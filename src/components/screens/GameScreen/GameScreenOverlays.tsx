"use client";

import { InventoryPanel, CapabilitiesPanel, SkillsPanel, ConcessionModal, TradePanel, CompanionPanel, CraftingPanel } from "@/components/elements/unique";
import type { PlayerActor, EquipmentSlot, Vendor } from "@/features/game/types";

export function GameScreenOverlays({
  inventoryOpen,
  capabilitiesPanelOpen,
  skillsPanelOpen,
  player,
  onCloseInventory,
  onCloseCapabilities,
  onCloseSkills,
  companionPanelOpen,
  onCloseCompanion,
  onAcceptConcession,
  onRejectConcession,
  onEquipItem,
  onUnequipItem,
  onUseItem,
  activeVendor,
  onCloseTrade,
  onSelectCapability,
  onSacrificeItem,
  craftingPanelOpen,
  onCloseCrafting,
}: {
  inventoryOpen: boolean;
  capabilitiesPanelOpen: boolean;
  skillsPanelOpen: boolean;
  player: PlayerActor;
  onCloseInventory: () => void;
  onCloseCapabilities: () => void;
  onCloseSkills: () => void;
  companionPanelOpen: boolean;
  onCloseCompanion: () => void;
  onAcceptConcession?: (type: 'flee' | 'capture') => void;
  onRejectConcession?: () => void;
  onEquipItem?: (itemId: string, slot: EquipmentSlot) => void;
  onUnequipItem?: (slot: EquipmentSlot) => void;
  onUseItem?: (itemId: string) => void;
  activeVendor: Vendor | null;
  onCloseTrade?: () => void;
  onSelectCapability?: (id: string) => void;
  onSacrificeItem?: (itemId: string) => void;
  craftingPanelOpen: boolean;
  onCloseCrafting: () => void;
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
          onDrop={(_id) => console.warn('Drop not implemented')}
        />
      )}
      {capabilitiesPanelOpen && (
        <CapabilitiesPanel
          player={player}
          onClose={onCloseCapabilities}
          onSelectCapability={onSelectCapability}
        />
      )}
      {skillsPanelOpen && (
        <SkillsPanel
          player={player}
          onClose={onCloseSkills}
        />
      )}
      {companionPanelOpen && (
        <CompanionPanel
          player={player}
          onClose={onCloseCompanion}
        />
      )}
      <ConcessionModal
        open={player.stats.hp <= 0}
        onAccept={(type) => onAcceptConcession?.(type)}
        onReject={() => onRejectConcession?.()}
      />
      {activeVendor && (
        <TradePanel
          player={player}
          vendor={activeVendor}
          onClose={() => onCloseTrade?.()}
        />
      )}
      {craftingPanelOpen && (
        <CraftingPanel
          player={player}
          onClose={onCloseCrafting}
        />
      )}
    </>
  );
}
