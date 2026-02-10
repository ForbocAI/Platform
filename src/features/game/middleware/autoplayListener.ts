import { createListenerMiddleware } from '@reduxjs/toolkit';
import { toggleAutoPlay } from '@/features/core/ui/slice/uiSlice';
import { runAutoplayTick } from '@/features/game/slice/gameSlice';
import type { TypedStartListening } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/features/core/store';

export const autoplayListener = {
    startListening: (startListening: TypedStartListening<RootState, AppDispatch>) => {
        startListening({
            predicate: (action, currentState) => {
                const isToggle = action.type === toggleAutoPlay.type;
                // Only trigger if toggled ON
                if (isToggle) {
                    const nextState = currentState as RootState; // This is actually prev state
                    // Listener middleware predicate receives (action, currentState, previousState)
                    // Wait, createListenerMiddleware predicate signature is (action, currentState, originalState)
                    // Actually effect runs after reducer.
                    // Let's just catch the toggle action.
                    return true;
                }
                return false;
            },
            effect: async (action, listenerApi) => {
                if (action.type !== toggleAutoPlay.type) return;

                const state = listenerApi.getState();
                if (!state.ui.autoPlay) return;

                // Loop with acceleration
                let delay = 800;
                const minDelay = 200;
                const decay = 0.95; // 5% faster each tick

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
