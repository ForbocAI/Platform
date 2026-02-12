"use client";

import type { Thread } from "@/features/game/types";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/features/core/store";
import { playButtonSound } from "@/features/audio";
import { GameButton } from "@/components/elements/generic";

export function ThreadList({
  threads,
  mainThreadId,
  onSetMain,
}: {
  threads: Thread[];
  mainThreadId: string | null;
  onSetMain: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  if (threads.length === 0) return null;

  return (
    <div className="border-b border-palette-border bg-palette-bg-mid/10 shrink-0 p-1.5" data-testid="thread-list">
      <span className="text-palette-muted uppercase tracking-wider text-xs block mb-1">Threads</span>
      <div className="flex flex-wrap gap-1">
        {threads.map((t) => (
          <GameButton
            key={t.id}
            variant={mainThreadId === t.id ? "magic" : "default"}
            onClick={() => {
              dispatch(playButtonSound());
              onSetMain(t.id);
            }}
            data-testid={`thread-${t.id}`}
            aria-label={mainThreadId === t.id ? `Main thread: ${t.name}` : `Set main thread: ${t.name}`}
            className={cn(
              "px-2 py-0.5 text-xs h-auto",
              mainThreadId === t.id
                ? "bg-palette-accent-soft/50 border-palette-accent-mid/50 text-palette-accent-mid"
                : "border-palette-border text-palette-muted hover:text-palette-muted-light"
            )}
          >
            {t.name}
          </GameButton>
        ))}
      </div>
    </div>
  );
}
