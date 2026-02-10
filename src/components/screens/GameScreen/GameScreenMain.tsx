"use client";

import { RoomViewport, MapView, ThreadList, FactsPanel, VignetteControls, NeuralLogPanel } from "@/components/elements/unique";
import type { Room, Fact, GameLogEntry, Thread, ActiveQuest, SessionScore } from "@/lib/game/types";
import type { VignetteStage } from "@/lib/game/types";
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
  activeQuests,
  sessionScore,
  sessionComplete,
  currentSceneId,
  onFadeOutScene,
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
  activeQuests: ActiveQuest[];
  sessionScore: SessionScore | null;
  sessionComplete: "quests" | "death" | null;
  currentSceneId: string | null;
  onFadeOutScene: () => void;
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
        {/* Quests & Session */}
        {(activeQuests.length > 0 || sessionComplete) && (
          <div className="shrink-0 border-b border-palette-border p-2 space-y-1.5 bg-palette-bg-mid/10" data-testid="quests-panel">
            {activeQuests.map((q) => (
              <div key={q.id} className="text-xs text-palette-muted">
                <span className={q.complete ? "line-through text-palette-muted/70" : ""}>
                  {q.label}: {q.progress}/{q.target}
                </span>
                {q.complete && <span className="ml-1 text-palette-accent-cyan">✓</span>}
              </div>
            ))}
            {sessionComplete === "quests" && sessionScore && (
              <div className="text-xs text-palette-accent-cyan pt-1 border-t border-palette-border/50">
                Session complete — Rooms: {sessionScore.roomsExplored} | Scans: {sessionScore.roomsScanned} | Foes: {sessionScore.enemiesDefeated} | Trades: {sessionScore.merchantTrades} | Quests: {sessionScore.questsCompleted} | Spirit: {sessionScore.spiritEarned}
              </div>
            )}
            {sessionComplete === "death" && sessionScore && (
              <div className="text-xs text-palette-accent-red pt-1 border-t border-palette-border/50">
                Session ended (death) — Rooms: {sessionScore.roomsExplored} | Scans: {sessionScore.roomsScanned} | Foes: {sessionScore.enemiesDefeated} | Trades: {sessionScore.merchantTrades} | Quests: {sessionScore.questsCompleted} | Spirit: {sessionScore.spiritEarned}
              </div>
            )}
          </div>
        )}
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
          currentSceneId={currentSceneId}
          onFadeOutScene={onFadeOutScene}
        />
        <NeuralLogPanel logs={logs} />
      </div>
    </main>
  );
}
