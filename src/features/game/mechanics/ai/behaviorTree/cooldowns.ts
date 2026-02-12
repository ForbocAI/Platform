/**
 * Action cooldown utilities — prevent action spam and loops.
 */

import type { AgentActionType, AwarenessResult } from '../types';

/** Cooldown periods (in number of actions) for different action types */
const ACTION_COOLDOWNS: Partial<Record<AgentActionType, number>> = {
    'buy': 3,           // Don't buy more than once every 3 actions
    'sell': 3,          // Don't sell more than once every 3 actions
    'commune': 5,       // Don't commune more than once every 5 actions
    'ask_oracle': 5,    // Don't ask oracle more than once every 5 actions
    'scan': 2,          // Don't scan more than once every 2 actions (unless room changed)
    'move': 0,          // Movement has no cooldown (needed for exploration)
    'loot': 1,          // Can loot every other action
};

/**
 * Check if an action is on cooldown based on recent action history.
 * Returns true if the action should be skipped due to cooldown.
 */
export function isActionOnCooldown(
    actionType: AgentActionType,
    awareness: AwarenessResult,
): boolean {
    const cooldown = ACTION_COOLDOWNS[actionType];
    if (cooldown === undefined || cooldown === 0) {
        return false; // No cooldown for this action
    }

    const history = awareness.actionHistory;
    if (history.length === 0) {
        return false; // No history, action is allowed
    }

    // Count how many times this action was taken in the last N actions
    const recentActions = history.slice(-cooldown);
    const sameActionCount = recentActions.filter(a => a.type === actionType).length;

    // If this action was taken recently, it's on cooldown
    return sameActionCount > 0;
}

/**
 * Check if we've been repeating the same action too many times.
 * Returns true if we should break the loop.
 */
export function isActionLooping(
    actionType: AgentActionType,
    awareness: AwarenessResult,
    maxRepeats: number = 3,
): boolean {
    const history = awareness.actionHistory;
    if (history.length < maxRepeats) {
        return false;
    }

    // Check if the last N actions are all the same type
    const recentActions = history.slice(-maxRepeats);
    return recentActions.every(a => a.type === actionType);
}
