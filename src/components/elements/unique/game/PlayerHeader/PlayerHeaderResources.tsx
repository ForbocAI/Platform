import { Sparkles, Droplets, Activity } from "lucide-react";
import type { AgentPlayer } from "@/features/game/types";

export function PlayerHeaderResources({ player }: { player: AgentPlayer }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2" title="Spirit / Blood / Surge">
      <div className="flex items-center gap-1" title="Spirit">
        <Sparkles className="app-icon text-palette-accent-mid shrink-0" aria-hidden />
        <span className="hidden sm:inline text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Spirit</span>
        <span className="hidden sm:inline font-black text-palette-accent-mid tabular-nums leading-tight">{player.inventory.spirit ?? 0}</span>
      </div>
      <div className="flex items-center gap-1" title="Blood">
        <Droplets className="app-icon text-palette-accent-mid shrink-0" aria-hidden />
        <span className="hidden sm:inline text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Blood</span>
        <span className="hidden sm:inline font-black text-palette-accent-mid tabular-nums leading-tight">{player.inventory.blood ?? 0}</span>
      </div>
      <div className="flex items-center gap-1" title="Surge">
        <Activity className="app-icon text-palette-white shrink-0" aria-hidden />
        <span className="hidden sm:inline text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Surge</span>
        <span className="hidden sm:inline font-black text-palette-white tabular-nums leading-tight">{player.surgeCount}</span>
      </div>
    </div>
  );
}
