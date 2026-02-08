"use client";

import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  askOracle,
  movePlayer,
  addLog,
  selectPlayer,
  selectCurrentRoom,
  selectLogs,
} from "@/features/game/slice/gameSlice";
import { setOracleInput, selectOracleInput } from "@/features/core/ui/slice/uiSlice";
import {
  PlayerHeader,
  RoomViewport,
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
    <main className="h-screen w-screen flex flex-col lg:grid lg:grid-cols-[1fr_400px] lg:grid-rows-[80px_1fr_250px] gap-1 lg:gap-2 p-2 bg-zinc-950 font-mono text-zinc-300 overflow-hidden">
      <PlayerHeader player={player} />
      <RoomViewport room={currentRoom} />
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
        onScan={() => dispatch(addLog({ message: "Scanning current sector...", type: "exploration" }))}
        onEngage={() => dispatch(addLog({ message: "You ready your weapon.", type: "combat" }))}
        onCommune={() => dispatch(addLog({ message: "You attempt to commune with the void...", type: "loom" }))}
      />
    </main>
  );
}
