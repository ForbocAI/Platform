"use client";

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
} from "@/features/game/slice/gameSlice";
import {
  selectOracleInput,
  selectStageOfScene,
  setOracleInput,
  clearOracleInput,
  setStageOfScene,
  toggleShowMap,
} from "@/features/core/ui/slice/uiSlice";
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
  OracleForm,
  ThreadList,
  FactsPanel,
  VignetteControls,
  NeuralLogPanel,
} from "@/components/elements/unique";
import type { VignetteStage } from "@/lib/quadar/types";

export function GameScreen() {
  const dispatch = useAppDispatch();
  const player = useAppSelector(selectPlayer);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const logs = useAppSelector(selectLogs);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectIsLoading);
  const oracleInput = useAppSelector(selectOracleInput);
  const stageOfScene = useAppSelector(selectStageOfScene);
  const threads = useAppSelector(selectThreads);
  const mainThreadId = useAppSelector(selectMainThreadId);
  const facts = useAppSelector(selectFacts);
  const vignette = useAppSelector(selectVignette);
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
        message="Initializing..."
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
    <div className="flex flex-col h-screen min-h-0 bg-palette-bg-dark text-palette-white">
      <PlayerHeader player={player} />
      <StageSelector
        stage={stageOfScene}
        onStageChange={(s) => dispatch(setStageOfScene(s))}
      />
      <main className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          <RoomViewport room={currentRoom} />
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
      />
    </div>
  );
}
