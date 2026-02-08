import Image from "next/image";
import { Shield, Zap, Skull } from "lucide-react";
import { StatBox } from "../generic";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeader({ player }: { player: Player }) {
  return (
    <header className="shrink-0 min-h-0 vengeance-border bg-palette-bg-mid/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-1.5 sm:p-2 gap-1.5 sm:gap-2 h-full">
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 w-full lg:w-auto min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <Image src="/logo.png" alt="Forboc AI" width={48} height={48} className="logo-theme object-contain w-8 h-8 sm:w-10 sm:h-10" />
          <div className="flex flex-col min-w-[2.5rem] gap-px min-w-0">
            <span className="text-palette-muted uppercase tracking-widest leading-tight">Ident: {player.characterClass}</span>
            <span className="font-bold text-palette-accent-cyan tracking-tight leading-tight flex items-baseline gap-1 min-w-0">
              <span className="truncate min-w-0">{player.name}</span>
              <span className="text-palette-muted-light shrink-0">LVL {player.level}</span>
            </span>
          </div>
        </div>
        <div className="flex-1 flex gap-1.5 sm:gap-2 lg:gap-8 justify-end lg:justify-start min-w-0">
          <div className="w-12 sm:w-16 lg:w-48">
            <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
              <div className="h-full bg-palette-accent-red transition-all duration-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
            </div>
          </div>
          <div className="w-12 sm:w-16 lg:w-48">
            <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
              <div className="h-full bg-palette-accent-cyan transition-all duration-500" style={{ width: `${(player.stress / player.maxStress) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full lg:w-auto gap-1.5 sm:gap-2 lg:gap-4 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
          <StatBox label="STR" value={player.Str} icon={<Shield className="app-icon text-palette-accent-warm" />} />
          <StatBox label="AGI" value={player.Agi} icon={<Zap className="app-icon text-palette-accent-gold" />} />
          <StatBox label="ARC" value={player.Arcane} icon={<Skull className="app-icon text-palette-accent-magic" />} />
        </div>
        <div className="border-l border-palette-border pl-1.5 sm:pl-2 flex flex-col items-end gap-px">
          <span className="text-palette-muted-light uppercase tracking-widest leading-tight">Surge</span>
          <span className="font-black text-palette-white leading-tight">{player.surgeCount}</span>
        </div>
      </div>
    </header>
  );
}
