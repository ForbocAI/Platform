import type { AgentConfig, AgentAction, AwarenessResult } from '../types';
import type { GameState, Enemy } from '../../../slice/types';

/**
 * Rival Bot Logic extensions
 * Rivals care about SCORE. They will:
 * 1. Steal kills (target low HP enemies)
 * 2. Rush to bosses
 * 3. Ignore player unless attacked (or if player is high value)
 * 
 * Ported from: Forboc/client/src/features/mechanics/orchestrators/systems/rivals/rivalSystem.ts
 */

export const calculateRivalPriority = (
    target: Enemy,
    playerPos: { x: number; y: number } | null, // Not used in simple dist check but good for future
    dist: number // Pre-calculated distance or mock 0 if not spatial
): number => {
    let score = 0;

    // Low HP = High Priority (Kill Steal)
    // Checking maxHp to be safe against div by zero, though unlikely
    const maxHp = target.maxHp || 100;
    if (target.hp < maxHp * 0.3) score += 50;

    // Bosses = High Priority
    // In Platform, 'boss' might be deduced from class or name/description
    const isBoss =
        target.characterClass.includes('Titan') ||
        target.characterClass.includes('Leviathan') ||
        target.characterClass.includes('Overfiend') ||
        target.characterClass.includes('Warden');

    if (isBoss) score += 100;

    // Distance Factor (Lower distance = Higher score)
    // In Abstract Platform, 'distance' might be 0 if in same room, or >0 if scan result
    // We assume we are evaluating enemies in current room (dist ~ 0-100)
    score -= dist * 0.5;

    return Math.max(0, score);
};

/**
 * Node 1.5: Rival Behavior (Strategic Overrides)
 */
export function nodeRival(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);

    // Only "Rivals" run this logic
    if (!has('rival')) return null;

    // Must have enemies to target
    if (!awareness.hasEnemies || !state.currentRoom?.enemies) return null;

    const enemies = state.currentRoom.enemies;
    let bestTarget: Enemy | null = null;
    let maxScore = -Infinity;

    // In Abstract Platform, we assume enemies in `currentRoom` are "nearby" (dist=0 or small)
    // unless we have specific coordinate data. 
    // `awareness.primaryEnemy` is a heuristic, but Rivals ignore that for Score.

    for (const enemy of enemies) {
        // Skip dead
        if (enemy.hp <= 0) continue;

        const priority = calculateRivalPriority(enemy, null, 10); // Assume close range (10m) in same room

        if (priority > maxScore) {
            maxScore = priority;
            bestTarget = enemy;
        }
    }

    // Threshold: Only override if score is significant (e.g. > 20)
    if (bestTarget && maxScore > 20) {
        return {
            type: 'engage',
            // We might need to target a SPECIFIC enemy. 
            // The `engage` action in Platform is currently generic "engageHostiles",
            // but for Rival precision we should ideally pass the target ID.
            // Actuator `engageHostiles` picks best target usually. 
            // We'll pass `payload` with targetId if actuator supports it, or use reason to hint.
            payload: { targetId: bestTarget.id },
            reason: `[Rival] High Value Target: ${bestTarget.name} (Score: ${Math.round(maxScore)})`
        };
    }

    return null;
}
