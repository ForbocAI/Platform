"use client";

import { Speech, Music } from "lucide-react";
import { VolumeControls } from "@/components/elements/unique/VolumeControls";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectTextToSpeech, toggleTextToSpeech } from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound, startMusic, stopMusic, selectMusicPlaying } from "@/features/audio";

export function PlayerHeaderMedia() {
  const dispatch = useAppDispatch();
  const textToSpeech = useAppSelector(selectTextToSpeech);
  const musicPlaying = useAppSelector(selectMusicPlaying);
  const playSound = usePlayButtonSound();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-1.5">
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
      <div className="border-l border-palette-border pl-1.5 sm:pl-2">
        <VolumeControls />
      </div>
    </div>
  );
}
