"use client";

import type { VignetteStage } from "@/features/game/types";
import { GameButton } from "@/components/elements/generic";

export function VignetteControls({
  theme = "",
  stage = "Exposition",
  threadIds,
  threads = [],
  currentSceneId = null,
  onFadeOutScene,
}: {
  theme?: string;
  stage?: VignetteStage;
  threadIds?: string[];
  threads?: { id: string; name: string }[];
  /** Current scene id (from narrative); Fade out button only active when set. */
  currentSceneId?: string | null;
  onFadeOutScene?: () => void;
  // These props are no longer used but kept for interface compatibility if needed, 
  // though it's cleaner to remove them from usage sites too.
  onStart?: (theme: string) => void;
  onAdvance?: (stage: VignetteStage) => void;
  onEnd?: () => void;
}) {
  return (
    <div className="border-b border-palette-border bg-palette-bg-mid/10 shrink-0 p-1.5 space-y-1.5" data-testid="vignette-controls">
      <div className="flex items-center justify-between">
        <span className="text-palette-muted uppercase tracking-wider text-xs block">Vignette</span>
        {currentSceneId && onFadeOutScene && (
          <GameButton
            onClick={onFadeOutScene}
            className="px-2 py-0.5 text-xs h-auto"
            data-testid="fade-out-scene"
            aria-label="Fade out scene"
          >
            Fade out
          </GameButton>
        )}
      </div>

      {theme ? (
        <p className="text-xs text-palette-muted animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-palette-accent-soft font-bold">Acting:</span> {theme} <span className="opacity-50">·</span> {stage}
          {threadIds?.length && threads.length
            ? <span className="block mt-0.5 text-palette-text-muted/70">Threads: {threadIds.map((id) => threads.find((t) => t.id === id)?.name ?? id).join(", ")}</span>
            : null}
        </p>
      ) : (
        <p className="text-xs text-palette-muted italic">No active vignette.</p>
      )}
    </div>
  );
}
