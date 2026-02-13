import type { AutoFocusMode, AutoSpeedMode, AutoplayURLConfig } from './types';
import type { AgentActionType } from '@/features/game/mechanics/ai/types';

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

/** Min delay (ms) per speed; decay factor for next delay. Used by reducer-driven autoplay scheduling. */
const AUTOPLAY_DELAY = {
    fast: { min: 200, decay: 0.9 },
    slow: { min: 500, decay: 0.98 },
    normal: { min: 200, decay: 0.95 },
} as const;

/** Compute next delay (ms) from current delay and speed. Pure. */
export function getNextAutoplayDelayMs(currentDelayMs: number, speed: AutoSpeedMode): number {
    const { min, decay } = AUTOPLAY_DELAY[speed] ?? AUTOPLAY_DELAY.normal;
    return Math.max(min, Math.floor(currentDelayMs * decay));
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
