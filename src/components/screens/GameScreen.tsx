"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  selectPlayer,
  selectCurrentRoom,
  selectLogs,
  selectIsInitialized,
  selectIsLoading,
  initializeGame,
  movePlayer,
  askOracle,
  addLog,
  runAutoplayTick,
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
} from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound } from "@/features/audio";
import {
  selectThreads,
  selectMainThreadId,
  selectFacts,
  selectVignette,
  selectCurrentScene,
  selectMainThread,
  setMainThread,
  startVignette,
  advanceVignetteStage,
  endVignette,
} from "@/features/narrative/slice/narrativeSlice";
import { LoadingOverlay } from "@/components/elements/generic/LoadingOverlay";
import {
  PlayerHeader,
  ActionDeck,
  StageSelector,
  RoomViewport,
  MapView,
  OracleForm,
  ThreadList,
  FactsPanel,
  VignetteControls,
  NeuralLogPanel,
  InventoryPanel,
  SpellsPanel,
} from "@/components/elements/unique";
import type { VignetteStage } from "@/lib/quadar/types";

export function GameScreen() {
  const dispatch = useAppDispatch();
  const playSound = usePlayButtonSound();
  const player = useAppSelector(selectPlayer);
  const currentRoom = useAppSelector(selectCurrentRoom);
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

  // All hooks must run before any conditional return (Rules of Hooks)
  const autoPlayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!autoPlay) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      return;
    }
    const AUTO_PLAY_DELAY_MS = 5000;
    autoPlayIntervalRef.current = setInterval(() => {
      dispatch(runAutoplayTick());
    }, AUTO_PLAY_DELAY_MS);
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, [autoPlay, dispatch]);

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
      <PlayerHeader player={player} />
      <StageSelector
        stage={stageOfScene}
        onStageChange={(s) => dispatch(setStageOfScene(s))}
      />
      <main className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          {showMap ? (
            <>
              <div className="flex items-center justify-end shrink-0 px-2 py-1 border-b border-palette-border bg-palette-bg-mid/30">
                <button
                  type="button"
                  onClick={() => dispatch(toggleShowMap())}
                  className="text-xs uppercase tracking-wider text-palette-muted hover:text-palette-accent-cyan transition-colors"
                  aria-label="Close map"
                  data-testid="map-close"
                >
                  ✕ Close map
                </button>
              </div>
              <div className="flex-1 min-h-0 min-w-0 overflow-auto">
                <MapView
                  exploredRooms={currentRoom ? { [currentRoom.id]: currentRoom } : {}}
                  roomCoordinates={currentRoom ? { [currentRoom.id]: { x: 0, y: 0 } } : {}}
                  currentRoomId={currentRoom?.id ?? null}
                />
              </div>
            </>
          ) : (
            <RoomViewport room={currentRoom} />
          )}
        </div>
        <div className="flex flex-col w-72 lg:w-80 shrink-0 min-h-0 border-l border-palette-border">
          <ThreadList
            threads={threads}
            mainThreadId={mainThreadId}
            onSetMain={(id) => dispatch(setMainThread(id))}
          />
          <FactsPanel facts={facts} />
          <VignetteControls
            theme={vignette?.theme ?? ""}
            stage={vignette?.stage ?? "Exposition"}
            threadIds={vignette?.threadIds}
            threads={threads.map((t) => ({ id: t.id, name: t.name }))}
            onStart={(theme) => dispatch(startVignette({ theme }))}
            onAdvance={(stage: VignetteStage) => dispatch(advanceVignetteStage({ stage }))}
            onEnd={() => dispatch(endVignette())}
          />
          <NeuralLogPanel logs={logs} />
        </div>
      </main>
      <div className="shrink-0 border-t border-palette-border">
        <OracleForm
          value={oracleInput}
          onChange={(v) => dispatch(setOracleInput(v))}
          onSubmit={handleOracleSubmit}
        />
      </div>
      <ActionDeck
        player={player}
        currentRoom={currentRoom}
        onMove={(dir) => dispatch(movePlayer(dir))}
        onMapClick={() => dispatch(toggleShowMap())}
        onScan={() => dispatch(addLog({ message: "Scanning...", type: "system" }))}
        onEngage={() => dispatch(addLog({ message: "Engaging hostiles.", type: "system" }))}
        onCommune={() => dispatch(addLog({ message: "Communing.", type: "system" }))}
        onOpenInventory={() => dispatch(toggleInventory())}
        onOpenSpells={() => dispatch(toggleSpellsPanel())}
        autoPlay={autoPlay}
        onToggleAutoPlay={() => {
          playSound();
          dispatch(toggleAutoPlay());
        }}
      />
      {inventoryOpen && (
        <InventoryPanel
          player={player}
          onClose={() => dispatch(toggleInventory())}
          onEquip={() => {}}
          onUnequip={() => {}}
          onUse={() => {}}
        />
      )}
      {spellsPanelOpen && (
        <SpellsPanel
          player={player}
          onClose={() => dispatch(toggleSpellsPanel())}
        />
      )}
    </div>
  );
}
