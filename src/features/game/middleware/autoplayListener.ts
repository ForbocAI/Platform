/**
 * Autoplay: reducer-only scheduling. When to run the next tick lives in Redux state
 * (autoplayNextTickAt, autoplayDelayMs); reducers set them on toggle and on
 * runAutoplayTick/fulfilled. This module only: (1) poll — dispatch tick when due,
 * (2) on toggle ON — set first schedule so the poll will fire.
 */

import { setAutoplaySchedule, toggleAutoPlay } from '@/features/core/ui/slice/uiSlice';
import { runAutoplayTick } from '@/features/game/slice/gameSlice';
import type { TypedStartListening } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/features/core/store';
import { getAutoplayConfig, getTickInterval } from '@/lib/sdk-placeholder';

const POLL_MS = 100;

export const autoplayListener = {
  startListening: (startListening: TypedStartListening<RootState, AppDispatch>) => {
    // Single poll: when autoplay is on and next tick time is due, dispatch tick and clear schedule (reducer sets next on fulfilled)
    startListening({
      predicate: (action) => action.type === 'app/bootstrap',
      effect: (_, listenerApi) => {
        setInterval(() => {
          const state = listenerApi.getState();
          if (!state.ui.autoPlay || state.ui.autoplayNextTickAt == null) return;
          if (Date.now() < state.ui.autoplayNextTickAt) return;
          listenerApi.dispatch(setAutoplaySchedule({ nextTickAt: null }));
          listenerApi.dispatch(runAutoplayTick());
        }, POLL_MS);
      },
    });

    // When autoplay is turned ON, set first schedule so the poll will run the first tick
    startListening({
      predicate: (action) => action.type === toggleAutoPlay.type,
      effect: (action, listenerApi) => {
        if (action.type !== toggleAutoPlay.type) return;
        const state = listenerApi.getState();
        if (!state.ui.autoPlay) return;
        const config = getAutoplayConfig();
        const speed = config.speed ?? 'normal';
        const delayMs = getTickInterval(speed);
        listenerApi.dispatch(
          setAutoplaySchedule({ nextTickAt: Date.now() + delayMs, nextDelayMs: delayMs })
        );
      },
    });
  },
};
