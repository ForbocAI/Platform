import { toggleAutoPlay } from '@/features/core/ui/slice/uiSlice';
import { runAutoplayTick } from '@/features/game/slice/gameSlice';
import type { TypedStartListening } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/features/core/store';
import { getAutoplayConfig, getTickInterval } from '@/lib/sdk-placeholder';

export const autoplayListener = {
    startListening: (startListening: TypedStartListening<RootState, AppDispatch>) => {
        // ── Main autoplay loop listener ──
        startListening({
            predicate: (action) => action.type === toggleAutoPlay.type,
            effect: async (action, listenerApi) => {
                if (action.type !== toggleAutoPlay.type) return;

                const state = listenerApi.getState();
                if (!state.ui.autoPlay) return;

                // Read URL-driven speed config
                const config = getAutoplayConfig();
                const baseDelay = getTickInterval(config.speed);

                // Acceleration settings based on speed mode
                const minDelay = config.speed === 'fast' ? 200 : config.speed === 'slow' ? 500 : 200;
                const decay = config.speed === 'fast' ? 0.90 : config.speed === 'slow' ? 0.98 : 0.95;

                let delay = baseDelay;

                while (true) {
                    await listenerApi.delay(delay);

                    // Accelerate
                    delay = Math.max(minDelay, Math.floor(delay * decay));

                    const current = listenerApi.getState();
                    if (!current.ui.autoPlay) break;

                    await listenerApi.dispatch(runAutoplayTick());
                }
            },
        });
    }
};
