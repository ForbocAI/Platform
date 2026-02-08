import { configureStore } from '@reduxjs/toolkit';
import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit';
import gameReducer, { initializeGame } from '@/features/game/slice/gameSlice';
import uiReducer from '@/features/core/ui/slice/uiSlice';
import { baseApi } from '@/features/core/api/baseApi';

export const appBootstrap = { type: 'app/bootstrap' as const };

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ui: uiReducer,
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

const startAppListening = listenerMiddleware.startListening as TypedStartListening<RootState, AppDispatch>;

startAppListening({
  predicate: (action) => action.type === 'app/bootstrap',
  effect: async (_, listenerApi) => {
    const state = listenerApi.getState();
    if (!state.game.player) {
      await listenerApi.dispatch(initializeGame());
    }
  },
});
