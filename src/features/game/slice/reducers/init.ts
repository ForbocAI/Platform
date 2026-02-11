import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { generateRandomEnemy, generateRandomMerchant } from '@/features/game/engine';
import { resolveUnexpectedlyEffect } from '@/features/narrative/helpers';
import * as actions from '../actions';
import { initialSessionScore, seedQuests } from '../constants';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addInitReducers(builder: ActionReducerMapBuilder<GameState>): void {
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

    builder.addCase(thunks.askOracle.fulfilled, (state, action) => {
        if (!state.player) return;
        const result = action.payload;
        const player = state.player;

        let newSurge = player.surgeCount;
        if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
        player.surgeCount = newSurge;

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

        let newSurge = player.surgeCount;
        if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
        player.surgeCount = newSurge;

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
}
