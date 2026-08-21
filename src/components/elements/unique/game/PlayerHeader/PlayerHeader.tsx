"use client";

import { PlayerHeaderIdentity } from "./PlayerHeaderIdentity";
import { PlayerHeaderBars } from "./PlayerHeaderBars";
import { PlayerHeaderMedia } from "./PlayerHeaderMedia";
import { RuneSigil } from "@/components/elements/unique";
import type { PlayerActor } from "@/features/game/types";

export function PlayerHeader({ player }: { player: PlayerActor }) {
  return (
    <header
      className="relative shrink-0 cozy-panel bg-palette-bg-mid/40 flex flex-col lg:flex-row items-start lg:items-center justify-between p-1.5 sm:p-2 gap-1.5 sm:gap-2 overflow-x-auto min-w-0"
      data-testid="player-header"
    >
      <RuneSigil className="hidden sm:block absolute top-2 right-3 text-base" />
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 w-full lg:w-auto min-w-0 shrink-0">
        <PlayerHeaderIdentity player={player} />
        <PlayerHeaderBars player={player} />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 shrink-0 min-w-0 ml-auto self-end lg:pl-4 lg:border-l lg:border-palette-border/40">
        <PlayerHeaderMedia />
      </div>
    </header>
  );
}
