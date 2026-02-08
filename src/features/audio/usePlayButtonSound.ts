"use client";

import { useCallback } from "react";
import { useAppSelector } from "@/features/core/store";
import { selectMasterVolume } from "./slice/audioSlice";
import { playButtonClick } from "./audioSystem";

/** Returns a function that plays the Goetéian button click sound at current master volume. */
export function usePlayButtonSound() {
  const masterVolume = useAppSelector(selectMasterVolume);
  return useCallback(() => {
    playButtonClick(masterVolume);
  }, [masterVolume]);
}
