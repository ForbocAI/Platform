"use client";

import type { StageOfScene } from "@/features/narrative/types";
import { cn } from "@/features/core/utils";
import { useAppDispatch } from "@/features/core/store";
import { playButtonSound } from "@/features/audio";
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
    <div className="flex flex-col gap-1 p-2 sm:p-2.5 pb-1.5 sm:pb-2 shrink-0" data-testid="stage-selector">
      <span className="flex items-center gap-1 text-palette-muted-light uppercase tracking-[0.16em] leading-tight">
        <span className="font-runic text-palette-accent-mid">ᚱᚢᚾ</span> Story Path
      </span>
      <div className="flex flex-nowrap gap-0.5 overflow-x-auto">
        {STAGES.map(({ value, label }) => (
          <GameButton
            key={value}
            variant={stage === value ? "magic" : "default"}
            showLabel
            onClick={() => {
              dispatch(playButtonSound());
              onStageChange(value);
            }}
            data-testid={`stage-${value.replace(/\s+/g, "-").toLowerCase()}`}
            aria-label={`Story path: ${label}`}
            className={cn(
              "px-1 py-0.5 h-auto leading-tight text-[10px] shrink-0",
              stage === value
                ? "bg-palette-accent-soft/45 text-palette-accent-bright border-palette-accent-soft/60"
                : "text-palette-muted-light hover:text-palette-accent-bright border-transparent"
            )}
          >
            {label}
          </GameButton>
        ))}
      </div>
    </div>
  );
}
