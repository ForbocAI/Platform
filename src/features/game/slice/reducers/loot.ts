import type { GameState } from '../types';
import { SPELLS, getSpellUnlockForLevel, getSkillUnlockForLevel } from '@/features/game/mechanics';
import type { Item } from '@/features/game/types';

/** Shared helper: distribute loot items to player inventory and log. */
export function applyLoot(state: GameState, lootItems: Item[]): void {
    if (!state.player) return;
    for (const loot of lootItems) {
        state.player.inventory.push(loot);
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

/** Shared helper: grant spirit + blood rewards and update quest tracking. */
export function applyCombatRewards(state: GameState, defeatedCount: number): void {
    if (!state.player) return;
    state.player.spirit = (state.player.spirit || 0) + (5 * defeatedCount);
    state.player.blood = (state.player.blood || 0) + (2 * defeatedCount);

    if (state.sessionScore) {
        state.sessionScore.enemiesDefeated += defeatedCount;
        state.sessionScore.spiritEarned += (5 * defeatedCount);
        const hostilesQuest = state.activeQuests.find(q => q.kind === "hostiles" && !q.complete);
        if (hostilesQuest) {
            hostilesQuest.progress = state.sessionScore.enemiesDefeated;
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

/** Shared helper: apply XP gain, level-up, spell/skill unlock. */
export function applyXpGain(state: GameState, xpGain: number): void {
    if (!state.player || xpGain <= 0) return;

    state.player.xp += xpGain;
    if (state.player.xp >= state.player.maxXp) {
        state.player.xp -= state.player.maxXp;
        state.player.level += 1;
        state.player.maxXp += 100;
        state.player.maxHp += 10;
        state.player.hp = state.player.maxHp;
        state.player.stress = Math.max(0, state.player.stress - 20);

        const newSpell = getSpellUnlockForLevel(state.player.characterClass, state.player.level);
        const newSkill = getSkillUnlockForLevel(state.player.characterClass, state.player.level);

        if (newSpell && !state.player.spells.includes(newSpell)) {
            state.player.spells = [...state.player.spells, newSpell];
            const spellName = SPELLS[newSpell]?.name ?? newSpell;
            state.logs.push({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                message: `LEVEL UP! You are now level ${state.player.level}! Unlocked: ${spellName}.`,
                type: "system"
            });
        } else if (newSkill) {
            const skillList = state.player.skills ?? [];
            if (!skillList.includes(newSkill)) {
                state.player.skills = [...skillList, newSkill];
                state.logs.push({
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    message: `LEVEL UP! You are now level ${state.player.level}! Unlocked skill: ${newSkill}.`,
                    type: "system"
                });
            } else {
                state.logs.push({
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`,
                    type: "system"
                });
            }
        } else {
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`,
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
