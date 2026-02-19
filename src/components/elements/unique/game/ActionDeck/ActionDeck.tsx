"use client";

import type { AgentPlayer, Area } from "@/features/game/types";
import { ActionButtons } from "./ActionButtons";
import { DeckToggles } from "./DeckToggles";

export function ActionDeck({
  player,
  currentArea,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onCommune,
  onOpenInventory,
  onOpenCapabilities,
  onOpenSkills,
  onOpenCompanion,
  autoPlay,
  onToggleAutoPlay,
}: {
  player: AgentPlayer;
  currentArea: Area;
  onMove: (direction: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onCommune: () => void;
  onOpenInventory?: () => void;
  onOpenCapabilities?: () => void;
  onOpenSkills?: () => void;
  onOpenCompanion?: () => void;
  autoPlay?: boolean;
  onToggleAutoPlay?: () => void;
}) {
  return (
    <footer
      className="shrink-0 vengeance-border bg-palette-bg-mid/80 p-1.5 sm:p-2 flex flex-row gap-1.5 sm:gap-2 items-center justify-start overflow-x-auto min-h-0"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ActionButtons
        currentArea={currentArea}
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
        onOpenCapabilities={onOpenCapabilities}
        onOpenSkills={onOpenSkills}
        onOpenInventory={onOpenInventory}
        onOpenCompanion={onOpenCompanion}
      />
    </footer>
  );
}
