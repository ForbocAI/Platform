/**
 * Autoplay Thunk — actuator layer for the shared behavior tree.
 *
 * Architecture:
 *   Brain:    src/features/game/mechanics/ai/behaviorTree.ts (decisions)
 *   Percept:  src/features/game/mechanics/ai/awareness.ts   (sensing)
 *   Actuator: this file                                       (execution)
 *
 * Aligned with Forboc/client/src/features/mechanics/orchestrators/systems/bots/botSystem.ts
 * + actuation.ts. The Brain decides, this file executes.
 *
 * SDK integration: When the ForbocAI SDK is integrated, a CortexDirective
 * will be injected into runBehaviorTree as its 4th argument. See system-todo.md §1.2.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { harvestCrop, craftItem } from './baseCamp';
import { useItem, equipItem, pickUpGroundLoot } from './inventory';
import { castSpell, engageHostiles, respawnPlayer } from './combat';
import { movePlayer, scanSector } from './exploration';
import { tradeBuy, tradeSell } from './trade';
import { askOracle, queryOracle } from './oracle';
import { handleVignetteProgression } from '../constants';
import { SPELLS } from '@/features/game/mechanics/spells';
import type { GameState } from '../types';
import type { Item, Enemy } from '@/features/game/types';
import { computeAwareness } from '@/features/game/mechanics/ai/awareness';
import { runBehaviorTree, AUTOPLAY_CONFIG } from '@/features/game/mechanics/ai/behaviorTree';
import type { AgentAction } from '@/features/game/mechanics/ai/types';
import { getSDKDirective } from '@/lib/sdk-placeholder';

// ── Utility helpers (used by actuator for specific decisions) ──

/** Find best item to buy from a merchant */
function pickBestPurchase(wares: Item[], spirit: number, blood: number, playerInventory: Item[]): Item | null {
  const affordable = wares.filter(w => {
    const cost = w.cost || { spirit: 0 };
    return (spirit >= (cost.spirit || 0)) && (blood >= (cost.blood || 0));
  });
  if (affordable.length === 0) return null;

  const healingNames = ['Healing', 'Potion', 'Mushroom', 'Salve', 'Puffball', 'Cap', 'Morel', 'Truffle', 'Lichen'];
  const hasAnyHealing = playerInventory.some(
    i => i.type === 'consumable' && healingNames.some(n => i.name.includes(n))
  );
  const hasWeapon = playerInventory.some(i => i.type === 'weapon');
  const hasArmor = playerInventory.some(i => i.type === 'armor');

  return affordable.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Prioritize consumables heavily when we have no healing items
    if (!hasAnyHealing) {
      if (a.type === 'consumable') scoreA += 10;
      if (b.type === 'consumable') scoreB += 10;
    }

    const typePriority: Record<string, number> = {
      consumable: 5, weapon: 4, armor: 4, relic: 3, contract: 2, resource: 1,
    };
    scoreA += typePriority[a.type] || 0;
    scoreB += typePriority[b.type] || 0;

    // Deprioritize weapon/armor if we already have one
    if (a.type === 'weapon' && hasWeapon) scoreA -= 3;
    if (b.type === 'weapon' && hasWeapon) scoreB -= 3;
    if (a.type === 'armor' && hasArmor) scoreA -= 3;
    if (b.type === 'armor' && hasArmor) scoreB -= 3;

    return scoreB - scoreA;
  })[0] ?? null;
}

/** Determine worst item to sell (resources > consumables > others) */
function pickWorstItem(inventory: Item[]): Item | null {
  if (inventory.length === 0) return null;
  const sellPriority: Record<string, number> = {
    resource: 1, consumable: 2, contract: 3, relic: 4, armor: 5, weapon: 6,
  };
  return [...inventory].sort((a, b) =>
    (sellPriority[a.type] || 0) - (sellPriority[b.type] || 0)
  )[0] ?? null;
}

/** Pick the best spell to cast based on situation (detailed heuristic) */
function pickBestSpell(spellIds: string[], enemies: Enemy[]): string | null {
  if (!spellIds || spellIds.length === 0) return null;

  let best: { id: string; score: number } | null = null;
  for (const id of spellIds) {
    const spell = SPELLS[id];
    if (!spell) continue;

    // Parse damage dice
    let score = 3;
    if (spell.damage) {
      const match = spell.damage.match(/(\d+)d(\d+)/);
      if (match) score = Number(match[1]) * (Number(match[2]) + 1) / 2;
    }
    // Prefer higher-damage spells against tough enemies
    if (enemies.length > 0 && enemies[0].hp > 30) score *= 1.5;
    // Prefer debuff/DoT spells for variety
    const effectStr = typeof spell.effect === 'function' ? spell.effect({} as never, {} as never) : '';
    if (effectStr.includes('DoT') || effectStr.includes('Debuff')) score += 2;
    if (!best || score > best.score) best = { id, score };
  }
  return best?.id ?? spellIds[0];
}

// ── Actuator: translates AgentAction into Redux dispatches ──

async function actuate(
  action: AgentAction,
  state: { game: GameState },
  dispatch: any,
  getState: () => unknown,
): Promise<void> {
  const { currentRoom: room, player } = state.game;
  if (!room || !player) return;

  switch (action.type) {
    case 'respawn':
      await dispatch(respawnPlayer());
      break;

    case 'harvest': {
      const idx = (action.payload?.featureIndex as number) ?? 0;
      dispatch(harvestCrop({ featureIndex: idx }));
      break;
    }

    case 'craft': {
      const recipeId = action.payload?.recipeId as string;
      if (recipeId) dispatch(craftItem({ recipeId }));
      break;
    }

    case 'heal': {
      const healingNames = ['Healing', 'Potion', 'Mushroom', 'Salve', 'Puffball', 'Cap', 'Morel', 'Truffle', 'Lichen'];
      const healingItem = player.inventory.find(
        i => i.type === 'consumable' && healingNames.some(n => i.name.includes(n))
      );
      if (healingItem) await dispatch(useItem({ itemId: healingItem.id }));
      break;
    }

    case 'reduce_stress': {
      const stressItem = player.inventory.find(
        i => i.type === 'consumable' && (i.name.includes('Calm') || i.name.includes('Tonic') || i.name.includes('Serenity'))
      );
      if (stressItem) await dispatch(useItem({ itemId: stressItem.id }));
      break;
    }

    case 'equip_weapon': {
      const itemId = action.payload?.itemId as string;
      if (itemId) await dispatch(equipItem({ itemId, slot: 'mainHand' }));
      break;
    }

    case 'equip_armor': {
      const itemId = action.payload?.itemId as string;
      if (itemId) await dispatch(equipItem({ itemId, slot: 'armor' }));
      break;
    }

    case 'flee':
    case 'move': {
      const dir = action.payload?.direction as string;
      if (dir) {
        await dispatch(movePlayer(dir));
        handleVignetteProgression(dispatch, getState);
      }
      break;
    }

    case 'cast_spell': {
      let spellId = action.payload?.spellId as string;
      // If behavior tree didn't pick a specific spell, use detailed heuristic
      if (!spellId) {
        spellId = pickBestSpell(player.spells || [], room.enemies || []) || '';
      }
      if (spellId) await dispatch(castSpell({ spellId }));
      break;
    }

    case 'engage':
      await dispatch(engageHostiles());
      break;

    case 'loot':
      if (room.groundLoot && room.groundLoot.length > 0) {
        await dispatch(pickUpGroundLoot({ itemId: room.groundLoot[0].id }));
      }
      break;

    case 'sell': {
      const sellTarget = pickWorstItem(player.inventory);
      if (sellTarget) await dispatch(tradeSell({ itemId: sellTarget.id }));
      break;
    }

    case 'buy': {
      const spirit = player.spirit ?? 0;
      const blood = player.blood ?? 0;
      const merchants = room.merchants || [];
      // Prefer specialist merchants
      const sorted = [...merchants].sort((a, b) => {
        const aSpec = a.specialty ? 1 : 0;
        const bSpec = b.specialty ? 1 : 0;
        return bSpec - aSpec;
      });
      for (const merchant of sorted) {
        if (spirit < 5) break;
        const purchase = pickBestPurchase(merchant.wares, spirit, blood, player.inventory);
        if (purchase) {
          await dispatch(tradeBuy({ merchantId: merchant.id, itemId: purchase.id }));
          return;
        }
      }
      break;
    }

    case 'scan':
      await dispatch(scanSector());
      break;

    case 'commune':
      await dispatch(queryOracle());
      handleVignetteProgression(dispatch, getState);
      break;

    case 'ask_oracle': {
      const themes = [
        'What shadows lurk in this corner of the otherworld?',
        'Is the fabric of reality weakening here?',
        'Can I hear the whispers of the ancient ones?',
        'Is there a slipgate hidden amidst the eerige foliage?',
        "Does the presence of the Governor of Qua'dar linger here?",
        'Are there hidden relics waiting to be discovered?',
        'Is the void shifting nearby?',
      ];
      const question = themes[Math.floor(Math.random() * themes.length)];
      await dispatch(askOracle(question));
      break;
    }

    case 'idle':
    default:
      // Nothing to do — wait for next tick
      break;
  }
}

// ── Main autoplay thunk ──

export const runAutoplayTick = createAsyncThunk(
  'game/runAutoplayTick',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { currentRoom: room, player } = state.game;

    if (!room || !player) return;

    // 1. Perceive — gather awareness of the environment
    const awareness = computeAwareness(state.game);

    // 2. SDK Directive — mock cortex processes observation & generates directive
    //    When real SDK is integrated, replace getSDKDirective() with:
    //      const obs = cortexMapper.toObservation(state.game);
    //      const directive = await SDK.Cortex.processObservation(obs);
    //      const sdkAction = await SDK.Cortex.generateAction(directive);
    //      const cortexDirective = cortexMapper.toCortexDirective(sdkAction);
    const cortexDirective = getSDKDirective(state.game);

    // 3. Decide — run the shared behavior tree with SDK directive as Node 0
    const action = runBehaviorTree(AUTOPLAY_CONFIG, state.game, awareness, cortexDirective);

    // 3. Act — execute the chosen action via Redux dispatches
    await actuate(action, state, dispatch, getState);
  }
);
