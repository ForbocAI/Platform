"use client";

import { PlayerHeader, StageSelector } from "@/components/elements/unique";
import type { PlayerActor } from "@/features/game/types";
import type { StageOfScene } from "@/features/game/types";

export function GameScreenHeader({
  player,
  stage,
  onStageChange,
}: {
  player: PlayerActor;
  stage: StageOfScene;
  onStageChange: (s: StageOfScene) => void;
}) {
  return (
    <>
      <PlayerHeader player={player} />
      <StageSelector stage={stage} onStageChange={onStageChange} />
    </>
  );
}
