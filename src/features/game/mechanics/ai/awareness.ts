/**
 * Awareness system — gathers environmental data for AI decision-making.
 *
 * Aligned with Forboc/client/src/features/mechanics/orchestrators/systems/bots/awareness.ts.
 * Computes threats, opportunities, and resource availability from game state.
 */

import type { GameState } from '../../slice/types';
import type { AwarenessResult, AgentActionType } from './types';
import type { ActiveQuest } from '../../types';

const DIRECTIONS = ['North', 'South', 'East', 'West'] as const;
const DANGEROUS_HAZARDS = ['Toxic Air', 'Radioactive Decay', 'Void Instability', 'Extreme Cold', 'Scorching Heat'];

/**
 * Compute awareness of the current game environment.
 * This is a pure function: no side effects, no dispatching.
 * 
 * @param state - Current game state
 * @param lastAction - Last action taken (for cooldown tracking)
 */
export function computeAwareness(state: GameState, lastAction: AgentActionType | null = null): AwarenessResult {
    const { currentRoom: room, player, logs, exploredRooms, activeQuests } = state;

    if (!room || !player) {
        return {
            hasEnemies: false,
            enemyCount: 0,
            primaryEnemy: null,
            hasMerchants: false,
            hasGroundLoot: false,
            hasReadyCrops: false,
            hasCraftableRecipes: false,
            isBaseCamp: false,
            availableExits: [],
            unvisitedExits: [],
            safeExits: [],
            baseCampExits: [],
            recentlyScanned: false,
            inCombat: false,
            recentDamage: 0,
            roomHazardCount: 0,
            isDangerousRoom: false,
            hpRatio: 0,
            stressRatio: 0,
            hasHealingItem: false,
            hasStressItem: false,
            hasUnequippedGear: false,
            surgeCount: 0,
            canAffordTrade: false,
            shouldSellExcess: false,
            spiritBalance: 0,
            bloodBalance: 0,
            hasSignedServitor: false,
            merchantHasContract: false,
            canAffordContract: false,
            justRespawned: false,
            lastActionType: null,
            actionHistory: [],
            incompleteQuests: [],
            questProgress: {},
        };
    }

    // ── Threats ──
    const enemies = room.enemies || [];
    const primaryEnemy = enemies.length > 0 ? enemies[0] : null;

    // ── Resources ──
    const spirit = player.spirit ?? 0;
    const blood = player.blood ?? 0;
    const inventory = player.inventory || [];

    // ── Health ──
    const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
    const stressRatio = player.maxStress > 0 ? (player.stress || 0) / player.maxStress : 0;

    const healingNames = ['Healing', 'Potion', 'Mushroom', 'Salve', 'Puffball', 'Cap', 'Morel', 'Truffle', 'Lichen'];
    const hasHealingItem = inventory.some(
        i => i.type === 'consumable' && healingNames.some(n => i.name.includes(n))
    );

    const stressNames = ['Calm', 'Tonic', 'Serenity', 'Spore Clump'];
    const hasStressItem = inventory.some(
        i => i.type === 'consumable' && stressNames.some(n => i.name.includes(n))
    );

    // ── Equipment ──
    const hasUnequippedGear =
        (!player.equipment?.mainHand && inventory.some(i => i.type === 'weapon')) ||
        (!player.equipment?.armor && inventory.some(i => i.type === 'armor'));

    // ── Base Camp ──
    const isBaseCamp = !!room.isBaseCamp;
    const hasReadyCrops = isBaseCamp && (room.features || []).some(
        f => f.type === 'farming_plot' && f.ready
    );
    const hasCraftableRecipes = (player.recipes || []).some(recipe =>
        recipe.ingredients.every(
            ing => inventory.filter(i => i.name === ing.name).length >= ing.quantity
        )
    );

    // ── Navigation ──
    const availableExits = DIRECTIONS.filter(d => room.exits[d]).map(String);
    const exploredRoomIds = Object.keys(exploredRooms || {});
    const unvisitedExits = DIRECTIONS
        .filter(d => room.exits[d] === 'new-room' || (room.exits[d] && !exploredRoomIds.includes(room.exits[d]!)))
        .map(String);

    // ── Proactive Pathfinding: Evaluate adjacent rooms for safety ──
    // When compromised (low HP), avoid entering rooms with dangerous hazards
    const isCompromised = hpRatio < 0.5; // Consider compromised when HP is below 50%
    const safeExits: string[] = [];
    const baseCampExits: string[] = []; // Exits leading to base camp (safest option when compromised)
    
    if (isCompromised && exploredRooms) {
        // Check each exit to see if the destination room is safe
        for (const direction of DIRECTIONS) {
            const exitRoomId = room.exits[direction];
            if (!exitRoomId) continue; // No exit in this direction
            
            // When compromised, NEVER enter unexplored rooms - we can't know if they're safe
            if (!exploredRoomIds.includes(exitRoomId)) continue;
            
            const adjacentRoom = exploredRooms[exitRoomId];
            if (!adjacentRoom) continue;
            
            // Base camp is always safe - prioritize it when compromised
            if (adjacentRoom.isBaseCamp) {
                baseCampExits.push(String(direction));
                safeExits.push(String(direction)); // Also add to safe exits
                continue;
            }
            
            // Check if the adjacent room has dangerous hazards
            const hasDangerousHazards = (adjacentRoom.hazards || []).some(h => DANGEROUS_HAZARDS.includes(h));
            
            // Also check if the room has enemies (additional danger)
            const hasEnemies = (adjacentRoom.enemies || []).length > 0;
            
            // Consider safe if no dangerous hazards and no enemies
            if (!hasDangerousHazards && !hasEnemies) {
                safeExits.push(String(direction));
            }
        }
    } else {
        // When not compromised, all exits are considered safe (no filtering needed)
        safeExits.push(...availableExits);
    }

    // ── Scan status ──
    const recentLogs = (logs || []).slice(-5);
    const recentlyScanned = recentLogs.some(
        l => l.message.includes('[SCAN RESULT]') && l.message.includes(room.title)
    );

    // ── Respawn detection ──
    // Check if player just respawned (within last 3 log entries)
    const veryRecentLogs = (logs || []).slice(-3);
    const justRespawned = veryRecentLogs.some(
        l => l.message.includes('Resurrecting') || l.message.includes('void releases you')
    ) || (player as any).justRespawned === true;
    
    // Clear the flag after detection (one-time check)
    if ((player as any).justRespawned === true) {
        (player as any).justRespawned = false;
    }

    // ── Combat detection ──
    const combatLogs = (logs || []).slice(-8);
    const combatKeywords = ['swing at', 'strikes you', 'cast ', 'attacks', 'hits you for', 'damage', 'has fallen'];
    const inCombat = enemies.length > 0 && combatLogs.some(
        l => combatKeywords.some(k => l.message.toLowerCase().includes(k))
    );
    let recentDamage = 0;
    for (const log of combatLogs) {
        const dmgMatch = log.message.match(/hits you for (\d+) damage/i);
        if (dmgMatch) recentDamage += Number(dmgMatch[1]);
        const strikesMatch = log.message.match(/strikes you for (\d+) damage/i);
        if (strikesMatch) recentDamage += Number(strikesMatch[1]);
    }

    // ── Hazard detection ──
    const hazards = room.hazards || [];
    const roomHazardCount = hazards.length;
    const isDangerousRoom = hazards.some(h => DANGEROUS_HAZARDS.includes(h));

    // ── Trade ──
    const hasMerchants = !!(room.merchants && room.merchants.length > 0);
    const canAffordTrade = hasMerchants && spirit >= 4;
    const shouldSellExcess = inventory.length > 6 || (spirit < 15 && inventory.length > 2);

    // ── Servitors: contract availability and affordability ──
    const hasSignedServitor = !!(player.servitors && player.servitors.length > 0);
    let merchantHasContract = false;
    let canAffordContract = false;
    if (hasMerchants && room.merchants) {
        for (const m of room.merchants) {
            const contractWares = (m.wares || []).filter((w: { type?: string }) => w.type === 'contract');
            if (contractWares.length > 0) merchantHasContract = true;
            for (const w of contractWares) {
                const cost = (w as { cost?: { spirit?: number; blood?: number } }).cost || {};
                if (spirit >= (cost.spirit ?? 0) && blood >= (cost.blood ?? 0)) {
                    canAffordContract = true;
                    break;
                }
            }
            if (canAffordContract) break;
        }
    }

    // ── Action History Tracking ──
    // Extract action history from recent logs (last 10 actions)
    const actionHistory: Array<{ type: AgentActionType; timestamp: number }> = [];
    const recentActionLogs = (logs || []).slice(-20); // Check last 20 logs for actions
    
    for (const log of recentActionLogs) {
        const msg = log.message.toLowerCase();
        let actionType: AgentActionType | null = null;
        
        if (msg.includes('moved') || msg.includes('moving')) actionType = 'move';
        else if (msg.includes('scanning') || msg.includes('[scan result]')) actionType = 'scan';
        else if (msg.includes('purchased') || msg.includes('bought')) actionType = 'buy';
        else if (msg.includes('sold')) actionType = 'sell';
        else if (msg.includes('cast') || msg.includes('casting')) actionType = 'cast_spell';
        else if (msg.includes('engaged') || msg.includes('engaging')) actionType = 'engage';
        else if (msg.includes('picked up') || msg.includes('loot')) actionType = 'loot';
        else if (msg.includes('heal') || msg.includes('healing')) actionType = 'heal';
        else if (msg.includes('commune') || msg.includes('oracle')) actionType = msg.includes('commune') ? 'commune' : 'ask_oracle';
        else if (msg.includes('equipped')) actionType = msg.includes('weapon') ? 'equip_weapon' : 'equip_armor';
        
        if (actionType) {
            actionHistory.push({ type: actionType, timestamp: log.timestamp });
        }
    }
    
    // Keep only last 10 actions
    const trimmedHistory = actionHistory.slice(-10);
    const lastActionType = lastAction || (trimmedHistory.length > 0 ? trimmedHistory[trimmedHistory.length - 1].type : null);

    // ── Quest Awareness ──
    const incompleteQuests = (activeQuests || []).filter(q => !q.complete);
    const questProgress: Record<string, number> = {};
    for (const quest of incompleteQuests) {
        questProgress[quest.id] = quest.target > 0 ? quest.progress / quest.target : 0;
    }

    return {
        hasEnemies: enemies.length > 0,
        enemyCount: enemies.length,
        primaryEnemy,
        hasMerchants,
        hasGroundLoot: !!(room.groundLoot && room.groundLoot.length > 0),
        hasReadyCrops,
        hasCraftableRecipes,
        isBaseCamp,
        availableExits,
        unvisitedExits,
        safeExits,
        baseCampExits,
        recentlyScanned,
        inCombat,
        recentDamage,
        roomHazardCount,
        isDangerousRoom,
        hpRatio,
        stressRatio,
        hasHealingItem,
        hasStressItem,
        hasUnequippedGear,
        surgeCount: player.surgeCount || 0,
        canAffordTrade,
        shouldSellExcess,
        spiritBalance: spirit,
        bloodBalance: blood,
        hasSignedServitor,
        merchantHasContract,
        canAffordContract,
        justRespawned,
        lastActionType,
        actionHistory: trimmedHistory,
        incompleteQuests,
        questProgress,
    };
}
