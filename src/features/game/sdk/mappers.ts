import type { Observation, AgentAction } from '@forbocai/core';
import type { GameState } from '@/features/game/slice/types';
import type { CortexDirective, AgentActionType } from '@/features/game/mechanics/ai/types';

/**
 * Maps Qua'dar GameState to ForbocAI SDK Observation
 */
export function toObservation(gameState: GameState): Observation {
    const { player, currentArea } = gameState;

    const parts: string[] = [];
    if (player) {
        parts.push(`Player HP: ${player.stats.hp}/${player.stats.maxHp}`);
        parts.push(`Stress: ${player.stats.stress ?? 0}/${player.stats.maxStress}`);
        parts.push(`Primary Resource: ${player.inventory.spirit}, Secondary Resource: ${player.inventory.blood}`);
        parts.push(`Inventory: ${player.inventory.items?.length ?? 0} items`);
    }
    if (currentArea) {
        parts.push(`Location: ${currentArea.title}`);
        parts.push(`NPCs: ${currentArea.npcs?.length ?? 0}`);
        parts.push(`Vendors: ${currentArea.vendors?.length ?? 0}`);
        parts.push(`Ground loot: ${currentArea.groundLoot?.length ?? 0}`);
        parts.push(`Base camp: ${currentArea.isBaseCamp ? 'yes' : 'no'}`);
    }

    return {
        type: 'state',
        timestamp: Date.now(),
        agentId: 'player-autoplay',
        content: parts.join('. '),
        data: {
            hp: player?.stats.hp,
            maxHp: player?.stats.maxHp,
            stress: player?.stats.stress,
            npcCount: currentArea?.npcs?.length ?? 0,
            areaTitle: currentArea?.title,
            isBaseCamp: currentArea?.isBaseCamp,
        },
    };
}

/**
 * Maps ForbocAI SDK AgentAction back to Qua'dar CortexDirective
 */
export function toCortexDirective(action: AgentAction): CortexDirective {
    const allowed: AgentActionType[] = [
        'respawn', 'harvest', 'craft', 'heal', 'reduce_stress', 'equip_weapon', 'equip_armor',
        'flee', 'cast_capability', 'engage', 'loot', 'sell', 'buy', 'scan', 'perform_inquiry',
        'ask_inquiry', 'advance_vignette', 'move', 'idle'
    ];
    const type = allowed.includes(action.type as AgentActionType) ? (action.type as AgentActionType) : 'idle';
    return {
        type,
        payload: action.payload,
        priority: 1, // Default priority for SDK directives
        source: 'sdk'
    };
}
