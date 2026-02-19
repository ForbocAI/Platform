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
    const { currentArea, player } = state.game;
    if (!currentArea || !player) return;
    const vendor = currentArea.vendors?.find((v) => v.id === merchantId);
    if (!vendor) return;
    const item = vendor.wares.find((i) => i.id === itemId);
    if (!item) return;
    const cost = item.cost || { primary: 0 };
    const primaryCost = cost.primary || 0;
    const secondaryCost = cost.secondary || 0;
    if ((player.resourcePrimary || 0) < primaryCost || (player.resourceSecondary || 0) < secondaryCost) {
      dispatch(addLog({ message: 'Insufficient currency.', type: 'system' }));
      return;
    }
    dispatch(addLog({ message: `Purchased ${item.name} from ${vendor.name}.`, type: 'system' }));
    dispatch(addFact({ text: `Purchased ${item.name} from ${vendor.name}.`, questionKind: 'trade', isFollowUp: false }));
    handleVignetteProgression(dispatch, getState);
    return { item, primaryCost, secondaryCost };
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
    const cost = item.cost || { primary: 10 };
    const value = Math.max(1, Math.floor((cost.primary || 0) / 2));
    dispatch(addLog({ message: `Sold ${item.name} for ${value} Spirit.`, type: 'system' }));
    dispatch(addFact({ text: `Sold ${item.name}.`, questionKind: 'trade', isFollowUp: false }));
    handleVignetteProgression(dispatch, getState);
    return { itemIndex, value };
  }
);
