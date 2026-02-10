import { createAsyncThunk } from '@reduxjs/toolkit';
import { SDK } from '@/lib/sdk-placeholder';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../actions';
import type { GameState } from '../types';

export const askOracle = createAsyncThunk(
  'game/askOracle',
  async (question: string, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    if (!state.game.player) throw new Error('No player');

    dispatch(addLog({ message: `Your Question: "${question}"`, type: 'system' }));

    const result = await SDK.Cortex.consultOracle(question, state.game.player.surgeCount);

    dispatch(
      addFact({
        sourceQuestion: question,
        sourceAnswer: result.description,
        text: `Oracle answered: ${result.description}`,
        questionKind: 'oracle',
        isFollowUp: false,
      })
    );

    return result;
  }
);

export const communeWithVoid = createAsyncThunk(
  'game/communeWithVoid',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    if (!state.game.player) return;

    dispatch(addLog({ message: 'You attempt to commune with the void...', type: 'system' }));

    const result = await SDK.Cortex.consultOracle('Commune', state.game.player.surgeCount);

    dispatch(addLog({ message: `Oracle: ${result.description}`, type: 'oracle' }));
    dispatch(
      addFact({
        text: `Communed with void: ${result.description}`,
        questionKind: 'commune',
        sourceAnswer: result.description,
        isFollowUp: false,
      })
    );

    return result;
  }
);
