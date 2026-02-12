import type { GameState } from '../../../slice/types';
import type { AwarenessResult } from '../types';

/**
 * Spell selection helper
 */
export function pickBestSpell(
    state: GameState,
    awareness: AwarenessResult,
): string | null {
    const player = state.player;
    if (!player) return null;

    const spellIds = player.spells || [];
    if (spellIds.length === 0) return null;

    // Simple heuristic: prefer higher-damage spells when enemies are tough
    // This will be replaced by SDK reasoning later
    let best: { id: string; score: number } | null = null;

    for (const id of spellIds) {
        let score = 5; // baseline
        // Prefer spells when multiple enemies (AoE value)
        if (awareness.enemyCount > 1) score += 3;
        // Prefer spells when HP is high (aggressive stance)
        if (awareness.hpRatio > 0.7) score += 2;
        // Add some variety
        score += Math.random() * 3;

        if (!best || score > best.score) best = { id, score };
    }

    return best?.id ?? null;
}
