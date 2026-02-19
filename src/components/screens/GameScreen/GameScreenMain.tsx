"use client";

import { AreaViewport, MapView, ThreadList, FactsPanel, VignetteControls, NeuralLogPanel, QuestsPanel } from "@/components/elements/unique";
import type { Area, Fact, GameLogEntry, Thread, ActiveQuest, SessionScore, VignetteStage } from "@/features/game/types";
import type { AreaCoordinates } from "@/features/game/slice/gameSlice";

interface VignetteState {
  theme: string;
  stage: VignetteStage;
  threadIds?: string[];
}

export function GameScreenMain({
  currentArea,
  showMap,
  exploredAreas,
  areaCoordinates,
  threads,
  mainThreadId,
  onSetMainThread,
  facts,
  vignette,
  onStartVignette,
  onAdvanceVignette,
  onEndVignette,
  logs,
  onTradeVendor,
  activeQuests,
  sessionScore,
  sessionComplete,
  currentSceneId,
  onFadeOutScene,
}: {
  currentArea: Area;
  showMap: boolean;
  exploredAreas: Record<string, Area>;
  areaCoordinates: Record<string, AreaCoordinates>;
  threads: Thread[];
  mainThreadId: string | null;
  onSetMainThread: (id: string) => void;
  facts: Fact[];
  vignette: VignetteState | null;
  onStartVignette: (theme: string) => void;
  onAdvanceVignette: (stage: VignetteStage) => void;
  onEndVignette: () => void;
  logs: GameLogEntry[];
  onTradeVendor: (vendorId: string) => void;
  activeQuests: ActiveQuest[];
  sessionScore: SessionScore | null;
  sessionComplete: "quests" | "death" | null;
  currentSceneId: string | null;
  onFadeOutScene: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto overflow-x-hidden lg:overflow-hidden">
      {/* Area / Map: full width on mobile (top), left column on lg+; flex-none on mobile so sidebar gets space below */}
      <div className="flex-none lg:flex-1 min-w-0 flex flex-col min-h-[35vh] lg:min-h-0 order-1">
        {showMap ? (
          <div className="flex-1 min-h-0 min-w-0 overflow-auto">
            <MapView
              exploredAreas={exploredAreas}
              areaCoordinates={areaCoordinates}
              currentAreaId={currentArea.id}
            />
          </div>
        ) : (
          <AreaViewport area={currentArea} onTradeVendor={onTradeVendor} />
        )}
      </div>
      {/* Sidebar: full width on mobile (below room), right column on lg+ */}
      <div className="flex flex-col w-full lg:w-72 xl:w-80 shrink-0 min-h-0 border-t lg:border-t-0 lg:border-l border-palette-border order-2 overflow-hidden">
        <QuestsPanel
          activeQuests={activeQuests}
          sessionComplete={sessionComplete}
          sessionScore={sessionScore}
        />
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
