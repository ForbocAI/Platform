"use client";

import type { Thread } from "@/features/game/types";
import { cn } from "@/features/core/utils";
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
    <div className="shrink-0 p-2 sm:p-2.5" data-testid="thread-list">
      <span className="text-palette-muted-light uppercase tracking-[0.16em] text-xs font-bold block mb-1.5">Story Threads</span>
      <div className="flex flex-wrap gap-1.5">
        {threads.map((t) => (
          <GameButton
            key={t.id}
            variant={mainThreadId === t.id ? "magic" : "default"}
            onClick={() => {
              dispatch(playButtonSound());
              onSetMain(t.id);
            }}
            data-testid={`thread-${t.id}`}
            aria-label={mainThreadId === t.id ? `Main story thread: ${t.name}` : `Set main story thread: ${t.name}`}
            className={cn(
              "px-2 py-0.5 text-xs h-auto",
              mainThreadId === t.id
                ? "bg-palette-accent-soft/45 border-palette-accent-soft/60 text-palette-accent-bright"
                : "border-palette-border/60 text-palette-muted-light hover:text-palette-accent-bright"
            )}
          >
            {t.name}
          </GameButton>
        ))}
      </div>
    </div>
  );
}
