"use client";

import { useEffect } from "react";
import { Dices } from "lucide-react";
import type { VignetteStage } from "@/lib/quadar/types";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectVignetteThemeInput, setVignetteThemeInput } from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound } from "@/features/audio";

const STAGES: VignetteStage[] = ["Exposition", "Rising Action", "Climax", "Epilogue"];

const THEMES = [
  "Shadows of the Past",
  "Lost Technology",
  "Betrayal",
  "Hope in Darkness",
  "The Void Calls",
  "Ancient Rituals",
  "Technomancer's Dream",
  "Cyber-Organic Fusion",
  "Echoes of Silence",
  "Forbidden Knowledge",
  "The Machine God",
  "Flesh and Steel"
];

export function VignetteControls({
  theme = "",
  stage = "Exposition",
  onStart,
  onAdvance,
  onEnd,
  threadIds,
  threads = [],
}: {
  theme?: string;
  stage?: VignetteStage;
  /** Thread ids tied to this vignette (narrative–spatial wiring). */
  threadIds?: string[];
  /** Thread list to resolve names for display. */
  threads?: { id: string; name: string }[];
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

  const randomizeTheme = () => {
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    dispatch(setVignetteThemeInput(randomTheme));
  };

  useEffect(() => {
    if (!inputTheme) {
      randomizeTheme();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount if empty

  return (
    <div className="border-b border-palette-border bg-palette-bg-mid/10 shrink-0 p-1.5 space-y-1.5" data-testid="vignette-controls">
      <span className="text-palette-muted uppercase tracking-wider text-xs block">Vignette</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-1">
          <div className="relative">
            <input
              type="text"
              value={inputTheme}
              readOnly
              placeholder="Theme"
              className="w-32 sm:w-40 px-2 py-0.5 bg-palette-bg-dark border border-palette-border text-palette-muted-light text-sm cursor-default focus:outline-none opacity-80"
              data-testid="vignette-theme"
              aria-label="Vignette theme"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              playSound();
              randomizeTheme();
            }}
            className="p-1 border border-palette-border text-palette-muted hover:text-palette-accent-cyan hover:border-palette-accent-cyan transition-colors"
            aria-label="Randomize theme"
            title="Roll new theme"
            data-testid="vignette-randomize"
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound();
            onStart(inputTheme);
          }}
          className="px-2 py-0.5 border border-palette-border text-palette-muted hover:border-palette-accent-cyan hover:text-palette-accent-cyan text-xs uppercase transition-colors"
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
            className="px-2 py-0.5 border border-palette-accent-magic/50 text-palette-accent-magic text-xs uppercase hover:bg-palette-accent-magic/10 transition-colors"
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
            className="px-2 py-0.5 border border-palette-border text-palette-muted hover:text-palette-accent-red hover:border-palette-accent-red text-xs uppercase transition-colors"
            data-testid="vignette-end"
            aria-label="End vignette"
          >
            End
          </button>
        )}
      </div>
      {theme ? (
        <p className="text-xs text-palette-muted animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-palette-accent-magic font-bold">Acting:</span> {theme} <span className="opacity-50">·</span> {stage}
          {threadIds?.length && threads.length
            ? <span className="block mt-0.5 text-palette-text-muted/70">Threads: {threadIds.map((id) => threads.find((t) => t.id === id)?.name ?? id).join(", ")}</span>
            : null}
        </p>
      ) : null}
    </div>
  );
}
