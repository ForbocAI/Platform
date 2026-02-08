"use client";

import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  setMasterVolume,
  selectMasterVolume,
  usePlayButtonSound,
} from "@/features/audio";
import { Minus, Plus } from "lucide-react";

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
        <button
          type="button"
          onClick={handleVolumeUp}
          className="p-0.5 rounded border border-transparent hover:border-palette-muted hover:bg-palette-panel/80 text-palette-muted-light hover:text-palette-foreground disabled:opacity-40 disabled:pointer-events-none"
          title="Volume up"
          aria-label="Volume up"
          disabled={masterVolume >= 1}
          data-testid="volume-up"
        >
          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
        <span className="text-[10px] leading-tight text-palette-muted uppercase tracking-wider">
          Vol
        </span>
        <button
          type="button"
          onClick={handleVolumeDown}
          className="p-0.5 rounded border border-transparent hover:border-palette-muted hover:bg-palette-panel/80 text-palette-muted-light hover:text-palette-foreground disabled:opacity-40 disabled:pointer-events-none"
          title="Volume down"
          aria-label="Volume down"
          disabled={isMuted}
          data-testid="volume-down"
        >
          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  );
}
