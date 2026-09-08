"use client";

import { AreaViewport, MapView, ThreadList, FactsPanel, VignetteControls, NeuralLogPanel, QuestsPanel, StageSelector } from "@/components/elements/unique";
import { PlayerHeaderIdentity, PlayerHeaderBars } from "@/components/elements/unique/game/PlayerHeader";
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
      <div className="flex flex-col w-full lg:w-72 xl:w-80 shrink-0 min-h-0 order-1 p-1.5 sm:p-2 gap-1.5 sm:gap-2 lg:overflow-y-auto">
        <div className="cozy-panel bg-palette-bg-mid/10 flex flex-col overflow-hidden shrink-0 lg:flex-1 lg:min-h-0">
          <div className="flex flex-col items-center gap-2.5 p-3 pb-2.5 lg:gap-2.5 lg:p-3 lg:pb-2.5 lg:flex-1 lg:min-h-0">
            <PlayerHeaderIdentity player={player} />
            <PlayerHeaderBars player={player} />
          </div>
          <div className="border-t border-palette-border/10">
            <StageSelector stage={stage} onStageChange={onStageChange} />
          </div>
          <div className="border-t border-palette-border/10">
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
      </div>

      <div className="flex flex-col w-full lg:flex-1 lg:basis-0 min-w-0 min-h-[35vh] lg:min-h-0 order-2 border-t lg:border-t-0 border-palette-border/20 lg:border-l column-divider p-1.5 sm:p-2 gap-1.5 sm:gap-2">
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
        <div className="cozy-panel bg-palette-bg-mid/15 divide-y divide-palette-border/20 overflow-y-auto shrink-0 max-h-[28%]">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-palette-border/20">
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
        </div>
      </div>

      <div className="flex flex-col w-full lg:flex-1 lg:basis-0 min-w-0 shrink-0 min-h-0 border-t lg:border-t-0 border-palette-border/20 lg:border-l column-divider order-3 overflow-hidden p-1.5 sm:p-2 gap-1.5 sm:gap-2">
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
