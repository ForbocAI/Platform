"use client";

import { PlayerHeader, StageSelector } from "@/components/elements/unique";
import type { Player } from "@/features/game/types";
import type { StageOfScene } from "@/features/game/types";

export function GameScreenHeader({
  player,
  stage,
  onStageChange,
  onServitorClick,
}: {
  player: Player;
  stage: StageOfScene;
  onStageChange: (s: StageOfScene) => void;
  onServitorClick?: () => void;
}) {
  return (
    <>
      <PlayerHeader player={player} onServitorClick={onServitorClick} />
      <StageSelector stage={stage} onStageChange={onStageChange} />
    </>
  );
}
