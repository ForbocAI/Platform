"use client";

import { InventoryPanel, SpellsPanel, ConcessionModal, TradePanel } from "@/components/elements/unique";
import type { Player } from "@/lib/quadar/types";

export function GameScreenOverlays({
  inventoryOpen,
  spellsPanelOpen,
  player,
  onCloseInventory,
  onCloseSpells,
  onAcceptConcession,
  onRejectConcession,
  activeMerchant,
  onCloseTrade,
}: {
  inventoryOpen: boolean;
  spellsPanelOpen: boolean;
  player: Player;
  onCloseInventory: () => void;
  onCloseSpells: () => void;
  onAcceptConcession?: (type: 'flee' | 'capture') => void;
  onRejectConcession?: () => void;
  activeMerchant?: import("@/lib/quadar/types").Merchant | null;
  onCloseTrade?: () => void;
}) {
  return (
    <>
      {inventoryOpen && (
        <InventoryPanel
          player={player}
          onClose={onCloseInventory}
          onEquip={() => { }}
          onUnequip={() => { }}
          onUse={() => { }}
        />
      )}
      {spellsPanelOpen && (
        <SpellsPanel
          player={player}
          onClose={onCloseSpells}
        />
      )}
      <ConcessionModal
        open={player.hp <= 0}
        onAccept={(type) => onAcceptConcession?.(type)}
        onReject={() => onRejectConcession?.()}
      />
      {activeMerchant && (
        <TradePanel
          player={player}
          merchant={activeMerchant}
          onClose={() => onCloseTrade?.()}
        />
      )}
    </>
  );
}
