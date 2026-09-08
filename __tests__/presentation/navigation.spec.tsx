import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import data from '../../data/tests/presentation.json';
import presentation from '../../data/presentation/class-selection.json';
import BootstrapGate from '../../src/app/BootstrapGate';
import { ClassSelectionScreen } from '../../src/components/screens/ClassSelectionScreen';
import uiReducer from '../../src/features/core/ui/slice/uiSlice';
import audioReducer from '../../src/features/audio/slice/audioSlice';
import gameReducer from '../../src/features/game/store/gameSlice';

const mocks = vi.hoisted(() => ({ initialize: vi.fn(), sdkInit: vi.fn() }));
vi.mock('@/features/game/sdk/cortexService', () => ({ sdkService: { init: mocks.sdkInit } }));
vi.mock('@/features/game/store/gameSlice', async (original) => ({
  ...await original<typeof import('../../src/features/game/store/gameSlice')>(),
  initializeGame: mocks.initialize,
}));
vi.mock('@/features/core/store', async () => {
  const { useDispatch, useSelector } = await import('react-redux');
  return { useAppDispatch: useDispatch, useAppSelector: useSelector };
});
vi.mock('next/image', () => ({ default: () => null }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe(data.suite, () => {
  it(data.cases.history, () => {
    mocks.sdkInit.mockResolvedValue(undefined);
    const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
    const replace = vi.spyOn(window.history, 'replaceState');
    render(<BootstrapGate><button>{data.browser.outsideLabel}</button></BootstrapGate>);
    fireEvent(window, new PopStateEvent(data.browser.popstate));
    expect(reload).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(mocks.sdkInit).toHaveBeenCalledTimes(data.counts.single);
  });

  it(data.cases.start, () => {
    const store = configureStore({ reducer: { ui: uiReducer, audio: audioReducer, game: gameReducer } });
    mocks.initialize.mockReturnValue({ type: data.browser.bootstrap });
    const push = vi.spyOn(window.history, 'pushState');
    render(<Provider store={store}><ClassSelectionScreen /></Provider>);
    fireEvent.click(screen.getByRole('button', { name: presentation.startLabel }));
    expect(mocks.initialize).toHaveBeenCalledWith({ classId: store.getState().ui.selectedClassId });
    expect(push).not.toHaveBeenCalled();
  });
});
