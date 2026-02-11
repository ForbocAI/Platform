"use client";

import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  setMasterVolume,
  selectMasterVolume,
  usePlayButtonSound,
} from "@/features/audio";
import { Minus, Plus } from "lucide-react";
import { GameButton } from "@/components/elements/generic";

const VOLUME_STEP = 0.15;

export function VolumeControls() {
  const dispatch = useAppDispatch();
  const masterVolume = useAppSelector(selectMasterVolume);
  const isMuted = masterVolume <= 0;
  const playSound = usePlayButtonSound();

  const handleVolumeUp = () => {
    playSound();
    dispatch(setMasterVolume(Math.min(1, masterVolume + VOLUME_STEP)));
  };

  const handleVolumeDown = () => {
    playSound();
    dispatch(setMasterVolume(Math.max(0, masterVolume - VOLUME_STEP)));
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 border border-palette-border rounded bg-palette-bg-mid/80 p-0.5">
      <div className="flex flex-col gap-px items-center">
        <GameButton
          icon={<Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          onClick={handleVolumeUp}
          className="p-0.5 h-6 shrink-0 border-transparent hover:border-palette-muted hover:bg-palette-panel/80 text-palette-muted-light hover:text-palette-foreground"
          title="Volume up"
          aria-label="Volume up"
          disabled={masterVolume >= 1}
          data-testid="volume-up"
        />
        <span className="text-[10px] leading-tight text-palette-muted uppercase tracking-wider">
          Vol
        </span>
        <GameButton
          icon={<Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          onClick={handleVolumeDown}
          className="p-0.5 h-6 shrink-0 border-transparent hover:border-palette-muted hover:bg-palette-panel/80 text-palette-muted-light hover:text-palette-foreground"
          title="Volume down"
          aria-label="Volume down"
          disabled={isMuted}
          data-testid="volume-down"
        />
      </div>
    </div>
  );
}
