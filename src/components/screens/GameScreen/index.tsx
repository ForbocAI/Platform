"use client";

import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  selectPlayer,
  selectCurrentArea,
  selectExploredAreas,
  selectAreaCoordinates,
  selectLogs,
  selectIsInitialized,
  selectActiveQuests,
  selectSessionScore,
  selectSessionComplete,
  movePlayer,
  askInquiry,
  addLog,
  scanSector,
  performSystemInquiry,
  engageHostiles,
  respawnPlayer,
  selectCapability,
  equipItem,
  unequipItem,
  consumeItem,
  sacrificeItem,
} from "@/features/game/store/gameSlice";
import {
  selectInquiryInput,
  selectStageOfScene,
  selectInventoryOpen,
  selectCapabilitiesPanelOpen,
  selectSkillsPanelOpen,
  setInquiryInput,
  clearInquiryInput,
  setStageOfScene,
  selectShowMap,
  toggleShowMap,
  toggleInventory,
  toggleCapabilitiesPanel,
  toggleSkillsPanel,
  selectAutoPlay,
  toggleAutoPlay,
  openTrade,
  closeTrade,
  selectActiveVendorId,
  selectCompanionPanelOpen,
  toggleCompanionPanel,
  selectCraftingPanelOpen,
  toggleCraftingPanel,
} from "@/features/core/ui/slice/uiSlice";
import { playButtonSound } from "@/features/audio";
import {
  selectThreads,
  selectMainThreadId,
  selectFacts,
  selectVignette,
  selectCurrentSceneId,
  startVignette,
  advanceVignetteStage,
  endVignette,
  fadeInScene,
  fadeOutScene,
  setMainThread,
} from "@/features/narrative/slice/narrativeSlice";
import { retryInitialize } from "@/features/core/store";
import { LoadingOverlay } from "@/components/elements/generic/LoadingOverlay";
import { GameScreenHeader } from "./GameScreenHeader";
import { GameScreenMain } from "./GameScreenMain";
import { GameScreenFooter } from "./GameScreenFooter";
import { GameScreenOverlays } from "./GameScreenOverlays";
import { ClassSelectionScreen } from "../ClassSelectionScreen";
import type { VignetteStage } from "@/features/game/types";

export function GameScreen() {
  const dispatch = useAppDispatch();
  const player = useAppSelector(selectPlayer);
  const currentArea = useAppSelector(selectCurrentArea);
  const exploredAreas = useAppSelector(selectExploredAreas);
  const areaCoordinates = useAppSelector(selectAreaCoordinates);
  const logs = useAppSelector(selectLogs);
  const isInitialized = useAppSelector(selectIsInitialized);
  const inquiryInput = useAppSelector(selectInquiryInput);
  const stageOfScene = useAppSelector(selectStageOfScene);
  const inventoryOpen = useAppSelector(selectInventoryOpen);
  const capabilitiesPanelOpen = useAppSelector(selectCapabilitiesPanelOpen);
  const skillsPanelOpen = useAppSelector(selectSkillsPanelOpen);
  const companionPanelOpen = useAppSelector(selectCompanionPanelOpen);
  const showMap = useAppSelector(selectShowMap);
  const autoPlay = useAppSelector(selectAutoPlay);
  const threads = useAppSelector(selectThreads);
  const mainThreadId = useAppSelector(selectMainThreadId);
  const facts = useAppSelector(selectFacts);
  const vignette = useAppSelector(selectVignette);
  const currentSceneId = useAppSelector(selectCurrentSceneId);
  const activeVendorId = useAppSelector(selectActiveVendorId);
  const activeVendor = (activeVendorId && currentArea) ? currentArea.vendors?.find(v => v.id === activeVendorId) || null : null;
  const activeQuests = useAppSelector(selectActiveQuests);
  const sessionScore = useAppSelector(selectSessionScore);
  const sessionComplete = useAppSelector(selectSessionComplete);
  const craftingPanelOpen = useAppSelector(selectCraftingPanelOpen);
  const isLoading = useAppSelector((state) => state.game.isLoading);

  if (!isInitialized) {
    if (isLoading) {
      return (
        <LoadingOverlay
          message="INITIALIZING..."
          onRetry={() => dispatch(retryInitialize)}
        />
      );
    }
    return <ClassSelectionScreen />;
  }

  if (!player || !currentArea) {
    return (
      <LoadingOverlay
        message="INITIALIZING..."
        onRetry={() => dispatch(retryInitialize)}
      />
    );
  }

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inquiryInput.trim();
    if (!q) return;
    dispatch(askInquiry(q));
    dispatch(clearInquiryInput());
  };

  return (
    <div className="relative flex flex-col h-screen min-h-0 bg-palette-bg-dark text-palette-white">
      <GameScreenHeader
        player={player}
        stage={stageOfScene}
        onStageChange={(s) => dispatch(setStageOfScene(s))}
      />
      <GameScreenMain
        currentArea={currentArea}
        showMap={showMap}
        exploredAreas={exploredAreas}
        areaCoordinates={areaCoordinates}
        threads={threads}
        mainThreadId={mainThreadId}
        onSetMainThread={(id) => dispatch(setMainThread(id))}
        facts={facts}
        vignette={vignette ? { theme: vignette.theme, stage: vignette.stage, threadIds: vignette.threadIds } : null}
        onStartVignette={(theme) => {
          dispatch(startVignette({ theme }));
          const threadId = mainThreadId ?? threads[0]?.id;
          if (currentArea && threadId) {
            dispatch(fadeInScene({ roomId: currentArea.id, mainThreadId: threadId, stageOfScene }));
          }
        }}
        onAdvanceVignette={(stage: VignetteStage) => dispatch(advanceVignetteStage({ stage }))}
        onEndVignette={() => dispatch(endVignette())}
        logs={logs}
        onTradeVendor={(id) => dispatch(openTrade(id))}
        activeQuests={activeQuests}
        sessionScore={sessionScore}
        sessionComplete={sessionComplete}
        currentSceneId={currentSceneId}
        onFadeOutScene={() => dispatch(fadeOutScene({ sceneId: currentSceneId ?? undefined }))}
      />
      <GameScreenFooter
        inquiryInput={inquiryInput}
        onInquiryChange={(v) => dispatch(setInquiryInput(v))}
        onInquirySubmit={handleInquirySubmit}
        player={player}
        currentArea={currentArea}
        onMove={(dir) => dispatch(movePlayer(dir))}
        onMapClick={() => dispatch(toggleShowMap())}
        onScan={() => dispatch(scanSector())}
        onEngage={() => dispatch(engageHostiles())}
        onPerformInquiry={() => dispatch(performSystemInquiry())}
        onOpenInventory={() => dispatch(toggleInventory())}
        onOpenCapabilities={() => dispatch(toggleCapabilitiesPanel())}
        onOpenSkills={() => dispatch(toggleSkillsPanel())}
        onOpenCompanion={() => dispatch(toggleCompanionPanel())}
        autoPlay={autoPlay}
        onToggleAutoPlay={() => {
          dispatch(playButtonSound());
          dispatch(toggleAutoPlay());
        }}
      />
      <GameScreenOverlays
        inventoryOpen={inventoryOpen}
        capabilitiesPanelOpen={capabilitiesPanelOpen}
        skillsPanelOpen={skillsPanelOpen}
        player={player}
        onCloseInventory={() => dispatch(toggleInventory())}
        onCloseCapabilities={() => dispatch(toggleCapabilitiesPanel())}
        onCloseSkills={() => dispatch(toggleSkillsPanel())}
        companionPanelOpen={companionPanelOpen}
        onCloseCompanion={() => dispatch(toggleCompanionPanel())}
        onRejectConcession={() => dispatch(respawnPlayer())}
        onAcceptConcession={(type) => dispatch(addLog({ message: `You accepted concession: ${type}`, type: "system" }))}
        onEquipItem={(id, slot) => dispatch(equipItem({ itemId: id, slot }))}
        onUnequipItem={(slot) => dispatch(unequipItem({ slot }))}
        onUseItem={(id) => dispatch(consumeItem({ itemId: id }))}
        activeVendor={activeVendor}
        onCloseTrade={() => dispatch(closeTrade())}
        onSelectCapability={(id) => dispatch(selectCapability(id))}
        onSacrificeItem={(id) => dispatch(sacrificeItem({ itemId: id }))}
        craftingPanelOpen={craftingPanelOpen}
        onCloseCrafting={() => dispatch(toggleCraftingPanel(false))}
      />
    </div>
  );
}
