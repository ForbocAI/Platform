"use client";

import type { StageOfScene } from "@/features/game/types";
import { cn } from "@/features/core/utils";
import { useAppDispatch } from "@/features/core/store";
import { playButtonSound } from "@/features/audio";
import { RuneSigil } from "../shared/Runes";
import { GameButton } from "@/components/elements/generic";

const STAGES: { value: StageOfScene; label: string }[] = [
  { value: "To Knowledge", label: "Wonder" },
  { value: "To Conflict", label: "Trouble" },
  { value: "To Endings", label: "Homecoming" },
];

export function StageSelector({
  stage,
  onStageChange,
}: {
  stage: StageOfScene;
  onStageChange: (s: StageOfScene) => void;
}) {
  const dispatch = useAppDispatch();
  return (
    <div className="flex items-center gap-1 p-1 sm:p-1.5 border-b border-palette-border bg-palette-bg-mid/10 shrink-0 overflow-x-auto min-w-0" data-testid="stage-selector">
      <RuneSigil className="shrink-0" />
      <span className="font-runic text-palette-accent-mid shrink-0">ᚱᚢᚾ</span>
      <span className="text-palette-muted-light uppercase tracking-[0.16em] mr-0.5 shrink-0 leading-tight">Story Path:</span>
      {STAGES.map(({ value, label }) => (
        <GameButton
          key={value}
          variant={stage === value ? "magic" : "default"}
          onClick={() => {
            dispatch(playButtonSound());
            onStageChange(value);
          }}
          data-testid={`stage-${value.replace(/\s+/g, "-").toLowerCase()}`}
          aria-label={`Story path: ${label}`}
          className={cn(
            "px-1.5 sm:px-2 py-0.5 h-auto leading-tight",
            stage === value
              ? "bg-palette-accent-soft/45 text-palette-accent-bright border-palette-accent-soft/60"
              : "text-palette-muted-light hover:text-palette-accent-bright border-transparent"
          )}
        >
          {label}
        </GameButton>
      ))}
    </div>
  );
}
