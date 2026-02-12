import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Item } from '@/features/game/types';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../actions';
import type { GameState } from '../types';

/** Weighted mushroom pool for farming harvests */
const HARVESTABLE_MUSHROOMS: { id: string; name: string; description: string; cost: { spirit: number; blood?: number }; weight: number }[] = [
  { id: "glowing_mushroom", name: "Glowing Mushroom", description: "A faint blue fungus with regenerative properties.", cost: { spirit: 5 }, weight: 30 },
  { id: "chromatic_cap", name: "Chromatic Cap", description: "Iridescent fungus from chromatic-steel growths. Shifts hue when touched.", cost: { spirit: 8 }, weight: 22 },
  { id: "ember_puffball", name: "Ember Puffball", description: "Smoldering orange puffball that radiates faint warmth. Used in pyrokinetic compounds.", cost: { spirit: 7 }, weight: 20 },
  { id: "static_lichen", name: "Static Lichen", description: "Lichen crackling with residual noise from the Static Sea. Disrupts nearby enchantments.", cost: { spirit: 10 }, weight: 12 },
  { id: "void_morel", name: "Void Morel", description: "A pitch-black morel that hums with dimensional resonance. Potent in rift alchemy.", cost: { spirit: 12 }, weight: 10 },
  { id: "chthonic_truffle", name: "Chthonic Truffle", description: "Subterranean truffle veined with crimson. Whispers of the deep cling to it.", cost: { spirit: 14, blood: 1 }, weight: 6 },
];

function pickRandomMushroom(): (typeof HARVESTABLE_MUSHROOMS)[number] {
  const total = HARVESTABLE_MUSHROOMS.reduce((s, m) => s + m.weight, 0);
  let r = Math.random() * total;
  for (const m of HARVESTABLE_MUSHROOMS) {
    r -= m.weight;
    if (r <= 0) return m;
  }
  return HARVESTABLE_MUSHROOMS[0];
}

export const harvestCrop = createAsyncThunk(
  'game/harvestCrop',
  async (arg: { featureIndex: number }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { currentRoom } = state.game;
    if (!currentRoom?.isBaseCamp || !currentRoom.features) return;
    const feature = currentRoom.features[arg.featureIndex];
    if (!feature || feature.type !== 'farming_plot' || !feature.ready) return;

    const mushroom = pickRandomMushroom();
    const cropItem: Item = {
      id: `${mushroom.id}_${Date.now()}`,
      name: mushroom.name,
      type: 'resource',
      description: mushroom.description,
      cost: mushroom.cost,
    };

    dispatch(addLog({ message: `Harvested ${cropItem.name}.`, type: 'system' }));
    dispatch(addFact({ text: `Harvested ${cropItem.name} from Base Camp.`, questionKind: 'basecamp', isFollowUp: false }));
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
