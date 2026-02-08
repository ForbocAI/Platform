import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

/**
 * Audio Slice
 *
 * Manages audio state: master volume, music volume, and music playing status.
 */

export interface AudioSliceState {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1, calculated from masterVolume
  musicPlaying: boolean;
}

const initialState: AudioSliceState = {
  masterVolume: 1,
  musicVolume: 1 * 0.6, // masterVolume * 0.6
  musicPlaying: true,
};

export const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    setMasterVolume: (state, action: PayloadAction<number>) => {
      const volume = Math.max(0, Math.min(1, action.payload));
      state.masterVolume = volume;
      state.musicVolume = volume * 0.6;
    },
    setMusicPlaying: (state, action: PayloadAction<boolean>) => {
      state.musicPlaying = action.payload;
    },
    startMusic: (state) => {
      state.musicPlaying = true;
    },
    stopMusic: (state) => {
      state.musicPlaying = false;
    },
  },
});

export const { setMasterVolume, setMusicPlaying, startMusic, stopMusic } =
  audioSlice.actions;

export default audioSlice.reducer;

type AudioRootState = { audio: AudioSliceState };

export const selectMasterVolume = (state: AudioRootState): number =>
  state.audio.masterVolume;

export const selectMusicVolume = (state: AudioRootState): number =>
  state.audio.musicVolume;

export const selectMusicPlaying = (state: AudioRootState): boolean =>
  state.audio.musicPlaying;

export const selectAudioConfig = createSelector(
  [selectMasterVolume, selectMusicVolume, selectMusicPlaying],
  (masterVolume, musicVolume, musicPlaying) => ({
    masterVolume,
    musicVolume,
    musicPlaying,
  })
);
