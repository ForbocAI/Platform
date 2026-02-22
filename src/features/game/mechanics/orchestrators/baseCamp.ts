import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Item } from '@/features/game/types';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../../store/gameSlice';
import type { GameState } from '../../store/types';

/** Weighted mushroom pool for farming harvests. New types (Spore Clump, Rust Spindle) add variety and distinct effects/flavor. */
const HARVESTABLE_MUSHROOMS: { id: string; name: string; description: string; cost: { primary: number; secondary?: number }; weight: number }[] = [
  { id: "glowing_mushroom", name: "Glowing Mushroom", description: "A faint blue fungus with regenerative properties.", cost: { primary: 5 }, weight: 28 },
  { id: "chromatic_cap", name: "Chromatic Cap", description: "Iridescent fungus from chromatic-steel growths. Shifts hue when touched.", cost: { primary: 8 }, weight: 20 },
  { id: "ember_puffball", name: "Ember Puffball", description: "Smoldering orange puffball that radiates faint warmth. Used in pyrokinetic compounds.", cost: { primary: 7 }, weight: 18 },
  { id: "static_lichen", name: "Static Lichen", description: "Lichen crackling with residual noise from the Static Sea. Disrupts nearby enchantments.", cost: { primary: 10 }, weight: 12 },
  { id: "void_morel", name: "Void Morel", description: "A pitch-black morel that hums with dimensional resonance. Potent in rift alchemy.", cost: { primary: 12 }, weight: 10 },
  { id: "chthonic_truffle", name: "Chthonic Truffle", description: "Subterranean truffle veined with crimson. Whispers of the deep cling to it.", cost: { primary: 14, secondary: 1 }, weight: 6 },
  { id: "spore_clump", name: "Spore Clump", description: "Soft grey cluster that soothes the mind. Calms stress and mild anxiety when prepared correctly.", cost: { primary: 6 }, weight: 14 },
  { id: "rust_spindle", name: "Rust Spindle", description: "Copper-toned spindle that bonds with metal. Used in reinforcement and repair alchemy.", cost: { primary: 9 }, weight: 8 },
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
    const { currentArea } = state.game;
    if (!currentArea?.isBaseCamp || !currentArea.features) return;
    const feature = currentArea.features[arg.featureIndex];
    if (!feature || feature.type !== 'resource_plot' || !feature.ready) return;

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
  async (arg: { formulaId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player, currentArea } = state.game;
    if (!player || !currentArea?.isBaseCamp) return;

    const formula = player.blueprints.find((f) => f.id === arg.formulaId);
    if (!formula) {
      dispatch(addLog({ message: 'Unknown blueprint.', type: 'system' }));
      return;
    }

    const hasIngredients = formula.ingredients.every((ing) => {
      const count = (player.inventory.items as Item[]).filter((i) => i.name === ing.name).length;
      return count >= ing.quantity;
    });
    if (!hasIngredients) {
      dispatch(addLog({ message: 'Insufficient ingredients.', type: 'system' }));
      return;
    }

    const craftedItem: Item = {
      id: `${formula.produces.name.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
      name: formula.produces.name,
      type: formula.produces.type,
      description: formula.produces.description,
      effect: formula.produces.effect,
      cost: formula.produces.cost,
    };

    dispatch(addLog({ message: `Crafted ${craftedItem.name}.`, type: 'system' }));
    dispatch(
      addFact({
        text: `Crafted ${craftedItem.name} at Base Camp.`,
        questionKind: 'basecamp',
        isFollowUp: false,
      })
    );
    return { craftedItem, ingredients: formula.ingredients };
  }
);
