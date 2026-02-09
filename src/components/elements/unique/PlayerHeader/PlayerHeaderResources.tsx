import { Sparkles, Droplets, Activity } from "lucide-react";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeaderResources({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2" title="Spirit / Blood / Surge">
      <div className="flex items-center gap-1">
        <Sparkles className="app-icon text-palette-accent-cyan shrink-0" aria-hidden />
        <span className="text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Spirit</span>
        <span className="font-black text-palette-accent-cyan tabular-nums leading-tight">{player.spirit ?? 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <Droplets className="app-icon text-palette-accent-red shrink-0" aria-hidden />
        <span className="text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Blood</span>
        <span className="font-black text-palette-accent-red tabular-nums leading-tight">{player.blood ?? 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <Activity className="app-icon text-palette-white shrink-0" aria-hidden />
        <span className="text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Surge</span>
        <span className="font-black text-palette-white tabular-nums leading-tight">{player.surgeCount}</span>
      </div>
    </div>
  );
}
