"use client";

import { Wand2, Award, Box, Users } from "lucide-react";
import type { Player } from "@/features/game/types";

export function DeckToggles({
  player,
  onOpenSpells,
  onOpenSkills,
  onOpenInventory,
  onOpenServitor,
}: {
  player: Player;
  onOpenSpells?: () => void;
  onOpenSkills?: () => void;
  onOpenInventory?: () => void;
  onOpenServitor?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 border-l border-palette-border pl-2 items-center shrink-0">
      <button
        type="button"
        onClick={onOpenSpells}
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-cyan/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="spells-toggle"
        aria-label="View spells"
        title="View spells"
      >
        <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Spells</span>
        </span>
        <div className="flex gap-px">
          {player.spells.map((spell) => (
            <div
              key={spell}
              className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
              title={spell}
            >
              <Wand2 className="app-icon" />
            </div>
          ))}
        </div>
      </button>
      <button
        type="button"
        onClick={onOpenSkills}
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-gold/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="skills-toggle"
        aria-label="View skills"
        title="View skills"
      >
        <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Skills</span>
        </span>
        <div className="flex gap-px">
          {(player.skills ?? []).map((skill) => (
            <div
              key={skill}
              className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
              title={skill}
            >
              <Award className="app-icon" />
            </div>
          ))}
        </div>
      </button>
      <button
        type="button"
        onClick={onOpenInventory}
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-gold/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="inventory-toggle"
        aria-label="Open inventory"
        title="View items"
      >
        <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Items</span>
        </span>
        <div className="flex gap-px">
          {player.inventory.map((item) => (
            <div
              key={item.id}
              className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
              title={item.name}
            >
              <Box className="app-icon" />
            </div>
          ))}
        </div>
      </button>
      {(player.servitors?.length ?? 0) > 0 && (
        <button
          type="button"
          onClick={onOpenServitor}
          className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-lime/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
          data-testid="servitor-toggle"
          aria-label="View Servitors"
          title="View Servitors"
        >
          <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
            <span className="hidden sm:inline">Servitors</span>
          </span>
          <div className="flex gap-px">
            {player.servitors!.map((comp) => (
              <div
                key={comp.id}
                className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
                title={comp.name}
              >
                <Users className="app-icon" />
              </div>
            ))}
          </div>
        </button>
      )}
    </div>
  );
}
