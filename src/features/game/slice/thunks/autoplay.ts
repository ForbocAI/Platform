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
 * Features exercised (for task.md / PLAYTEST_AUTOMATION): Init, Movement, SCAN, ENGAGE,
 * COMMUNE, Oracle, Facts (via commune/ask_oracle), Vignette (via handleVignetteProgression
 * on move/commune), Trading (buy/sell), Combat (engage, cast_spell), Hazards (flee/danger),
 * Crafting & Farming (harvest, craft), Quests (quest node + scan/move/engage/trade),
 * Concession/Death (respawn; auto-respawn when autoplay is on via core/listeners),
 * Servitors (combat slice uses them when present).
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
import type { GameState } from '../types';
import { computeAwareness } from '@/features/game/mechanics/ai/awareness';
import { runBehaviorTree, AUTOPLAY_CONFIG } from '@/features/game/mechanics/ai/behaviorTree';
import type { AgentAction, AgentActionType, CortexDirective } from '@/features/game/mechanics/ai/types';
import { getAutoplayConfig, getTickInterval, getNextAutoplayDelayMs } from '@/lib/sdk/config';
import { sdkService } from '@/lib/sdk/cortexService';
import { toObservation, toCortexDirective } from '@/lib/sdk/mappers';
import { addLog } from '@/features/game/slice/gameSlice';
import {
  pickBestPurchase,
  pickWorstItem,
  pickBestSpell,
  ORACLE_THEMES,
  HEALING_ITEM_NAMES,
} from './autoplayHelpers';

// Track last action for cooldown/loop prevention
let lastActionType: AgentActionType | null = null;
let lastRoomId: string | null = null;
let stuckCounter = 0;

/**
 * Check for "Abstract Stuck" state:
 * - Bot tries to move/explore but Room ID stays same.
 */
function checkStuckState(currentRoomId: string, actionType: AgentActionType | null | undefined): boolean {
  if (actionType === ('move' as any) || actionType === ('explore' as any)) {
    if (currentRoomId === lastRoomId) {
      stuckCounter++;
    } else {
      stuckCounter = 0;
    }
  } else {
    // Actions other than move might reset stuck counter if successful? 
    // Or we just decay it.
    stuckCounter = Math.max(0, stuckCounter - 1);
  }
  lastRoomId = currentRoomId;
  return stuckCounter > 5;
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
      const healingItem = player.inventory.find(
        i => i.type === 'consumable' && HEALING_ITEM_NAMES.some(n => i.name.includes(n)),
      );
      if (healingItem) await dispatch(useItem({ itemId: healingItem.id }));
      break;
    }

    case 'reduce_stress': {
      const stressItem = player.inventory.find(
        i => i.type === 'consumable' && (i.name.includes('Calm') || i.name.includes('Tonic') || i.name.includes('Serenity') || i.name.includes('Spore Clump'))
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
      const preferContract = action.reason?.includes('servitor contract') ?? false;
      for (const merchant of sorted) {
        if (spirit < 5) break;
        const purchase = pickBestPurchase(merchant.wares, spirit, blood, player.inventory, preferContract);
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
      const question = ORACLE_THEMES[Math.floor(Math.random() * ORACLE_THEMES.length)];
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
  async (_, { getState, dispatch }): Promise<{ nextTickAt: number; nextDelayMs: number } | undefined> => {
    const rootState = getState() as { game: GameState; ui?: { autoplayDelayMs?: number } };
    const state = { game: rootState.game };
    const { currentRoom: room, player } = state.game;

    if (!room || !player) return undefined;

    // 1. Perceive — gather awareness of the environment (with last action for cooldown tracking)
    const awareness = computeAwareness(state.game, lastActionType);

    // 2. SDK Directive — Call real ForbocAI SDK
    let cortexDirective: CortexDirective | null = null;
    try {
      const agent = sdkService.getAgent();
      const observation = toObservation(state.game);

      const response = await agent.process(observation.content, state.game as any);

      if (response.dialogue) {
        dispatch(addLog({ message: response.dialogue, type: 'dialogue' }));
      }

      if (response.action) {
        cortexDirective = toCortexDirective(response.action);
      }
    } catch (e) {
      console.warn('SDK Decision failed, falling back to pure Behavior Tree:', e);
    }

    // 3. Decide — run the shared behavior tree with SDK directive as Node 0
    let action = runBehaviorTree(AUTOPLAY_CONFIG, state.game, awareness, cortexDirective);

    // 3.5 Stuck Recovery Override
    const isStuck = checkStuckState(room.id, lastActionType); // Check result of PREVIOUS action
    if (isStuck) {
      // Force a random move to a random exit to unstick
      const exits = (Object.keys(room.exits) as import('@/features/game/types').Direction[]).filter(k => room.exits[k as import('@/features/game/types').Direction]);
      if (exits.length > 0) {
        const randomExit = exits[Math.floor(Math.random() * exits.length)];
        action = {
          type: 'move',
          payload: { direction: randomExit },
          reason: 'Stuck Recovery (Abstract): Forcing move to random exit'
        };
        stuckCounter = 0; // Reset
      }
    }

    // 4. Act — execute the chosen action via Redux dispatches
    await actuate(action, state, dispatch, getState);

    // 5. Track last action for next tick's cooldown checks
    lastActionType = action.type;

    // 6. Return schedule for reducer: when next tick and decayed delay (reducer-only scheduling)
    const config = getAutoplayConfig();
    const speed = config.speed ?? 'normal';
    const delayMs = rootState.ui?.autoplayDelayMs ?? getTickInterval(speed);
    const nextDelayMs = getNextAutoplayDelayMs(delayMs, speed);
    return { nextTickAt: Date.now() + delayMs, nextDelayMs };
  }
);
