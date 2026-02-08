"use client";

import type { VignetteStage } from "@/lib/quadar/types";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectVignetteThemeInput, setVignetteThemeInput } from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound } from "@/features/audio";

const STAGES: VignetteStage[] = ["Exposition", "Rising Action", "Climax", "Epilogue"];

export function VignetteControls({
  theme = "",
  stage = "Exposition",
  onStart,
  onAdvance,
  onEnd,
}: {
  theme?: string;
  stage?: VignetteStage;
  onStart: (theme: string) => void;
  onAdvance: (stage: VignetteStage) => void;
  onEnd: () => void;
}) {
  const dispatch = useAppDispatch();
  const inputTheme = useAppSelector(selectVignetteThemeInput);
  const hasActiveVignette = Boolean(theme);
  const currentIndex = STAGES.indexOf(stage);
  const nextStage = STAGES[currentIndex + 1];
  const playSound = usePlayButtonSound();

  return (
    <div className="border-b border-palette-border bg-palette-bg-mid/10 shrink-0 p-1.5 space-y-1.5" data-testid="vignette-controls">
      <span className="text-palette-muted uppercase tracking-wider text-xs block">Vignette</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          type="text"
          value={inputTheme}
          onChange={(e) => dispatch(setVignetteThemeInput(e.target.value))}
          placeholder="Theme"
          className="flex-1 min-w-[8rem] px-2 py-0.5 bg-palette-bg-dark border border-palette-border text-palette-muted-light text-sm"
          data-testid="vignette-theme"
          aria-label="Vignette theme"
        />
        <button
          type="button"
          onClick={() => {
            playSound();
            onStart(inputTheme);
          }}
          className="px-2 py-0.5 border border-palette-border text-palette-muted hover:border-palette-accent-cyan hover:text-palette-accent-cyan text-xs uppercase"
          data-testid="vignette-start"
          aria-label="Start vignette"
        >
          Start
        </button>
        {hasActiveVignette && nextStage && (
          <button
            type="button"
            onClick={() => {
              playSound();
              onAdvance(nextStage);
            }}
            className="px-2 py-0.5 border border-palette-accent-magic/50 text-palette-accent-magic text-xs uppercase"
            data-testid={`vignette-advance-${nextStage.replace(/\s+/g, "-").toLowerCase()}`}
            aria-label={`Advance to ${nextStage}`}
          >
            → {nextStage}
          </button>
        )}
        {hasActiveVignette && (
          <button
            type="button"
            onClick={() => {
              playSound();
              onEnd();
            }}
            className="px-2 py-0.5 border border-palette-border text-palette-muted hover:text-palette-accent-red text-xs uppercase"
            data-testid="vignette-end"
            aria-label="End vignette"
          >
            End
          </button>
        )}
      </div>
      {theme ? <p className="text-xs text-palette-muted">Theme: {theme} · Stage: {stage}</p> : null}
    </div>
  );
}
