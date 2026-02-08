
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '@/features/game/slice/gameSlice';
import uiReducer from '@/features/core/ui/slice/uiSlice';

export const store = configureStore({
    reducer: {
        game: gameReducer,
        ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
