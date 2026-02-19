import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { applyDamageDealtBonus, applyDamageTakenReduction } from '@/features/game/skills';
import type { Item, StatusEffect } from '@/features/game/types';
import * as thunks from '../thunks';
import type { GameState } from '../types';
import { applyLoot, applyCombatRewards, applyXpGain } from './loot';
import { addDeathReducers } from './death';

function addEngageHostilesReducer(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.engageHostiles.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.currentArea) return;
        const { npcId, npcDamage, npcDefeated, playerDamage } = action.payload;
        const capabilities = state.player.capabilities ?? [];
        const actualPlayerDamage = applyDamageTakenReduction(capabilities, playerDamage);
        const actualNPCDamage = applyDamageDealtBonus(capabilities, state.player.activeEffects, npcDamage);

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

        const companionUpdates = (action.payload as { companionUpdates?: { id: string; damageTaken: number }[] }).companionUpdates;
        if (companionUpdates && state.player.companions) {
            for (const update of companionUpdates) {
                const cmpIndex = state.player.companions.findIndex(c => c.id === update.id);
                if (cmpIndex !== -1) {
                    const cmp = state.player.companions[cmpIndex];
                    cmp.hp -= update.damageTaken;
                    if (cmp.hp <= 0) {
                        state.logs.push({
                            id: Date.now().toString(),
                            timestamp: Date.now(),
                            message: `${cmp.name} has fallen in battle!`,
                            type: "combat"
                        });
                        state.player.companions.splice(cmpIndex, 1);
                    }
                }
            }
        }

        const npcs = state.currentArea.npcs.map(e => {
            // Process NPC Effects (DoT & Duration)
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

            if (e.id === npcId) {
                const afterAttackHp = currentHp - actualNPCDamage;
                return {
                    ...e,
                    hp: afterAttackHp,
                    lastDamageTime: actualNPCDamage > 0 ? Date.now() : e.lastDamageTime,
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

        if (npcDefeated) {
            state.currentArea.npcs = npcs.filter(e => e.id !== npcId);
            const lootItems = (action.payload as { lootItems?: Item[] }).lootItems ?? [];
            applyLoot(state, lootItems);
            applyCombatRewards(state, 1);
            const xpGain = (action.payload as { xpGain?: number }).xpGain || 0;
            applyXpGain(state, xpGain);
        } else {
            state.currentArea.npcs = npcs;
        }
    });
}

function addCastCapabilityReducer(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.castCapability.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.currentArea) return;

        const payload = action.payload as {
            npcId: string;
            npcDamage: number;
            npcDefeated: boolean;
            playerDamage: number;
            xpGain: number;
            lootItems: Item[];
            aoeUpdates?: { npcId: string; damage: number; defeated: boolean; statusEffects?: StatusEffect[] }[];
            playerStatusUpdates?: StatusEffect[];
            playerHeal?: number;
        };

        const { playerDamage, aoeUpdates, playerStatusUpdates, playerHeal } = payload;
        const capabilities = state.player.capabilities ?? [];

        // 1. Apply Player Damage, Heal, and Status
        const actualPlayerDamageCapability = applyDamageTakenReduction(capabilities, playerDamage);

        // Apply Heal
        if (playerHeal && playerHeal > 0) {
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + playerHeal);
        }

        state.player.hp -= actualPlayerDamageCapability;
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

        // 2. Apply NPC Damage (AoE or Single) and Status
        let updates = aoeUpdates;
        if (!updates) {
            updates = [{
                npcId: payload.npcId,
                damage: payload.npcDamage,
                defeated: payload.npcDefeated,
                statusEffects: []
            }];
        }

        const npcsCapability = state.currentArea.npcs.map(e => {
            const update = updates?.find(u => u.npcId === e.id);
            if (update) {
                const actualDamage = applyDamageDealtBonus(capabilities, state.player?.activeEffects, update.damage);
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
        const livingNPCs = npcsCapability.filter(e => e.hp > 0);
        const deadNPCsCount = state.currentArea.npcs.length - livingNPCs.length;

        if (deadNPCsCount > 0) {
            state.currentArea.npcs = livingNPCs;
            applyLoot(state, payload.lootItems ?? []);
            applyCombatRewards(state, deadNPCsCount);
        } else {
            state.currentArea.npcs = npcsCapability;
        }

        applyXpGain(state, payload.xpGain || 0);
    });
    builder.addCase(thunks.castCapability.rejected, (state, action) => {
        state.logs.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message: `Capability execution failed: ${action.error.message || "Unknown error"}`,
            type: "system"
        });
    });
}

export function addCombatReducers(builder: ActionReducerMapBuilder<GameState>): void {
    addEngageHostilesReducer(builder);
    addCastCapabilityReducer(builder);
    addDeathReducers(builder);
}
