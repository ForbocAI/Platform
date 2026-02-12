/**
 * Awareness system — gathers environmental data for AI decision-making.
 *
 * Aligned with Forboc/client/src/features/mechanics/orchestrators/systems/bots/awareness.ts.
 * Computes threats, opportunities, and resource availability from game state.
 */

import type { GameState } from '../../slice/types';
import type { AwarenessResult } from './types';

const DIRECTIONS = ['North', 'South', 'East', 'West'] as const;

/**
 * Compute awareness of the current game environment.
 * This is a pure function: no side effects, no dispatching.
 */
export function computeAwareness(state: GameState): AwarenessResult {
    const { currentRoom: room, player, logs, exploredRooms } = state;

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

    const stressNames = ['Calm', 'Tonic', 'Serenity'];
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

    // ── Scan status ──
    const recentLogs = (logs || []).slice(-5);
    const recentlyScanned = recentLogs.some(
        l => l.message.includes('[SCAN RESULT]') && l.message.includes(room.title)
    );

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
    const dangerousHazards = ['Toxic Air', 'Radioactive Decay', 'Void Instability', 'Extreme Cold', 'Scorching Heat'];
    const isDangerousRoom = hazards.some(h => dangerousHazards.includes(h));

    // ── Trade ──
    const hasMerchants = !!(room.merchants && room.merchants.length > 0);
    const canAffordTrade = hasMerchants && spirit >= 5;
    const shouldSellExcess = inventory.length > 6 || (spirit < 15 && inventory.length > 2);

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
    };
}
