import { createAsyncThunk } from '@reduxjs/toolkit';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../gameSlice';
import type { GameState } from '../types';

export const pickUpGroundLoot = createAsyncThunk(
  'game/pickUpGroundLoot',
  async ({ itemId }: { itemId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { currentArea, player } = state.game;
    if (!currentArea || !player || !currentArea.groundLoot) return;

    const item = currentArea.groundLoot.find((i) => i.id === itemId);
    if (!item) return;

    dispatch(addLog({ message: `Picked up ${item.name}.`, type: 'system' }));
    dispatch(
      addFact({
        text: `Picked up ${item.name} from the ground.`,
        questionKind: 'loot',
        isFollowUp: false,
      })
    );
    return { item, itemId };
  }
);

export const consumeItem = createAsyncThunk(
  'game/consumeItem',
  async ({ itemId }: { itemId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player } = state.game;
    if (!player) return;

    const itemIndex = player.inventory.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;
    const item = player.inventory.items[itemIndex];

    if (item.type === 'contract' && item.contractDetails) {
      dispatch(addLog({ message: `You signed ${item.name}. ${item.contractDetails.targetName} joins your party!`, type: 'system' }));
      return { itemIndex, effect: 'hire_companion' as const, contractDetails: item.contractDetails, now: Date.now() };
    }

    if (item.type !== 'consumable') return;

    dispatch(addLog({ message: `Used ${item.name}.`, type: 'system' }));

    if (item.name.includes('Healing') || item.name.includes('Potion')) {
      dispatch(addLog({ message: 'Health restored.', type: 'system' }));
      return { itemIndex, effect: 'heal_hp_20' as const };
    }
    if (item.name.includes('Clarity') || item.name.includes('Elixir')) {
      dispatch(addLog({ message: 'Stress reduced.', type: 'system' }));
      return { itemIndex, effect: 'heal_stress_10' as const };
    }

    return { itemIndex, effect: 'unknown' as const };
  }
);

export const equipItem = createAsyncThunk(
  'game/equipItem',
  async (
    {
      itemId,
      slot,
    }: { itemId: string; slot: import('@/features/game/types').EquipmentSlot },
    { getState, dispatch }
  ) => {
    const state = getState() as { game: GameState };
    const { player } = state.game;
    if (!player) return;

    const itemIndex = player.inventory.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const item = player.inventory.items[itemIndex];
    if (slot === 'mainHand' && item.type !== 'weapon') return;
    if (slot === 'armor' && item.type !== 'armor') return;
    if (slot === 'relic' && item.type !== 'relic') return;

    dispatch(addLog({ message: `Equipped ${item.name}.`, type: 'system' }));
    return { itemIndex, slot, item };
  }
);

export const unequipItem = createAsyncThunk(
  'game/unequipItem',
  async ({ slot }: { slot: import('@/features/game/types').EquipmentSlot }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player } = state.game;
    if (!player || !player.inventory.equipment || !(player.inventory.equipment as any)[slot]) return;

    dispatch(addLog({ message: `Unequipped ${(player.inventory.equipment as any)[slot]?.name}.`, type: 'system' }));
    return { slot };
  }
);

export const sacrificeItem = createAsyncThunk(
  'game/sacrificeItem',
  async ({ itemId }: { itemId: string }, { getState, dispatch }) => {
    const state = getState() as { game: import('../types').GameState };
    const { player } = state.game;
    if (!player) return;

    const itemIndex = player.inventory.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const item = player.inventory.items[itemIndex];
    const value = item.cost?.primary || 0;

    if (value <= 0) return;

    const gain = Math.max(1, Math.floor(value / 2));

    dispatch(addLog({ message: `Sacrificed ${item.name} for ${gain} Primary.`, type: 'system' }));
    dispatch(
      addFact({
        text: `Sacrificed ${item.name} to the void.`,
        questionKind: 'sacrifice',
        isFollowUp: false,
      })
    );

    return { itemIndex, gain };
  }
);
