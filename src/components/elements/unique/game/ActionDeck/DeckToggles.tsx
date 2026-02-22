"use client";

import { Award, Box, Users, Zap } from "lucide-react";
import type { PlayerActor, Item } from "@/features/game/types";

export function DeckToggles({
  player,
  onOpenCapabilities,
  onOpenSkills,
  onOpenInventory,
  onOpenCompanion,
}: {
  player: PlayerActor;
  onOpenCapabilities?: () => void;
  onOpenSkills?: () => void;
  onOpenInventory?: () => void;
  onOpenCompanion?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 border-l border-palette-border pl-2 items-center shrink-0">
      <button
        type="button"
        onClick={onOpenCapabilities}
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-mid/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="capabilities-toggle"
        aria-label="View capabilities"
        title="View capabilities"
      >
        <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Capabilities</span>
        </span>
        <div className="flex gap-px">
          {(player.capabilities.learned ?? []).slice(0, 3).map((id) => (
            <div
              key={id}
              className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
              title={id}
            >
              <Zap className="app-icon" />
            </div>
          ))}
          {(player.capabilities.learned?.length ?? 0) > 3 && (
            <div className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted text-[10px] font-mono pointer-events-none">
              +{(player.capabilities.learned?.length ?? 0) - 3}
            </div>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onOpenSkills}
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-bright/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="skills-toggle"
        aria-label="View skills"
        title="View skills"
      >
        <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Skills</span>
        </span>
        <div className="flex gap-px">
          {([] as string[]).map((skill) => (
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
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-bright/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="inventory-toggle"
        aria-label="Open inventory"
        title="View items"
      >
        <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Items</span>
        </span>
        <div className="flex gap-px">
          {(player.inventory.items as Item[]).map((item) => (
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
      {(player.companions?.length ?? 0) > 0 && (
        <button
          type="button"
          onClick={onOpenCompanion}
          className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-lime/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
          data-testid="companion-toggle"
          aria-label="View Companions"
          title="View Companions"
        >
          <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs whitespace-nowrap">
            <span className="hidden sm:inline">Companions</span>
          </span>
          <div className="flex gap-px">
            {player.companions!.map((comp) => (
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
