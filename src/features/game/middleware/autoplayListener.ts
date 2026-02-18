import { setAutoplaySchedule, toggleAutoPlay } from '@/features/core/ui/slice/uiSlice';
import type { TypedStartListening } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/features/core/store';
import { getAutoplayConfig, getTickInterval } from '@/lib/sdk/config';
import { botOrchestrator } from '@/features/game/mechanics/ai/BotOrchestrator';

const POLL_MS = 100;

export const autoplayListener = {
  startListening: (startListening: TypedStartListening<RootState, AppDispatch>) => {
    // 1. Initialize Orchestrator on Bootstrap
    startListening({
      predicate: (action) => action.type === 'app/init' || action.type === 'game/initializeGame/fulfilled',
      effect: (_, listenerApi) => {
        botOrchestrator.init(listenerApi.dispatch, listenerApi.getState);

        // Single central poll for all AI systems
        setInterval(() => {
          botOrchestrator.update();
        }, POLL_MS);
      },
    });

    // 2. On toggle ON — set first schedule
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
