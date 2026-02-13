import type { AgentConfig, AgentAction, AwarenessResult } from '../types';
import type { GameState } from '../../../slice/types';
import { pickBestSpell } from './helpers';
import { isActionOnCooldown, isActionLooping } from './cooldowns';

/**
 * Node 4: Combat (Engage Threats)
 */
export function nodeCombat(
    config: AgentConfig,
    state: GameState,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);
    const player = state.player;

    if (!player) return null;

    if (has('combat') && awareness.hasEnemies && awareness.hpRatio > 0.25) {
        // Try spells first (more interesting combat)
        if (has('spell') && config.traits.aggression > 0.3) {
            const spellId = pickBestSpell(state, awareness);
            if (spellId && Math.random() < 0.6) {
                return { type: 'cast_spell', payload: { spellId }, reason: 'Casting spell in combat' };
            }
        }

        // Melee engagement
        return { type: 'engage', reason: `Engaging ${awareness.primaryEnemy?.name || 'hostile'} (HP: ${awareness.primaryEnemy?.hp ?? '?'})` };
    }

    return null;
}

/**
 * Node 4b: Servitor prep — when merchant + enemy present and no signed servitor, buy contract before engaging
 */
export function nodeServitorPrep(
    config: AgentConfig,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);
    if (!has('trade') || !awareness.hasMerchants || !awareness.hasEnemies) return null;
    if (awareness.hasSignedServitor) return null;
    if (!awareness.merchantHasContract || !awareness.canAffordContract) return null;
    if (isActionOnCooldown('buy', awareness)) return null;
    return { type: 'buy', reason: 'Strategic: Buying servitor contract before combat' };
}

/**
 * Node 5: Loot (Pick Up Items)
 */
export function nodeLoot(
    config: AgentConfig,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);

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
    const has = (cap: string) => config.capabilities.includes(cap as any);

    if (!has('trade') || !awareness.hasMerchants) {
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

    // Strategic priority 3: Buy upgrades when spirit is high (resourcefulness trait influences this)
    const hasHighSpirit = awareness.spiritBalance >= 20;
    const shouldBuyUpgrade = hasHighSpirit && config.traits.resourcefulness > 0.5;
    if (shouldBuyUpgrade && awareness.canAffordTrade && !isActionOnCooldown('buy', awareness)) {
        // Only buy if not recently bought (cooldown check)
        return { type: 'buy', reason: 'Strategic: Buying upgrades with excess spirit' };
    }

    // Fallback: Random trading based on resourcefulness trait (but still respect cooldowns)
    if (config.traits.resourcefulness > 0.3 && awareness.canAffordTrade) {
        if (!isActionOnCooldown('buy', awareness) && Math.random() < config.traits.resourcefulness * 0.3) {
            return { type: 'buy', reason: 'Browsing merchant wares' };
        }
    }

    return null;
}

/**
 * Node 7: Recon (Scan & Oracle) — With cooldowns to prevent spam
 */
export function nodeRecon(
    config: AgentConfig,
    awareness: AwarenessResult,
): AgentAction | null {
    const has = (cap: string) => config.capabilities.includes(cap as any);

    // Scan: Only if room not recently scanned and not on cooldown
    if (has('awareness') && !awareness.recentlyScanned && !isActionOnCooldown('scan', awareness)) {
        return { type: 'scan', reason: 'Room not yet scanned' };
    }

    // Oracle/Commune: Check cooldowns and prevent loops
    if (has('oracle')) {
        // Prevent oracle spam - check if we've been doing this too much
        if (isActionLooping('commune', awareness, 3) || isActionLooping('ask_oracle', awareness, 3)) {
            return null; // Break the loop
        }

        // Frequency based on mysticism trait (enough to populate Facts during autoplay), with cooldown checks
        const oracleChance = config.traits.mysticism * 0.28;
        if (Math.random() < oracleChance) {
            if (Math.random() < 0.5) {
                if (!isActionOnCooldown('commune', awareness)) {
                    return { type: 'commune', reason: 'Communing with the void' };
                }
            } else {
                if (!isActionOnCooldown('ask_oracle', awareness)) {
                    return { type: 'ask_oracle', reason: 'Seeking oracle guidance' };
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
    const has = (cap: string) => config.capabilities.includes(cap as any);
    const room = state.currentRoom;

    if (!room) return null;

    if (has('explore') && awareness.availableExits.length > 0) {
        // Proactive pathfinding: When compromised (low HP), avoid hazardous/unexplored rooms
        let exits = awareness.availableExits;
        let reason = `Exploring ${exits[0]}`;
        
        // ── Exploration Fallback Strategy: When all rooms explored ──
        const allRoomsExplored = awareness.unvisitedExits.length === 0 && awareness.availableExits.length > 0;
        
        if (allRoomsExplored) {
            // Fallback 1: Return to base camp if not already there
            if (!awareness.isBaseCamp && awareness.baseCampExits.length > 0) {
                exits = awareness.baseCampExits;
                reason = 'All areas explored — returning to base camp';
            }
            // Fallback 2: Seek combat for XP/quests if HP is good
            else if (awareness.hpRatio > 0.7 && !awareness.hasEnemies) {
                // Look for rooms with enemies
                const exitsWithEnemies = awareness.availableExits.filter(dir => {
                    const exitRoomId = room.exits[dir as 'North' | 'South' | 'East' | 'West'];
                    if (!exitRoomId) return false;
                    const exploredRoom = state.exploredRooms?.[exitRoomId];
                    return exploredRoom && (exploredRoom.enemies || []).length > 0;
                });
                
                if (exitsWithEnemies.length > 0) {
                    exits = exitsWithEnemies;
                    reason = 'All areas explored — seeking combat for XP';
                } else {
                    // Fallback 3: Just move randomly (better than idle)
                    reason = 'All areas explored — patrolling';
                }
            }
            // Fallback 4: If HP is low, prioritize safe rooms
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
                // Otherwise, use safe explored exits (no hazards, no enemies)
                exits = awareness.safeExits;
                reason = `Moving to safe room (avoiding hazards, HP: ${Math.round(awareness.hpRatio * 100)}%)`;
            } else {
                // No safe explored exits available
                // Check if we're in a dangerous room - evacuate immediately if so
                if (awareness.isDangerousRoom && awareness.availableExits.length > 0) {
                    // We're in a dangerous room - evacuate to ANY exit (even if it's toxic, better than staying)
                    exits = awareness.availableExits;
                    reason = `⚠️ EVACUATING dangerous room (HP: ${Math.round(awareness.hpRatio * 100)}%)`;
                } else {
                    // Not in immediate danger, but no safe exits
                    // Check if all explored exits are dangerous
                    const exploredExits = awareness.availableExits.filter(dir => {
                        const exitRoomId = room.exits[dir as 'North' | 'South' | 'East' | 'West'];
                        return exitRoomId && Object.keys(state.exploredRooms || {}).includes(exitRoomId);
                    });
                    
                    const exploredSafeExits = exploredExits.filter(dir => {
                        const exitRoomId = room.exits[dir as 'North' | 'South' | 'East' | 'West'];
                        if (!exitRoomId) return false;
                        const exploredRoom = state.exploredRooms?.[exitRoomId];
                        if (!exploredRoom) return false;
                        const hasDangerousHazards = (exploredRoom.hazards || []).some((h: string) => 
                            ['Toxic Air', 'Radioactive Decay', 'Void Instability', 'Extreme Cold', 'Scorching Heat'].includes(h)
                        );
                        return !hasDangerousHazards && (exploredRoom.enemies || []).length === 0;
                    });
                    
                    if (exploredSafeExits.length > 0) {
                        exits = exploredSafeExits;
                        reason = `Retreating to safe explored room (HP: ${Math.round(awareness.hpRatio * 100)}%)`;
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
                        // Last resort: enter unexplored room
                        exits = awareness.availableExits;
                        reason = `⚠️ FORCED: All exits unexplored (HP: ${Math.round(awareness.hpRatio * 100)}%) - entering unknown`;
                    }
                }
            }
        } else if (awareness.unvisitedExits.length > 0) {
            // When not compromised, prefer unvisited rooms for exploration
            exits = awareness.unvisitedExits;
            reason = `Exploring unvisited area`;
        }
        
        const direction = exits[Math.floor(Math.random() * exits.length)];
        return { type: 'move', payload: { direction }, reason };
    }

    return null;
}
