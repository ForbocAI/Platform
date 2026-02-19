import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addTradeReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.tradeBuy.fulfilled, (state, action) => {
        if (!action.payload || !state.player) return;
        const { item, primaryCost, secondaryCost } = action.payload;

        state.player.resourcePrimary = (state.player.resourcePrimary || 0) - primaryCost;
        state.player.resourceSecondary = (state.player.resourceSecondary || 0) - secondaryCost;
        state.player.inventory.push({ ...item });

        if (state.sessionScore) {
            state.sessionScore.vendorTrades += 1;
            const vendorQuest = state.activeQuests.find(q => q.kind === "vendor" && !q.complete);
            if (vendorQuest) {
                vendorQuest.progress = state.sessionScore.vendorTrades;
                if (vendorQuest.progress >= vendorQuest.target) {
                    vendorQuest.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${vendorQuest.label}.`);
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${vendorQuest.label}.`, type: "system" });
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
        state.player.resourcePrimary = (state.player.resourcePrimary || 0) + value;

        if (state.sessionScore) {
            state.sessionScore.vendorTrades += 1;
            const vendorQuest = state.activeQuests.find(q => q.kind === "vendor" && !q.complete);
            if (vendorQuest) {
                vendorQuest.progress = state.sessionScore.vendorTrades;
                if (vendorQuest.progress >= vendorQuest.target) {
                    vendorQuest.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${vendorQuest.label}.`);
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${vendorQuest.label}.`, type: "system" });
                    if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                        state.sessionComplete = "quests";
                        state.sessionScore.endTime = Date.now();
                    }
                }
            }
        }
    });
}
