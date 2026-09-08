import settings from '../../../../data/presentation/settings.json';
import { themeOf, type Theme } from './theme';

// Preference storage is optional; denial must not disable the controls or
// reset the in-memory preference.
export const readTheme = (): Theme => {
  try {
    return themeOf(window.localStorage.getItem(settings.theme.storageKey));
  } catch {
    return themeOf(settings.theme.initial);
  }
};

export const saveTheme = (theme: Theme): boolean => {
  try {
    window.localStorage.setItem(settings.theme.storageKey, theme);
    return true;
  } catch {
    return false;
  }
};

export const applyTheme = (theme: Theme): void =>
  document.documentElement.setAttribute(settings.theme.attribute, theme);
