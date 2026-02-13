/**
 * Behavior Tree — shared AI decision system.
 *
 * Aligned with Forboc/client/src/features/mechanics/orchestrators/systems/bots/botSystem.ts.
 * Implements: SDK Directive > Safety > Base Camp > Economy > Combat > Recon > Default
 *
 * Used by both autoplay (player) and NPC/servitor AI.
 * SDK integration: When CortexDirective is present, it is executed as Priority Node 0.
 */

import type { AgentConfig, AgentAction, AwarenessResult, CortexDirective } from '../types';
import type { GameState } from '../../../slice/types';
import {
    nodeSDKDirective,
    nodeSurvival,
    nodeBaseCamp,
    nodeEquipment,
} from './nodesSurvival';
import {
    nodeCombat,
    nodeLoot,
    nodeEconomy,
    nodeRecon,
    nodeExploration,
    nodeServitorPrep,
} from './nodesAction';
import { nodeQuest } from './nodesQuest';

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
    const player = state.player;
    const room = state.currentRoom;

    if (!player || !room) {
        return { type: 'idle', reason: 'No player or room state' };
    }

    // Execute nodes in priority order
    const action =
        nodeSDKDirective(cortexDirective) ||
        nodeSurvival(config, state, awareness) ||
        nodeBaseCamp(config, state, awareness) ||
        nodeEquipment(config, state, awareness) ||
        nodeServitorPrep(config, awareness) ||
        nodeCombat(config, state, awareness) ||
        nodeLoot(config, awareness) ||
        nodeEconomy(config, awareness) ||
        nodeQuest(config, state, awareness) ||
        nodeRecon(config, awareness) ||
        nodeExploration(config, state, awareness);

    // Default: Idle/Patrol
    return action || { type: 'idle', reason: 'Nothing to do — idling' };
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
