"use client";

import { X, Sparkles } from "lucide-react";
import type { Player } from "@/lib/quadar/types";

/** Format skill id for display (e.g. keen_senses -> Keen Senses). */
function formatSkillLabel(skillId: string): string {
  return skillId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

interface SkillsPanelProps {
  player: Player;
  onClose: () => void;
}

export function SkillsPanel({ player, onClose }: SkillsPanelProps) {
  const skills = player.skills ?? [];
  return (
    <div
      className="absolute inset-0 z-50 bg-palette-bg-dark/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center"
      data-testid="skills-panel"
    >
      <div className="w-full max-w-md bg-palette-bg-dark border border-palette-border shadow-2xl flex flex-col max-h-full">
        <div className="flex items-center justify-between p-3 border-b border-palette-border bg-palette-bg-mid/50">
          <h2 className="text-lg font-bold text-palette-white tracking-widest uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-palette-accent-gold" />
            Unlocked Skills
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:text-palette-accent-red transition-colors"
            data-testid="skills-panel-close"
            aria-label="Close skills"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {skills.length === 0 ? (
            <p className="text-palette-muted text-sm">No skills unlocked yet. Level up to unlock class skills.</p>
          ) : (
            <ul className="space-y-2">
              {skills.map((skillId) => (
                <li key={skillId}>
                  <div className="flex items-center gap-2 p-3 bg-palette-bg-mid/30 border border-palette-border rounded text-palette-white">
                    <Sparkles className="w-4 h-4 text-palette-accent-gold shrink-0" />
                    <span className="font-medium flex-1">{formatSkillLabel(skillId)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
