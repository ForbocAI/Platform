import type { TypedStartListening } from '@reduxjs/toolkit';
import { getInitOptionsFromUrl } from '@/lib/getInitOptions';
import { initializeGame, clearPendingQuestFacts } from '@/features/game/slice/gameSlice';
import { addThread, setMainThread, addFact } from '@/features/narrative/slice/narrativeSlice';
import type { RootState, AppDispatch } from './index';

export const retryInitialize = { type: 'app/retryInitialize' as const };

export function registerGameListeners(
  startAppListening: TypedStartListening<RootState, AppDispatch>
): void {
  // Bootstrap: init game when no player, using full URL params
  startAppListening({
    predicate: (action) => action.type === 'app/bootstrap',
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState();
      if (!state.game.player) {
        const opts = getInitOptionsFromUrl();
        await listenerApi.dispatch(initializeGame(opts));
      }
    },
  });

  // Retry: re-initialize with current URL params (e.g. LoadingOverlay Retry button)
  startAppListening({
    predicate: (action) => action.type === retryInitialize.type,
    effect: async (_, listenerApi) => {
      const opts = getInitOptionsFromUrl();
      await listenerApi.dispatch(initializeGame(opts));
    },
  });

  // Pending quest facts → add to narrative facts, then clear
  startAppListening({
    predicate: () => true,
    effect: (action, listenerApi) => {
      const state = listenerApi.getState();
      const pending = state.game.pendingQuestFacts;
      if (pending.length === 0) return;
      listenerApi.dispatch(clearPendingQuestFacts());
      pending.forEach((text) => {
        listenerApi.dispatch(
          addFact({ text, questionKind: 'quest', isFollowUp: false })
        );
      });
    },
  });

  // Thread seeding: when game initialized and no threads, add first thread
  startAppListening({
    predicate: (action) => action.type === initializeGame.fulfilled.type,
    effect: (action, listenerApi) => {
      const state = listenerApi.getState();
      if (state.narrative.threads.length > 0) return;
      listenerApi.dispatch(
        addThread({ name: 'Reconnaissance', stage: 'To Knowledge' })
      );
    },
  });

  // Main thread: when exactly one thread and no mainThreadId, set it
  startAppListening({
    predicate: (action) => action.type === addThread.type,
    effect: (action, listenerApi) => {
      const state = listenerApi.getState();
      const { threads, mainThreadId } = state.narrative;
      if (threads.length !== 1 || mainThreadId) return;
      listenerApi.dispatch(setMainThread(threads[0].id));
    },
  });
}
