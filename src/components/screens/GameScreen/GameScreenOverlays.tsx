"use client";

import { InventoryPanel, SpellsPanel, SkillsPanel, ConcessionModal, TradePanel, PartyPanel } from "@/components/elements/unique";
import type { Player } from "@/lib/game/types";

export function GameScreenOverlays({
  inventoryOpen,
  spellsPanelOpen,
  skillsPanelOpen,
  player,
  onCloseInventory,
  onCloseSpells,
  onCloseSkills,
  partyPanelOpen,
  onCloseParty,
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
  partyPanelOpen: boolean;
  onCloseParty: () => void;
  onAcceptConcession?: (type: 'flee' | 'capture') => void;
  onRejectConcession?: () => void;
  onEquipItem?: (itemId: string, slot: import("@/lib/game/types").EquipmentSlot) => void;
  onUnequipItem?: (slot: import("@/lib/game/types").EquipmentSlot) => void;
  onUseItem?: (itemId: string) => void;
  activeMerchant?: import("@/lib/game/types").Merchant | null;
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
      {partyPanelOpen && (
        <PartyPanel
          player={player}
          onClose={onCloseParty}
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
