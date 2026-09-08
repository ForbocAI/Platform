import type { TypedStartListening } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import { applyTheme, readTheme, saveTheme } from './themeEffects';
import { selectTheme, themeLoaded, themeToggled } from './slice/uiSlice';

export const registerThemeListeners = (
  startListening: TypedStartListening<RootState, AppDispatch>,
): void => {
  startListening({
    predicate: (action) => action.type === 'app/bootstrap',
    effect: (_, api) => { api.dispatch(themeLoaded(readTheme())); },
  });
  startListening({
    actionCreator: themeLoaded,
    effect: (_, api) => applyTheme(selectTheme(api.getState())),
  });
  startListening({
    actionCreator: themeToggled,
    effect: (_, api) => {
      const theme = selectTheme(api.getState());
      applyTheme(theme);
      saveTheme(theme);
    },
  });
};
