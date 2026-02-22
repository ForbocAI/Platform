import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../orchestrators';
import type { GameState } from '../../store/types';
import type { Item, EquipmentSlot, Companion } from '@/features/game/types';

export function addInventoryReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.consumeItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { itemIndex, effect } = action.payload;

        if (effect === 'hire_companion') {
            const contractDetails = (action.payload as { contractDetails?: Item["contractDetails"]; now?: number }).contractDetails;
            if (contractDetails) {
                state.player.inventory.items.splice(itemIndex, 1);
                if (!state.player.companions) state.player.companions = [];
                const newCompanion: Companion = {
                    id: (action.payload as { now?: number }).now?.toString() ?? Date.now().toString(),
                    active: true,
                    type: "companion",
                    faction: "ally",
                    name: contractDetails.targetName,
                    role: contractDetails.role as "Warrior" | "Scout" | "Mystic",
                    stats: {
                        hp: contractDetails.maxHp,
                        maxHp: contractDetails.maxHp,
                        stress: 0,
                        maxStress: 100,
                        speed: 1,
                        defense: 10,
                        damage: 5,
                        invulnerable: 0,
                    },
                    inventory: {
                        weapons: [],
                        currentWeaponIndex: 0,
                        items: [],
                        equipment: {},
                        spirit: 0,
                        blood: 0,
                    },
                    capabilities: {
                        learned: [],
                    },
                    activeEffects: [],
                    x: 0, y: 0, vx: 0, vy: 0, width: 14, height: 24,
                    isGrounded: true, facingRight: true,
                    state: "idle", frame: 0, animTimer: 0,
                };
                state.player.companions.push(newCompanion);
            }
            return;
        }

        state.player.inventory.items.splice(itemIndex, 1);

        if (effect === "heal_hp_20") {
            state.player.stats.hp = Math.min(state.player.stats.maxHp, state.player.stats.hp + 20);
        } else if (effect === "heal_stress_10") {
            state.player.stats.stress = Math.max(0, state.player.stats.stress - 10);
        }
    });

    builder.addCase(thunks.sacrificeItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { itemIndex, gain } = action.payload;

        state.player.inventory.items.splice(itemIndex, 1);
        state.player.inventory.spirit = (state.player.inventory.spirit || 0) + gain;

        if (state.sessionScore) {
            state.sessionScore.resourcesEarned += gain;
        }
    });

    builder.addCase(thunks.equipItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { itemIndex, slot, item } = action.payload;

        state.player.inventory.items.splice(itemIndex, 1);

        const equipment = state.player.inventory.equipment as Record<EquipmentSlot, Item | undefined> | undefined;
        const existing = equipment?.[slot];
        if (existing) {
            state.player.inventory.items.push(existing);
        }

        if (!state.player.inventory.equipment) state.player.inventory.equipment = {};
        (state.player.inventory.equipment as Record<EquipmentSlot, Item | undefined>)[slot] = item;
    });

    builder.addCase(thunks.unequipItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.player.inventory.equipment) return;
        const { slot } = action.payload;

        const equipment = state.player.inventory.equipment as Record<EquipmentSlot, Item | undefined> | undefined;
        const item = equipment?.[slot];
        if (item) {
            state.player.inventory.items.push(item);
            delete (state.player.inventory.equipment as Record<EquipmentSlot, Item | undefined>)[slot];
        }
    });

    builder.addCase(thunks.harvestCrop.fulfilled, (state, action) => {
        if (!action.payload || !state.currentArea?.features) return;
        const { featureIndex, item } = action.payload;

        const plot = state.currentArea.features[featureIndex];
        if (plot && plot.type === 'resource_plot') {
            plot.progress = 0;
            plot.ready = false;
        }

        state.player?.inventory.items.push(item);
    });

    builder.addCase(thunks.pickUpGroundLoot.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.currentArea?.groundLoot) return;
        const { item, itemId } = action.payload;
        state.player.inventory.items.push(item);
        state.currentArea.groundLoot = state.currentArea.groundLoot.filter((i) => i.id !== itemId);
    });

    builder.addCase(thunks.craftItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { craftedItem, ingredients } = action.payload;
        for (const ing of ingredients) {
            let remaining = ing.quantity;
            state.player.inventory.items = (state.player.inventory.items as Item[]).filter((i) => {
                if (remaining > 0 && i.name === ing.name) {
                    remaining--;
                    return false;
                }
                return true;
            });
        }
        state.player.inventory.items.push(craftedItem);
    });
}
