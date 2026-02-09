import { Sparkles, Droplets, Activity } from "lucide-react";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeaderResources({ player }: { player: Player }) {
  return (
    <div className="border-l border-palette-border pl-1.5 sm:pl-2 flex items-center gap-2 lg:gap-4">
      <span className="text-palette-muted-light text-[10px] sm:text-xs lg:hidden tabular-nums flex items-center gap-1" title="Spirit / Blood / Surge">
        <Sparkles className="app-icon text-palette-accent-cyan shrink-0" aria-hidden />
        <span className="text-palette-accent-cyan font-bold">{player.spirit ?? 0}</span>
        <span className="text-palette-muted mx-0.5">/</span>
        <Droplets className="app-icon text-palette-accent-red shrink-0" aria-hidden />
        <span className="text-palette-accent-red font-bold">{player.blood ?? 0}</span>
        <span className="text-palette-muted mx-0.5">/</span>
        <Activity className="app-icon text-palette-white shrink-0" aria-hidden />
        <span className="text-palette-white font-bold">{player.surgeCount}</span>
      </span>
      <div className="hidden lg:flex flex-col items-start gap-px">
        <span className="text-palette-muted-light uppercase tracking-widest leading-tight flex items-center gap-1">
          <Sparkles className="app-icon text-palette-accent-cyan" aria-hidden /> Spirit
        </span>
        <span className="font-black text-palette-accent-cyan leading-tight">{player.spirit ?? 0}</span>
      </div>
      <div className="hidden lg:flex flex-col items-start gap-px">
        <span className="text-palette-muted-light uppercase tracking-widest leading-tight flex items-center gap-1">
          <Droplets className="app-icon text-palette-accent-red" aria-hidden /> Blood
        </span>
        <span className="font-black text-palette-accent-red leading-tight">{player.blood ?? 0}</span>
      </div>
      <div className="hidden lg:flex border-l border-palette-border pl-1.5 sm:pl-2 flex-col items-start gap-px">
        <span className="text-palette-muted-light uppercase tracking-widest leading-tight flex items-center gap-1">
          <Activity className="app-icon text-palette-white" aria-hidden /> Surge
        </span>
        <span className="font-black text-palette-white leading-tight">{player.surgeCount}</span>
      </div>
    </div>
  );
}
