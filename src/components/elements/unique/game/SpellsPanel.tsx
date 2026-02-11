"use client";

import { Wand2 } from "lucide-react";
import type { Player } from "@/features/game/types";
import { Modal } from "@/components/elements/generic";

interface SpellsPanelProps {
  player: Player;
  onClose: () => void;
  onSelectSpell?: (spellId: string) => void;
}

export function SpellsPanel({ player, onClose, onSelectSpell }: SpellsPanelProps) {
  return (
    <Modal
      title="Known Spells"
      titleIcon={<Wand2 className="w-5 h-5 text-palette-accent-cyan" />}
      onClose={onClose}
      data-testid="spells-panel"
    >
      {player.spells.length === 0 ? (
        <p className="text-palette-muted text-sm">No spells learned yet.</p>
      ) : (
        <ul className="space-y-2">
          {player.spells.map((spell) => (
            <li key={spell}>
              <button
                type="button"
                onClick={() => {
                  onSelectSpell?.(spell);
                  onClose();
                }}
                className="w-full flex items-center gap-2 p-3 bg-palette-bg-mid/30 border border-palette-border rounded text-palette-white hover:bg-palette-accent-cyan/20 hover:border-palette-accent-cyan transition-all text-left border-palette-accent-magic/50"
                aria-label={`Select spell ${spell}`}
              >
                <Wand2 className="w-4 h-4 text-palette-accent-cyan shrink-0" />
                <span className="font-medium flex-1">{spell}</span>
                <span className="text-xs text-palette-muted uppercase tracking-wider">Select</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
