"use client";

import type { StageOfScene } from "@/lib/quadar/types";
import { cn } from "@/lib/utils";
import { usePlayButtonSound } from "@/features/audio";
import { RuneSigil } from "./Runes";

const STAGES: { value: StageOfScene; label: string }[] = [
  { value: "To Knowledge", label: "Knowledge" },
  { value: "To Conflict", label: "Conflict" },
  { value: "To Endings", label: "Endings" },
];

export function StageSelector({
  stage,
  onStageChange,
}: {
  stage: StageOfScene;
  onStageChange: (s: StageOfScene) => void;
}) {
  const playSound = usePlayButtonSound();
  return (
    <div className="flex items-center gap-1 p-1 sm:p-1.5 border-b border-palette-border bg-palette-bg-mid/10 shrink-0">
      <RuneSigil className="shrink-0" />
      <span className="text-palette-muted-light uppercase tracking-wider mr-0.5 shrink-0 leading-tight">Stage:</span>
      {STAGES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            playSound();
            onStageChange(value);
          }}
          className={cn(
            "px-1.5 sm:px-2 py-0.5 font-bold uppercase tracking-wider transition-colors touch-manipulation leading-tight",
            stage === value
              ? "bg-palette-accent-magic/50 text-palette-accent-magic border border-palette-accent-cyan/50"
              : "text-palette-muted hover:text-palette-muted-light border border-transparent"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
