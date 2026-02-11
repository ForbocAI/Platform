import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addTradeReducers(builder: ActionReducerMapBuilder<GameState>): void {
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
}
