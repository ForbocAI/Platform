/**
 * Node 5.5: Quest Prioritization
 * 
 * Actively pursues incomplete quest objectives.
 * Priority: Between Economy and Recon (after basic needs, before exploration).
 */

import type { AgentConfig, AgentAction, AwarenessResult } from '../types';
import type { GameState } from '../../../slice/types';
import { isActionOnCooldown } from './cooldowns';

/**
 * Quest node — prioritize quest completion.
 * 
 * Quests are prioritized by:
 * 1. Progress ratio (closer to completion = higher priority)
 * 2. Quest type (reconnaissance > hostiles > merchant > rescue)
 */
export function nodeQuest(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);
    
    if (!has('quest')) {
        return null; // Agent doesn't have quest capability
    }

    const incompleteQuests = awareness.incompleteQuests;
    if (incompleteQuests.length === 0) {
        return null; // No incomplete quests
    }

    // Sort quests by priority: progress ratio (descending), then by quest type priority
    const questTypePriority: Record<string, number> = {
        'reconnaissance': 4,
        'hostiles': 3,
        'merchant': 2,
        'rescue': 1,
    };

    const prioritizedQuests = [...incompleteQuests].sort((a, b) => {
        const aProgress = awareness.questProgress[a.id] || 0;
        const bProgress = awareness.questProgress[b.id] || 0;
        
        // First sort by progress (closer to completion = higher priority)
        if (Math.abs(aProgress - bProgress) > 0.1) {
            return bProgress - aProgress;
        }
        
        // Then by quest type priority
        const aPriority = questTypePriority[a.kind] || 0;
        const bPriority = questTypePriority[b.kind] || 0;
        return bPriority - aPriority;
    });

    const targetQuest = prioritizedQuests[0];
    if (!targetQuest) return null;

    // ── Quest-specific actions ──
    
    // Reconnaissance: Scan unvisited rooms
    if (targetQuest.kind === 'reconnaissance' && targetQuest.progress < targetQuest.target) {
        if (has('awareness') && !awareness.recentlyScanned && !isActionOnCooldown('scan', awareness)) {
            return { type: 'scan', reason: `Quest: ${targetQuest.label} (${targetQuest.progress}/${targetQuest.target})` };
        }
        
        // If already scanned, explore unvisited areas
        if (has('explore') && awareness.unvisitedExits.length > 0) {
            const direction = awareness.unvisitedExits[Math.floor(Math.random() * awareness.unvisitedExits.length)];
            return { type: 'move', payload: { direction }, reason: `Quest: Exploring for ${targetQuest.label}` };
        }
    }

    // Hostiles: Seek and engage enemies
    if (targetQuest.kind === 'hostiles' && targetQuest.progress < targetQuest.target) {
        if (has('combat') && awareness.hasEnemies && awareness.hpRatio > 0.25) {
            return { type: 'engage', reason: `Quest: Defeating hostiles (${targetQuest.progress}/${targetQuest.target})` };
        }
        
        // If no enemies in current room, explore to find them
        if (has('explore') && awareness.availableExits.length > 0 && !awareness.hasEnemies) {
            // Prefer exploring unexplored areas (more likely to have enemies)
            const exits = awareness.unvisitedExits.length > 0 ? awareness.unvisitedExits : awareness.availableExits;
            const direction = exits[Math.floor(Math.random() * exits.length)];
            return { type: 'move', payload: { direction }, reason: `Quest: Seeking hostiles for ${targetQuest.label}` };
        }
    }

    // Merchant: Trade with merchants
    if (targetQuest.kind === 'merchant' && targetQuest.progress < targetQuest.target) {
        if (has('trade') && awareness.hasMerchants) {
            if (awareness.shouldSellExcess && !isActionOnCooldown('sell', awareness)) {
                return { type: 'sell', reason: `Quest: Trading with merchants (${targetQuest.progress}/${targetQuest.target})` };
            }
            if (awareness.canAffordTrade && !isActionOnCooldown('buy', awareness)) {
                return { type: 'buy', reason: `Quest: Trading with merchants (${targetQuest.progress}/${targetQuest.target})` };
            }
        }
        
        // If no merchants in current room, explore to find them
        if (has('explore') && awareness.availableExits.length > 0 && !awareness.hasMerchants) {
            const exits = awareness.unvisitedExits.length > 0 ? awareness.unvisitedExits : awareness.availableExits;
            const direction = exits[Math.floor(Math.random() * exits.length)];
            return { type: 'move', payload: { direction }, reason: `Quest: Seeking merchants for ${targetQuest.label}` };
        }
    }

    // Rescue: Find allies/NPCs
    if (targetQuest.kind === 'rescue' && targetQuest.progress < targetQuest.target) {
        // Check if current room has allies
        const room = state.currentRoom;
        if (room?.allies && room.allies.length > 0) {
            // Quest completion is handled by game logic, just need to be in the right room
            return null; // Already in correct room
        }
        
        // Explore to find allies
        if (has('explore') && awareness.availableExits.length > 0) {
            const exits = awareness.unvisitedExits.length > 0 ? awareness.unvisitedExits : awareness.availableExits;
            const direction = exits[Math.floor(Math.random() * exits.length)];
            return { type: 'move', payload: { direction }, reason: `Quest: Seeking allies for ${targetQuest.label}` };
        }
    }

    return null;
}
