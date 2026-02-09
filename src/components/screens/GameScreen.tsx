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
  selectConcessionOffered,
  selectTradePanelMerchantId,
  selectExploredRooms,
  selectRoomCoordinates,
  acceptConcession,
  rejectConcession,
  openTradePanel,
  closeTradePanel,
  buyFromMerchant,
  sellToMerchant,
  sacrificeItem,
  equipItem,
  unequipItem,
  useConsumableItem,
  castSpell,
} from "@/features/game/slice/gameSlice";
import {
  selectThreads,
  selectFacts,
  selectVignette,
  selectMainThreadId,
  selectCurrentSceneId,
  setMainThread,
  fadeOutScene,
  startVignette,
  advanceVignetteStage,
  endVignette,
} from "@/features/narrative/slice/narrativeSlice";
import { setOracleInput, selectOracleInput, toggleShowMap, selectShowMap, selectStageOfScene, setStageOfScene, selectInventoryOpen, toggleInventory } from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound } from "@/features/audio";
import {
  PlayerHeader,
  RoomViewport,
  MapView,
  NeuralLogPanel,
  OracleForm,
  ActionDeck,
  StageSelector,
  ConcessionModal,
  FactsPanel,
  ThreadList,
  VignetteControls,
  TradePanel,
  InventoryPanel,
} from "@/components/elements/unique";
import { LoadingOverlay } from "@/components/elements/generic";
import type { ConcessionOutcome } from "@/lib/quadar/types";

export function GameScreen() {
  const dispatch = useAppDispatch();
  const player = useAppSelector(selectPlayer);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const logs = useAppSelector(selectLogs);
  const oracleInput = useAppSelector(selectOracleInput);
  const showMap = useAppSelector(selectShowMap);
  const inventoryOpen = useAppSelector(selectInventoryOpen);
  const stageOfScene = useAppSelector(selectStageOfScene);
  const error = useAppSelector(selectError);
  const concessionOffered = useAppSelector(selectConcessionOffered);
  const tradePanelMerchantId = useAppSelector(selectTradePanelMerchantId);
  const exploredRooms = useAppSelector(selectExploredRooms);
  const roomCoordinates = useAppSelector(selectRoomCoordinates);
  const threads = useAppSelector(selectThreads);
  const facts = useAppSelector(selectFacts);
  const vignette = useAppSelector(selectVignette);
  const mainThreadId = useAppSelector(selectMainThreadId);
  const currentSceneId = useAppSelector(selectCurrentSceneId);
  const playSound = usePlayButtonSound();

  const handleAskOracle = (e: React.FormEvent) => {
    e.preventDefault();
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
    <main className="h-screen w-screen flex flex-col px-1 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] bg-palette-bg-dark text-palette-muted-light overflow-hidden">
      {concessionOffered?.offered && (
        <ConcessionModal
          onAccept={(outcome: ConcessionOutcome, narrative: string) =>
            dispatch(acceptConcession({ outcome, narrative }))
          }
          onReject={() => dispatch(rejectConcession())}
        />
      )}
      {tradePanelMerchantId &&
        currentRoom?.merchants &&
        player &&
        (() => {
          const merchant = currentRoom.merchants.find((m) => m.id === tradePanelMerchantId);
          return merchant ? (
            <TradePanel
              merchant={merchant}
              playerInventory={player.inventory}
              playerSpirit={player.spirit ?? 0}
              playerBlood={player.blood ?? 0}
              onBuy={(itemId) => dispatch(buyFromMerchant({ merchantId: tradePanelMerchantId, itemId }))}
              onSell={(itemId) => dispatch(sellToMerchant({ merchantId: tradePanelMerchantId, itemId }))}
              onClose={() => dispatch(closeTradePanel())}
            />
          ) : null;
        })()}
      {inventoryOpen && player && (
        <InventoryPanel
          player={player}
          onClose={() => dispatch(toggleInventory())}
          onEquip={(itemId, slot) => dispatch(equipItem({ itemId, slot }))}
          onUnequip={(slot) => dispatch(unequipItem({ slot }))}
          onUse={(itemId) => dispatch(useConsumableItem({ itemId }))}
          onSacrifice={(itemId) => dispatch(sacrificeItem({ itemId }))}
        />
      )}
      <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-[9fr_15fr_15fr_11fr] gap-y-2 py-2 overflow-hidden">
        <div className="min-h-0 overflow-hidden w-full">
          <PlayerHeader player={player} />
        </div>
        <div className="min-h-0 overflow-auto w-full vengeance-border border-b-2 border-(--border-red) rounded-none">
          {showMap ? (
            <MapView
              exploredRooms={exploredRooms}
              roomCoordinates={roomCoordinates}
              currentRoomId={currentRoom?.id ?? null}
            />
          ) : (
            <RoomViewport room={currentRoom} onTradeMerchant={(id) => dispatch(openTradePanel({ merchantId: id }))} />
          )}
        </div>
        <div className="min-h-0 overflow-auto w-full flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
            <ThreadList threads={threads} mainThreadId={mainThreadId} onSetMain={(id) => dispatch(setMainThread(id))} />
            <FactsPanel facts={facts} />
            <VignetteControls
              theme={vignette?.theme ?? ""}
              stage={vignette?.stage}
              threadIds={vignette?.threadIds}
              threads={threads}
              onStart={(theme) =>
                dispatch(
                  startVignette({
                    theme,
                    threadIds: mainThreadId ? [mainThreadId] : threads.map((t) => t.id),
                  })
                )
              }
              onAdvance={(stage) => dispatch(advanceVignetteStage({ stage }))}
              onEnd={() => dispatch(endVignette())}
            />
            <NeuralLogPanel logs={logs} />
          </div>
          <div className="shrink-0 flex flex-col border-t border-palette-border bg-palette-bg-mid/10">
            <div className="flex items-center gap-1.5 shrink-0">
              <StageSelector stage={stageOfScene} onStageChange={(s) => dispatch(setStageOfScene(s))} />
              {currentSceneId && (
                <button
                  type="button"
                  onClick={() => {
                    playSound();
                    dispatch(fadeOutScene({ sceneId: currentSceneId }));
                  }}
                  className="px-2 py-0.5 border border-palette-border text-palette-muted hover:text-palette-accent-cyan text-xs uppercase"
                  data-testid="fade-out-scene"
                  aria-label="Fade out scene"
                >
                  Fade out
                </button>
              )}
            </div>
            <OracleForm
              value={oracleInput}
              onChange={(value) => dispatch(setOracleInput(value))}
              onSubmit={handleAskOracle}
            />
          </div>
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
            onCast={(spellId) => dispatch(castSpell({ spellId }))}
            inventoryOpen={inventoryOpen}
            onToggleInventory={() => dispatch(toggleInventory())}
          />
        </div>
      </div>
    </main>
  );
}
