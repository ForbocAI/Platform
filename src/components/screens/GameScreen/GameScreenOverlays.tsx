"use client";

import { InventoryPanel, SpellsPanel } from "@/components/elements/unique";
import type { Player } from "@/lib/quadar/types";

export function GameScreenOverlays({
  inventoryOpen,
  spellsPanelOpen,
  player,
  onCloseInventory,
  onCloseSpells,
}: {
  inventoryOpen: boolean;
  spellsPanelOpen: boolean;
  player: Player;
  onCloseInventory: () => void;
  onCloseSpells: () => void;
}) {
  return (
    <>
      {inventoryOpen && (
        <InventoryPanel
          player={player}
          onClose={onCloseInventory}
          onEquip={() => {}}
          onUnequip={() => {}}
          onUse={() => {}}
        />
      )}
      {spellsPanelOpen && (
        <SpellsPanel
          player={player}
          onClose={onCloseSpells}
        />
      )}
    </>
  );
}
