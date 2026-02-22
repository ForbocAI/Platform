import type { AgentConfig, AgentAction, AwarenessResult, AgentCapability } from '../types';
import type { GameState } from '../../../../store/types';
import { pickBestCapability } from './helpers';
import { isActionOnCooldown, isActionLooping } from './cooldowns';

/**
 * Node 4: Combat (Engage Threats)
 */
export function nodeCombat(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: AgentCapability) => config.capabilities.includes(cap);
    const player = state.player;

    if (!player) return null;

    if (has('combat') && awareness.hasNPCs && awareness.hpRatio > 0.25) {
        // Try capabilities first (more interesting combat)
        if (has('capability') && config.traits.aggression > 0.3) {
            const capabilityId = pickBestCapability(state, awareness);
            if (capabilityId && Math.random() < 0.6) {
                return { type: 'cast_capability', payload: { capabilityId }, reason: 'Activating capability in combat' };
            }
        }

        // Melee engagement
        return { type: 'engage', reason: `Engaging ${awareness.primaryNPC?.name || 'hostile'} (HP: ${awareness.primaryNPC?.stats.hp ?? '?'})` };
    }

    return null;
}

/**
 * Node 4b: Companion prep — when vendor + hostile present and no signed companion, buy contract before engaging
 */
export function nodeCompanionPrep(
    config: AgentConfig,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: AgentCapability) => config.capabilities.includes(cap);
    if (!has('trade') || !awareness.hasVendors || !awareness.hasNPCs) return null;
    if (awareness.hasSignedCompanion) return null;
    if (!awareness.vendorHasContract || !awareness.canAffordContract) return null;
    if (isActionOnCooldown('buy', awareness)) return null;
    return { type: 'buy', reason: 'Strategic: Buying companion contract before combat' };
}

/**
 * Node 5: Loot (Pick Up Items)
 */
export function nodeLoot(
    config: AgentConfig,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: AgentCapability) => config.capabilities.includes(cap);

    if (has('loot') && awareness.hasGroundLoot) {
        return { type: 'loot', reason: 'Ground loot available' };
    }

    return null;
}

/**
 * Node 6: Economy (Trade) — Strategic resource management
 */
export function nodeEconomy(
    config: AgentConfig,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: AgentCapability) => config.capabilities.includes(cap);

    if (!has('trade') || !awareness.hasVendors) {
        return null;
    }

    // Check cooldowns to prevent spam
    if (isActionOnCooldown('buy', awareness) && isActionOnCooldown('sell', awareness)) {
        return null; // Both actions on cooldown
    }

    // Strategic priority 1: Sell excess inventory (always prioritize clearing space)
    if (awareness.shouldSellExcess && !isActionOnCooldown('sell', awareness)) {
        return { type: 'sell', reason: 'Strategic: Selling excess inventory' };
    }

    // Strategic priority 2: Buy healing items when HP is low and inventory is empty
    const needsHealing = awareness.hpRatio < 0.6 && !awareness.hasHealingItem;
    if (needsHealing && awareness.canAffordTrade && !isActionOnCooldown('buy', awareness)) {
        return { type: 'buy', reason: `Strategic: Buying healing items (HP: ${Math.round(awareness.hpRatio * 100)}%)` };
    }

    // Strategic priority 3: Buy upgrades when primary resource is high (resourcefulness trait influences this)
    const hasHighResource = awareness.primaryResourceBalance >= 20;
    const shouldBuyUpgrade = hasHighResource && config.traits.resourcefulness > 0.5;
    if (shouldBuyUpgrade && awareness.canAffordTrade && !isActionOnCooldown('buy', awareness)) {
        // Only buy if not recently bought (cooldown check)
        return { type: 'buy', reason: 'Strategic: Buying upgrades with excess resource' };
    }

    // Fallback: Random trading based on resourcefulness trait (but still respect cooldowns)
    if (config.traits.resourcefulness > 0.3 && awareness.canAffordTrade) {
        if (!isActionOnCooldown('buy', awareness) && Math.random() < config.traits.resourcefulness * 0.3) {
            return { type: 'buy', reason: 'Browsing vendor wares' };
        }
    }

    return null;
}

/**
 * Node 7: Recon (Scan & Inquiry) — With cooldowns to prevent spam
 */
export function nodeRecon(
    config: AgentConfig,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: AgentCapability) => config.capabilities.includes(cap);

    // Scan: Only if area not recently scanned and not on cooldown
    if (has('awareness') && !awareness.recentlyScanned && !isActionOnCooldown('scan', awareness)) {
        return { type: 'scan', reason: 'Area not yet scanned' };
    }

    // Inquiry/Commune: Check cooldowns and prevent loops
    if (has('inquiry')) {
        // Prevent inquiry spam - check if we've been doing this too much
        if (isActionLooping('perform_inquiry', awareness, 3) || isActionLooping('ask_inquiry', awareness, 3)) {
            return null; // Break the loop
        }

        // Frequency based on inquiryFrequency trait (enough to populate Facts during autoplay), with cooldown checks
        const inquiryChance = config.traits.inquiryFrequency * 0.28;
        if (Math.random() < inquiryChance) {
            if (Math.random() < 0.5) {
                if (!isActionOnCooldown('perform_inquiry', awareness)) {
                    console.log('nodeInquiry: Performing inquiry.');
                    return { type: 'perform_inquiry', reason: 'Attempting to gather knowledge / generate spirit' };
                }
            } else {
                if (!isActionOnCooldown('ask_inquiry', awareness)) {
                    return { type: 'ask_inquiry', reason: 'Seeking inquiry guidance' };
                }
            }
        }
    }

    return null;
}

/**
 * Node 8: Exploration (Move)
 */
export function nodeExploration(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: AgentCapability) => config.capabilities.includes(cap);
    const area = state.currentArea;

    if (!area) return null;

    if (has('explore') && awareness.availableExits.length > 0) {
        // Proactive pathfinding: When compromised (low HP), avoid hazardous/unexplored areas
        let exits = awareness.availableExits;
        let reason = `Exploring ${exits[0]}`;

        // ── Exploration Fallback Strategy: When all areas explored ──
        const allAreasExplored = awareness.unvisitedExits.length === 0 && awareness.availableExits.length > 0;

        if (allAreasExplored) {
            // Fallback 1: Return to base camp if not already there
            if (!awareness.isBaseCamp && awareness.baseCampExits.length > 0) {
                exits = awareness.baseCampExits;
                reason = 'All areas explored — returning to base camp';
            }
            // Fallback 2: Seek combat for XP/quests if HP is good
            else if (awareness.hpRatio > 0.7 && !awareness.hasNPCs) {
                // Look for areas with NPCs
                const exitsWithNPCs = awareness.availableExits.filter(dir => {
                    const exitAreaId = area.exits[dir as 'North' | 'South' | 'East' | 'West'];
                    if (!exitAreaId) return false;
                    const exploredArea = state.exploredAreas?.[exitAreaId];
                    return exploredArea && (exploredArea.npcs || []).length > 0;
                });

                if (exitsWithNPCs.length > 0) {
                    exits = exitsWithNPCs;
                    reason = 'All areas explored — seeking combat for progression';
                } else {
                    // Fallback 3: Just move randomly (better than idle)
                    reason = 'All areas explored — patrolling';
                }
            }
            // Fallback 4: If HP is low, prioritize safe areas
            else if (awareness.hpRatio < 0.5 && awareness.safeExits.length > 0) {
                exits = awareness.safeExits;
                reason = 'All areas explored — moving to safe area';
            }
        }

        if (awareness.hpRatio < 0.5) {
            // When compromised, prioritize base camp if available
            if (awareness.baseCampExits.length > 0) {
                exits = awareness.baseCampExits;
                reason = `Returning to base camp (HP: ${Math.round(awareness.hpRatio * 100)}%)`;
            } else if (awareness.safeExits.length > 0) {
                // Otherwise, use safe explored exits (no hazards, no NPCs)
                exits = awareness.safeExits;
                reason = `Moving to safe area (avoiding hazards, HP: ${Math.round(awareness.hpRatio * 100)}%)`;
            } else {
                // No safe explored exits available
                // Check if we're in a dangerous area - evacuate immediately if so
                if (awareness.isDangerousArea && awareness.availableExits.length > 0) {
                    // We're in a dangerous area - evacuate to ANY exit
                    exits = awareness.availableExits;
                    reason = `⚠️ EVACUATING dangerous area (HP: ${Math.round(awareness.hpRatio * 100)}%)`;
                } else {
                    // Not in immediate danger, but no safe exits
                    // Check if all explored exits are dangerous
                    const exploredExits = awareness.availableExits.filter(dir => {
                        const exitAreaId = area.exits[dir as 'North' | 'South' | 'East' | 'West'];
                        return exitAreaId && Object.keys(state.exploredAreas || {}).includes(exitAreaId);
                    });

                    const exploredSafeExits = exploredExits.filter(dir => {
                        const exitAreaId = area.exits[dir as 'North' | 'South' | 'East' | 'West'];
                        if (!exitAreaId) return false;
                        const exploredArea = state.exploredAreas?.[exitAreaId];
                        if (!exploredArea) return false;
                        const hasDangerousHazards = (exploredArea.hazards || []).some((h: string) =>
                            ['Toxic Air', 'Radioactive Decay', 'Void Instability', 'Extreme Cold', 'Scorching Heat'].includes(h)
                        );
                        return !hasDangerousHazards && (exploredArea.npcs || []).length === 0;
                    });

                    if (exploredSafeExits.length > 0) {
                        exits = exploredSafeExits;
                        reason = `Retreating to safe explored area (HP: ${Math.round(awareness.hpRatio * 100)}%)`;
                    } else if (exploredExits.length > 0) {
                        // All explored exits are dangerous - try to heal first
                        if (has('heal') && awareness.hasHealingItem) {
                            return { type: 'heal', reason: `HP critical (${Math.round(awareness.hpRatio * 100)}%) - all explored exits hazardous, healing first` };
                        }
                        // No healing available - must use dangerous explored exit (better than unknown)
                        exits = exploredExits;
                        reason = `⚠️ FORCED: All explored exits hazardous (HP: ${Math.round(awareness.hpRatio * 100)}%)`;
                    } else {
                        // All exits are unexplored - try to heal before exploring
                        if (has('heal') && awareness.hasHealingItem) {
                            return { type: 'heal', reason: `HP critical (${Math.round(awareness.hpRatio * 100)}%) - all exits unexplored, healing first` };
                        }
                        // Last resort: enter unexplored area
                        exits = awareness.availableExits;
                        reason = `⚠️ FORCED: All exits unexplored (HP: ${Math.round(awareness.hpRatio * 100)}%) - entering unknown`;
                    }
                }
            }
        } else if (awareness.unvisitedExits.length > 0) {
            // When not compromised, prefer unvisited areas for exploration
            exits = awareness.unvisitedExits;
            reason = `Exploring unvisited area`;
        }

        const direction = exits[Math.floor(Math.random() * exits.length)];
        return { type: 'move', payload: { direction }, reason };
    }

    return null;
}
