import settings from '../../../../data/presentation/settings.json';

export type Theme = keyof typeof settings.theme.next;

export const themeOf = (value: unknown): Theme =>
  (value === settings.theme.next.dark
    ? settings.theme.next.dark
    : settings.theme.initial) as Theme;

export const nextTheme = (theme: Theme): Theme =>
  themeOf(settings.theme.next[theme]);
