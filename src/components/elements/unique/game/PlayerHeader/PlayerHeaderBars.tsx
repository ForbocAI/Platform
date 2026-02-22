import type { PlayerActor } from "@/features/game/types";

export function PlayerHeaderBars({ player }: { player: PlayerActor }) {
  return (
    <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 justify-center min-w-44">
      <div className="min-w-0 flex items-center gap-1" title="FLESH">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>FLESH</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div
              className="h-full bg-palette-accent-mid transition-all duration-500"
              style={{ width: `${(player.stats.hp / player.stats.maxHp) * 100}%` }}
            />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.stats.hp}/{player.stats.maxHp}
        </span>
      </div>
      <div className="min-w-0 flex items-center gap-1" title="PRESSURE">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>PRESSURE</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div
              className="h-full bg-palette-accent-mid transition-all duration-500"
              style={{ width: `${(player.stats.stress / player.stats.maxStress) * 100}%` }}
            />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.stats.stress}/{player.stats.maxStress}
        </span>
      </div>
      <div className="min-w-0 flex items-center gap-1" title="LORE">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>LORE</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div
              className="h-full bg-palette-accent-bright transition-all duration-500"
              style={{ width: `${((player.stats.xp ?? 0) / (player.stats.maxXp ?? 1)) * 100}%` }}
            />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.stats.xp ?? 0}/{player.stats.maxXp ?? 1} (Echo {player.stats.level})
        </span>
      </div>
      <div className="min-w-0 flex items-center gap-1" title="Spirit">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>Spirit</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div className="h-full bg-palette-accent-mid transition-all duration-500 min-w-[2px]" style={{ width: (player.inventory.spirit ?? 0) > 0 ? "100%" : "0%" }} />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.inventory.spirit ?? 0}
        </span>
      </div>
      <div className="min-w-0 flex items-center gap-1" title="Blood">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>Blood</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div className="h-full bg-palette-accent-mid transition-all duration-500 min-w-[2px]" style={{ width: (player.inventory.blood ?? 0) > 0 ? "100%" : "0%" }} />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.inventory.blood ?? 0}
        </span>
      </div>
      <div className="min-w-0 flex items-center gap-1" title="Surge">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>Surge</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div className="h-full bg-palette-accent-lime transition-all duration-500 min-w-[2px]" style={{ width: player.entropyModifier > 0 ? "100%" : "0%" }} />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.entropyModifier}
        </span>
      </div>
    </div>
  );
}
