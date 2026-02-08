"use client";

import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  askOracle,
  movePlayer,
  engageEnemy,
  communeWithVoid,
  scanSector,
  selectPlayer,
  selectCurrentRoom,
  selectLogs,
} from "@/features/game/slice/gameSlice";
import { setOracleInput, selectOracleInput, toggleShowMap, selectShowMap } from "@/features/core/ui/slice/uiSlice";
import {
  PlayerHeader,
  RoomViewport,
  MapView,
  NeuralLogPanel,
  OracleForm,
  ActionDeck,
} from "@/components/elements/unique";

export function GameScreen() {
  const dispatch = useAppDispatch();
  const player = useAppSelector(selectPlayer);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const logs = useAppSelector(selectLogs);
  const oracleInput = useAppSelector(selectOracleInput);
  const showMap = useAppSelector(selectShowMap);

  const handleAskOracle = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(askOracle(oracleInput));
    dispatch(setOracleInput(""));
  };

  if (!player || !currentRoom) {
    return (
      <div className="h-screen w-screen bg-black text-red-500 font-mono flex items-center justify-center animate-pulse text-xs lg:text-base">
        INITIALIZING...
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col lg:grid lg:grid-cols-[1fr_400px] lg:grid-rows-[80px_1fr_250px] gap-0.5 sm:gap-1 lg:gap-2 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] px-1 py-1 sm:px-2 sm:py-2 lg:pt-0 lg:p-2 bg-zinc-950 font-mono text-zinc-300 overflow-y-auto overflow-x-hidden lg:overflow-hidden">
      <PlayerHeader player={player} />
      {showMap ? <MapView room={currentRoom} /> : <RoomViewport room={currentRoom} />}
      <NeuralLogPanel logs={logs}>
        <OracleForm
          value={oracleInput}
          onChange={(value) => dispatch(setOracleInput(value))}
          onSubmit={handleAskOracle}
        />
      </NeuralLogPanel>
      <ActionDeck
        player={player}
        currentRoom={currentRoom}
        onMove={(dir) => dispatch(movePlayer(dir))}
        onMapClick={() => dispatch(toggleShowMap())}
        onScan={() => dispatch(scanSector())}
        onEngage={() => dispatch(engageEnemy())}
        onCommune={() => dispatch(communeWithVoid())}
      />
    </main>
  );
}
