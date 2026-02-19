"use client";

import { Map as MapIcon } from "lucide-react";
import { GameButton, NavButton } from "@/components/elements/generic";
import type { Area } from "@/features/game/types";

export function DirectionalPad({
  currentArea,
  onMove,
  onMapClick,
}: {
  currentArea: Area;
  onMove: (direction: string) => void;
  onMapClick: () => void;
}) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-px sm:gap-0.5 w-14 sm:w-16 h-14 sm:h-16 shrink-0 self-start *:min-w-0 *:min-h-0 overflow-hidden">
      <div />
      <NavButton dir="N" onClick={() => onMove("North")} active={!!currentArea.exits.North} data-testid="move-north" />
      <div />
      <NavButton dir="W" onClick={() => onMove("West")} active={!!currentArea.exits.West} data-testid="move-west" />
      <GameButton
        variant="magic"
        icon={<MapIcon className="app-icon" />}
        onClick={onMapClick}
        className="size-full! min-w-0 min-h-0 rounded-sm"
        title="Toggle map"
        data-testid="map-toggle"
      />
      <NavButton dir="E" onClick={() => onMove("East")} active={!!currentArea.exits.East} data-testid="move-east" />
      <div />
      <NavButton dir="S" onClick={() => onMove("South")} active={!!currentArea.exits.South} data-testid="move-south" />
      <div />
    </div>
  );
}
