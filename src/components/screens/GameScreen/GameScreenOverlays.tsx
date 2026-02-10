"use client";

import { InventoryPanel, SpellsPanel, SkillsPanel, ConcessionModal, TradePanel } from "@/components/elements/unique";
import type { Player } from "@/lib/quadar/types";

export function GameScreenOverlays({
  inventoryOpen,
  spellsPanelOpen,
  skillsPanelOpen,
  player,
  onCloseInventory,
  onCloseSpells,
  onCloseSkills,
  onAcceptConcession,
  onRejectConcession,
  activeMerchant,
  onCloseTrade,
  onSelectSpell,
}: {
  inventoryOpen: boolean;
  spellsPanelOpen: boolean;
  skillsPanelOpen: boolean;
  player: Player;
  onCloseInventory: () => void;
  onCloseSpells: () => void;
  onCloseSkills: () => void;
  onAcceptConcession?: (type: 'flee' | 'capture') => void;
  onRejectConcession?: () => void;
  activeMerchant?: import("@/lib/quadar/types").Merchant | null;
  onCloseTrade?: () => void;
  onSelectSpell?: (spellId: string) => void;
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
          onSelectSpell={onSelectSpell}
        />
      )}
      {skillsPanelOpen && (
        <SkillsPanel
          player={player}
          onClose={onCloseSkills}
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
