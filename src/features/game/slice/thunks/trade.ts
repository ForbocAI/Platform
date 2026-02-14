import { createAsyncThunk } from '@reduxjs/toolkit';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../gameSlice';
import { handleVignetteProgression } from '../constants';
import type { GameState } from '../types';

export const tradeBuy = createAsyncThunk(
  'game/tradeBuy',
  async (
    { merchantId, itemId }: { merchantId: string; itemId: string },
    { getState, dispatch }
  ) => {
    const state = getState() as { game: GameState };
    const { currentRoom, player } = state.game;
    if (!currentRoom || !player) return;
    const merchant = currentRoom.merchants?.find((m) => m.id === merchantId);
    if (!merchant) return;
    const item = merchant.wares.find((i) => i.id === itemId);
    if (!item) return;
    const cost = item.cost || { spirit: 0 };
    const spiritCost = cost.spirit || 0;
    const bloodCost = cost.blood || 0;
    if ((player.spirit || 0) < spiritCost || (player.blood || 0) < bloodCost) {
      dispatch(addLog({ message: 'Insufficent currency.', type: 'system' }));
      return;
    }
    dispatch(addLog({ message: `Purchased ${item.name} from ${merchant.name}.`, type: 'system' }));
    dispatch(addFact({ text: `Purchased ${item.name} from ${merchant.name}.`, questionKind: 'trade', isFollowUp: false }));
    handleVignetteProgression(dispatch, getState);
    return { item, spiritCost, bloodCost };
  }
);

export const tradeSell = createAsyncThunk(
  'game/tradeSell',
  async ({ itemId }: { itemId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player } = state.game;
    if (!player) return;
    const itemIndex = player.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;
    const item = player.inventory[itemIndex];
    const cost = item.cost || { spirit: 10 };
    const value = Math.max(1, Math.floor((cost.spirit || 0) / 2));
    dispatch(addLog({ message: `Sold ${item.name} for ${value} Spirit.`, type: 'system' }));
    dispatch(addFact({ text: `Sold ${item.name}.`, questionKind: 'trade', isFollowUp: false }));
    handleVignetteProgression(dispatch, getState);
    return { itemIndex, value };
  }
);
