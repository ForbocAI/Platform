import type { AgentConfig, AgentAction, AwarenessResult, CortexDirective } from '../types';
import type { GameState } from '../../../slice/types';

/**
 * Node 0: SDK Cortex Directive (Priority Override)
 */
export function nodeSDKDirective(cortexDirective?: CortexDirective | null): AgentAction | null {
    if (cortexDirective) {
        return {
            type: cortexDirective.type,
            payload: cortexDirective.payload,
            reason: `[SDK] Cortex directive: ${cortexDirective.type}`,
        };
    }
    return null;
}

/**
 * Node 0.5: Narrative Vignette (Priority Block)
 */
export function nodeVignette(awareness: AwarenessResult): AgentAction | null {
    if (awareness.hasActiveVignette) {
        return {
            type: 'advance_vignette',
            reason: 'Narrative vignette active — advancing exposition',
        };
    }
    return null;
}

/**
 * Node 1: Survival (Safety > Everything)
 */
export function nodeSurvival(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);
    const player = state.player;
    const area = state.currentArea;

    if (!player || !area) return null;

    // When neutralized, do not return respawn here — concession listener (autoplay) or UI (manual) dispatches
    // respawnPlayer. Returning respawn from the tree would double-dispatch and block the loop.
    if (player.stats.hp <= 0) return null;

    // ── Post-Respawn Preparation ──
    if (awareness.justRespawned) {
        if (has('equip') && awareness.hasUnequippedGear) {
            const weapon = (player.inventory.items || []).find(i => i.type === 'weapon');
            if (weapon && !player.inventory.equipment?.mainHand) {
                return { type: 'equip_weapon', payload: { itemId: weapon.id }, reason: 'Post-respawn: Equipping gear' };
            }
            const armor = (player.inventory.items || []).find(i => i.type === 'armor');
            if (armor && !player.inventory.equipment?.armor) {
                return { type: 'equip_armor', payload: { itemId: armor.id }, reason: 'Post-respawn: Equipping armor' };
            }
        }

        if (awareness.isDangerousArea && awareness.availableExits.length > 0) {
            const exit = awareness.availableExits[Math.floor(Math.random() * awareness.availableExits.length)];
            return { type: 'move', payload: { direction: exit }, reason: 'Post-respawn: Leaving dangerous area' };
        }

        if (has('awareness') && !awareness.recentlyScanned) {
            return { type: 'scan', reason: 'Post-respawn: Assessing situation' };
        }

        if (has('heal') && awareness.hasHealingItem && player.stats.hp < player.stats.maxHp * 0.9) {
            return { type: 'heal', reason: 'Post-respawn: Ensuring full health' };
        }
    }

    // Emergency healing
    if (has('heal') && awareness.hpRatio < (0.4 + config.traits.caution * 0.2)) {
        if (awareness.hasHealingItem) {
            return { type: 'heal', reason: `HP low (${Math.round(awareness.hpRatio * 100)}%) — healing` };
        }
    }

    // Stress relief
    if (has('heal') && awareness.stressRatio > (0.6 - config.traits.caution * 0.2)) {
        if (awareness.hasStressItem) {
            return { type: 'reduce_stress', reason: `Stress high (${Math.round(awareness.stressRatio * 100)}%)` };
        }
    }

    // Flee from danger
    if (has('flee') && awareness.hasNPCs && awareness.hpRatio < 0.25 && config.traits.caution >= 0.5) {
        if (awareness.availableExits.length > 0) {
            const exit = awareness.availableExits[Math.floor(Math.random() * awareness.availableExits.length)];
            return { type: 'move', payload: { direction: exit }, reason: 'Fleeing — HP dangerously low' };
        }
    }

    // Evacuate hazardous area
    if (awareness.isDangerousArea && awareness.hpRatio < 0.5 && !awareness.hasNPCs) {
        if (awareness.availableExits.length > 0) {
            const exit = awareness.availableExits[Math.floor(Math.random() * awareness.availableExits.length)];
            return { type: 'move', payload: { direction: exit }, reason: `Evacuating hazardous area (${Math.round(awareness.hpRatio * 100)}% HP)` };
        }
    }

    // Return to base camp when no healing items and HP is critical
    if (has('flee') && awareness.hpRatio < 0.35 && !awareness.hasHealingItem && !awareness.isBaseCamp) {
        if (awareness.availableExits.length > 0) {
            const exit = awareness.availableExits[Math.floor(Math.random() * awareness.availableExits.length)];
            return { type: 'move', payload: { direction: exit }, reason: `HP critical (${Math.round(awareness.hpRatio * 100)}%) — no healing items, moving toward safety` };
        }
    }

    return null;
}

/**
 * Node 2: Base Camp (Harvest & Craft)
 */
export function nodeBaseCamp(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);
    const player = state.player;
    const area = state.currentArea;

    if (!player || !area) return null;

    if (has('craft') && awareness.isBaseCamp) {
        if (awareness.hasReadyCrops) {
            const readyIdx = (area.features || []).findIndex(f => f.type === 'resource_plot' && f.ready);
            if (readyIdx >= 0) {
                return { type: 'harvest', payload: { featureIndex: readyIdx }, reason: 'Crop ready for harvest' };
            }
        }

        if (awareness.hasCraftableRecipes) {
            const recipe = (player.blueprints || []).find(r =>
                r.ingredients.every(
                    ing => (player.inventory.items || []).filter(i => i.name === ing.name).length >= ing.quantity
                )
            );
            if (recipe) {
                return { type: 'craft', payload: { recipeId: recipe.id }, reason: `Can craft ${recipe.id}` };
            }
        }
    }

    return null;
}

/**
 * Node 3: Equipment (Gear Up)
 */
export function nodeEquipment(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);
    const player = state.player;

    if (!player) return null;

    if (has('equip') && awareness.hasUnequippedGear) {
        const weapon = (player.inventory.items || []).find(i => i.type === 'weapon');
        if (weapon && !player.inventory.equipment?.mainHand) {
            return { type: 'equip_weapon', payload: { itemId: weapon.id }, reason: `Equip ${weapon.name}` };
        }
        const armor = (player.inventory.items || []).find(i => i.type === 'armor');
        if (armor && !player.inventory.equipment?.armor) {
            return { type: 'equip_armor', payload: { itemId: armor.id }, reason: `Equip ${armor.name}` };
        }
    }

    return null;
}
