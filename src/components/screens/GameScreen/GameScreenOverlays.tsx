"use client";

import { InventoryPanel, SpellsPanel, SkillsPanel, ConcessionModal, TradePanel, ServitorPanel } from "@/components/elements/unique";
import type { Player, EquipmentSlot, Merchant } from "@/features/game/types";

export function GameScreenOverlays({
  inventoryOpen,
  spellsPanelOpen,
  skillsPanelOpen,
  player,
  onCloseInventory,
  onCloseSpells,
  onCloseSkills,
  servitorPanelOpen,
  onCloseServitor,
  onAcceptConcession,
  onRejectConcession,
  onEquipItem,
  onUnequipItem,
  onUseItem,
  activeMerchant,
  onCloseTrade,
  onSelectSpell,
  onSacrificeItem,
}: {
  inventoryOpen: boolean;
  spellsPanelOpen: boolean;
  skillsPanelOpen: boolean;
  player: Player;
  onCloseInventory: () => void;
  onCloseSpells: () => void;
  onCloseSkills: () => void;
  servitorPanelOpen: boolean;
  onCloseServitor: () => void;
  onAcceptConcession?: (type: 'flee' | 'capture') => void;
  onRejectConcession?: () => void;
  onEquipItem?: (itemId: string, slot: EquipmentSlot) => void;
  onUnequipItem?: (slot: EquipmentSlot) => void;
  onUseItem?: (itemId: string) => void;
  activeMerchant?: Merchant | null;
  onCloseTrade?: () => void;
  onSelectSpell?: (spellId: string) => void;
  onSacrificeItem?: (itemId: string) => void;
}) {
  return (
    <>
      {inventoryOpen && (
        <InventoryPanel
          player={player}
          onClose={onCloseInventory}
          onEquip={(id, slot) => onEquipItem?.(id, slot)}
          onUnequip={(slot) => onUnequipItem?.(slot)}
          onUse={(id) => onUseItem?.(id)}
          onSacrifice={(id) => onSacrificeItem?.(id)}
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
      {servitorPanelOpen && (
        <ServitorPanel
          player={player}
          onClose={onCloseServitor}
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
