/**
 * Mock Cortex Directive Service
 *
 * Simulates the SDK's Cortex.processObservation() → Directive → generateAction() pipeline
 * locally until the real ForbocAI SDK is integrated (see system-todo.md §1.2).
 *
 * Architecture alignment:
 *   SDK:      src/cortex.ts → processObservation() → generateAction()
 *   API:      /agents/{id}/process, /cortex/{id}/complete
 *   Platform: This file (mock) → CortexDirective consumed by behaviorTree.ts Node 0
 *
 * URL Parameters for test directives:
 *   ?autoFocus=combat     — Force combat-only decisions
 *   ?autoFocus=explore    — Force exploration-only
 *   ?autoFocus=trade      — Force trading/economy
 *   ?autoFocus=heal       — Force healing/survival
 *   ?autoFocus=oracle     — Force oracle/commune
 *   ?autoFocus=loot       — Force looting
 *   ?autoFocus=baseCamp   — Force base camp activities
 *   ?autoFocus=full       — Full behavior tree (default, no override)
 *   ?autoSpeed=fast       — 1s tick interval
 *   ?autoSpeed=slow       — 5s tick interval
 *   ?autoStart=1          — Auto-enable autoplay on load
 */

import type { CortexDirective, AgentActionType } from '@/features/game/mechanics/ai/types';
import type { GameState } from '@/features/game/slice/types';
import type { Direction } from '@/features/game/types';

// ── SDK Protocol Types (mirrors sdk/src/core/index.ts) ──

export interface Observation {
    type: 'event' | 'state' | 'request';
    timestamp: number;
    agentId?: string;
    content: string;
    data?: Record<string, unknown>;
    context?: Record<string, unknown>;
}

export interface Directive {
    type: 'system-prompt' | 'action-constraints' | 'behavior-rules' | 'thought';
    content: string;
    constraints?: Record<string, unknown>;
    priority?: 'high' | 'normal' | 'low';
    expiresAt?: number;
}

export interface SDKAgentAction {
    type: string;
    target?: string;
    payload?: Record<string, unknown>;
    reason?: string;
    confidence?: number;
}

// ── Focus Mode ──

export type AutoFocusMode = 'combat' | 'explore' | 'trade' | 'heal' | 'oracle' | 'loot' | 'baseCamp' | 'full';
export type AutoSpeedMode = 'fast' | 'normal' | 'slow';

export interface AutoplayURLConfig {
    focus: AutoFocusMode;
    speed: AutoSpeedMode;
    autoStart: boolean;
}

/** Parse autoplay URL parameters */
export function getAutoplayConfig(): AutoplayURLConfig {
    if (typeof window === 'undefined') {
        return { focus: 'full', speed: 'normal', autoStart: false };
    }
    const params = new URLSearchParams(window.location.search);
    return {
        focus: (params.get('autoFocus') as AutoFocusMode) || 'full',
        speed: (params.get('autoSpeed') as AutoSpeedMode) || 'normal',
        autoStart: params.get('autoStart') === '1',
    };
}

/** Get tick interval in ms based on speed mode */
export function getTickInterval(speed: AutoSpeedMode): number {
    switch (speed) {
        case 'fast': return 1000;
        case 'slow': return 5000;
        default: return 2800;
    }
}

// ── Focus → Action Mapping ──

const FOCUS_ACTIONS: Record<AutoFocusMode, AgentActionType[]> = {
    combat: ['engage', 'cast_spell', 'heal', 'respawn'],
    explore: ['move', 'scan', 'loot'],
    trade: ['buy', 'sell', 'move'],
    heal: ['heal', 'reduce_stress', 'flee'],
    oracle: ['commune', 'ask_oracle', 'scan'],
    loot: ['loot', 'move', 'scan'],
    baseCamp: ['harvest', 'craft', 'heal'],
    full: [], // Empty = no override, full behavior tree
};

// ── Mock Cortex Pipeline ──

/**
 * Mock processObservation: Converts game state into an SDK Observation.
 * When the real SDK is integrated, this becomes:
 *   SDK.Cortex.processObservation(observation) → Directive
 */
export function mockProcessObservation(gameState: GameState): Observation {
    const { player, currentRoom } = gameState;

    const parts: string[] = [];
    if (player) {
        parts.push(`Player HP: ${player.hp}/${player.maxHp}`);
        parts.push(`Stress: ${player.stress ?? 0}/${player.maxStress}`);
        parts.push(`Spirit: ${player.spirit ?? 0}, Blood: ${player.blood ?? 0}`);
        parts.push(`Inventory: ${player.inventory?.length ?? 0} items`);
    }
    if (currentRoom) {
        parts.push(`Location: ${currentRoom.title}`);
        parts.push(`Enemies: ${currentRoom.enemies?.length ?? 0}`);
        parts.push(`Merchants: ${currentRoom.merchants?.length ?? 0}`);
        parts.push(`Ground loot: ${currentRoom.groundLoot?.length ?? 0}`);
        parts.push(`Base camp: ${currentRoom.isBaseCamp ? 'yes' : 'no'}`);
    }

    return {
        type: 'state',
        timestamp: Date.now(),
        agentId: 'player-autoplay',
        content: parts.join('. '),
        data: {
            hp: player?.hp,
            maxHp: player?.maxHp,
            stress: player?.stress,
            enemyCount: currentRoom?.enemies?.length ?? 0,
            roomTitle: currentRoom?.title,
            isBaseCamp: currentRoom?.isBaseCamp,
        },
    };
}

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

    // Smart selection within the focus area
    for (const actionType of allowedActions) {
        switch (actionType) {
            case 'engage':
                if (currentRoom.enemies && currentRoom.enemies.length > 0 && player.hp > 0) {
                    return {
                        type: 'engage',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Engaging hostiles` },
                    };
                }
                break;

            case 'cast_spell':
                if (currentRoom.enemies && currentRoom.enemies.length > 0 && player.spells?.length > 0 && player.hp > 0) {
                    return {
                        type: 'cast_spell',
                        payload: { spellId: player.spells[Math.floor(Math.random() * player.spells.length)] },
                        priority: 10,
                        source: 'sdk',
                    };
                }
                break;

            case 'heal':
                if (player.hp < player.maxHp * 0.8) {
                    return {
                        type: 'heal',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Healing priority` },
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
                if (currentRoom.merchants && currentRoom.merchants.length > 0 && (player.spirit ?? 0) >= 5) {
                    return {
                        type: 'buy',
                        priority: 10,
                        source: 'sdk',
                        payload: { reason: `[SDK:${focus}] Buying from merchant` },
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

/**
 * The full mock SDK pipeline: Observe → Reason → Decide
 *
 * This is the single entry point called by the autoplay thunk.
 * When the real SDK is integrated, replace this with:
 *   const observation = cortexMapper.toObservation(gameState);
 *   const directive = await SDK.Cortex.processObservation(observation);
 *   const action = await SDK.Cortex.generateAction(directive);
 *   return cortexMapper.toCortexDirective(action);
 */
export function getSDKDirective(gameState: GameState): CortexDirective | null {
    const config = getAutoplayConfig();
    const observation = mockProcessObservation(gameState);
    return mockGenerateDirective(observation, gameState, config.focus);
}
