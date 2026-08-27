"use client";

import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import {
  setMasterVolume,
  selectMasterVolume,
  playButtonSound,
} from "@/features/audio";
import { Volume2, VolumeX } from "lucide-react";

export function VolumeControls() {
  const dispatch = useAppDispatch();
  const masterVolume = useAppSelector(selectMasterVolume);
  const isMuted = masterVolume <= 0;
  const preMuteVolume = useRef(1);

  const handleToggleMute = () => {
    dispatch(playButtonSound());
    if (isMuted) {
      dispatch(setMasterVolume(preMuteVolume.current));
    } else {
      preMuteVolume.current = masterVolume;
      dispatch(setMasterVolume(0));
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleMute}
      className={isMuted
        ? "p-1 sm:p-1.5 rounded-full border border-palette-border/60 hover:border-palette-accent-mid text-palette-muted hover:text-palette-accent-bright transition-colors"
        : "p-1 sm:p-1.5 rounded-full border border-palette-accent-mid/55 bg-palette-accent-mid/18 text-palette-accent-bright hover:bg-palette-accent-mid/26 transition-colors"
      }
      data-testid="volume-toggle"
      aria-label={isMuted ? "Unmute" : "Mute"}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
    </button>
  );
}
