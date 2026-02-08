import Image from "next/image";
import { Shield, Zap, Skull, Play, Square } from "lucide-react";
import { StatBox } from "../generic";
import { VolumeControls } from "./VolumeControls";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectAutoPlay, toggleAutoPlay } from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound } from "@/features/audio";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeader({ player }: { player: Player }) {
  const dispatch = useAppDispatch();
  const autoPlay = useAppSelector(selectAutoPlay);
  const playSound = usePlayButtonSound();

  return (
    <header className="shrink-0 min-h-0 vengeance-border bg-palette-bg-mid/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-1.5 sm:p-2 gap-1.5 sm:gap-2 h-full" data-testid="player-header">
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 w-full lg:w-auto min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <Image src="/logo.png" alt="Forboc AI" width={48} height={48} className="logo-theme object-contain w-8 h-8 sm:w-10 sm:h-10" />
          <div className="flex flex-col min-w-[2.5rem] gap-px min-w-0">
            <span className="text-palette-muted uppercase tracking-widest leading-tight flex items-center gap-1.5">
              Ident: {player.characterClass}
              <span className="status-led" aria-hidden />
            </span>
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
          <button
            type="button"
            onClick={() => {
              playSound();
              dispatch(toggleAutoPlay());
            }}
            className={autoPlay
              ? "p-1 sm:p-1.5 rounded border border-palette-accent-red/50 bg-palette-accent-red/20 text-palette-accent-red hover:bg-palette-accent-red/30 transition-colors"
              : "p-1 sm:p-1.5 rounded border border-palette-border hover:border-palette-accent-cyan text-palette-muted hover:text-palette-accent-cyan transition-colors"
            }
            data-testid="auto-play-toggle"
            aria-label={autoPlay ? "Stop auto-play" : "Start auto-play"}
            title={autoPlay ? "Stop auto-play" : "Start auto-play"}
          >
            {autoPlay ? <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <StatBox label="STR" value={player.Str} icon={<Shield className="app-icon text-palette-accent-warm" />} />
          <StatBox label="AGI" value={player.Agi} icon={<Zap className="app-icon text-palette-accent-gold" />} />
          <StatBox label="ARC" value={player.Arcane} icon={<Skull className="app-icon text-palette-accent-magic" />} />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <VolumeControls />
          <div className="border-l border-palette-border pl-1.5 sm:pl-2 flex flex-col items-end gap-px">
            <span className="text-palette-muted-light uppercase tracking-widest leading-tight">Surge</span>
            <span className="font-black text-palette-white leading-tight">{player.surgeCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
