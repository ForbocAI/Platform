import type { TypedStartListening } from '@reduxjs/toolkit';
import { getInitOptionsFromUrl } from '@/lib/getInitOptions';
import { initializeGame, clearPendingQuestFacts, respawnPlayer } from '@/features/game/slice/gameSlice';
import { normalizeClassIdFromParam } from '@/features/game/mechanics/classes';
import { addThread, setMainThread, addFact } from '@/features/narrative/slice/narrativeSlice';
import { toggleAutoPlay, setSelectedClassId, setAutoplaySchedule } from '@/features/core/ui/slice/uiSlice';
import type { RootState, AppDispatch } from './index';

export const retryInitialize = { type: 'app/retryInitialize' as const };

export function registerGameListeners(
  startAppListening: TypedStartListening<RootState, AppDispatch>
): void {
  // Bootstrap: init game when no player, using full URL params; sync selectedClassId from URL
  startAppListening({
    predicate: (action) => action.type === 'app/bootstrap',
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState();
      const opts = getInitOptionsFromUrl();
      const normalizedClassId = opts.classId ? normalizeClassIdFromParam(opts.classId) : undefined;

      if (normalizedClassId) {
        listenerApi.dispatch(setSelectedClassId(normalizedClassId));
      }

      if (!state.game.player) {
        // Only auto-init if deterministic (test), class explicitly provided, or autoStart requested
        if (opts.deterministic || opts.classId || opts.autoStart) {
          await listenerApi.dispatch(
            initializeGame({ ...opts, classId: normalizedClassId ?? opts.classId })
          );

          // Auto-start autoplay if requested
          if (opts.autoStart) {
            await listenerApi.delay(1500);
            listenerApi.dispatch(toggleAutoPlay());
          }
        }
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

  // Autoplay concession auto-respawn: when autoplay is on and player is dead (concession modal open),
  // auto-dispatch respawn once so soak tests run unattended. Then set next tick to now so the poll dispatches a tick.
  startAppListening({
    predicate: (action) => action.type === 'game/runAutoplayTick/fulfilled',
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState();
      if (!state.ui.autoPlay) return;
      const player = state.game.player;
      if (!player || player.hp > 0) return;
      await listenerApi.dispatch(respawnPlayer());
      listenerApi.dispatch(setAutoplaySchedule({ nextTickAt: Date.now() }));
    },
  });
}
