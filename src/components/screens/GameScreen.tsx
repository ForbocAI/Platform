"use client";

import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  askOracle,
  initializeGame,
  movePlayer,
  engageEnemy,
  communeWithVoid,
  scanSector,
  selectPlayer,
  selectCurrentRoom,
  selectLogs,
  selectError,
} from "@/features/game/slice/gameSlice";
import { setOracleInput, selectOracleInput, toggleShowMap, selectShowMap, selectStageOfScene, setStageOfScene } from "@/features/core/ui/slice/uiSlice";
import {
  PlayerHeader,
  RoomViewport,
  MapView,
  NeuralLogPanel,
  OracleForm,
  ActionDeck,
  StageSelector,
} from "@/components/elements/unique";
import { LoadingOverlay } from "@/components/elements/generic";

export function GameScreen() {
  const dispatch = useAppDispatch();
  const player = useAppSelector(selectPlayer);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const logs = useAppSelector(selectLogs);
  const oracleInput = useAppSelector(selectOracleInput);
  const showMap = useAppSelector(selectShowMap);
  const stageOfScene = useAppSelector(selectStageOfScene);
  const error = useAppSelector(selectError);

  const handleAskOracle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleInput.trim()) return;
    dispatch(askOracle(oracleInput));
    dispatch(setOracleInput(""));
  };

  if (!player || !currentRoom) {
    return (
      <LoadingOverlay
        message={error ?? "INITIALIZING..."}
        onRetry={error ? () => dispatch(initializeGame()) : undefined}
      />
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col px-1 sm:px-2 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] bg-zinc-950 font-mono text-zinc-300 overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-[9fr_15fr_15fr_11fr] gap-y-2 py-2 overflow-hidden">
        <div className="min-h-0 overflow-hidden w-full">
          <PlayerHeader player={player} />
        </div>
<div className="min-h-0 overflow-auto w-full vengeance-border border-b-2 border-[var(--border-red)] rounded-none">
        {showMap ? <MapView room={currentRoom} /> : <RoomViewport room={currentRoom} />}
      </div>
        <div className="min-h-0 overflow-auto w-full">
          <NeuralLogPanel logs={logs}>
            <StageSelector stage={stageOfScene} onStageChange={(s) => dispatch(setStageOfScene(s))} />
            <OracleForm
              value={oracleInput}
              onChange={(value) => dispatch(setOracleInput(value))}
              onSubmit={handleAskOracle}
            />
          </NeuralLogPanel>
        </div>
        <div className="min-h-0 overflow-hidden w-full">
          <ActionDeck
            player={player}
            currentRoom={currentRoom}
            onMove={(dir) => dispatch(movePlayer(dir))}
            onMapClick={() => dispatch(toggleShowMap())}
            onScan={() => dispatch(scanSector())}
            onEngage={() => dispatch(engageEnemy())}
            onCommune={() => dispatch(communeWithVoid())}
          />
        </div>
      </div>
    </main>
  );
}
