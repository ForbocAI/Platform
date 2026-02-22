"use client";

import { PlayerHeaderIdentity } from "./PlayerHeaderIdentity";
import { PlayerHeaderBars } from "./PlayerHeaderBars";
import { PlayerHeaderMedia } from "./PlayerHeaderMedia";
import type { PlayerActor } from "@/features/game/types";

export function PlayerHeader({ player }: { player: PlayerActor }) {
  return (
    <header
      className="shrink-0 vengeance-border bg-palette-bg-mid/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-1.5 sm:p-2 gap-1.5 sm:gap-2 overflow-x-auto min-w-0"
      data-testid="player-header"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 w-full lg:w-auto min-w-0 shrink-0">
        <PlayerHeaderIdentity player={player} />
        <PlayerHeaderBars player={player} />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 shrink-0 min-w-0 ml-auto">
        <PlayerHeaderMedia />
      </div>
    </header>
  );
}
