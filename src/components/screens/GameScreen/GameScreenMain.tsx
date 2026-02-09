"use client";

import { RoomViewport, MapView, ThreadList, FactsPanel, VignetteControls, NeuralLogPanel } from "@/components/elements/unique";
import type { Room, Fact, GameLogEntry, Thread } from "@/lib/quadar/types";
import type { VignetteStage } from "@/lib/quadar/types";

interface VignetteState {
  theme: string;
  stage: VignetteStage;
  threadIds?: string[];
}

export function GameScreenMain({
  currentRoom,
  showMap,
  onCloseMap,
  threads,
  mainThreadId,
  onSetMainThread,
  facts,
  vignette,
  onStartVignette,
  onAdvanceVignette,
  onEndVignette,
  logs,
}: {
  currentRoom: Room;
  showMap: boolean;
  onCloseMap: () => void;
  threads: Thread[];
  mainThreadId: string | null;
  onSetMainThread: (id: string) => void;
  facts: Fact[];
  vignette: VignetteState | null;
  onStartVignette: (theme: string) => void;
  onAdvanceVignette: (stage: VignetteStage) => void;
  onEndVignette: () => void;
  logs: GameLogEntry[];
}) {
  return (
    <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
      {/* Room / Map: full width on mobile (top), left column on lg+ */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col min-h-[38vh] lg:min-h-0 order-1">
        {showMap ? (
          <>
            <div className="flex items-center justify-end shrink-0 px-2 py-1 border-b border-palette-border bg-palette-bg-mid/30">
              <button
                type="button"
                onClick={onCloseMap}
                className="text-xs uppercase tracking-wider text-palette-muted hover:text-palette-accent-cyan transition-colors"
                aria-label="Close map"
                data-testid="map-close"
              >
                ✕ Close map
              </button>
            </div>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto">
              <MapView
                exploredRooms={{ [currentRoom.id]: currentRoom }}
                roomCoordinates={{ [currentRoom.id]: { x: 0, y: 0 } }}
                currentRoomId={currentRoom.id}
              />
            </div>
          </>
        ) : (
          <RoomViewport room={currentRoom} />
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
