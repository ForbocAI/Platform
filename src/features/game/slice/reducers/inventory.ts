import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addInventoryReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.useItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { itemIndex, effect } = action.payload;

        if (effect === 'hire_servitor') {
            const contractDetails = (action.payload as { contractDetails?: { role: string; servitorName: string; maxHp: number; description: string } }).contractDetails;
            if (contractDetails) {
                state.player.inventory.splice(itemIndex, 1);
                if (!state.player.servitors) state.player.servitors = [];
                state.player.servitors.push({
                    id: Date.now().toString(),
                    name: contractDetails.servitorName,
                    role: contractDetails.role as "Warrior" | "Scout" | "Mystic",
                    hp: contractDetails.maxHp,
                    maxHp: contractDetails.maxHp,
                    description: contractDetails.description
                });
            }
            return;
        }

        state.player.inventory.splice(itemIndex, 1);

        if (effect === "heal_hp_20") {
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + 20);
        } else if (effect === "heal_stress_10") {
            state.player.stress = Math.max(0, state.player.stress - 10);
        }
    });

    builder.addCase(thunks.sacrificeItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { itemIndex, gain } = action.payload;

        state.player.inventory.splice(itemIndex, 1);
        state.player.spirit = (state.player.spirit || 0) + gain;

        if (state.sessionScore) {
            state.sessionScore.spiritEarned += gain;
        }
    });

    builder.addCase(thunks.equipItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { itemIndex, slot, item } = action.payload;

        state.player.inventory.splice(itemIndex, 1);

        const existing = state.player.equipment?.[slot];
        if (existing) {
            state.player.inventory.push(existing);
        }

        if (!state.player.equipment) state.player.equipment = {};
        state.player.equipment[slot] = item;
    });

    builder.addCase(thunks.unequipItem.fulfilled, (state, action) => {
        if (!action.payload || !state.player || !state.player.equipment) return;
        const { slot } = action.payload;

        const item = state.player.equipment[slot];
        if (item) {
            state.player.inventory.push(item);
            delete state.player.equipment[slot];
        }
    });

    builder.addCase(thunks.harvestCrop.fulfilled, (state, action) => {
        if (!action.payload || !state.currentRoom?.features) return;
        const { featureIndex, item } = action.payload;

        const plot = state.currentRoom.features[featureIndex];
        if (plot && plot.type === 'farming_plot') {
            plot.progress = 0;
            plot.ready = false;
        }

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
}
