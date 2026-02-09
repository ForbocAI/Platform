"use client";

import { PlayerHeaderIdentity } from "./PlayerHeaderIdentity";
import { PlayerHeaderBars } from "./PlayerHeaderBars";
import { PlayerHeaderResources } from "./PlayerHeaderResources";
import { PlayerHeaderStats } from "./PlayerHeaderStats";
import { PlayerHeaderMedia } from "./PlayerHeaderMedia";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeader({ player }: { player: Player }) {
  return (
    <header
      className="shrink-0 vengeance-border bg-palette-bg-mid/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-1.5 sm:p-2 gap-1.5 sm:gap-2 overflow-x-auto min-w-0"
      data-testid="player-header"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 w-full lg:w-auto min-w-0 shrink-0">
        <PlayerHeaderIdentity player={player} />
        <PlayerHeaderBars player={player} />
      </div>
      <div className="flex items-center justify-between w-full lg:w-auto gap-1.5 sm:gap-2 lg:gap-4 shrink-0 min-w-0">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <PlayerHeaderStats player={player} />
          <PlayerHeaderResources player={player} />
        </div>
        <PlayerHeaderMedia />
      </div>
    </header>
  );
}
