import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import settings from '../../data/presentation/settings.json';
import data from '../../data/tests/presentation.json';
import uiReducer, { selectTheme, themeToggled } from '../../src/features/core/ui/slice/uiSlice';
import audioReducer from '../../src/features/audio/slice/audioSlice';
import gameReducer from '../../src/features/game/store/gameSlice';
import narrativeReducer from '../../src/features/narrative/slice/narrativeSlice';
import forbocReducer from '../../src/features/game/sdk/state/forbocSlice';
import { registerThemeListeners } from '../../src/features/core/ui/themeListeners';
import { SettingsMenu } from '../../src/components/elements/generic/SettingsMenu';
import type { AppDispatch, RootState } from '../../src/features/core/store';

vi.mock('@/features/core/store', async () => {
  const { useDispatch, useSelector } = await import('react-redux');
  return { useAppDispatch: useDispatch, useAppSelector: useSelector };
});

const createRoot = () => {
  const listener = createListenerMiddleware();
  const store = configureStore({
    reducer: { ui: uiReducer, audio: audioReducer, game: gameReducer,
      narrative: narrativeReducer, forboc: forbocReducer },
    middleware: (defaults) => defaults().prepend(listener.middleware),
  });
  registerThemeListeners(listener.startListening.withTypes<RootState, AppDispatch>());
  store.dispatch({ type: data.browser.bootstrap });
  return store;
};

const renderControls = (store: ReturnType<typeof createRoot>) => render(
  <Provider store={store}><SettingsMenu /><button>{data.browser.outsideLabel}</button></Provider>,
);
const trigger = () => screen.getByRole('button', { name: settings.labels.settings });
const open = () => fireEvent.click(trigger());
const toggle = (name: string) => screen.getByTestId(name);

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute(settings.theme.attribute);
});

describe(data.suite, () => {
  it(data.cases.hydration, () => {
    window.localStorage.setItem(settings.theme.storageKey, settings.theme.next.dark);
    const store = createRoot();
    expect(renderToString(<Provider store={store}><SettingsMenu /></Provider>)).toBeFalsy();
  });

  it(data.cases.storedTheme, () => {
    window.localStorage.setItem(settings.theme.storageKey, settings.theme.next.dark);
    const store = createRoot();
    expect(selectTheme(store.getState())).toBe(settings.theme.next.dark);
    expect(document.documentElement.getAttribute(settings.theme.attribute))
      .toBe(settings.theme.next.dark);
  });

  it(data.cases.deniedRead, () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error(data.browser.deniedMessage);
    });
    const store = createRoot();
    renderControls(store);
    open();
    expect(selectTheme(store.getState())).toBe(settings.theme.initial);
    expect(toggle(settings.testIds.theme)).toBeDefined();
    fireEvent.click(toggle(settings.testIds.theme));
    expect(selectTheme(store.getState())).toBe(settings.theme.next.dark);
  });

  it(data.cases.deniedWrite, () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error(data.browser.deniedMessage);
    });
    const store = createRoot();
    store.dispatch(themeToggled());
    expect(selectTheme(store.getState())).toBe(settings.theme.next.dark);
    expect(document.documentElement.getAttribute(settings.theme.attribute))
      .toBe(settings.theme.next.dark);
  });

  it(data.cases.remount, () => {
    const store = createRoot();
    const first = renderControls(store);
    open();
    fireEvent.click(toggle(settings.testIds.theme));
    first.unmount();
    renderControls(store);
    open();
    expect(toggle(settings.testIds.theme).getAttribute('aria-pressed')).toBe(String(true));
    expect(window.localStorage.getItem(settings.theme.storageKey)).toBe(settings.theme.next.dark);
  });

  it(data.cases.dismiss, () => {
    renderControls(createRoot());
    open();
    toggle(settings.testIds.theme).focus();
    fireEvent.keyDown(document, { key: settings.dismissKey });
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe(String(false));
    open();
    toggle(settings.testIds.theme).focus();
    fireEvent.blur(toggle(settings.testIds.theme), {
      relatedTarget: screen.getByRole('button', { name: data.browser.outsideLabel }),
    });
    expect(trigger().getAttribute('aria-expanded')).toBe(String(false));
  });

  it(data.cases.audio, () => {
    const store = createRoot();
    renderControls(store);
    open();
    const before = store.getState();
    fireEvent.click(toggle(settings.testIds.narration));
    fireEvent.click(toggle(settings.testIds.music));
    fireEvent.click(toggle(settings.testIds.volume));
    expect(store.getState().ui.textToSpeech).toBe(!before.ui.textToSpeech);
    expect(store.getState().audio.musicPlaying).toBe(!before.audio.musicPlaying);
    expect(toggle(settings.testIds.narration).getAttribute('aria-pressed'))
      .toBe(String(!before.ui.textToSpeech));
    expect(toggle(settings.testIds.music).getAttribute('aria-pressed'))
      .toBe(String(!before.audio.musicPlaying));
    expect(toggle(settings.testIds.volume).getAttribute('aria-label'))
      .toBe(settings.labels.unmute);
    fireEvent.click(toggle(settings.testIds.volume));
    expect(store.getState().audio.masterVolume).toBe(before.audio.masterVolume);
  });
});
