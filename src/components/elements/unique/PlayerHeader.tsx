import Image from "next/image";
import { Shield, Zap, Skull, Play, Square, Speech, Music, Sparkles, Droplets, Activity } from "lucide-react";
import { StatBox } from "../generic";
import { VolumeControls } from "./VolumeControls";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectAutoPlay, toggleAutoPlay, selectTextToSpeech, toggleTextToSpeech } from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound, startMusic, stopMusic, selectMusicPlaying } from "@/features/audio";
import type { Player } from "@/lib/quadar/types";

export function PlayerHeader({ player }: { player: Player }) {
  const dispatch = useAppDispatch();
  const autoPlay = useAppSelector(selectAutoPlay);
  const textToSpeech = useAppSelector(selectTextToSpeech);

  const musicPlaying = useAppSelector(selectMusicPlaying);
  const playSound = usePlayButtonSound();

  return (
    <header className="shrink-0 vengeance-border bg-palette-bg-mid/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-1.5 sm:p-2 gap-1.5 sm:gap-2" data-testid="player-header">
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 w-full lg:w-auto min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <Image src="/logo.png" alt="Forboc AI" width={48} height={48} className="logo-theme object-contain w-8 h-8 sm:w-10 sm:h-10" />
          <div className="flex flex-col min-w-10 gap-px">
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
        <div className="flex-1 flex gap-1.5 sm:gap-2 lg:gap-8 justify-end lg:justify-start min-w-[11rem] items-center">
          <div className="min-w-0 flex items-center gap-1">
            <span className="text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>HP</span>
            <div className="w-12 sm:w-16 lg:w-48 min-w-0">
              <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
                <div className="h-full bg-palette-accent-red transition-all duration-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
              </div>
            </div>
            <span className="text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">{player.hp}/{player.maxHp}</span>
          </div>
          <div className="min-w-0 flex items-center gap-1">
            <span className="text-palette-muted uppercase text-[10px] sm:text-xs tracking-wider shrink-0" aria-hidden>Stress</span>
            <div className="w-12 sm:w-16 lg:w-48 min-w-0">
              <div className="h-1 lg:h-2 w-full bg-palette-bg-dark/50 border border-palette-border">
                <div className="h-full bg-palette-accent-cyan transition-all duration-500" style={{ width: `${(player.stress / player.maxStress) * 100}%` }} />
              </div>
            </div>
            <span className="text-palette-muted-light text-[10px] sm:text-xs shrink-0 tabular-nums">{player.stress}/{player.maxStress}</span>
          </div>
        </div>
        {/* Spirit, Blood, Surge — left side with icons */}
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
      </div>
      <div className="flex items-center justify-between w-full lg:w-auto gap-1.5 sm:gap-2 lg:gap-4 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
          <StatBox label="STR" value={player.Str} icon={<Shield className="app-icon text-palette-accent-warm" />} />
          <StatBox label="AGI" value={player.Agi} icon={<Zap className="app-icon text-palette-accent-gold" />} />
          <StatBox label="ARC" value={player.Arcane} icon={<Skull className="app-icon text-palette-accent-magic" />} />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <VolumeControls />
          <div className="border-l border-palette-border pl-1.5 sm:pl-2 flex items-center gap-1 sm:gap-1.5">
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
            <button
              type="button"
              onClick={() => {
                playSound();
                dispatch(toggleTextToSpeech());
              }}
              className={textToSpeech
                ? "p-1 sm:p-1.5 rounded border border-palette-accent-cyan/50 bg-palette-accent-cyan/20 text-palette-accent-cyan hover:bg-palette-accent-cyan/30 transition-colors"
                : "p-1 sm:p-1.5 rounded border border-palette-border hover:border-palette-accent-cyan text-palette-muted hover:text-palette-accent-cyan transition-colors"
              }
              data-testid="text-to-speech-toggle"
              aria-label={textToSpeech ? "Turn off text-to-speech" : "Turn on text-to-speech"}
              title={textToSpeech ? "Turn off text-to-speech" : "Turn on text-to-speech"}
            >
              <Speech className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playSound();
                dispatch(musicPlaying ? stopMusic() : startMusic());
              }}
              className={musicPlaying
                ? "p-1 sm:p-1.5 rounded border border-palette-accent-cyan/50 bg-palette-accent-cyan/20 text-palette-accent-cyan hover:bg-palette-accent-cyan/30 transition-colors"
                : "p-1 sm:p-1.5 rounded border border-palette-border hover:border-palette-accent-cyan text-palette-muted hover:text-palette-accent-cyan transition-colors"
              }
              data-testid="music-toggle"
              aria-label={musicPlaying ? "Pause music" : "Play music"}
              title={musicPlaying ? "Pause music" : "Play music"}
            >
              <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${musicPlaying ? "" : "opacity-70"}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
