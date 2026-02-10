import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Item } from '@/lib/game/types';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../actions';
import type { GameState } from '../types';

export const harvestCrop = createAsyncThunk(
  'game/harvestCrop',
  async (arg: { featureIndex: number }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { currentRoom } = state.game;
    if (!currentRoom?.isBaseCamp || !currentRoom.features) return;
    const feature = currentRoom.features[arg.featureIndex];
    if (!feature || feature.type !== 'farming_plot' || !feature.ready) return;

    const cropItem: Item = {
      id: `glowing_mushroom_${Date.now()}`,
      name: 'Glowing Mushroom',
      type: 'resource',
      description: 'A faint blue fungus with regenerative properties. Used in alchemy.',
      cost: { spirit: 5 },
    };

    dispatch(addLog({ message: `Harvested ${cropItem.name}.`, type: 'system' }));
    dispatch(addFact({ text: 'Harvested crop from Base Camp.', questionKind: 'basecamp', isFollowUp: false }));
    return { featureIndex: arg.featureIndex, item: cropItem };
  }
);

export const craftItem = createAsyncThunk(
  'game/craftItem',
  async (arg: { recipeId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player, currentRoom } = state.game;
    if (!player || !currentRoom?.isBaseCamp) return;

    const recipe = player.recipes.find((r) => r.id === arg.recipeId);
    if (!recipe) {
      dispatch(addLog({ message: 'Unknown recipe.', type: 'system' }));
      return;
    }

    const hasIngredients = recipe.ingredients.every((ing) => {
      const count = player.inventory.filter((i) => i.name === ing.name).length;
      return count >= ing.quantity;
    });
    if (!hasIngredients) {
      dispatch(addLog({ message: 'Insufficient ingredients.', type: 'system' }));
      return;
    }

    const craftedItem: Item = {
      id: `${recipe.produces.name.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
      name: recipe.produces.name,
      type: recipe.produces.type,
      description: recipe.produces.description,
      effect: recipe.produces.effect,
      cost: recipe.produces.cost,
    };

    dispatch(addLog({ message: `Crafted ${craftedItem.name}.`, type: 'system' }));
    dispatch(
      addFact({
        text: `Crafted ${craftedItem.name} at Base Camp.`,
        questionKind: 'basecamp',
        isFollowUp: false,
      })
    );
    return { craftedItem, ingredients: recipe.ingredients };
  }
);
