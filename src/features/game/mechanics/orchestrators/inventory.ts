import { createAsyncThunk } from '@reduxjs/toolkit';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../../store/gameSlice';
import type { GameState } from '../../store/types';

const CONSUMABLE_EFFECT_MAP = {
  heal_hp_20: 'heal_hp_20',
  heal_stress_10: 'heal_stress_10',
  heal_20_stress_10: 'heal_20_stress_10',
  stress_30: 'stress_30',
  heal_50_stress_add_10: 'heal_50_stress_add_10',
} as const;

export const pickUpGroundLoot = createAsyncThunk(
  'game/pickUpGroundLoot',
  async ({ itemId }: { itemId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { currentArea, player } = state.game;
    if (!currentArea || !player || !currentArea.groundLoot) return;

    const item = currentArea.groundLoot.find((i) => i.id === itemId);
    if (!item) return;

    dispatch(addLog({ message: `Gathered ${item.name}.`, type: 'system' }));
    dispatch(
      addFact({
        text: `Gathered ${item.name} along the path.`,
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

    const itemIndex = (player.inventory.items as import('../../types').Item[]).findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;
    const item = (player.inventory.items as import('../../types').Item[])[itemIndex];

    if (item.type === 'contract' && item.contractDetails) {
      dispatch(addLog({ message: `You signed ${item.name}. ${item.contractDetails.targetName} joins your party!`, type: 'system' }));
      return { itemIndex, effect: 'hire_companion' as const, contractDetails: item.contractDetails, now: Date.now() };
    }

    if (item.type !== 'consumable') return;

    dispatch(addLog({ message: `Used ${item.name}.`, type: 'system' }));

    const mappedEffect = item.effect ? CONSUMABLE_EFFECT_MAP[item.effect as keyof typeof CONSUMABLE_EFFECT_MAP] : undefined;
    if (mappedEffect) {
      if (mappedEffect === 'heal_hp_20') {
        dispatch(addLog({ message: 'Health restored.', type: 'system' }));
      } else if (mappedEffect === 'heal_stress_10') {
        dispatch(addLog({ message: 'Worry eased.', type: 'system' }));
      } else if (mappedEffect === 'heal_20_stress_10') {
        dispatch(addLog({ message: 'You feel steadier and a little stronger.', type: 'system' }));
      } else if (mappedEffect === 'stress_30') {
        dispatch(addLog({ message: 'Your nerves settle.', type: 'system' }));
      } else if (mappedEffect === 'heal_50_stress_add_10') {
        dispatch(addLog({ message: 'You recover quickly, but the rush leaves you rattled.', type: 'system' }));
      }
      return { itemIndex, effect: mappedEffect };
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

    const itemIndex = (player.inventory.items as import('../../types').Item[]).findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const item = (player.inventory.items as import('../../types').Item[])[itemIndex];
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
    if (!player) return;
    const equipment = player.inventory.equipment as Record<import('@/features/game/types').EquipmentSlot, import('@/features/game/types').Item | undefined> | undefined;
    if (!equipment || !equipment[slot]) return;

    dispatch(addLog({ message: `Unequipped ${equipment[slot]?.name}.`, type: 'system' }));
    return { slot };
  }
);

export const sacrificeItem = createAsyncThunk(
  'game/sacrificeItem',
  async ({ itemId }: { itemId: string }, { getState, dispatch }) => {
    const state = getState() as { game: import('../../store/types').GameState };
    const { player } = state.game;
    if (!player) return;

    const itemIndex = (player.inventory.items as import('../../types').Item[]).findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const item = (player.inventory.items as import('../../types').Item[])[itemIndex];
    const value = item.cost?.primary || 0;

    if (value <= 0) return;

    const gain = Math.max(1, Math.floor(value / 2));

    dispatch(addLog({ message: `Repurposed ${item.name} into ${gain} Pollen.`, type: 'system' }));
    dispatch(
      addFact({
        text: `Repurposed ${item.name} into shared supplies.`,
        questionKind: 'sacrifice',
        isFollowUp: false,
      })
    );

    return { itemIndex, gain };
  }
);
