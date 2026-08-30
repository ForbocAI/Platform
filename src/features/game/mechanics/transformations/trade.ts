import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../orchestrators';
import type { GameState } from '../../store/types';

export function addTradeReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.tradeBuy.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { item, primaryCost, secondaryCost, merchantId } = action.payload;

        state.player.inventory.spirit = (state.player.inventory.spirit || 0) - primaryCost;
        state.player.inventory.blood = (state.player.inventory.blood || 0) - secondaryCost;
        state.player.inventory.items.push({ ...item });

        const vendor = state.currentArea?.vendors?.find((v) => v.id === merchantId);
        if (vendor) {
            const wareIndex = vendor.wares.findIndex((w) => w.id === item.id);
            if (wareIndex !== -1) vendor.wares.splice(wareIndex, 1);
        }

        if (state.sessionScore) {
            state.sessionScore.vendorTrades += 1;
            const vendorQuest = state.activeQuests.find(q => q.kind === "vendor" && !q.complete);
            if (vendorQuest) {
                vendorQuest.progress = state.sessionScore.vendorTrades;
                if (vendorQuest.progress >= vendorQuest.target) {
                    vendorQuest.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${vendorQuest.label}.`);
                    if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                        state.sessionComplete = "quests";
                        state.sessionScore.endTime = (action.payload as { now?: number }).now ?? Date.now();
                    }
                }
            }
        }
    });

    builder.addCase(thunks.tradeSell.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { itemIndex, value } = action.payload;

        state.player.inventory.items.splice(itemIndex, 1);
        state.player.inventory.spirit = (state.player.inventory.spirit || 0) + value;

        if (state.sessionScore) {
            state.sessionScore.vendorTrades += 1;
            const vendorQuest = state.activeQuests.find(q => q.kind === "vendor" && !q.complete);
            if (vendorQuest) {
                vendorQuest.progress = state.sessionScore.vendorTrades;
                if (vendorQuest.progress >= vendorQuest.target) {
                    vendorQuest.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${vendorQuest.label}.`);
                    if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                        state.sessionComplete = "quests";
                        state.sessionScore.endTime = (action.payload as { now?: number }).now ?? Date.now();
                    }
                }
            }
        }
    });
}
