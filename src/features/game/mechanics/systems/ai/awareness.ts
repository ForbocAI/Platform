/**
 * Awareness system — gathers environmental data for AI decision-making.
 *
 * Aligned with Forboc/client/src/features/mechanics/orchestrators/systems/bots/awareness.ts.
 * Computes threats, opportunities, and resource availability from game state.
 */

import type { GameState } from '../../../store/types';
import type { AwarenessResult, AgentActionType } from './types';
import type { Item } from '../../../types';

const DIRECTIONS = ['North', 'South', 'East', 'West'] as const;
const DANGEROUS_HAZARDS = ['Toxic Air', 'Radioactive Decay', 'Void Instability', 'Extreme Cold', 'Scorching Heat'];

/**
 * Compute awareness of the current game environment.
 * This is a pure function: no side effects, no dispatching.
 * 
 * @param state - Current game state
 * @param lastAction - Last action taken (for cooldown tracking)
 * @param hasActiveVignette - Is there an active narrative vignette?
 */
export function computeAwareness(
    state: GameState,
    lastAction: AgentActionType | null = null,
    hasActiveVignette: boolean = false
): AwarenessResult {
    const { currentArea: area, player, logs, exploredAreas, activeQuests } = state;

    if (!area || !player) {
        return {
            hasNPCs: false,
            npcCount: 0,
            primaryNPC: null,
            hasVendors: false,
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
            areaHazardCount: 0,
            isDangerousArea: false,
            hpRatio: 0,
            stressRatio: 0,
            hasHealingItem: false,
            hasStressItem: false,
            hasUnequippedGear: false,
            surgeCount: 0,
            canAffordTrade: false,
            shouldSellExcess: false,
            primaryResourceBalance: 0,
            secondaryResourceBalance: 0,
            hasSignedCompanion: false,
            vendorHasContract: false,
            canAffordContract: false,
            justRespawned: false,
            hasActiveVignette: false,
            lastActionType: null,
            actionHistory: [],
            incompleteQuests: [],
            questProgress: {},
        };
    }

    // ── Threats ──
    const npcs = area.npcs || [];
    const primaryNPC = npcs.length > 0 ? npcs[0] : null;

    // ── Resources ──
    const resourcePrimary = player.inventory.spirit ?? 0;
    const resourceSecondary = player.inventory.blood ?? 0;
    const inventory = (player.inventory.items as Item[]) || [];

    // ── Health ──
    const hpRatio = player.stats.maxHp > 0 ? player.stats.hp / player.stats.maxHp : 0;
    const stressRatio = player.stats.maxStress > 0 ? (player.stats.stress || 0) / player.stats.maxStress : 0;

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
        (!player.inventory.equipment?.mainHand && inventory.some(i => i.type === 'weapon')) ||
        (!player.inventory.equipment?.armor && inventory.some(i => i.type === 'armor'));

    // ── Base Camp ──
    const isBaseCamp = !!area.isBaseCamp;
    const hasReadyCrops = isBaseCamp && (area.features || []).some(
        f => f.type === 'resource_plot' && f.ready
    );
    const hasCraftableRecipes = (player.blueprints || []).some(recipe =>
        recipe.ingredients.every(
            ing => inventory.filter(i => i.name === ing.name).length >= ing.quantity
        )
    );

    // ── Navigation ──
    const availableExits = DIRECTIONS.filter(d => area.exits[d]).map(String);
    const exploredAreaIds = Object.keys(exploredAreas || {});
    const unvisitedExits = DIRECTIONS
        .filter(d => area.exits[d] === 'new-area' || (area.exits[d] && !exploredAreaIds.includes(area.exits[d]!)))
        .map(String);

    // ── Proactive Pathfinding: Evaluate adjacent areas for safety ──
    // When compromised (low HP), avoid entering areas with dangerous hazards
    const isCompromised = hpRatio < 0.5; // Consider compromised when HP is below 50%
    const safeExits: string[] = [];
    const baseCampExits: string[] = []; // Exits leading to base camp (safest option when compromised)

    if (isCompromised && exploredAreas) {
        // Check each exit to see if the destination area is safe
        for (const direction of DIRECTIONS) {
            const exitAreaId = area.exits[direction];
            if (!exitAreaId) continue; // No exit in this direction

            // When compromised, NEVER enter unexplored areas - we can't know if they're safe
            if (!exploredAreaIds.includes(exitAreaId)) continue;

            const adjacentArea = exploredAreas[exitAreaId];
            if (!adjacentArea) continue;

            // Base camp is always safe - prioritize it when compromised
            if (adjacentArea.isBaseCamp) {
                baseCampExits.push(String(direction));
                safeExits.push(String(direction)); // Also add to safe exits
                continue;
            }

            // Check if the adjacent area has dangerous hazards
            const hasDangerousHazards = (adjacentArea.hazards || []).some(h => DANGEROUS_HAZARDS.includes(h));

            // Also check if the area has NPCs (additional danger)
            const hasNPCs = (adjacentArea.npcs || []).length > 0;

            // Consider safe if no dangerous hazards and no NPCs
            if (!hasDangerousHazards && !hasNPCs) {
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
        l => l.message.includes('[SCAN RESULT]') && l.message.includes(area.title)
    );

    // ── Respawn detection ──
    // Check if player just respawned (within last 3 log entries)
    const veryRecentLogs = (logs || []).slice(-3);
    const justRespawned = veryRecentLogs.some(
        l => l.message.includes('Resurrecting') || l.message.includes('void releases you')
    ) || player.justRespawned === true;

    // Clear the flag after detection (one-time check)
    if (player.justRespawned === true) {
        player.justRespawned = false;
    }

    // ── Combat detection ──
    const combatLogs = (logs || []).slice(-8);
    const combatKeywords = ['swing at', 'strikes you', 'activate ', 'attacks', 'hits you for', 'damage', 'neutralized'];
    const inCombat = npcs.length > 0 && combatLogs.some(
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
    const hazards = area.hazards || [];
    const areaHazardCount = hazards.length;
    const isDangerousArea = hazards.some(h => DANGEROUS_HAZARDS.includes(h));

    // ── Trade ──
    const hasVendors = !!(area.vendors && area.vendors.length > 0);
    const canAffordTrade = hasVendors && resourcePrimary >= 4;
    const shouldSellExcess = inventory.length > 6 || (resourcePrimary < 15 && inventory.length > 2);

    // ── Companions: contract availability and affordability ──
    const hasSignedCompanion = !!(player.companions && player.companions.length > 0);
    let vendorHasContract = false;
    let canAffordContract = false;
    if (hasVendors && area.vendors) {
        for (const v of area.vendors) {
            const contractWares = (v.wares || []).filter((w: { type?: string }) => w.type === 'contract');
            if (contractWares.length > 0) vendorHasContract = true;
            for (const w of contractWares) {
                const cost = (w as { cost?: { primary?: number; secondary?: number } }).cost || {};
                if (resourcePrimary >= (cost.primary ?? 0) && resourceSecondary >= (cost.secondary ?? 0)) {
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
        else if (msg.includes('activate') || msg.includes('activating')) actionType = 'cast_capability';
        else if (msg.includes('engaged') || msg.includes('engaging')) actionType = 'engage';
        else if (msg.includes('picked up') || msg.includes('loot')) actionType = 'loot';
        else if (msg.includes('heal') || msg.includes('healing')) actionType = 'heal';
        else if (msg.includes('perform inquiry') || msg.includes('inquiry')) actionType = 'perform_inquiry';
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
        hasNPCs: npcs.length > 0,
        npcCount: npcs.length,
        primaryNPC,
        hasVendors,
        hasGroundLoot: !!(area.groundLoot && area.groundLoot.length > 0),
        hasReadyCrops,
        hasCraftableRecipes: hasCraftableRecipes,
        isBaseCamp,
        availableExits,
        unvisitedExits,
        safeExits,
        baseCampExits,
        recentlyScanned,
        inCombat,
        recentDamage,
        areaHazardCount,
        isDangerousArea,
        hpRatio,
        stressRatio,
        hasHealingItem,
        hasStressItem,
        hasUnequippedGear,
        surgeCount: player.surgeCount || 0,
        canAffordTrade,
        shouldSellExcess,
        primaryResourceBalance: resourcePrimary,
        secondaryResourceBalance: resourceSecondary,
        hasSignedCompanion,
        vendorHasContract,
        canAffordContract,
        justRespawned,
        hasActiveVignette,
        lastActionType,
        actionHistory: trimmedHistory,
        incompleteQuests,
        questProgress,
    };
}
