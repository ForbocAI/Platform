import type { Player } from "@/lib/quadar/types";

export function PlayerHeaderBars({ player }: { player: Player }) {
  return (
    <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 justify-center min-w-44">
      <div className="min-w-0 flex items-center gap-1" title="HP">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>HP</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div
              className="h-full bg-palette-accent-red transition-all duration-500"
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.hp}/{player.maxHp}
        </span>
      </div>
      <div className="min-w-0 flex items-center gap-1" title="Stress">
        <span className="hidden sm:inline text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>Stress</span>
        <div className="w-12 sm:w-16 lg:w-48 min-w-0">
          <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
            <div
              className="h-full bg-palette-accent-cyan transition-all duration-500"
              style={{ width: `${(player.stress / player.maxStress) * 100}%` }}
            />
          </div>
        </div>
        <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
          {player.stress}/{player.maxStress}
        </span>
      </div>
    </div>
  );
}
