import type { AgentConfig, AgentAction, AwarenessResult, AgentCapability } from '../types';
import type { GameState } from '../../../../store/types';
import type { AgentNPC } from '../../../../types';

/**
 * Rival Bot Logic extensions
 * Rivals care about SCORE. They will:
 * 1. Steal kills (target low HP NPCs)
 * 2. Rush to high-value targets (bosses)
 * 3. Ignore player unless attacked (or if player is high value)
 * 
 * Ported from: Forboc/client/src/features/mechanics/orchestrators/systems/rivals/rivalSystem.ts
 */

export const calculateRivalPriority = (
    target: AgentNPC,
    playerPos: { x: number; y: number } | null, // Not used in simple dist check but good for future
    dist: number // Pre-calculated distance or mock 0 if not spatial
): number => {
    let score = 0;

    // Low HP = High Priority (Kill Steal)
    // Checking maxHp to be safe against div by zero, though unlikely
    const maxHp = target.stats.maxHp || 100;
    if (target.stats.hp < maxHp * 0.3) score += 50;

    // High-value targets (Bosses) = High Priority
    // In Platform, 'boss' is deduced from type
    const isBoss =
        target.type.includes('Titan') ||
        target.type.includes('Leviathan') ||
        target.type.includes('Overfiend') ||
        target.type.includes('Warden');

    if (isBoss) score += 100;

    // Distance Factor (Lower distance = Higher score)
    // In Abstract Platform, 'distance' might be 0 if in same area, or >0 if scan result
    // We assume we are evaluating NPCs in current area (dist ~ 0-100)
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
    const has = (cap: AgentCapability | 'rival') => config.capabilities.includes(cap as AgentCapability);

    // Only "Rivals" run this logic
    if (!has('rival')) return null;

    // Must have NPCs to target
    if (!awareness.hasNPCs || !state.currentArea?.npcs) return null;

    const npcs = state.currentArea.npcs;
    let bestTarget: AgentNPC | null = null;
    let maxScore = -Infinity;

    // In Abstract Platform, we assume NPCs in `currentArea` are "nearby" (dist=0 or small)
    // unless we have specific coordinate data. 
    // `awareness.primaryNPC` is a heuristic, but Rivals ignore that for Score.

    for (const npc of npcs) {
        // Skip neutralized
        if (npc.stats.hp <= 0) continue;

        const priority = calculateRivalPriority(npc, null, 10); // Assume close range (10m) in same area
        if (priority > maxScore) {
            maxScore = priority;
            bestTarget = npc;
        }
    }

    // Threshold: Only override if score is significant (e.g. > 20)
    if (bestTarget && maxScore > 20) {
        return {
            type: 'engage',
            // We might need to target a SPECIFIC NPC. 
            // The `engage` action in Platform is currently generic "engageHostiles",
            // but for Rival precision we should ideally pass the targetId.
            // Actuator `engageHostiles` picks best target usually. 
            // We'll pass `payload` with targetId if actuator supports it, or use reason to hint.
            payload: { targetId: bestTarget.id },
            reason: `[Rival] High Value Target: ${bestTarget.name} (Score: ${Math.round(maxScore)})`
        };
    }

    return null;
}
