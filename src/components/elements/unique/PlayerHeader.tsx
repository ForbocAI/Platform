import Image from "next/image";
import { Shield, Zap, Skull } from "lucide-react";
import { StatBox } from "../generic";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeader({ player }: { player: Player }) {
  return (
    <header className="shrink-0 lg:col-span-2 vengeance-border bg-zinc-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-2 lg:px-8 gap-2">
      <div className="flex items-center gap-2 lg:gap-8 w-full lg:w-auto">
        <Image src="/logo.png" alt="Forboc AI" width={24} height={24} className="logo-theme object-contain shrink-0 lg:w-[32px] lg:h-[32px]" />
        <div className="flex flex-col">
          <span className="text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Ident: {player.characterClass}</span>
          <span className="text-xs lg:text-xl font-bold text-cyan tracking-tighter leading-none">
            {player.name}{" "}
            <span className="text-[8px] lg:text-xs text-zinc-600 align-top">LVL {player.level}</span>
          </span>
        </div>
        <div className="flex-1 flex gap-2 lg:gap-8 justify-end lg:justify-start">
          <div className="w-16 lg:w-48">
            <div className="h-1 lg:h-2 w-full bg-zinc-950/50 border border-zinc-800">
              <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
            </div>
          </div>
          <div className="w-16 lg:w-48">
            <div className="h-1 lg:h-2 w-full bg-zinc-950/50 border border-zinc-800">
              <div className="h-full bg-cyan-600 transition-all duration-500" style={{ width: `${(player.stress / player.maxStress) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full lg:w-auto gap-2 lg:gap-8">
        <div className="flex items-center gap-2 lg:gap-6">
          <StatBox label="STR" value={player.Str} icon={<Shield size={12} className="text-orange-500 lg:w-[14px] lg:h-[14px]" />} />
          <StatBox label="AGI" value={player.Agi} icon={<Zap size={12} className="text-yellow-500 lg:w-[14px] lg:h-[14px]" />} />
          <StatBox label="ARC" value={player.Arcane} icon={<Skull size={12} className="text-purple-500 lg:w-[14px] lg:h-[14px]" />} />
        </div>
        <div className="border-l border-zinc-800 pl-2 lg:pl-8 flex flex-col items-end">
          <span className="text-[8px] lg:text-[9px] text-zinc-600 uppercase tracking-widest">Surge</span>
          <span className="text-sm lg:text-2xl font-black text-white leading-none">{player.surgeCount}</span>
        </div>
      </div>
    </header>
  );
}
