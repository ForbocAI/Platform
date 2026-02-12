import type { Observation, AutoFocusMode } from './types';
import type { CortexDirective } from '@/features/game/mechanics/ai/types';
import type { GameState } from '@/features/game/slice/types';
import type { Direction } from '@/features/game/types';
import { FOCUS_ACTIONS } from './config';
import { getClassModifiers } from './classModifiers';

/**
 * Mock generateAction: Converts a Directive into an AgentAction.
 * When the real SDK is integrated, this becomes:
 *   SDK.Cortex.generateAction(directive) → AgentAction
 *
 * In focus mode, this returns a CortexDirective that overrides the behavior tree.
 * In 'full' mode, returns null (behavior tree decides).
 */
export function mockGenerateDirective(
    _observation: Observation,
    gameState: GameState,
    focus: AutoFocusMode,
): CortexDirective | null {
    // Full mode: no SDK override, let behavior tree decide
    if (focus === 'full') return null;

    const allowedActions = FOCUS_ACTIONS[focus];
    if (!allowedActions || allowedActions.length === 0) return null;

    const { player, currentRoom } = gameState;
    if (!player || !currentRoom) return null;

    // Get class-specific modifiers
    const classMods = getClassModifiers(player.characterClass);

    // Smart selection within the focus area
    for (const actionType of allowedActions) {
        switch (actionType) {
            case 'engage':
                // Class-specific combat behavior
                if (currentRoom.enemies && currentRoom.enemies.length > 0 && player.hp > 0) {
                    // Doomguard: More defensive, engage only if HP is reasonable
                    // Ashwalker: More aggressive, engage even at lower HP
                    const hpRatio = player.hp / player.maxHp;
                    const shouldEngage = classMods.aggression > 0.7 
                        ? hpRatio > 0.25  // Aggressive classes engage at lower HP
                        : hpRatio > 0.4;  // Defensive classes need more HP
                    
                    if (shouldEngage) {
                        return {
                            type: 'engage',
                            priority: 10,
                            source: 'sdk',
                            payload: { reason: `[SDK:${focus}] Engaging hostiles (${player.characterClass} style)` },
                        };
                    }
                }
                break;

            case 'cast_spell':
                // Class-specific spell selection
                if (currentRoom.enemies && currentRoom.enemies.length > 0 && player.spells?.length > 0 && player.hp > 0) {
                    // Prefer offensive spells for aggressive classes, defensive for tank classes
                    // For now, random selection but could be enhanced with spell type detection
                    const spellId = player.spells[Math.floor(Math.random() * player.spells.length)];
                    return {
                        type: 'cast_spell',
                        payload: { spellId },
                        priority: classMods.aggression > 0.7 ? 11 : 10, // Higher priority for aggressive classes
                        source: 'sdk',
                    };
                }
                break;

            case 'heal':
                // Use class-specific healing threshold
                if (player.hp < player.maxHp * classMods.healingThreshold) {
                    return {
                        type: 'heal',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Healing priority (${player.characterClass} threshold)` },
                    };
                }
                break;

            case 'reduce_stress':
                if ((player.stress ?? 0) > player.maxStress * 0.3) {
                    return {
                        type: 'reduce_stress',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Stress relief` },
                    };
                }
                break;

            case 'flee': {
                const exits = (['North', 'South', 'East', 'West'] as Direction[]).filter(d => currentRoom.exits[d]);
                if (exits.length > 0) {
                    return {
                        type: 'move',
                        payload: { direction: exits[Math.floor(Math.random() * exits.length)] },
                        priority: 10,
                        source: 'sdk',
                    };
                }
                break;
            }

            case 'move': {
                const dirs = (['North', 'South', 'East', 'West'] as Direction[]).filter(d => currentRoom.exits[d]);
                if (dirs.length > 0) {
                    return {
                        type: 'move',
                        payload: { direction: dirs[Math.floor(Math.random() * dirs.length)] },
                        priority: 10,
                        source: 'sdk',
                    };
                }
                break;
            }

            case 'scan':
                return {
                    type: 'scan',
                    priority: 5,
                    source: 'sdk',
                    payload: { reason: `[SDK:${focus}] Scan sector` },
                };

            case 'buy':
                // Class-specific buying priorities
                if (currentRoom.merchants && currentRoom.merchants.length > 0 && (player.spirit ?? 0) >= 5) {
                    // Doomguard prefers armor/shields, Ashwalker prefers weapons/speed items
                    // This is handled in the actuation layer, but we can add class context here
                    return {
                        type: 'buy',
                        priority: 10,
                        source: 'sdk',
                        payload: { 
                            reason: `[SDK:${focus}] Buying from merchant`,
                            classPreference: classMods.prefersShields ? 'defensive' : classMods.prefersSpeed ? 'offensive' : 'balanced',
                        },
                    };
                }
                break;

            case 'sell':
                if (currentRoom.merchants && currentRoom.merchants.length > 0 && player.inventory.length > 2) {
                    return {
                        type: 'sell',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Selling excess` },
                    };
                }
                break;

            case 'commune':
                return {
                    type: 'commune',
                    priority: 10,
                    source: 'sdk',
                    payload: { reason: `[SDK:${focus}] Commune with void` },
                };

            case 'ask_oracle':
                return {
                    type: 'ask_oracle',
                    priority: 10,
                    source: 'sdk',
                    payload: { reason: `[SDK:${focus}] Oracle query` },
                };

            case 'loot':
                if (currentRoom.groundLoot && currentRoom.groundLoot.length > 0) {
                    return {
                        type: 'loot',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Picking up loot` },
                    };
                }
                break;

            case 'harvest':
                if (currentRoom.isBaseCamp && currentRoom.features?.some(f => f.type === 'farming_plot' && f.ready)) {
                    const idx = currentRoom.features.findIndex(f => f.type === 'farming_plot' && f.ready);
                    return {
                        type: 'harvest',
                        payload: { featureIndex: idx },
                        priority: 10,
                        source: 'sdk',
                    };
                }
                break;

            case 'craft':
                if (currentRoom.isBaseCamp) {
                    return {
                        type: 'craft',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Crafting` },
                    };
                }
                break;

            case 'respawn':
                if (player.hp <= 0) {
                    return {
                        type: 'respawn',
                        priority: 100,
                        source: 'sdk',
                    };
                }
                break;
        }
    }

    // If no action matched in focus mode, return null to allow behavior tree fallback
    return null;
}
