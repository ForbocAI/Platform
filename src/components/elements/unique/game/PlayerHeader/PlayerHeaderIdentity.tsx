import Image from "next/image";
import type { AgentPlayer } from "@/features/game/types";

export function PlayerHeaderIdentity({ player }: { player: AgentPlayer }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
      <Image src="/logo.png" alt="Forboc AI" width={48} height={48} className="logo-theme object-contain w-8 h-8 sm:w-10 sm:h-10" />
      <div className="flex flex-col min-w-10 gap-px">
        <span className="text-palette-muted uppercase tracking-widest leading-tight flex items-center gap-1.5">
          Ident: {player.agentClass}
          <span className="status-led" aria-hidden />
        </span>
        <span className="font-bold text-palette-accent-mid tracking-tight leading-tight flex items-baseline gap-1 min-w-0">
          <span className="truncate min-w-0">{player.name}</span>
          <span className="text-palette-muted-light shrink-0">LVL {player.stats.level ?? 1}</span>
        </span>
      </div>
    </div>
  );
}
