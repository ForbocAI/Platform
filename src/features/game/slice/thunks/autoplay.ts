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
 * COMMUNE, Inquiry, Facts (via perform_inquiry/ask_inquiry), Vignette (via handleVignetteProgression
 * on move/perform_inquiry), Trading (buy/sell), Combat (engage, cast_capability), Hazards (flee/danger),
 * Crafting & Farming (harvest, craft), Quests (quest node + scan/move/engage/trade),
 * Concession/Death (respawn; auto-respawn when autoplay is on via core/listeners),
 * Companions (combat slice uses them when present).
 *
 * SDK integration: When the ForbocAI SDK is integrated, a CortexDirective
 * will be injected into runBehaviorTree as its 4th argument. See system-todo.md §1.2.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { harvestCrop } from './baseCamp';
import { pickUpGroundLoot } from './inventory';
import { castCapability, respawnPlayer } from './combat';
import {
  movePlayer,
  scanSector,
  engageHostiles,
  askInquiry,
  tradeBuy,
  tradeSell,
  consumeItem,
  equipItem,
  craftItem,
  sacrificeItem,
  performSystemInquiry,
} from './index';
import { handleVignetteProgression } from '../constants';
import type { GameState } from '../types';
import { computeAwareness } from '@/features/game/mechanics/ai/awareness';
import { runBehaviorTree, AUTOPLAY_CONFIG } from '@/features/game/mechanics/ai/behaviorTree';
import type { AgentAction, AgentActionType, CortexDirective } from '@/features/game/mechanics/ai/types';
import { getAutoplayConfig, getTickInterval, getNextAutoplayDelayMs } from '@/features/game/sdk/config';
import { sdkService } from '@/features/game/sdk/cortexService';
import { toObservation, toCortexDirective } from '@/features/game/sdk/mappers';
import { addLog, setAgentPondering, clearAgentPondering } from '@/features/game/slice/gameSlice';
import { getPortraitForAgent } from '@/features/game/sdk/portraits';
import {
  pickBestPurchase,
  pickWorstItem,
  pickBestCapability,
  INQUIRY_THEMES,
  HEALING_ITEM_NAMES,
} from './autoplayHelpers';

// Track last action for cooldown/loop prevention
let lastActionType: AgentActionType | null = null;
let lastAreaId: string | null = null;
let stuckCounter = 0;

/**
 * Check for "Abstract Stuck" state:
 * - Bot tries to move/explore but Area ID stays same.
 */
function checkStuckState(currentAreaId: string, actionType: AgentActionType | null | undefined): boolean {
  if (actionType === ('move' as any) || actionType === ('explore' as any)) {
    if (currentAreaId === lastAreaId) {
      stuckCounter++;
    } else {
      stuckCounter = 0;
    }
  } else {
    // Actions other than move might reset stuck counter if successful? 
    // Or we just decay it.
    stuckCounter = Math.max(0, stuckCounter - 1);
  }
  lastAreaId = currentAreaId;
  return stuckCounter > 5;
}

// ── Actuator: translates AgentAction into Redux dispatches ──

async function actuate(
  action: AgentAction,
  state: { game: GameState },
  dispatch: any,
  getState: () => unknown,
): Promise<void> {
  const { currentArea: area, player } = state.game;
  if (!area || !player) return;

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
      const blueprintId = action.payload?.recipeId as string;
      if (blueprintId) dispatch(craftItem({ formulaId: blueprintId }));
      break;
    }

    case 'heal': {
      const healingItem = player.inventory.items.find(
        i => i.type === 'consumable' && HEALING_ITEM_NAMES.some(n => i.name.includes(n)),
      );
      if (healingItem) await dispatch(consumeItem({ itemId: healingItem.id }));
      break;
    }

    case 'reduce_stress': {
      const stressItem = player.inventory.items.find(
        i => i.type === 'consumable' && (i.name.includes('Calm') || i.name.includes('Tonic') || i.name.includes('Serenity') || i.name.includes('Spore Clump'))
      );
      if (stressItem) await dispatch(consumeItem({ itemId: stressItem.id }));
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

    case 'cast_capability': {
      let capabilityId = action.payload?.capabilityId as string;
      // If behavior tree didn't pick a specific capability, use detailed heuristic
      if (!capabilityId) {
        capabilityId = pickBestCapability(player.capabilities.learned || [], area.npcs || []) || '';
      }
      if (capabilityId) await dispatch(castCapability({ capabilityId }));
      break;
    }

    case 'engage':
      await dispatch(engageHostiles());
      break;

    case 'loot':
      if (area.groundLoot && area.groundLoot.length > 0) {
        await dispatch(pickUpGroundLoot({ itemId: area.groundLoot[0].id }));
      }
      break;

    case 'sell': {
      const sellTarget = pickWorstItem(player.inventory.items);
      if (sellTarget) await dispatch(tradeSell({ itemId: sellTarget.id }));
      break;
    }

    case 'buy': {
      const spirit = player.inventory.spirit ?? 0;
      const blood = player.inventory.blood ?? 0;
      const vendors = area.vendors || [];
      // Prefer specialist vendors
      const sorted = [...vendors].sort((a, b) => {
        const aSpec = a.specialty ? 1 : 0;
        const bSpec = b.specialty ? 1 : 0;
        return bSpec - aSpec;
      });
      const preferContract = action.reason?.includes('companion contract') ?? false;
      for (const vendor of sorted) {
        if (spirit < 5) break;
        const purchase = pickBestPurchase(vendor.wares, spirit, blood, player.inventory.items, preferContract);
        if (purchase) {
          await dispatch(tradeBuy({ merchantId: vendor.id, itemId: purchase.id }));
          return;
        }
      }
      break;
    }

    case 'scan':
      await dispatch(scanSector());
      break;

    case 'perform_inquiry':
      dispatch(performSystemInquiry());
      handleVignetteProgression(dispatch, getState);
      break;

    case 'ask_inquiry': {
      const question = INQUIRY_THEMES[Math.floor(Math.random() * INQUIRY_THEMES.length)];
      dispatch(askInquiry(question));
      break;
    }

    case 'advance_vignette':
      handleVignetteProgression(dispatch, getState);
      break;

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
    const { currentArea: area, player } = state.game;
    console.log(`runAutoplayTick: Starting. Area=[${area?.title}] Player=[${player?.name}]`);

    if (!area || !player) {
      console.warn('runAutoplayTick: Aborting — Missing area or player.');
      return undefined;
    }

    // 1. Perceive — gather awareness of the environment (with last action for cooldown tracking)
    const hasActiveVignette = !!(rootState as any).narrative?.vignette;
    const awareness = computeAwareness(state.game, lastActionType, hasActiveVignette);
    console.log(`runAutoplayTick: Perceived. hasVignette=${awareness.hasActiveVignette}, health=${awareness.hpRatio.toFixed(2)}`);

    // 2. SDK Directive — Call real ForbocAI SDK (skip if cortex is unavailable)
    let cortexDirective: CortexDirective | null = null;
    if (sdkService.isCortexReady()) {
      try {
        const SDK_TIMEOUT_MS = 5000;
        const sdkPromise = (async () => {
          const agent = await sdkService.getAgent();
          const observation = toObservation(state.game);

          dispatch(setAgentPondering('player-autoplay'));
          const response = await agent.process(observation.content, state.game as any);
          dispatch(clearAgentPondering('player-autoplay'));

          return response;
        })();

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('SDK timeout')), SDK_TIMEOUT_MS)
        );

        const response = await Promise.race([sdkPromise, timeoutPromise]);

        if (response.dialogue) {
          const portraitUrl = getPortraitForAgent('player', "Agent Explorer");
          dispatch(addLog({ message: response.dialogue, type: 'dialogue', portraitUrl }));
        }

        if (response.action) {
          cortexDirective = toCortexDirective(response.action);
        }
      } catch (e) {
        console.warn('SDK Decision failed, falling back to pure Behavior Tree:', e);
        dispatch(clearAgentPondering('player-autoplay'));
      }
    } // end isCortexReady guard

    // 3. Decide — run the shared behavior tree with SDK directive as Node 0
    let action = runBehaviorTree(AUTOPLAY_CONFIG, state.game, awareness, cortexDirective);
    console.log(`runAutoplayTick: Decided. Action=[${action.type}] Reason=[${action.reason}]`);

    // 3.5 Stuck Recovery Override
    const isStuck = checkStuckState(area.id, lastActionType); // Check result of PREVIOUS action
    if (isStuck) {
      // Force a random move to a random exit to unstick
      const exits = (Object.keys(area.exits) as import('@/features/game/types').Direction[]).filter(k => area.exits[k as import('@/features/game/types').Direction]);
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
    console.log(`runAutoplayTick: Actuating [${action.type}]...`);
    await actuate(action, state, dispatch, getState);
    console.log(`runAutoplayTick: Actuated [${action.type}].`);

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
