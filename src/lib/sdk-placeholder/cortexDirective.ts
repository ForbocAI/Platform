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

import type { CortexDirective } from '@/features/game/mechanics/ai/types';
import type { GameState } from '@/features/game/slice/types';
import { getAutoplayConfig } from './config';
import { mockProcessObservation } from './observation';
import { mockGenerateDirective } from './directiveGeneration';

// Re-export types and utilities for convenience
export type { Observation, Directive, SDKAgentAction, AutoFocusMode, AutoSpeedMode, AutoplayURLConfig } from './types';
export { getAutoplayConfig, getTickInterval } from './config';
export { mockProcessObservation } from './observation';
export { getClassModifiers } from './classModifiers';

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
