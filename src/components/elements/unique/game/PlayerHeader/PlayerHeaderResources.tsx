import { Sparkles, Droplets, Activity, Users } from "lucide-react";
import type { Player } from "@/features/game/types";

export function PlayerHeaderResources({ player, onServitorClick }: { player: Player; onServitorClick?: () => void }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2" title="Spirit / Blood / Surge">
      <div className="flex items-center gap-1" title="Spirit">
        <Sparkles className="app-icon text-palette-accent-cyan shrink-0" aria-hidden />
        <span className="hidden sm:inline text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Spirit</span>
        <span className="hidden sm:inline font-black text-palette-accent-cyan tabular-nums leading-tight">{player.spirit ?? 0}</span>
      </div>
      <div className="flex items-center gap-1" title="Blood">
        <Droplets className="app-icon text-palette-accent-red shrink-0" aria-hidden />
        <span className="hidden sm:inline text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Blood</span>
        <span className="hidden sm:inline font-black text-palette-accent-red tabular-nums leading-tight">{player.blood ?? 0}</span>
      </div>
      <div className="flex items-center gap-1" title="Surge">
        <Activity className="app-icon text-palette-white shrink-0" aria-hidden />
        <span className="hidden sm:inline text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Surge</span>
        <span className="hidden sm:inline font-black text-palette-white tabular-nums leading-tight">{player.surgeCount}</span>
      </div>
      {(player.servitors?.length ?? 0) > 0 && (
        <button onClick={onServitorClick} className="flex items-center gap-1 hover:brightness-125 transition-all outline-none focus-visible:ring-1 focus-visible:ring-palette-accent-lime rounded px-1" title="View Servitors" data-testid="servitor-toggle" aria-label="View Servitors">
          <Users className="app-icon text-palette-accent-lime shrink-0" aria-hidden />
          <span className="hidden sm:inline text-palette-muted-light uppercase tracking-widest text-[10px] sm:text-xs leading-tight">Servitors</span>
          <span className="hidden sm:inline font-black text-palette-accent-lime tabular-nums leading-tight">{player.servitors!.length}</span>
        </button>
      )}
    </div>
  );
}
