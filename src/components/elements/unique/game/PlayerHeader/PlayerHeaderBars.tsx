import { Heart, Brain, BookOpen, Sparkles, Gem, Zap } from "lucide-react";
import type { PlayerActor } from "@/features/game/types";
import { CLASS_PRESENTATION } from "@/features/game/mechanics/classes";
import { cn } from "@/features/core/utils";

function StatRow({
  icon,
  label,
  fillClassName,
  width,
  value,
  empty,
}: {
  icon: React.ReactNode;
  label: string;
  fillClassName: string;
  width: string;
  value: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className={cn("min-w-0 flex items-center gap-1", empty && "opacity-45")} title={label}>
      <span className="shrink-0 text-palette-muted-light" aria-hidden>{icon}</span>
      <span className="text-palette-muted-light uppercase text-[10px] tracking-[0.14em] shrink-0 whitespace-nowrap w-16" aria-hidden>{label}</span>
      <div className="flex-1 min-w-[2rem]">
        <div className="h-1.5 w-full bg-palette-bg-dark/50 border border-palette-border/60 rounded-full overflow-hidden">
          <div className={cn("h-full transition-all duration-500 min-w-[2px]", fillClassName)} style={{ width }} />
        </div>
      </div>
      <span className="text-palette-muted-light text-[10px] shrink-0 tabular-nums text-right">
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
    <div className="flex-1 lg:flex-none lg:shrink-0 flex flex-col gap-1.5 justify-center min-w-0 w-full">
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-palette-muted text-[9px] uppercase tracking-[0.2em] mb-0.5">Vitals</span>
          <StatRow
            icon={<Heart className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            label="Health"
            fillClassName="bg-palette-accent-dim"
            width={`${(player.stats.hp / player.stats.maxHp) * 100}%`}
            value={`${player.stats.hp}/${player.stats.maxHp}`}
          />
          <StatRow
            icon={<Brain className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            label="Worry"
            fillClassName="bg-palette-accent-soft"
            width={`${(player.stats.stress / player.stats.maxStress) * 100}%`}
            value={`${player.stats.stress}/${player.stats.maxStress}`}
          />
          <StatRow
            icon={<BookOpen className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            label="Learning"
            fillClassName="bg-palette-accent-bright"
            width={`${((player.stats.xp ?? 0) / (player.stats.maxXp ?? 1)) * 100}%`}
            value={`${player.stats.xp ?? 0}/${player.stats.maxXp ?? 1} (Bloom ${player.stats.level})`}
          />
        </div>
        <div className="flex flex-col gap-1 border-t border-palette-border/40 pt-1.5">
          <span className="text-palette-muted text-[9px] uppercase tracking-[0.2em] mb-0.5">Resources</span>
          <StatRow
            icon={<Sparkles className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            label="Pollen"
            fillClassName="bg-palette-accent-mid"
            width={(player.inventory.spirit ?? 0) > 0 ? "100%" : "0%"}
            value={player.inventory.spirit ?? 0}
            empty={(player.inventory.spirit ?? 0) <= 0}
          />
          <StatRow
            icon={<Gem className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            label="Glowstones"
            fillClassName="bg-palette-accent-soft"
            width={(player.inventory.blood ?? 0) > 0 ? "100%" : "0%"}
            value={player.inventory.blood ?? 0}
            empty={(player.inventory.blood ?? 0) <= 0}
          />
          <StatRow
            icon={<Zap className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
            label="Spark"
            fillClassName="bg-palette-accent-lime"
            width={player.entropyModifier > 0 ? "100%" : "0%"}
            value={player.entropyModifier}
            empty={player.entropyModifier <= 0}
          />
        </div>
      </div>
    </div>
  );
}
