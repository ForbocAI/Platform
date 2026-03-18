"use client";

import type { ActiveQuest, SessionScore } from "@/features/game/types";

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
      className="shrink-0 border-b border-palette-border p-2 space-y-1.5 bg-palette-bg-mid/10"
      data-testid="quests-panel"
    >
      <div className="text-palette-muted-light uppercase tracking-[0.16em] text-xs">Workboard</div>
      {activeQuests.map((q) => (
        <div key={q.id} className="text-xs text-palette-muted-light">
          <span
            className={
              q.complete ? "line-through text-palette-muted/70" : ""
            }
          >
            {q.label}: {q.progress}/{q.target}
          </span>
          {q.complete && (
            <span className="ml-1 text-palette-accent-mid">✓</span>
          )}
        </div>
      ))}
      {sessionComplete === "quests" && sessionScore && (
        <div className="text-xs text-palette-accent-mid pt-1 border-t border-palette-border/50">
          Journey complete — Areas: {sessionScore.areasExplored} | Scouts:{" "}
          {sessionScore.areasScanned} | Troubles: {sessionScore.npcsDefeated} |
          Trades: {sessionScore.vendorTrades} | Quests:{" "}
          {sessionScore.questsCompleted} | Supplies: {sessionScore.resourcesEarned}
        </div>
      )}
      {sessionComplete === "death" && sessionScore && (
        <div className="text-xs text-palette-accent-mid pt-1 border-t border-palette-border/50">
          Journey paused at dusk — Areas: {sessionScore.areasExplored} | Scouts:{" "}
          {sessionScore.areasScanned} | Troubles: {sessionScore.npcsDefeated} |
          Trades: {sessionScore.vendorTrades} | Quests:{" "}
          {sessionScore.questsCompleted} | Supplies: {sessionScore.resourcesEarned}
        </div>
      )}
    </div>
  );
}
