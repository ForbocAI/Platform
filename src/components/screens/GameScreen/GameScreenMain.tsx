"use client";

import { AreaViewport, MapView, ThreadList, FactsPanel, VignetteControls, NeuralLogPanel, QuestsPanel, StageSelector } from "@/components/elements/unique";
import { GameScreenFooter } from "./GameScreenFooter";
import type { Area, Fact, GameLogEntry, Thread, ActiveQuest, SessionScore, VignetteStage, StageOfScene, PlayerActor, Direction } from "@/features/game/types";
import type { AreaCoordinates } from "@/features/game/store/gameSlice";

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
  player,
  inquiryInput,
  onInquiryChange,
  onInquirySubmit,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onPerformInquiry,
  onOpenInventory,
  onOpenCapabilities,
  onOpenSkills,
  onOpenCompanion,
  autoPlay,
  onToggleAutoPlay,
  stage,
  onStageChange,
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
  player: PlayerActor;
  inquiryInput: string;
  onInquiryChange: (v: string) => void;
  onInquirySubmit: (e: React.FormEvent) => void;
  onMove: (dir: Direction) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onPerformInquiry: () => void;
  onOpenInventory?: () => void;
  onOpenCapabilities?: () => void;
  onOpenSkills?: () => void;
  onOpenCompanion?: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  stage: StageOfScene;
  onStageChange: (s: StageOfScene) => void;
}) {
  return (
    <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto overflow-x-hidden lg:overflow-hidden">
      {/* Left half: Area / Map (primary) + Workboard (secondary, shrinks first) */}
      <div className="flex-none lg:flex-1 lg:basis-0 min-w-0 flex flex-col min-h-[35vh] lg:min-h-0 order-1 p-1.5 sm:p-2 gap-1.5 sm:gap-2">
        <div className="flex-1 min-h-[16rem] flex flex-col">
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
        {/* One unified panel with internal dividers, instead of separate boxes — capped so the area view above keeps most of the height */}
        <div className="cozy-panel bg-palette-bg-mid/15 divide-y divide-palette-border/50 overflow-y-auto min-h-0 shrink max-h-[28%]">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-palette-border/50">
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
          </div>
          <FactsPanel facts={facts} />
          <VignetteControls
            theme={vignette?.theme ?? ""}
            stage={vignette?.stage ?? "Exposition"}
            threadIds={vignette?.threadIds}
            threads={threads.map(t => ({ id: t.id, name: t.name ?? "Unnamed Thread" }))}
            onStart={onStartVignette}
            onAdvance={onAdvanceVignette}
            onEnd={onEndVignette}
            currentSceneId={currentSceneId}
            onFadeOutScene={onFadeOutScene}
          />
        </div>
      </div>
      {/* Right half: Story path + Lantern Chronicle (primary) + inquiry input + action deck, pinned below it */}
      <div className="flex flex-col w-full lg:flex-1 lg:basis-0 min-w-0 shrink-0 min-h-0 border-t lg:border-t-0 lg:border-l border-palette-border order-2 overflow-hidden p-1.5 sm:p-2 gap-1.5 sm:gap-2">
        <StageSelector stage={stage} onStageChange={onStageChange} />
        <div className="flex-1 min-h-[10rem]">
          <NeuralLogPanel logs={logs} />
        </div>
        <GameScreenFooter
          inquiryInput={inquiryInput}
          onInquiryChange={onInquiryChange}
          onInquirySubmit={onInquirySubmit}
          player={player}
          currentArea={currentArea}
          onMove={onMove}
          onMapClick={onMapClick}
          onScan={onScan}
          onEngage={onEngage}
          onPerformInquiry={onPerformInquiry}
          onOpenInventory={onOpenInventory}
          onOpenCapabilities={onOpenCapabilities}
          onOpenSkills={onOpenSkills}
          onOpenCompanion={onOpenCompanion}
          autoPlay={autoPlay}
          onToggleAutoPlay={onToggleAutoPlay}
        />
      </div>
    </main>
  );
}
