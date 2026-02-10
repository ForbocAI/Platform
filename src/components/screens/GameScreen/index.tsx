"use client";

import { useEffect, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  selectPlayer,
  selectCurrentRoom,
  selectExploredRooms,
  selectRoomCoordinates,
  selectLogs,
  selectIsInitialized,
  selectIsLoading,
  selectActiveQuests,
  selectSessionScore,
  selectSessionComplete,
  selectPendingQuestFacts,
  initializeGame,
  movePlayer,
  askOracle,
  addLog,
  scanSector,
  communeWithVoid,
  engageHostiles,
  respawnPlayer,
  selectSpell,
  clearPendingQuestFacts,
} from "@/features/game/slice/gameSlice";
import {
  selectOracleInput,
  selectStageOfScene,
  selectInventoryOpen,
  selectSpellsPanelOpen,
  selectSkillsPanelOpen,
  setOracleInput,
  clearOracleInput,
  setStageOfScene,
  selectShowMap,
  toggleShowMap,
  toggleInventory,
  toggleSpellsPanel,
  toggleSkillsPanel,
  selectAutoPlay,
  toggleAutoPlay,
  openTrade,
  closeTrade,
  selectActiveMerchantId,
} from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound } from "@/features/audio";
import {
  selectThreads,
  selectMainThreadId,
  selectFacts,
  selectVignette,
  selectCurrentSceneId,
  addThread,
  setMainThread,
  startVignette,
  advanceVignetteStage,
  endVignette,
  fadeInScene,
  fadeOutScene,
  addFact,
} from "@/features/narrative/slice/narrativeSlice";
import { LoadingOverlay } from "@/components/elements/generic/LoadingOverlay";
import { GameScreenHeader } from "./GameScreenHeader";
import { GameScreenMain } from "./GameScreenMain";
import { GameScreenFooter } from "./GameScreenFooter";
import { GameScreenOverlays } from "./GameScreenOverlays";
import type { VignetteStage } from "@/lib/quadar/types";

export function GameScreen() {
  const dispatch = useAppDispatch();
  const playSound = usePlayButtonSound();
  const player = useAppSelector(selectPlayer);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const exploredRooms = useAppSelector(selectExploredRooms);
  const roomCoordinates = useAppSelector(selectRoomCoordinates);
  const logs = useAppSelector(selectLogs);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectIsLoading);
  const oracleInput = useAppSelector(selectOracleInput);
  const stageOfScene = useAppSelector(selectStageOfScene);
  const inventoryOpen = useAppSelector(selectInventoryOpen);
  const spellsPanelOpen = useAppSelector(selectSpellsPanelOpen);
  const skillsPanelOpen = useAppSelector(selectSkillsPanelOpen);
  const showMap = useAppSelector(selectShowMap);
  const autoPlay = useAppSelector(selectAutoPlay);
  const threads = useAppSelector(selectThreads);
  const mainThreadId = useAppSelector(selectMainThreadId);
  const facts = useAppSelector(selectFacts);
  const vignette = useAppSelector(selectVignette);
  const currentSceneId = useAppSelector(selectCurrentSceneId);
  const activeMerchantId = useAppSelector(selectActiveMerchantId);
  const activeMerchant = (activeMerchantId && currentRoom) ? currentRoom.merchants?.find(m => m.id === activeMerchantId) : null;
  const activeQuests = useAppSelector(selectActiveQuests);
  const sessionScore = useAppSelector(selectSessionScore);
  const sessionComplete = useAppSelector(selectSessionComplete);
  const pendingQuestFacts = useAppSelector(selectPendingQuestFacts);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pendingQuestFacts.length === 0) return;
    const toAdd = [...pendingQuestFacts];
    dispatch(clearPendingQuestFacts());
    toAdd.forEach((text) => {
      dispatch(addFact({ text, questionKind: "quest", isFollowUp: false }));
    });
  }, [pendingQuestFacts, dispatch]);

  // Seed one thread so vignette + Fade out can run (fadeInScene needs mainThreadId)
  useEffect(() => {
    if (!isInitialized || threads.length > 0) return;
    dispatch(addThread({ name: "Reconnaissance", stage: "To Knowledge" }));
  }, [isInitialized, threads.length, dispatch]);
  useEffect(() => {
    if (threads.length === 1 && !mainThreadId) {
      dispatch(setMainThread(threads[0].id));
    }
  }, [threads, mainThreadId, dispatch]);

  const getInitOptions = () => ({
    forceMerchant: searchParams.get("forceMerchant") === "1",
    deterministic: searchParams.get("deterministic") === "1",
    forceEnemy: searchParams.get("forceEnemy") === "1",
    lowHp: searchParams.get("lowHp") === "1",
  });

  useLayoutEffect(() => {
    if (!isInitialized && !isLoading) {
      dispatch(initializeGame(getInitOptions()));
    }
  }, [isInitialized, isLoading, dispatch, searchParams]);

  if (!isInitialized) {
    return (
      <LoadingOverlay
        message="INITIALIZING..."
        onRetry={() => dispatch(initializeGame(getInitOptions()))}
      />
    );
  }

  if (!player || !currentRoom) {
    return (
      <LoadingOverlay
        message="INITIALIZING..."
        onRetry={() => dispatch(initializeGame(getInitOptions()))}
      />
    );
  }

  const handleOracleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = oracleInput.trim();
    if (!q) return;
    dispatch(askOracle(q));
    dispatch(clearOracleInput());
  };

  return (
    <div className="relative flex flex-col h-screen min-h-0 bg-palette-bg-dark text-palette-white">
      <GameScreenHeader
        player={player}
        stage={stageOfScene}
        onStageChange={(s) => dispatch(setStageOfScene(s))}
      />
      <GameScreenMain
        currentRoom={currentRoom}
        showMap={showMap}
        exploredRooms={exploredRooms}
        roomCoordinates={roomCoordinates}
        threads={threads}
        mainThreadId={mainThreadId}
        onSetMainThread={(id) => dispatch(setMainThread(id))}
        facts={facts}
        vignette={vignette ? { theme: vignette.theme, stage: vignette.stage, threadIds: vignette.threadIds } : null}
        onStartVignette={(theme) => {
          dispatch(startVignette({ theme }));
          const threadId = mainThreadId ?? threads[0]?.id;
          if (currentRoom && threadId) {
            dispatch(fadeInScene({ roomId: currentRoom.id, mainThreadId: threadId, stageOfScene }));
          }
        }}
        onAdvanceVignette={(stage: VignetteStage) => dispatch(advanceVignetteStage({ stage }))}
        onEndVignette={() => dispatch(endVignette())}
        logs={logs}
        onTradeMerchant={(id) => dispatch(openTrade(id))}
        activeQuests={activeQuests}
        sessionScore={sessionScore}
        sessionComplete={sessionComplete}
        currentSceneId={currentSceneId}
        onFadeOutScene={() => dispatch(fadeOutScene({ sceneId: currentSceneId ?? undefined }))}
      />
      <GameScreenFooter
        oracleInput={oracleInput}
        onOracleChange={(v) => dispatch(setOracleInput(v))}
        onOracleSubmit={handleOracleSubmit}
        player={player}
        currentRoom={currentRoom}
        onMove={(dir) => dispatch(movePlayer(dir))}
        onMapClick={() => dispatch(toggleShowMap())}
        onScan={() => dispatch(scanSector())}
        onEngage={() => dispatch(engageHostiles())}
        onCommune={() => dispatch(communeWithVoid())}
        onOpenInventory={() => dispatch(toggleInventory())}
        onOpenSpells={() => dispatch(toggleSpellsPanel())}
        onOpenSkills={() => dispatch(toggleSkillsPanel())}
        autoPlay={autoPlay}
        onToggleAutoPlay={() => {
          playSound();
          dispatch(toggleAutoPlay());
        }}
      />
      <GameScreenOverlays
        inventoryOpen={inventoryOpen}
        spellsPanelOpen={spellsPanelOpen}
        skillsPanelOpen={skillsPanelOpen}
        player={player}
        onCloseInventory={() => dispatch(toggleInventory())}
        onCloseSpells={() => dispatch(toggleSpellsPanel())}
        onCloseSkills={() => dispatch(toggleSkillsPanel())}
        onRejectConcession={() => dispatch(respawnPlayer())}
        onAcceptConcession={(type) => dispatch(addLog({ message: `You accepted concession: ${type}`, type: "system" }))}
        activeMerchant={activeMerchant}
        onCloseTrade={() => dispatch(closeTrade())}
        onSelectSpell={(id) => dispatch(selectSpell(id))}
      />
    </div>
  );
}
