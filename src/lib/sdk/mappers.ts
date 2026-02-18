import type { Observation, AgentAction } from '@forbocai/core';
import type { GameState } from '@/features/game/slice/types';
import type { CortexDirective } from '@/features/game/mechanics/ai/types';

/**
 * Maps Qua'dar GameState to ForbocAI SDK Observation
 */
export function toObservation(gameState: GameState): Observation {
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
 * Maps ForbocAI SDK AgentAction back to Qua'dar CortexDirective
 */
export function toCortexDirective(action: AgentAction): CortexDirective {
    return {
        type: action.type as any, // Cast to the game's directive types
        payload: action.payload,
        priority: 1, // Default priority for SDK directives
        source: 'sdk'
    };
}
