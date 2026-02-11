import { createAction } from '@reduxjs/toolkit';
import type { GameLogEntry } from '@/features/game/types';

export const addLog = createAction<{ message: string; type: GameLogEntry['type'] }>('game/addLog');
export const selectSpell = createAction<string | null>('game/selectSpell');
export const clearPendingQuestFacts = createAction('game/clearPendingQuestFacts');
