"use client";

import { PlayerHeader, StageSelector } from "@/components/elements/unique";
import type { Player } from "@/lib/game/types";
import type { StageOfScene } from "@/lib/game/types";

export function GameScreenHeader({
  player,
  stage,
  onStageChange,
  onPartyClick,
}: {
  player: Player;
  stage: StageOfScene;
  onStageChange: (s: StageOfScene) => void;
  onPartyClick?: () => void;
}) {
  return (
    <>
      <PlayerHeader player={player} onPartyClick={onPartyClick} />
      <StageSelector stage={stage} onStageChange={onStageChange} />
    </>
  );
}
