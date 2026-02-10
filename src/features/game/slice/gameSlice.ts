import { createSlice } from '@reduxjs/toolkit';
import { generateRandomEnemy, generateRandomMerchant } from '@/lib/game/engine';
import { SPELLS, getSpellUnlockForLevel, getSkillUnlockForLevel, getSkillsForLevels } from '@/lib/game/mechanics';
import { resolveUnexpectedlyEffect } from '@/lib/game/narrativeHelpers';
import { applyDamageDealtBonus, applyDamageTakenReduction } from '@/lib/game/skills';
import * as actions from './actions';
import { initialState, initialSessionScore, seedQuests } from './constants';
import * as thunks from './thunks';
import type { GameState } from './types';

export type { RoomCoordinates, InitializeGameOptions } from './types';
export { addLog, selectSpell, clearPendingQuestFacts } from './actions';
export {
  initializeGame,
  askOracle,
  communeWithVoid,
  movePlayer,
  scanSector,
  castSpell,
  engageHostiles,
  respawnPlayer,
  tradeBuy,
  tradeSell,
  pickUpGroundLoot,
  useItem,
  equipItem,
  unequipItem,
  harvestCrop,
  craftItem,
  runAutoplayTick,
} from './thunks';

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(actions.addLog, (state, action) => {
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: action.payload.message,
                type: action.payload.type,
            });
        });
        builder.addCase(actions.selectSpell, (state, action) => {
            state.selectedSpellId = action.payload;
        });
        builder.addCase(actions.clearPendingQuestFacts, (state) => {
            state.pendingQuestFacts = [];
        });

        // Initialize
        builder.addCase(thunks.initializeGame.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(thunks.initializeGame.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isInitialized = true;
            state.player = action.payload.player;
            const initialRoom = action.payload.initialRoom;
            state.currentRoom = initialRoom;
            state.exploredRooms = { [initialRoom.id]: initialRoom };
            state.roomCoordinates = { [initialRoom.id]: { x: 0, y: 0 } };
            state.activeQuests = seedQuests();
            state.sessionScore = {
                ...initialSessionScore(),
                spiritEarned: action.payload.player.spirit ?? 0,
            };
            state.sessionComplete = null;
            state.pendingQuestFacts = [];
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: "SYSTEM: Connection Stable. Welcome to Quadar Tower, Ranger.",
                type: "system"
            });
        });

        // Oracle / Commune
        builder.addCase(thunks.askOracle.fulfilled, (state, action) => {
            if (!state.player) return;
            const result = action.payload;
            const player = state.player;

            // Surge Update
            let newSurge = player.surgeCount;
            if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
            player.surgeCount = newSurge;

            // Handle Unexpectedly Event
            if (result.unexpectedRoll) {
                const effect = resolveUnexpectedlyEffect(result.unexpectedRoll, result.unexpectedEvent || "");
                if (effect.applyEnteringRed && state.currentRoom) {
                    // Add random enemy
                    state.currentRoom.enemies.push(generateRandomEnemy());
                    state.currentRoom.hazards.push("Threat Imminent");
                }
                if (effect.applyEnterStageLeft && state.currentRoom) {
                    // Add merchant and ally
                    if (!state.currentRoom.merchants) state.currentRoom.merchants = [];
                    state.currentRoom.merchants.push(generateRandomMerchant());

                    if (!state.currentRoom.allies) state.currentRoom.allies = [];
                    state.currentRoom.allies.push({ id: Date.now().toString(), name: "Fellow Ranger" });
                }
            }

            // Log is handled in thunk but we add the Oracle result here too for persistent log state
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: `Oracle: ${result.description} (Roll: ${result.roll}, Surge: ${newSurge})`,
                type: "oracle"
            });
        });

        builder.addCase(thunks.communeWithVoid.fulfilled, (state, action) => {
            if (!state.player || !action.payload) return;
            const result = action.payload;
            const player = state.player;

            // Surge Update
            let newSurge = player.surgeCount;
            if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
            player.surgeCount = newSurge;

            // Handle Unexpectedly Event
            if (result.unexpectedRoll) {
                const effect = resolveUnexpectedlyEffect(result.unexpectedRoll, result.unexpectedEvent || "");
                if (effect.applyEnteringRed && state.currentRoom) {
                    state.currentRoom.enemies.push(generateRandomEnemy());
                    state.currentRoom.hazards.push("Threat Imminent");
                }
                if (effect.applyEnterStageLeft && state.currentRoom) {
                    if (!state.currentRoom.merchants) state.currentRoom.merchants = [];
                    state.currentRoom.merchants.push(generateRandomMerchant());

                    if (!state.currentRoom.allies) state.currentRoom.allies = [];
                    state.currentRoom.allies.push({ id: Date.now().toString(), name: "Fellow Ranger" });
                }
            }
        });

        // Move
        builder.addCase(thunks.movePlayer.fulfilled, (state, action) => {
            const { room: newRoom } = action.payload;
            const prevRoom = state.currentRoom;
            if (!prevRoom) return;
            const prevCoord = state.roomCoordinates[prevRoom.id] ?? { x: 0, y: 0 };
            const direction = action.payload.direction;
            const delta = { North: { x: 0, y: -1 }, South: { x: 0, y: 1 }, East: { x: 1, y: 0 }, West: { x: -1, y: 0 } }[direction] ?? { x: 0, y: 0 };
            const newCoord = { x: prevCoord.x + delta.x, y: prevCoord.y + delta.y };
            state.currentRoom = newRoom;
            state.exploredRooms[newRoom.id] = newRoom;
            state.roomCoordinates[newRoom.id] = newCoord;
            if (state.sessionScore) state.sessionScore.roomsExplored += 1;
            // Rescue: find Fellow Ranger in this room
            if (newRoom.allies?.length && state.sessionScore) {
                const rescue = state.activeQuests.find(q => q.kind === "rescue" && !q.complete);
                if (rescue) {
                    rescue.progress = 1;
                    rescue.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${rescue.label}.`);
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${rescue.label}.`, type: "system" });
                    if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                        state.sessionComplete = "quests";
                        state.sessionScore.endTime = Date.now();
                    }
                }
            }
        });

        // Scan: advance reconnaissance and session score
        builder.addCase(thunks.scanSector.fulfilled, (state) => {
            if (state.sessionScore) state.sessionScore.roomsScanned += 1;
            const recon = state.activeQuests.find(q => q.kind === "reconnaissance" && !q.complete);
            if (recon && state.sessionScore) {
                recon.progress = state.sessionScore.roomsScanned;
                if (recon.progress >= recon.target) {
                    recon.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${recon.label}.`);
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${recon.label}.`, type: "system" });
                    if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                        state.sessionComplete = "quests";
                        state.sessionScore.endTime = Date.now();
                    }
                }
            }
        });

        // Combat
        builder.addCase(thunks.engageHostiles.fulfilled, (state, action) => {
            if (!action.payload || !state.player || !state.currentRoom) return;
            const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;
            const skills = state.player.skills ?? [];
            const actualPlayerDamage = applyDamageTakenReduction(skills, playerDamage);
            const actualEnemyDamage = applyDamageDealtBonus(skills, enemyDamage);

            // Update Player
            state.player.hp -= actualPlayerDamage;
            if (state.player.hp < 0) state.player.hp = 0;
            state.player.stress += 1;

            // Update Enemy
            const enemies = state.currentRoom.enemies.map(e => {
                if (e.id === enemyId) {
                    return {
                        ...e,
                        hp: e.hp - actualEnemyDamage,
                        lastDamageTime: actualEnemyDamage > 0 ? Date.now() : e.lastDamageTime,
                        lastAttackTime: Date.now() // Enemy always retaliates in this model
                    };
                }
                return e;
            });

            if (enemyDefeated) {
                // Remove defeated enemy
                state.currentRoom.enemies = enemies.filter(e => e.id !== enemyId);
                // Loot
                const lootItems = (action.payload as { lootItems?: import("@/lib/game/types").Item[] }).lootItems ?? [];
                for (const loot of lootItems) {
                    state.player.inventory.push(loot);
                }
                if (lootItems.length > 0) {
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Loot: ${lootItems.map((l) => l.name).join(", ")}.`, type: "system" });
                }
                // Rewards
                state.player.spirit = (state.player.spirit || 0) + 5;
                state.player.blood = (state.player.blood || 0) + 2;
                if (state.sessionScore) {
                    state.sessionScore.enemiesDefeated += 1;
                    state.sessionScore.spiritEarned += 5;
                    // Hostiles quest
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

                // XP Logic and level-up spell/skill unlock
                const xpGain = (action.payload as any).xpGain || 0;
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
                            const skills = state.player.skills ?? [];
                            if (!skills.includes(newSkill)) {
                                state.player.skills = [...skills, newSkill];
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

        // Cast Spell
        builder.addCase(thunks.castSpell.fulfilled, (state, action) => {
            if (!action.payload || !state.player || !state.currentRoom) return;
            const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;
            const spellSkills = state.player.skills ?? [];
            const actualPlayerDamageSpell = applyDamageTakenReduction(spellSkills, playerDamage);
            const actualEnemyDamageSpell = applyDamageDealtBonus(spellSkills, enemyDamage);

            // Update Player
            state.player.hp -= actualPlayerDamageSpell;
            if (state.player.hp < 0) state.player.hp = 0;
            state.player.stress += 1;

            // Update Enemy
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
                // Remove defeated enemy
                state.currentRoom.enemies = enemiesSpell.filter(e => e.id !== enemyId);
                // Loot
                const lootItemsSpell = (action.payload as { lootItems?: import("@/lib/game/types").Item[] }).lootItems ?? [];
                for (const loot of lootItemsSpell) {
                    state.player.inventory.push(loot);
                }
                if (lootItemsSpell.length > 0) {
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Loot: ${lootItemsSpell.map((l) => l.name).join(", ")}.`, type: "system" });
                }
                // Rewards
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

                // XP Logic and level-up spell/skill unlock
                const xpGain = (action.payload as any).xpGain || 0;
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
                            const skills = state.player.skills ?? [];
                            if (!skills.includes(newSkill)) {
                                state.player.skills = [...skills, newSkill];
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

        // Respawn: session ends on death
        builder.addCase(thunks.respawnPlayer.fulfilled, (state) => {
            if (!state.player || !state.currentRoom) return;
            state.player.hp = state.player.maxHp;
            state.player.stress = 0;
            state.currentRoom.enemies = [];
            state.sessionComplete = null; // Resume play
            // state.sessionScore.endTime = Date.now(); // Do not end session
        });

        // Trade
        builder.addCase(thunks.tradeBuy.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { item, spiritCost, bloodCost } = action.payload;

            state.player.spirit = (state.player.spirit || 0) - spiritCost;
            state.player.blood = (state.player.blood || 0) - bloodCost;
            state.player.inventory.push({ ...item });

            if (state.sessionScore) {
                state.sessionScore.merchantTrades += 1;
                const merchantQuest = state.activeQuests.find(q => q.kind === "merchant" && !q.complete);
                if (merchantQuest) {
                    merchantQuest.progress = state.sessionScore.merchantTrades;
                    if (merchantQuest.progress >= merchantQuest.target) {
                        merchantQuest.complete = true;
                        state.sessionScore.questsCompleted += 1;
                        state.pendingQuestFacts.push(`Completed quest: ${merchantQuest.label}.`);
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${merchantQuest.label}.`, type: "system" });
                        if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                            state.sessionComplete = "quests";
                            state.sessionScore.endTime = Date.now();
                        }
                    }
                }
            }
        });

        builder.addCase(thunks.tradeSell.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { itemIndex, value } = action.payload;

            state.player.inventory.splice(itemIndex, 1);
            state.player.spirit = (state.player.spirit || 0) + value;

            if (state.sessionScore) {
                state.sessionScore.merchantTrades += 1;
                const merchantQuest = state.activeQuests.find(q => q.kind === "merchant" && !q.complete);
                if (merchantQuest) {
                    merchantQuest.progress = state.sessionScore.merchantTrades;
                    if (merchantQuest.progress >= merchantQuest.target) {
                        merchantQuest.complete = true;
                        state.sessionScore.questsCompleted += 1;
                        state.pendingQuestFacts.push(`Completed quest: ${merchantQuest.label}.`);
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${merchantQuest.label}.`, type: "system" });
                        if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                            state.sessionComplete = "quests";
                            state.sessionScore.endTime = Date.now();
                        }
                    }
                }
            }
        });

        // Inventory Actions
        builder.addCase(thunks.useItem.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { itemIndex, effect } = action.payload;

            // Remove item
            state.player.inventory.splice(itemIndex, 1);

            // Apply effect
            if (effect === "heal_hp_20") {
                state.player.hp = Math.min(state.player.maxHp, state.player.hp + 20);
            } else if (effect === "heal_stress_10") {
                state.player.stress = Math.max(0, state.player.stress - 10);
            }
        });

        builder.addCase(thunks.equipItem.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { itemIndex, slot, item } = action.payload;

            // Remove from inventory
            state.player.inventory.splice(itemIndex, 1);

            // If something already in slot, move to inventory
            const existing = state.player.equipment?.[slot];
            if (existing) {
                state.player.inventory.push(existing);
            }

            // Set new item
            if (!state.player.equipment) state.player.equipment = {};
            state.player.equipment[slot] = item;
        });

        builder.addCase(thunks.unequipItem.fulfilled, (state, action) => {
            if (!action.payload || !state.player || !state.player.equipment) return;
            const { slot } = action.payload;

            // Move to inventory
            const item = state.player.equipment[slot];
            if (item) {
                state.player.inventory.push(item);
                delete state.player.equipment[slot];
            }
        });

        // Base Camp Logic
        builder.addCase(thunks.harvestCrop.fulfilled, (state, action) => {
            if (!action.payload || !state.currentRoom?.features) return;
            const { featureIndex, item } = action.payload;

            // Reset plot
            const plot = state.currentRoom.features[featureIndex];
            if (plot && plot.type === 'farming_plot') {
                plot.progress = 0;
                plot.ready = false;
            }

            // Add item
            state.player?.inventory.push(item);
        });

        builder.addCase(thunks.pickUpGroundLoot.fulfilled, (state, action) => {
            if (!action.payload || !state.player || !state.currentRoom?.groundLoot) return;
            const { item, itemId } = action.payload;
            state.player.inventory.push(item);
            state.currentRoom.groundLoot = state.currentRoom.groundLoot.filter((i) => i.id !== itemId);
        });

        builder.addCase(thunks.craftItem.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { craftedItem, ingredients } = action.payload;
            for (const ing of ingredients) {
                let remaining = ing.quantity;
                state.player.inventory = state.player.inventory.filter((i) => {
                    if (remaining > 0 && i.name === ing.name) {
                        remaining--;
                        return false;
                    }
                    return true;
                });
            }
            state.player.inventory.push(craftedItem);
        });

        // Autoplay Tick - Grow Crops
        builder.addCase(thunks.runAutoplayTick.fulfilled, (state) => {
            // Passive crop growth on every tick
            if (state.currentRoom?.features) {
                state.currentRoom.features.forEach(f => {
                    if (f.type === 'farming_plot' && !f.ready) {
                        f.progress += 20; // 5 ticks to grow
                        if (f.progress >= 100) {
                            f.progress = 100;
                            f.ready = true;
                        }
                    }
                });
            }
        });
    }
});

// Selectors
export const selectPlayer = (state: { game: GameState }) => state.game.player;
export const selectCurrentRoom = (state: { game: GameState }) => state.game.currentRoom;
export const selectExploredRooms = (state: { game: GameState }) => state.game.exploredRooms;
export const selectRoomCoordinates = (state: { game: GameState }) => state.game.roomCoordinates;
export const selectLogs = (state: { game: GameState }) => state.game.logs;
export const selectIsInitialized = (state: { game: GameState }) => state.game.isInitialized;
export const selectIsLoading = (state: { game: GameState }) => state.game.isLoading;
export const selectSelectedSpellId = (state: { game: GameState }) => state.game.selectedSpellId;
export const selectActiveQuests = (state: { game: GameState }) => state.game.activeQuests;
export const selectSessionScore = (state: { game: GameState }) => state.game.sessionScore;
export const selectSessionComplete = (state: { game: GameState }) => state.game.sessionComplete;
export const selectPendingQuestFacts = (state: { game: GameState }) => state.game.pendingQuestFacts;

export default gameSlice.reducer;
