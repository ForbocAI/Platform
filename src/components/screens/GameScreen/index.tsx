"use client";

import { useEffect } from "react";
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
  initializeGame,
  movePlayer,
  askOracle,
  addLog,
  scanSector,
  communeWithVoid,
  engageHostiles,
  respawnPlayer,
  selectSpell,
} from "@/features/game/slice/gameSlice";
import {
  selectOracleInput,
  selectStageOfScene,
  selectInventoryOpen,
  selectSpellsPanelOpen,
  setOracleInput,
  clearOracleInput,
  setStageOfScene,
  selectShowMap,
  toggleShowMap,
  toggleInventory,
  toggleSpellsPanel,
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
  setMainThread,
  startVignette,
  advanceVignetteStage,
  endVignette,
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
  const showMap = useAppSelector(selectShowMap);
  const autoPlay = useAppSelector(selectAutoPlay);
  const threads = useAppSelector(selectThreads);
  const mainThreadId = useAppSelector(selectMainThreadId);
  const facts = useAppSelector(selectFacts);
  const vignette = useAppSelector(selectVignette);
  const activeMerchantId = useAppSelector(selectActiveMerchantId);
  const activeMerchant = (activeMerchantId && currentRoom) ? currentRoom.merchants?.find(m => m.id === activeMerchantId) : null;
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      const forceMerchant = searchParams.get("forceMerchant") === "1";
      dispatch(initializeGame({ forceMerchant }));
    }
  }, [isInitialized, isLoading, dispatch, searchParams]);

  if (!isInitialized && isLoading) {
    return (
      <LoadingOverlay
        onRetry={() => dispatch(initializeGame())}
      />
    );
  }

  if (!player || !currentRoom) {
    return (
      <LoadingOverlay
        message="INITIALIZING..."
        onRetry={() => dispatch(initializeGame())}
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
        onStartVignette={(theme) => dispatch(startVignette({ theme }))}
        onAdvanceVignette={(stage: VignetteStage) => dispatch(advanceVignetteStage({ stage }))}
        onEndVignette={() => dispatch(endVignette())}
        logs={logs}
        onTradeMerchant={(id) => dispatch(openTrade(id))}
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
        autoPlay={autoPlay}
        onToggleAutoPlay={() => {
          playSound();
          dispatch(toggleAutoPlay());
        }}
      />
      <GameScreenOverlays
        inventoryOpen={inventoryOpen}
        spellsPanelOpen={spellsPanelOpen}
        player={player}
        onCloseInventory={() => dispatch(toggleInventory())}
        onCloseSpells={() => dispatch(toggleSpellsPanel())}
        onRejectConcession={() => dispatch(respawnPlayer())}
        onAcceptConcession={(type) => dispatch(addLog({ message: `You accepted concession: ${type}`, type: "system" }))}
        activeMerchant={activeMerchant}
        onCloseTrade={() => dispatch(closeTrade())}
        onSelectSpell={(id) => dispatch(selectSpell(id))}
      />
    </div>
  );
}
