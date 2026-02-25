import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../orchestrators';
import type { GameState } from '../../store/types';

export function addMovementReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.movePlayer.fulfilled, (state, action) => {
        const { area: newArea, hazardEffects } = action.payload;
        if (state.player && hazardEffects) {
            state.player.stats.hp = Math.max(0, state.player.stats.hp - hazardEffects.damage);
            state.player.stats.stress = Math.min(state.player.stats.maxStress, state.player.stats.stress + hazardEffects.stress);
        }
        const prevArea = state.currentArea;
        if (!prevArea) return;
        const prevCoord = state.areaCoordinates[prevArea.id] ?? { x: 0, y: 0 };
        const direction = action.payload.direction;
        const delta = { North: { x: 0, y: -1 }, South: { x: 0, y: 1 }, East: { x: 1, y: 0 }, West: { x: -1, y: 0 } }[direction] ?? { x: 0, y: 0 };
        const newCoord = { x: prevCoord.x + delta.x, y: prevCoord.y + delta.y };
        state.currentArea = newArea;
        state.exploredAreas[newArea.id] = newArea;
        state.areaCoordinates[newArea.id] = newCoord;
        if (state.sessionScore) state.sessionScore.areasExplored += 1;
        if (newArea.allies?.length && state.sessionScore) {
            const rescue = state.activeQuests.find(q => q.kind === "rescue" && !q.complete);
            if (rescue) {
                rescue.progress = 1;
                rescue.complete = true;
                state.sessionScore.questsCompleted += 1;
                state.pendingQuestFacts.push(`Completed quest: ${rescue.label}.`);
                if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                    state.sessionComplete = "quests";
                    state.sessionScore.endTime = (action.payload as { now?: number }).now ?? Date.now(); // Fallback but thunk should pass it
                }
            }
        }
    });

    builder.addCase(thunks.scanSector.fulfilled, (state, action) => {
        if (state.sessionScore) state.sessionScore.areasScanned += 1;
        const recon = state.activeQuests.find(q => q.kind === "reconnaissance" && !q.complete);
        if (recon && state.sessionScore) {
            recon.progress = state.sessionScore.areasScanned;
            if (recon.progress >= recon.target) {
                recon.complete = true;
                state.sessionScore.questsCompleted += 1;
                state.pendingQuestFacts.push(`Completed quest: ${recon.label}.`);
                if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                    state.sessionComplete = "quests";
                    state.sessionScore.endTime = (action.payload as { now?: number }).now ?? Date.now();
                }
            }
        }
    });
}
