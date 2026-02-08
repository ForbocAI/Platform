import { isAnyOf } from "@reduxjs/toolkit";
import type { TypedStartListening } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/features/core/store";
import { startMusic as startMusicAction, stopMusic as stopMusicAction } from "./slice/audioSlice";
import { selectMusicVolume, selectMusicPlaying } from "./slice/audioSlice";
import {
  setMusicStateGetter,
  startMusic as startMusicLoop,
  stopMusic as stopMusicLoop,
} from "./audioSystem";

/**
 * Registers audio listeners: wires Redux audio state to the music loop
 * and starts/stops the loop when actions are dispatched.
 */
export function registerAudioListeners(
  startListening: TypedStartListening<RootState, AppDispatch>
) {
  startListening({
    predicate: (action) => action.type === "app/bootstrap",
    effect: (_action, listenerApi) => {
      setMusicStateGetter(() => {
        const state = listenerApi.getState();
        return {
          musicVolume: selectMusicVolume(state),
          musicPlaying: selectMusicPlaying(state),
        };
      });
    },
  });

  startListening({
    matcher: isAnyOf(startMusicAction, stopMusicAction),
    effect: (action, listenerApi) => {
      const state = listenerApi.getState();
      const playing = selectMusicPlaying(state);
      if (playing) {
        startMusicLoop();
      } else {
        stopMusicLoop();
      }
    },
  });
}
