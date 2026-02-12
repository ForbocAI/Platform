"use client";

import { Sparkles } from "lucide-react";
import type { Player } from "@/features/game/types";
import { Modal } from "@/components/elements/generic";

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
    <Modal
      title="Unlocked Skills"
      titleIcon={<Sparkles className="w-5 h-5 text-palette-accent-bright" />}
      onClose={onClose}
      data-testid="skills-panel"
    >
      {skills.length === 0 ? (
        <p className="text-palette-muted text-sm">No skills unlocked yet. Level up to unlock class skills.</p>
      ) : (
        <ul className="space-y-2">
          {skills.map((skillId) => (
            <li key={skillId}>
              <div className="flex items-center gap-2 p-3 bg-palette-bg-mid/30 border border-palette-border rounded text-palette-white">
                <Sparkles className="w-4 h-4 text-palette-accent-bright shrink-0" />
                <span className="font-medium flex-1">{formatSkillLabel(skillId)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
