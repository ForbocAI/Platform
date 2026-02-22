/**
 * Behavior Tree — shared AI decision system.
 *
 * Aligned with Forboc/client/src/features/mechanics/orchestrators/systems/bots/botSystem.ts.
 * Implements: SDK Directive > Safety > Base Camp > Economy > Combat > Recon > Default
 *
 * Used by both autoplay (player) and NPC/companion AI.
 * SDK integration: When CortexDirective is present, it is executed as Priority Node 0.
 */

import type { AgentConfig, AgentAction, AwarenessResult, CortexDirective } from '../types';
import type { GameState } from '../../../../store/types';
import { nodeRival } from './nodesRival';

import { nodeSDKDirective, nodeVignette, nodeSurvival, nodeBaseCamp, nodeEquipment } from './nodesSurvival';
import {
    nodeCombat,
    nodeCompanionPrep,
    nodeLoot,
    nodeEconomy,
    nodeRecon,
    nodeExploration
} from './nodesAction';
import { nodeQuest } from './nodesQuest';

/**
 * Main entry point for the behavior tree
 */
export function runBehaviorTree(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
    cortexDirective: CortexDirective | null
): AgentAction {
    // Execute nodes in priority order
    const action =
        nodeSDKDirective(cortexDirective) ||
        nodeVignette(awareness) ||
        nodeRival(config, state, awareness) || // Priority 1.5: Rival/Strategic Overrides
        nodeSurvival(config, state, awareness) ||
        nodeBaseCamp(config, state, awareness) ||
        nodeEquipment(config, state, awareness) ||
        nodeCompanionPrep(config, awareness) ||
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
        'craft', 'heal', 'equip', 'inquiry', 'loot', 'capability', 'quest',
    ],
    traits: {
        aggression: 0.65,
        curiosity: 0.7,
        caution: 0.5,
        resourcefulness: 0.6,
        inquiryFrequency: 0.4,
    },
};

/** NPC Fellow Agent: combat-oriented ally */
export const NPC_RANGER_CONFIG: AgentConfig = {
    id: 'npc-ranger',
    type: 'npc',
    capabilities: ['awareness', 'combat', 'flee', 'explore', 'loot', 'heal'],
    traits: {
        aggression: 0.7,
        curiosity: 0.5,
        caution: 0.4,
        resourcefulness: 0.3,
        inquiryFrequency: 0.1,
    },
};

/** Companion: follows orders, supports in combat */
export const COMPANION_CONFIG: AgentConfig = {
    id: 'companion',
    type: 'companion',
    capabilities: ['awareness', 'combat', 'serve', 'heal'],
    traits: {
        aggression: 0.5,
        curiosity: 0.2,
        caution: 0.6,
        resourcefulness: 0.1,
        inquiryFrequency: 0.0,
    },
};
