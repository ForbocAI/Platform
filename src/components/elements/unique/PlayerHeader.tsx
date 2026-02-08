import Image from "next/image";
import { Shield, Zap, Skull } from "lucide-react";
import { StatBox } from "../generic";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeader({ player }: { player: Player }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 shrink-0 min-h-[2.75rem] pt-[env(safe-area-inset-top,0px)] lg:pt-0 lg:static lg:col-span-2 vengeance-border bg-zinc-950 lg:bg-zinc-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-1.5 sm:p-2 lg:px-8 gap-1.5 sm:gap-2">
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-8 w-full lg:w-auto min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <Image src="/logo.png" alt="Forboc AI" width={24} height={24} className="logo-theme object-contain w-5 h-5 sm:w-6 sm:h-6 lg:size-8" />
          <div className="flex flex-col min-w-[3rem]">
            <span className="text-[7px] sm:text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Ident: {player.characterClass}</span>
            <span className="text-[10px] sm:text-xs lg:text-xl font-bold text-cyan tracking-tighter leading-none truncate max-w-[6rem] sm:max-w-[8rem]">
              {player.name}{" "}
              <span className="text-[7px] sm:text-[8px] lg:text-xs text-zinc-600 align-top">LVL {player.level}</span>
            </span>
          </div>
        </div>
        <div className="flex-1 flex gap-1.5 sm:gap-2 lg:gap-8 justify-end lg:justify-start min-w-0">
          <div className="w-12 sm:w-16 lg:w-48">
            <div className="h-1 lg:h-2 w-full bg-zinc-950/50 border border-zinc-800">
              <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
            </div>
          </div>
          <div className="w-12 sm:w-16 lg:w-48">
            <div className="h-1 lg:h-2 w-full bg-zinc-950/50 border border-zinc-800">
              <div className="h-full bg-cyan-600 transition-all duration-500" style={{ width: `${(player.stress / player.maxStress) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full lg:w-auto gap-1.5 sm:gap-2 lg:gap-8 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-6">
          <StatBox label="STR" value={player.Str} icon={<Shield size={10} className="text-orange-500 sm:size-3 lg:size-3.5" />} />
          <StatBox label="AGI" value={player.Agi} icon={<Zap size={10} className="text-yellow-500 sm:size-3 lg:size-3.5" />} />
          <StatBox label="ARC" value={player.Arcane} icon={<Skull size={10} className="text-purple-500 sm:size-3 lg:size-3.5" />} />
        </div>
        <div className="border-l border-zinc-800 pl-1.5 sm:pl-2 lg:pl-8 flex flex-col items-end">
          <span className="text-[7px] sm:text-[8px] lg:text-[9px] text-zinc-600 uppercase tracking-widest">Surge</span>
          <span className="text-xs sm:text-sm lg:text-2xl font-black text-white leading-none">{player.surgeCount}</span>
        </div>
      </div>
    </header>
  );
}
