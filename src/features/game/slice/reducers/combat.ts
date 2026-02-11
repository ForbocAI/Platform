import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { SPELLS, getSpellUnlockForLevel, getSkillUnlockForLevel } from '@/features/game/mechanics';
import { applyDamageDealtBonus, applyDamageTakenReduction } from '@/features/game/skills';
import type { Item } from '@/features/game/types';
import * as thunks from '../thunks';
import type { GameState } from '../types';

function addEngageHostilesReducer(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.engageHostiles.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.currentRoom) return;
        const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;
        const skills = state.player.skills ?? [];
        const actualPlayerDamage = applyDamageTakenReduction(skills, playerDamage);
        const actualEnemyDamage = applyDamageDealtBonus(skills, enemyDamage);

        state.player.hp -= actualPlayerDamage;
        if (state.player.hp < 0) state.player.hp = 0;
        state.player.stress += 1;

        const servitorUpdates = (action.payload as { servitorUpdates?: { id: string; damageTaken: number }[] }).servitorUpdates;
        if (servitorUpdates && state.player.servitors) {
            for (const update of servitorUpdates) {
                const srvIndex = state.player.servitors.findIndex(c => c.id === update.id);
                if (srvIndex !== -1) {
                    const srv = state.player.servitors[srvIndex];
                    srv.hp -= update.damageTaken;
                    if (srv.hp <= 0) {
                        state.logs.push({
                            id: Date.now().toString(),
                            timestamp: Date.now(),
                            message: `${srv.name} has fallen in battle!`,
                            type: "combat"
                        });
                        state.player.servitors.splice(srvIndex, 1);
                    }
                }
            }
        }

        const enemies = state.currentRoom.enemies.map(e => {
            if (e.id === enemyId) {
                return {
                    ...e,
                    hp: e.hp - actualEnemyDamage,
                    lastDamageTime: actualEnemyDamage > 0 ? Date.now() : e.lastDamageTime,
                    lastAttackTime: Date.now()
                };
            }
            return e;
        });

        if (enemyDefeated) {
            state.currentRoom.enemies = enemies.filter(e => e.id !== enemyId);
            const lootItems = (action.payload as { lootItems?: Item[] }).lootItems ?? [];
            for (const loot of lootItems) {
                state.player.inventory.push(loot);
            }
            if (lootItems.length > 0) {
                state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Loot: ${lootItems.map((l) => l.name).join(", ")}.`, type: "system" });
            }
            state.player.spirit = (state.player.spirit || 0) + 5;
            state.player.blood = (state.player.blood || 0) + 2;
            if (state.sessionScore) {
                state.sessionScore.enemiesDefeated += 1;
                state.sessionScore.spiritEarned += 5;
                const hostilesQuest = state.activeQuests.find(q => q.kind === "hostiles" && !q.complete);
                if (hostilesQuest) {
                    hostilesQuest.progress = state.sessionScore.enemiesDefeated;
                    if (hostilesQuest.progress >= hostilesQuest.target) {
                        hostilesQuest.complete = true;
                        state.sessionScore.questsCompleted += 1;
                        state.pendingQuestFacts.push(`Completed quest: ${hostilesQuest.label}.`);
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${hostilesQuest.label}.`, type: "system" });
                        if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                            state.sessionComplete = "quests";
                            state.sessionScore.endTime = Date.now();
                        }
                    }
                }
            }

            const xpGain = (action.payload as { xpGain?: number }).xpGain || 0;
            if (xpGain > 0) {
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
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked: ${spellName}.`, type: "system" });
                    } else if (newSkill) {
                        const skillList = state.player.skills ?? [];
                        if (!skillList.includes(newSkill)) {
                            state.player.skills = [...skillList, newSkill];
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked skill: ${newSkill}.`, type: "system" });
                        } else {
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                        }
                    } else {
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                    }
                } else {
                    state.logs.push({
                        id: Date.now().toString(),
                        timestamp: Date.now(),
                        message: `Gained ${xpGain} XP.`,
                        type: "system"
                    });
                }
            }
        } else {
            state.currentRoom.enemies = enemies;
        }
    });
}

function addCastSpellReducer(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.castSpell.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.currentRoom) return;
        const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;
        const spellSkills = state.player.skills ?? [];
        const actualPlayerDamageSpell = applyDamageTakenReduction(spellSkills, playerDamage);
        const actualEnemyDamageSpell = applyDamageDealtBonus(spellSkills, enemyDamage);

        state.player.hp -= actualPlayerDamageSpell;
        if (state.player.hp < 0) state.player.hp = 0;
        state.player.stress += 1;

        const enemiesSpell = state.currentRoom.enemies.map(e => {
            if (e.id === enemyId) {
                return {
                    ...e,
                    hp: e.hp - actualEnemyDamageSpell,
                    lastDamageTime: actualEnemyDamageSpell > 0 ? Date.now() : e.lastDamageTime,
                    lastAttackTime: Date.now()
                };
            }
            return e;
        });

        if (enemyDefeated) {
            state.currentRoom.enemies = enemiesSpell.filter(e => e.id !== enemyId);
            const lootItemsSpell = (action.payload as { lootItems?: Item[] }).lootItems ?? [];
            for (const loot of lootItemsSpell) {
                state.player.inventory.push(loot);
            }
            if (lootItemsSpell.length > 0) {
                state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Loot: ${lootItemsSpell.map((l) => l.name).join(", ")}.`, type: "system" });
            }
            state.player.spirit = (state.player.spirit || 0) + 5;
            state.player.blood = (state.player.blood || 0) + 2;
            if (state.sessionScore) {
                state.sessionScore.enemiesDefeated += 1;
                state.sessionScore.spiritEarned += 5;
                const hostilesQuest = state.activeQuests.find(q => q.kind === "hostiles" && !q.complete);
                if (hostilesQuest) {
                    hostilesQuest.progress = state.sessionScore.enemiesDefeated;
                    if (hostilesQuest.progress >= hostilesQuest.target) {
                        hostilesQuest.complete = true;
                        state.sessionScore.questsCompleted += 1;
                        state.pendingQuestFacts.push(`Completed quest: ${hostilesQuest.label}.`);
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${hostilesQuest.label}.`, type: "system" });
                        if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                            state.sessionComplete = "quests";
                            state.sessionScore.endTime = Date.now();
                        }
                    }
                }
            }

            const xpGain = (action.payload as { xpGain?: number }).xpGain || 0;
            if (xpGain > 0) {
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
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked: ${spellName}.`, type: "system" });
                    } else if (newSkill) {
                        const skillList = state.player.skills ?? [];
                        if (!skillList.includes(newSkill)) {
                            state.player.skills = [...skillList, newSkill];
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked skill: ${newSkill}.`, type: "system" });
                        } else {
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                        }
                    } else {
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                    }
                } else {
                    state.logs.push({
                        id: Date.now().toString(),
                        timestamp: Date.now(),
                        message: `Gained ${xpGain} XP.`,
                        type: "system"
                    });
                }
            }
        } else {
            state.currentRoom.enemies = enemiesSpell;
        }
    });
}

export function addCombatReducers(builder: ActionReducerMapBuilder<GameState>): void {
    addEngageHostilesReducer(builder);
    addCastSpellReducer(builder);
    builder.addCase(thunks.respawnPlayer.fulfilled, (state) => {
        if (!state.player || !state.currentRoom) return;
        state.player.hp = state.player.maxHp;
        state.player.stress = 0;
        state.currentRoom.enemies = [];
        state.sessionComplete = null;
    });
}
