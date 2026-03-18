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
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-mid/50 rounded-2xl p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="capabilities-toggle"
        aria-label="View gifts"
        title="View gifts"
      >
        <span className="text-palette-muted-light uppercase tracking-[0.16em] leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Gifts</span>
        </span>
        <div className="flex gap-px">
          {(player.capabilities.learned ?? []).slice(0, 3).map((id) => (
            <div
              key={id}
              className="w-5 h-5 bg-palette-bg-mid border border-palette-border/70 rounded-full flex items-center justify-center text-palette-muted-light pointer-events-none"
              title={id}
            >
              <Zap className="app-icon" />
            </div>
          ))}
          {(player.capabilities.learned?.length ?? 0) > 3 && (
            <div className="w-5 h-5 bg-palette-bg-mid border border-palette-border/70 rounded-full flex items-center justify-center text-palette-muted-light text-[10px] font-mono pointer-events-none">
              +{(player.capabilities.learned?.length ?? 0) - 3}
            </div>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onOpenSkills}
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-bright/50 rounded-2xl p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="skills-toggle"
        aria-label="View knacks"
        title="View knacks"
      >
        <span className="text-palette-muted-light uppercase tracking-[0.16em] leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Knacks</span>
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
        className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-bright/50 rounded-2xl p-1 -m-1 transition-colors cursor-pointer min-w-0"
        data-testid="inventory-toggle"
        aria-label="Open pack"
        title="View pack"
      >
        <span className="text-palette-muted-light uppercase tracking-[0.16em] leading-tight text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Pack</span>
        </span>
        <div className="flex gap-px">
          {(player.inventory.items as Item[]).map((item) => (
            <div
              key={item.id}
              className="w-5 h-5 bg-palette-bg-mid border border-palette-border/70 rounded-full flex items-center justify-center text-palette-muted-light pointer-events-none"
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
          className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-lime/50 rounded-2xl p-1 -m-1 transition-colors cursor-pointer min-w-0"
          data-testid="companion-toggle"
          aria-label="View companions"
          title="View companions"
        >
          <span className="text-palette-muted-light uppercase tracking-[0.16em] leading-tight text-xs whitespace-nowrap">
            <span className="hidden sm:inline">Companions</span>
          </span>
          <div className="flex gap-px">
            {player.companions!.map((comp) => (
              <div
                key={comp.id}
                className="w-5 h-5 bg-palette-bg-mid border border-palette-border/70 rounded-full flex items-center justify-center text-palette-muted-light pointer-events-none"
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
