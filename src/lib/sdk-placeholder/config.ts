import type { AutoFocusMode, AutoSpeedMode, AutoplayURLConfig, AgentActionType } from './types';
import type { CortexDirective } from '@/features/game/mechanics/ai/types';

/**
 * Parse autoplay URL parameters
 */
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

/**
 * Get tick interval in ms based on speed mode
 */
export function getTickInterval(speed: AutoSpeedMode): number {
    switch (speed) {
        case 'fast': return 1000;
        case 'slow': return 5000;
        default: return 2800;
    }
}

/**
 * Focus → Action Mapping
 */
export const FOCUS_ACTIONS: Record<AutoFocusMode, AgentActionType[]> = {
    combat: ['engage', 'cast_spell', 'heal', 'respawn'],
    explore: ['move', 'scan', 'loot'],
    trade: ['buy', 'sell', 'move'],
    heal: ['heal', 'reduce_stress', 'flee'],
    oracle: ['commune', 'ask_oracle', 'scan'],
    loot: ['loot', 'move', 'scan'],
    baseCamp: ['harvest', 'craft', 'heal'],
    full: [], // Empty = no override, full behavior tree
};
