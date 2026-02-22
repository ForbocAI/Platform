import type { GameState } from '../../../../store/types';
import type { AwarenessResult } from '../types';

/**
 * Capability selection helper
 */
export function pickBestCapability(
    state: GameState,
    awareness: AwarenessResult,
): string | null {
    const player = state.player;
    if (!player) return null;

    const capabilityIds = player.capabilities.learned || [];
    if (capabilityIds.length === 0) return null;

    // Simple heuristic: prefer higher-magnitude capabilities when NPCs are tough
    // This will be replaced by SDK reasoning later
    let best: { id: string; score: number } | null = null;

    for (const id of capabilityIds) {
        let score = 5; // baseline
        // Prefer capabilities when multiple NPCs (AoE value)
        if (awareness.npcCount > 1) score += 3;
        // Prefer capabilities when HP is high (aggressive stance)
        if (awareness.hpRatio > 0.7) score += 2;
        // Add some variety
        score += Math.random() * 3;

        if (!best || score > best.score) best = { id, score };
    }

    return best?.id ?? null;
}
