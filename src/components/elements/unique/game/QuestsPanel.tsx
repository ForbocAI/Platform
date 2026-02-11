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
      {activeQuests.map((q) => (
        <div key={q.id} className="text-xs text-palette-muted">
          <span
            className={
              q.complete ? "line-through text-palette-muted/70" : ""
            }
          >
            {q.label}: {q.progress}/{q.target}
          </span>
          {q.complete && (
            <span className="ml-1 text-palette-accent-cyan">✓</span>
          )}
        </div>
      ))}
      {sessionComplete === "quests" && sessionScore && (
        <div className="text-xs text-palette-accent-cyan pt-1 border-t border-palette-border/50">
          Session complete — Rooms: {sessionScore.roomsExplored} | Scans:{" "}
          {sessionScore.roomsScanned} | Foes: {sessionScore.enemiesDefeated} |
          Trades: {sessionScore.merchantTrades} | Quests:{" "}
          {sessionScore.questsCompleted} | Spirit: {sessionScore.spiritEarned}
        </div>
      )}
      {sessionComplete === "death" && sessionScore && (
        <div className="text-xs text-palette-accent-red pt-1 border-t border-palette-border/50">
          Session ended (death) — Rooms: {sessionScore.roomsExplored} | Scans:{" "}
          {sessionScore.roomsScanned} | Foes: {sessionScore.enemiesDefeated} |
          Trades: {sessionScore.merchantTrades} | Quests:{" "}
          {sessionScore.questsCompleted} | Spirit: {sessionScore.spiritEarned}
        </div>
      )}
    </div>
  );
}
