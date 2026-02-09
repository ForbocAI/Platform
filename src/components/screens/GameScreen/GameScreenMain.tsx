"use client";

import { RoomViewport, MapView, ThreadList, FactsPanel, VignetteControls, NeuralLogPanel } from "@/components/elements/unique";
import type { Room, Fact, GameLogEntry, Thread } from "@/lib/quadar/types";
import type { VignetteStage } from "@/lib/quadar/types";
import type { RoomCoordinates } from "@/features/game/slice/gameSlice";

interface VignetteState {
  theme: string;
  stage: VignetteStage;
  threadIds?: string[];
}

export function GameScreenMain({
  currentRoom,
  showMap,
  exploredRooms,
  roomCoordinates,
  threads,
  mainThreadId,
  onSetMainThread,
  facts,
  vignette,
  onStartVignette,
  onAdvanceVignette,
  onEndVignette,
  logs,
  onTradeMerchant,
}: {
  currentRoom: Room;
  showMap: boolean;
  exploredRooms: Record<string, Room>;
  roomCoordinates: Record<string, RoomCoordinates>;
  threads: Thread[];
  mainThreadId: string | null;
  onSetMainThread: (id: string) => void;
  facts: Fact[];
  vignette: VignetteState | null;
  onStartVignette: (theme: string) => void;
  onAdvanceVignette: (stage: VignetteStage) => void;
  onEndVignette: () => void;
  logs: GameLogEntry[];
  onTradeMerchant: (merchantId: string) => void;
}) {
  return (
    <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto overflow-x-hidden lg:overflow-hidden">
      {/* Room / Map: full width on mobile (top), left column on lg+; flex-none on mobile so sidebar gets space below */}
      <div className="flex-none lg:flex-1 min-w-0 flex flex-col min-h-[35vh] lg:min-h-0 order-1">
        {showMap ? (
          <div className="flex-1 min-h-0 min-w-0 overflow-auto">
            <MapView
              exploredRooms={exploredRooms}
              roomCoordinates={roomCoordinates}
              currentRoomId={currentRoom.id}
            />
          </div>
        ) : (
          <RoomViewport room={currentRoom} onTradeMerchant={onTradeMerchant} />
        )}
      </div>
      {/* Sidebar: full width on mobile (below room), right column on lg+ */}
      <div className="flex flex-col w-full lg:w-72 xl:w-80 shrink-0 min-h-0 border-t lg:border-t-0 lg:border-l border-palette-border order-2 overflow-hidden">
        <ThreadList
          threads={threads}
          mainThreadId={mainThreadId}
          onSetMain={onSetMainThread}
        />
        <FactsPanel facts={facts} />
        <VignetteControls
          theme={vignette?.theme ?? ""}
          stage={vignette?.stage ?? "Exposition"}
          threadIds={vignette?.threadIds}
          threads={threads}
          onStart={onStartVignette}
          onAdvance={onAdvanceVignette}
          onEnd={onEndVignette}
        />
        <NeuralLogPanel logs={logs} />
      </div>
    </main>
  );
}
