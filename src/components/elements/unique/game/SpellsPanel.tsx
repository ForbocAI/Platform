"use client";

import { Wand2 } from "lucide-react";
import type { Player } from "@/features/game/types";
import { Modal, GameButton } from "@/components/elements/generic";

interface SpellsPanelProps {
  player: Player;
  onClose: () => void;
  onSelectSpell?: (spellId: string) => void;
}

export function SpellsPanel({ player, onClose, onSelectSpell }: SpellsPanelProps) {
  return (
    <Modal
      title="Known Spells"
      titleIcon={<Wand2 className="w-5 h-5 text-palette-accent-mid" />}
      onClose={onClose}
      data-testid="spells-panel"
    >
      {player.spells.length === 0 ? (
        <p className="text-palette-muted text-sm">No spells learned yet.</p>
      ) : (
        <ul className="space-y-2">
          {player.spells.map((spell) => (
            <li key={spell}>
              <GameButton
                variant="magic"
                icon={<Wand2 className="w-4 h-4 text-palette-accent-mid shrink-0" />}
                onClick={() => {
                  onSelectSpell?.(spell);
                  onClose();
                }}
                className="w-full flex items-center gap-2 p-3 h-auto rounded text-left justify-start"
                aria-label={`Select spell ${spell}`}
              >
                <span className="font-medium flex-1 normal-case tracking-normal">{spell}</span>
                <span className="text-xs text-palette-muted uppercase tracking-wider">Select</span>
              </GameButton>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
