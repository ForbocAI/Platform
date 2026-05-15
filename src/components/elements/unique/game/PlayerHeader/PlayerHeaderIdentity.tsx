import Image from "next/image";
import type { PlayerActor } from "@/features/game/types";
import { CLASS_PRESENTATION } from "@/features/game/mechanics/classes";

export function PlayerHeaderIdentity({ player }: { player: PlayerActor }) {
  const classKey = player.agentClass as keyof typeof CLASS_PRESENTATION | undefined;
  const presentation = classKey ? CLASS_PRESENTATION[classKey] : undefined;
  const folkLabel = presentation?.name ?? player.agentClass ?? 'Unknown';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
      <Image src="/logo.png" alt="Forboc AI" width={48} height={48} className="logo-theme object-contain w-8 h-8 sm:w-10 sm:h-10" />
      <div className="flex flex-col min-w-10 gap-px">
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
    </div>
  );
}
