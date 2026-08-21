import type { PlayerActor } from "@/features/game/types";
import { CLASS_PRESENTATION } from "@/features/game/mechanics/classes";
import { cn } from "@/features/core/utils";

function StatRow({
  label,
  fillClassName,
  width,
  value,
}: {
  label: string;
  fillClassName: string;
  width: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex items-center gap-1" title={label}>
      <span className="hidden sm:inline text-palette-muted-light uppercase text-[10px] sm:text-xs tracking-[0.18em] shrink-0 whitespace-nowrap" aria-hidden>{label}</span>
      <div className="w-12 sm:w-16 lg:w-28 xl:w-36 min-w-0">
        <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border/60 rounded-full overflow-hidden">
          <div className={cn("h-full transition-all duration-500 min-w-[2px]", fillClassName)} style={{ width }} />
        </div>
      </div>
      <span className="hidden sm:inline text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function PlayerHeaderBars({ player }: { player: PlayerActor }) {
  const classKey = player.agentClass as keyof typeof CLASS_PRESENTATION | undefined;
  const presentation = classKey ? CLASS_PRESENTATION[classKey] : undefined;
  const folkLabel = presentation?.name ?? player.agentClass ?? 'Unknown';

  return (
    <div className="flex-1 flex flex-col gap-1.5 justify-center min-w-44">
      <div className="flex flex-col gap-0.5 mb-0.5">
        <span className="text-palette-muted-light uppercase tracking-[0.18em] leading-tight flex items-center gap-1.5">
          <span className="font-runic text-palette-accent-mid">ᚠᚢᚦ</span>
          Folk: {folkLabel}
          <span className="status-led" aria-hidden />
        </span>
        <span className="font-bold text-palette-accent-mid tracking-tight leading-tight flex items-baseline gap-1 min-w-0">
          <span className="truncate min-w-0">{player.name}</span>
          <span className="text-palette-muted-light shrink-0">Bloom {player.stats.level ?? 1}</span>
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1">
        <div className="flex flex-col gap-1">
          <StatRow
            label="Health"
            fillClassName="bg-palette-accent-dim"
            width={`${(player.stats.hp / player.stats.maxHp) * 100}%`}
            value={`${player.stats.hp}/${player.stats.maxHp}`}
          />
          <StatRow
            label="Worry"
            fillClassName="bg-palette-accent-soft"
            width={`${(player.stats.stress / player.stats.maxStress) * 100}%`}
            value={`${player.stats.stress}/${player.stats.maxStress}`}
          />
          <StatRow
            label="Learning"
            fillClassName="bg-palette-accent-bright"
            width={`${((player.stats.xp ?? 0) / (player.stats.maxXp ?? 1)) * 100}%`}
            value={`${player.stats.xp ?? 0}/${player.stats.maxXp ?? 1} (Bloom ${player.stats.level})`}
          />
        </div>
        <div className="flex flex-col gap-1 sm:border-l sm:border-palette-border/40 sm:pl-4">
          <StatRow
            label="Pollen"
            fillClassName="bg-palette-accent-mid"
            width={(player.inventory.spirit ?? 0) > 0 ? "100%" : "0%"}
            value={player.inventory.spirit ?? 0}
          />
          <StatRow
            label="Glowstones"
            fillClassName="bg-palette-accent-soft"
            width={(player.inventory.blood ?? 0) > 0 ? "100%" : "0%"}
            value={player.inventory.blood ?? 0}
          />
          <StatRow
            label="Spark"
            fillClassName="bg-palette-accent-lime"
            width={player.entropyModifier > 0 ? "100%" : "0%"}
            value={player.entropyModifier}
          />
        </div>
      </div>
    </div>
  );
}
