import { createAsyncThunk } from '@reduxjs/toolkit';
import { sdkService } from '@/features/game/sdk/cortexService';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../gameSlice';
import type { GameState } from '../types';

export const askInquiry = createAsyncThunk(
  'game/askInquiry',
  async (question: string, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    if (!state.game.player) throw new Error('No player');

    dispatch(addLog({ message: `Your Inquiry: "${question}"`, type: 'system' }));

    const result = await sdkService.generateInquiryResponse(question, state.game.player.stats.stress); // Using stress as context

    dispatch(
      addFact({
        sourceQuestion: question,
        sourceAnswer: result.description,
        text: `Inquiry response: ${result.description}`,
        questionKind: 'inquiry',
        isFollowUp: false,
      })
    );

    return result;
  }
);

export const performSystemInquiry = createAsyncThunk(
  'game/performSystemInquiry',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    if (!state.game.player) return;

    dispatch(addLog({ message: 'Requesting system overview...', type: 'system' }));

    const result = await sdkService.generateInquiryResponse('System Overview', state.game.player.stats.stress);

    dispatch(addLog({ message: `Response: ${result.description}`, type: 'oracle' }));
    dispatch(
      addFact({
        text: `System Inquiry: ${result.description}`,
        questionKind: 'system',
        sourceAnswer: result.description,
        isFollowUp: false,
      })
    );

    return result;
  }
);
