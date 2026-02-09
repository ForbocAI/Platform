"use client";

import { X, Wand2 } from "lucide-react";
import type { Player } from "@/lib/quadar/types";

interface SpellsPanelProps {
  player: Player;
  onClose: () => void;
}

export function SpellsPanel({ player, onClose }: SpellsPanelProps) {
  return (
    <div
      className="absolute inset-0 z-50 bg-palette-bg-dark/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center"
      data-testid="spells-panel"
    >
      <div className="w-full max-w-md bg-palette-bg-dark border border-palette-border shadow-2xl flex flex-col max-h-full">
        <div className="flex items-center justify-between p-3 border-b border-palette-border bg-palette-bg-mid/50">
          <h2 className="text-lg font-bold text-palette-white tracking-widest uppercase flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-palette-accent-cyan" />
            Known Spells
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:text-palette-accent-red transition-colors"
            data-testid="spells-panel-close"
            aria-label="Close spells"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {player.spells.length === 0 ? (
            <p className="text-palette-muted text-sm">No spells learned yet.</p>
          ) : (
            <ul className="space-y-2">
              {player.spells.map((spell) => (
                <li
                  key={spell}
                  className="flex items-center gap-2 p-2 bg-palette-bg-mid/30 border border-palette-border rounded text-palette-white"
                >
                  <Wand2 className="w-4 h-4 text-palette-accent-cyan shrink-0" />
                  <span className="font-medium">{spell}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
