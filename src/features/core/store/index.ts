import { configureStore } from '@reduxjs/toolkit';
import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import gameReducer from '@/features/game/slice/gameSlice';
import uiReducer, { clearVignetteThemeInput, toggleCraftingPanel } from '@/features/core/ui/slice/uiSlice';
import narrativeReducer, { endVignette } from '@/features/narrative/slice/narrativeSlice';
import audioReducer from '@/features/audio/slice/audioSlice';
import { baseApi } from '@/features/core/api/baseApi';
import { registerAudioListeners, flushTtsQueue } from '@/features/audio/audioListeners';
import { registerGameListeners } from '@/features/core/store/listeners';
import '@/features/core/api/gameApi';

export const appBootstrap = { type: 'app/bootstrap' as const };
export { retryInitialize } from './listeners';

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ui: uiReducer,
    narrative: narrativeReducer,
    audio: audioReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from './hooks';

setupListeners(store.dispatch);

const startAppListening = listenerMiddleware.startListening as TypedStartListening<RootState, AppDispatch>;

registerAudioListeners(startAppListening);
registerGameListeners(startAppListening);

// Flush TTS queue on user click so speechSynthesis.speak() runs with a user gesture (Chrome requirement).
// Register open_crafting DOM event so Redux can open the crafting panel (no useEffect in components).
startAppListening({
  predicate: (action) => action.type === 'app/bootstrap',
  effect: (_, listenerApi) => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', () => flushTtsQueue(), true);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('open_crafting', () => {
        listenerApi.dispatch(toggleCraftingPanel(true));
      });
    }
    listenerApi.cancel();
  },
});

import { autoplayListener } from '@/features/game/middleware/autoplayListener';

autoplayListener.startListening(startAppListening);

startAppListening({
  predicate: (action) => action.type === endVignette.type,
  effect: async (_, listenerApi) => {
    listenerApi.dispatch(clearVignetteThemeInput());
  },
});

if (typeof window !== 'undefined') {
  queueMicrotask(() => store.dispatch(appBootstrap));
}
