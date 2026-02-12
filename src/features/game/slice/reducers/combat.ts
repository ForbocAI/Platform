import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { applyDamageDealtBonus, applyDamageTakenReduction } from '@/features/game/skills';
import type { Item, StatusEffect } from '@/features/game/types';
import * as thunks from '../thunks';
import type { GameState } from '../types';
import { applyLoot, applyCombatRewards, applyXpGain } from './loot';
import { addDeathReducers } from './death';

function addEngageHostilesReducer(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.engageHostiles.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.currentRoom) return;
        const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;
        const skills = state.player.skills ?? [];
        const actualPlayerDamage = applyDamageTakenReduction(skills, playerDamage);
        const actualEnemyDamage = applyDamageDealtBonus(skills, state.player.activeEffects, enemyDamage);

        // Process Player Effects (DoT & Duration)
        if (state.player.activeEffects) {
            const nextEffects: typeof state.player.activeEffects = [];
            for (const effect of state.player.activeEffects) {
                if (effect.damagePerTurn) {
                    state.player.hp -= effect.damagePerTurn;
                    state.logs.push({
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: Date.now(),
                        message: `You take ${effect.damagePerTurn} damage from ${effect.name}.`,
                        type: "combat"
                    });
                }
                const nextDuration = effect.duration - 1;
                if (nextDuration > 0) {
                    nextEffects.push({ ...effect, duration: nextDuration });
                } else {
                    state.logs.push({
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: Date.now(),
                        message: `${effect.name} fades.`,
                        type: "combat"
                    });
                }
            }
            state.player.activeEffects = nextEffects;
        }

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
            // Process Enemy Effects (DoT & Duration)
            let currentHp = e.hp;
            let currentEffects = e.activeEffects || [];
            const nextEffects: typeof currentEffects = [];

            for (const effect of currentEffects) {
                if (effect.damagePerTurn) {
                    currentHp -= effect.damagePerTurn;
                    state.logs.push({
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: Date.now(),
                        message: `${e.name} takes ${effect.damagePerTurn} damage from ${effect.name}.`,
                        type: "combat"
                    });
                }
                const nextDuration = effect.duration - 1;
                if (nextDuration > 0) {
                    nextEffects.push({ ...effect, duration: nextDuration });
                }
            }

            if (e.id === enemyId) {
                const afterAttackHp = currentHp - actualEnemyDamage;
                return {
                    ...e,
                    hp: afterAttackHp,
                    lastDamageTime: actualEnemyDamage > 0 ? Date.now() : e.lastDamageTime,
                    lastAttackTime: Date.now(),
                    activeEffects: nextEffects
                };
            }

            return {
                ...e,
                hp: currentHp,
                activeEffects: nextEffects
            };
        });

        if (enemyDefeated) {
            state.currentRoom.enemies = enemies.filter(e => e.id !== enemyId);
            const lootItems = (action.payload as { lootItems?: Item[] }).lootItems ?? [];
            applyLoot(state, lootItems);
            applyCombatRewards(state, 1);
            const xpGain = (action.payload as { xpGain?: number }).xpGain || 0;
            applyXpGain(state, xpGain);
        } else {
            state.currentRoom.enemies = enemies;
        }
    });
}

function addCastSpellReducer(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.castSpell.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.currentRoom) return;

        const payload = action.payload as {
            enemyId: string;
            enemyDamage: number;
            enemyDefeated: boolean;
            playerDamage: number;
            xpGain: number;
            lootItems: Item[];
            aoeUpdates?: { enemyId: string; damage: number; defeated: boolean; statusEffects?: StatusEffect[] }[];
            playerStatusUpdates?: StatusEffect[];
            playerHeal?: number;
        };

        const { playerDamage, aoeUpdates, playerStatusUpdates, playerHeal } = payload;
        const spellSkills = state.player.skills ?? [];

        // 1. Apply Player Damage, Heal, and Status
        const actualPlayerDamageSpell = applyDamageTakenReduction(spellSkills, playerDamage);

        // Apply Heal
        if (playerHeal && playerHeal > 0) {
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + playerHeal);
        }

        state.player.hp -= actualPlayerDamageSpell;
        if (state.player.hp < 0) state.player.hp = 0;
        state.player.stress += 1;

        // Apply Player Status Updates
        if (playerStatusUpdates && playerStatusUpdates.length > 0) {
            state.player.activeEffects = state.player.activeEffects || [];
            for (const effect of playerStatusUpdates) {
                state.player.activeEffects = state.player.activeEffects.filter(e => e.id !== effect.id);
                state.player.activeEffects.push(effect);
            }
        }

        // 2. Apply Enemy Damage (AoE or Single) and Status
        let updates = aoeUpdates;
        if (!updates) {
            updates = [{
                enemyId: payload.enemyId,
                damage: payload.enemyDamage,
                defeated: payload.enemyDefeated,
                statusEffects: []
            }];
        }

        const enemiesSpell = state.currentRoom.enemies.map(e => {
            const update = updates?.find(u => u.enemyId === e.id);
            if (update) {
                const actualDamage = applyDamageDealtBonus(spellSkills, state.player?.activeEffects, update.damage);
                let newHp = e.hp - actualDamage;

                let newEffects = e.activeEffects || [];
                if (update.statusEffects && update.statusEffects.length > 0) {
                    for (const effect of update.statusEffects) {
                        newEffects = newEffects.filter(ef => ef.id !== effect.id);
                        newEffects.push(effect);
                    }
                }

                return {
                    ...e,
                    hp: newHp,
                    lastDamageTime: actualDamage > 0 ? Date.now() : e.lastDamageTime,
                    lastAttackTime: Date.now(),
                    activeEffects: newEffects
                };
            }
            return e;
        });

        // 3. Handle Death and Loot
        const livingEnemies = enemiesSpell.filter(e => e.hp > 0);
        const deadEnemiesCount = state.currentRoom.enemies.length - livingEnemies.length;

        if (deadEnemiesCount > 0) {
            state.currentRoom.enemies = livingEnemies;
            applyLoot(state, payload.lootItems ?? []);
            applyCombatRewards(state, deadEnemiesCount);
        } else {
            state.currentRoom.enemies = enemiesSpell;
        }

        applyXpGain(state, payload.xpGain || 0);
    });
    builder.addCase(thunks.castSpell.rejected, (state, action) => {
        state.logs.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message: `Spell cast failed: ${action.error.message || "Unknown error"}`,
            type: "system"
        });
    });
}

export function addCombatReducers(builder: ActionReducerMapBuilder<GameState>): void {
    addEngageHostilesReducer(builder);
    addCastSpellReducer(builder);
    addDeathReducers(builder);
}
