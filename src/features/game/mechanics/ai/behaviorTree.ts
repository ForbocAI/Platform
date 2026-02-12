/**
 * Behavior Tree — shared AI decision system.
 *
 * Aligned with Forboc/client/src/features/mechanics/orchestrators/systems/bots/botSystem.ts.
 * Implements: SDK Directive > Safety > Base Camp > Economy > Combat > Recon > Default
 *
 * Used by both autoplay (player) and NPC/servitor AI.
 * SDK integration: When CortexDirective is present, it is executed as Priority Node 0.
 */

import type { AgentConfig, AgentAction, AwarenessResult, CortexDirective } from './types';
import type { GameState } from '../../slice/types';

// ── Spell selection helper ──

function pickBestSpell(
    state: GameState,
    awareness: AwarenessResult,
): string | null {
    const player = state.player;
    if (!player) return null;

    const spellIds = player.spells || [];
    if (spellIds.length === 0) return null;

    // Simple heuristic: prefer higher-damage spells when enemies are tough
    // This will be replaced by SDK reasoning later
    let best: { id: string; score: number } | null = null;

    for (const id of spellIds) {
        let score = 5; // baseline
        // Prefer spells when multiple enemies (AoE value)
        if (awareness.enemyCount > 1) score += 3;
        // Prefer spells when HP is high (aggressive stance)
        if (awareness.hpRatio > 0.7) score += 2;
        // Add some variety
        score += Math.random() * 3;

        if (!best || score > best.score) best = { id, score };
    }

    return best?.id ?? null;
}

// ── Behavior Tree ──

/**
 * Execute the behavior tree for a given agent.
 * Returns the single best action to take this tick.
 *
 * @param config  - Agent configuration (capabilities, traits)
 * @param state   - Current game state
 * @param awareness - Pre-computed awareness result
 * @param cortexDirective - Optional SDK directive (Priority Node 0)
 */
export function runBehaviorTree(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
    cortexDirective?: CortexDirective | null,
): AgentAction {
    const has = (cap: string) => config.capabilities.includes(cap as any);
    const player = state.player;
    const room = state.currentRoom;

    if (!player || !room) {
        return { type: 'idle', reason: 'No player or room state' };
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 0: SDK Cortex Directive (Priority Override)
    // When the ForbocAI SDK is integrated, it injects a CortexDirective
    // that bypasses the entire behavior tree below.
    // See system-todo.md §1.2.
    // ══════════════════════════════════════════════════════════════════
    if (cortexDirective) {
        return {
            type: cortexDirective.type,
            payload: cortexDirective.payload,
            reason: `[SDK] Cortex directive: ${cortexDirective.type}`,
        };
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 1: Survival (Safety > Everything)
    // ══════════════════════════════════════════════════════════════════
    if (player.hp <= 0) {
        return { type: 'respawn', reason: 'Dead — must respawn' };
    }

    // Emergency healing — use any consumable when HP is under ~50% (scaled by caution)
    if (has('heal') && awareness.hpRatio < (0.4 + config.traits.caution * 0.2)) {
        if (awareness.hasHealingItem) {
            return { type: 'heal', reason: `HP low (${Math.round(awareness.hpRatio * 100)}%) — healing` };
        }
    }

    // Stress relief — use calming items when stress is above threshold
    if (has('heal') && awareness.stressRatio > (0.6 - config.traits.caution * 0.2)) {
        if (awareness.hasStressItem) {
            return { type: 'reduce_stress', reason: `Stress high (${Math.round(awareness.stressRatio * 100)}%)` };
        }
    }

    // Flee from danger when HP is dangerously low
    if (has('flee') && awareness.hasEnemies && awareness.hpRatio < 0.25 && config.traits.caution >= 0.5) {
        if (awareness.availableExits.length > 0) {
            const exit = awareness.availableExits[Math.floor(Math.random() * awareness.availableExits.length)];
            return { type: 'move', payload: { direction: exit }, reason: 'Fleeing — HP dangerously low' };
        }
    }

    // Evacuate hazardous room when HP is below 50%
    if (awareness.isDangerousRoom && awareness.hpRatio < 0.5 && !awareness.hasEnemies) {
        if (awareness.availableExits.length > 0) {
            const exit = awareness.availableExits[Math.floor(Math.random() * awareness.availableExits.length)];
            return { type: 'move', payload: { direction: exit }, reason: `Evacuating hazardous room (${Math.round(awareness.hpRatio * 100)}% HP)` };
        }
    }

    // Return to base camp when no healing items and HP is critical
    if (has('flee') && awareness.hpRatio < 0.35 && !awareness.hasHealingItem && !awareness.isBaseCamp) {
        if (awareness.availableExits.length > 0) {
            const exit = awareness.availableExits[Math.floor(Math.random() * awareness.availableExits.length)];
            return { type: 'move', payload: { direction: exit }, reason: `HP critical (${Math.round(awareness.hpRatio * 100)}%) — no healing items, moving toward safety` };
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 2: Base Camp (Harvest & Craft)
    // ══════════════════════════════════════════════════════════════════
    if (has('craft') && awareness.isBaseCamp) {
        if (awareness.hasReadyCrops) {
            const readyIdx = (room.features || []).findIndex(f => f.type === 'farming_plot' && f.ready);
            if (readyIdx >= 0) {
                return { type: 'harvest', payload: { featureIndex: readyIdx }, reason: 'Crop ready for harvest' };
            }
        }

        if (awareness.hasCraftableRecipes) {
            const recipe = (player.recipes || []).find(r =>
                r.ingredients.every(
                    ing => (player.inventory || []).filter(i => i.name === ing.name).length >= ing.quantity
                )
            );
            if (recipe) {
                return { type: 'craft', payload: { recipeId: recipe.id }, reason: `Can craft ${recipe.id}` };
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 3: Equipment (Gear Up)
    // ══════════════════════════════════════════════════════════════════
    if (has('equip') && awareness.hasUnequippedGear) {
        const weapon = (player.inventory || []).find(i => i.type === 'weapon');
        if (weapon && !player.equipment?.mainHand) {
            return { type: 'equip_weapon', payload: { itemId: weapon.id }, reason: `Equip ${weapon.name}` };
        }
        const armor = (player.inventory || []).find(i => i.type === 'armor');
        if (armor && !player.equipment?.armor) {
            return { type: 'equip_armor', payload: { itemId: armor.id }, reason: `Equip ${armor.name}` };
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 4: Combat (Engage Threats — COMMIT TO FIGHT)
    // Stay in combat until enemy is dead or HP drops below flee threshold.
    // This prevents the "explore leak" where the bot walks away mid-fight.
    // ══════════════════════════════════════════════════════════════════
    if (has('combat') && awareness.hasEnemies && awareness.hpRatio > 0.25) {
        // Try spells first (more interesting combat)
        if (has('spell') && config.traits.aggression > 0.3) {
            const spellId = pickBestSpell(state, awareness);
            if (spellId && Math.random() < 0.6) {
                return { type: 'cast_spell', payload: { spellId }, reason: 'Casting spell in combat' };
            }
        }

        // Melee engagement
        return { type: 'engage', reason: `Engaging ${awareness.primaryEnemy?.name || 'hostile'} (HP: ${awareness.primaryEnemy?.hp ?? '?'})` };
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 5: Loot (Pick Up Items)
    // ══════════════════════════════════════════════════════════════════
    if (has('loot') && awareness.hasGroundLoot) {
        return { type: 'loot', reason: 'Ground loot available' };
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 6: Economy (Trade)
    // ══════════════════════════════════════════════════════════════════
    if (has('trade') && awareness.hasMerchants && config.traits.resourcefulness > 0.3) {
        if (awareness.shouldSellExcess) {
            return { type: 'sell', reason: 'Inventory bulging — selling excess' };
        }
        if (awareness.canAffordTrade && Math.random() < config.traits.resourcefulness) {
            return { type: 'buy', reason: 'Merchant available — browsing wares' };
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 7: Recon (Scan & Oracle)
    // ══════════════════════════════════════════════════════════════════
    if (has('awareness') && !awareness.recentlyScanned) {
        return { type: 'scan', reason: 'Room not yet scanned' };
    }

    if (has('oracle') && Math.random() < config.traits.mysticism * 0.3) {
        if (Math.random() < 0.5) {
            return { type: 'commune', reason: 'Communing with the void' };
        } else {
            return { type: 'ask_oracle', reason: 'Seeking oracle guidance' };
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 8: Exploration (Move)
    // ══════════════════════════════════════════════════════════════════
    if (has('explore') && awareness.availableExits.length > 0) {
        // Prefer unvisited rooms
        const exits = awareness.unvisitedExits.length > 0
            ? awareness.unvisitedExits
            : awareness.availableExits;
        const direction = exits[Math.floor(Math.random() * exits.length)];
        return { type: 'move', payload: { direction }, reason: `Exploring ${direction}` };
    }

    // ══════════════════════════════════════════════════════════════════
    // Node 9: Default (Idle/Patrol)
    // ══════════════════════════════════════════════════════════════════
    return { type: 'idle', reason: 'Nothing to do — idling' };
}

// ── Preset Configs ──

/** Player autoplay: full capabilities, balanced traits */
export const AUTOPLAY_CONFIG: AgentConfig = {
    id: 'player-autoplay',
    type: 'player',
    capabilities: [
        'awareness', 'combat', 'flee', 'explore', 'trade',
        'craft', 'heal', 'equip', 'oracle', 'loot', 'spell', 'quest',
    ],
    traits: {
        aggression: 0.65,
        curiosity: 0.7,
        caution: 0.5,
        resourcefulness: 0.6,
        mysticism: 0.4,
    },
};

/** NPC Fellow Ranger: combat-oriented ally */
export const NPC_RANGER_CONFIG: AgentConfig = {
    id: 'npc-ranger',
    type: 'npc',
    capabilities: ['awareness', 'combat', 'flee', 'explore', 'loot', 'heal'],
    traits: {
        aggression: 0.7,
        curiosity: 0.5,
        caution: 0.4,
        resourcefulness: 0.3,
        mysticism: 0.1,
    },
};

/** Servitor: follows orders, supports in combat */
export const SERVITOR_CONFIG: AgentConfig = {
    id: 'servitor',
    type: 'servitor',
    capabilities: ['awareness', 'combat', 'serve', 'heal'],
    traits: {
        aggression: 0.5,
        curiosity: 0.2,
        caution: 0.6,
        resourcefulness: 0.1,
        mysticism: 0.0,
    },
};
