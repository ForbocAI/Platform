"use client";

import { PlayerHeader } from "@/components/elements/unique";
import type { PlayerActor } from "@/features/game/types";

export function GameScreenHeader({ player }: { player: PlayerActor }) {
  return (
    <div className="p-1.5 sm:p-2">
      <PlayerHeader player={player} />
    </div>
  );
}
