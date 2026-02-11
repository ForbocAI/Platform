"use client";

import type { Player, Room } from "@/features/game/types";
import { ActionButtons } from "./ActionButtons";
import { DeckToggles } from "./DeckToggles";

export function ActionDeck({
  player,
  currentRoom,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onCommune,
  onOpenInventory,
  onOpenSpells,
  onOpenSkills,
  onOpenServitor,
  autoPlay,
  onToggleAutoPlay,
}: {
  player: Player;
  currentRoom: Room;
  onMove: (direction: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onCommune: () => void;
  onOpenInventory?: () => void;
  onOpenSpells?: () => void;
  onOpenSkills?: () => void;
  onOpenServitor?: () => void;
  autoPlay?: boolean;
  onToggleAutoPlay?: () => void;
}) {
  return (
    <footer
      className="shrink-0 vengeance-border bg-palette-bg-mid/80 p-1.5 sm:p-2 flex flex-row gap-1.5 sm:gap-2 items-center justify-start overflow-x-auto min-h-0"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ActionButtons
        currentRoom={currentRoom}
        onMove={onMove}
        onMapClick={onMapClick}
        onScan={onScan}
        onEngage={onEngage}
        onCommune={onCommune}
        autoPlay={autoPlay}
        onToggleAutoPlay={onToggleAutoPlay}
      />
      <DeckToggles
        player={player}
        onOpenSpells={onOpenSpells}
        onOpenSkills={onOpenSkills}
        onOpenInventory={onOpenInventory}
        onOpenServitor={onOpenServitor}
      />
    </footer>
  );
}
