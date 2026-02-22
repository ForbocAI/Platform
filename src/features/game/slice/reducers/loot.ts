import type { GameState } from '../types';
import { CAPABILITIES, getCapabilityUnlockForLevel } from '@/features/game/mechanics/capabilities';
import type { Item } from '@/features/game/types';

/** Shared helper: distribute loot items to player inventory and log. */
export function applyLoot(state: GameState, lootItems: Item[]): void {
    if (!state.player) return;
    for (const loot of lootItems) {
        state.player.inventory.items.push(loot);
    }
    if (lootItems.length > 0) {
        state.logs.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message: `Loot: ${lootItems.map((l) => l.name).join(", ")}.`,
            type: "system"
        });
    }
}

/** Shared helper: grant primary + secondary resource rewards and update quest tracking. */
export function applyCombatRewards(state: GameState, defeatedCount: number): void {
    if (!state.player) return;
    state.player.inventory.spirit = (state.player.inventory.spirit || 0) + (5 * defeatedCount);
    state.player.inventory.blood = (state.player.inventory.blood || 0) + (2 * defeatedCount);

    if (state.sessionScore) {
        state.sessionScore.npcsDefeated += defeatedCount;
        state.sessionScore.resourcesEarned += (5 * defeatedCount);
        const hostilesQuest = state.activeQuests.find(q => q.kind === "hostiles" && !q.complete);
        if (hostilesQuest) {
            hostilesQuest.progress = state.sessionScore.npcsDefeated;
            if (hostilesQuest.progress >= hostilesQuest.target) {
                hostilesQuest.complete = true;
                state.sessionScore.questsCompleted += 1;
                state.pendingQuestFacts.push(`Completed quest: ${hostilesQuest.label}.`);
                state.logs.push({
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    message: `Quest complete: ${hostilesQuest.label}.`,
                    type: "system"
                });
                if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                    state.sessionComplete = "quests";
                    state.sessionScore.endTime = Date.now();
                }
            }
        }
    }
}

/** Shared helper: apply XP gain, level-up, capability unlock. */
export function applyXpGain(state: GameState, xpGain: number): void {
    if (!state.player || xpGain <= 0) return;

    state.player.stats.xp = (state.player.stats.xp ?? 0) + xpGain;
    if ((state.player.stats.xp ?? 0) >= (state.player.stats.maxXp ?? 1000)) {
        state.player.stats.xp = (state.player.stats.xp ?? 0) - (state.player.stats.maxXp ?? 1000);
        state.player.stats.level = (state.player.stats.level ?? 1) + 1;
        state.player.stats.maxXp = (state.player.stats.maxXp ?? 1000) + 100;
        state.player.stats.maxHp += 10;
        state.player.stats.hp = state.player.stats.maxHp;
        state.player.stats.stress = 0;

        const newCapabilityId = getCapabilityUnlockForLevel(state.player.agentClass, state.player.stats.level ?? 1);

        if (newCapabilityId && !state.player.capabilities.learned.includes(newCapabilityId)) {
            state.player.capabilities.learned = [...state.player.capabilities.learned, newCapabilityId];
            const capabilityEntry = CAPABILITIES[newCapabilityId as keyof typeof CAPABILITIES];
            const capabilityName = capabilityEntry?.name ?? newCapabilityId;
            state.logs.push({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                message: `LEVEL UP! You are now level ${state.player.stats.level}! Unlocked capability: ${capabilityName}.`,
                type: "system"
            });
        } else {
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: `LEVEL UP! You are now level ${state.player.stats.level}! Max HP increased.`,
                type: "system"
            });
        }
    } else {
        state.logs.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message: `Gained ${xpGain} XP.`,
            type: "system"
        });
    }
}
