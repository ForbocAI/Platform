"use client";

import type { ActiveQuest, SessionScore } from "@/features/game/types";
import { cn } from "@/features/core/utils";

interface QuestsPanelProps {
  activeQuests: ActiveQuest[];
  sessionComplete: "quests" | "death" | null;
  sessionScore: SessionScore | null;
}

export function QuestsPanel({
  activeQuests,
  sessionComplete,
  sessionScore,
}: QuestsPanelProps) {
  if (activeQuests.length === 0 && !sessionComplete) return null;

  return (
    <div
      className="shrink-0 p-2 sm:p-2.5 space-y-1.5"
      data-testid="quests-panel"
    >
      <div className="text-palette-muted-light uppercase tracking-[0.16em] text-xs font-bold">Workboard</div>
      <div className="space-y-1">
        {activeQuests.map((q) => (
          <div key={q.id} className="flex items-center justify-between gap-2 text-xs text-palette-muted-light">
            <span className={cn("truncate", q.complete && "line-through text-palette-muted/70")}>
              {q.label}
            </span>
            <span className="shrink-0 tabular-nums flex items-center gap-1">
              {q.progress}/{q.target}
              {q.complete && <span className="text-palette-accent-mid">✓</span>}
            </span>
          </div>
        ))}
      </div>
      {sessionComplete === "quests" && sessionScore && (
        <div className="text-xs text-palette-accent-mid pt-1.5 border-t border-palette-border/50">
          Journey complete — Areas: {sessionScore.areasExplored} | Scouts:{" "}
          {sessionScore.areasScanned} | Troubles: {sessionScore.npcsDefeated} |
          Trades: {sessionScore.vendorTrades} | Quests:{" "}
          {sessionScore.questsCompleted} | Supplies: {sessionScore.resourcesEarned}
        </div>
      )}
      {sessionComplete === "death" && sessionScore && (
        <div className="text-xs text-palette-accent-mid pt-1.5 border-t border-palette-border/50">
          Journey paused at dusk — Areas: {sessionScore.areasExplored} | Scouts:{" "}
          {sessionScore.areasScanned} | Troubles: {sessionScore.npcsDefeated} |
          Trades: {sessionScore.vendorTrades} | Quests:{" "}
          {sessionScore.questsCompleted} | Supplies: {sessionScore.resourcesEarned}
        </div>
      )}
    </div>
  );
}
