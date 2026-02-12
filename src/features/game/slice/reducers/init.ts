import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { generateRandomEnemy, generateRandomMerchant } from '@/features/game/engine';
import { resolveUnexpectedlyEffect } from '@/features/narrative/helpers';
import { checkSurgeEvent } from '@/features/game/mechanics/surgeEvents';
import * as actions from '../actions';
import { initialSessionScore, seedQuests } from '../constants';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addInitReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(actions.addLog, (state, action) => {
        state.logs.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            message: `Oracle: ${result.description} (Roll: ${result.roll}, Surge: ${newSurge})`,
            type: "oracle"
        });

        // Surge event check
        const surgeEvent = checkSurgeEvent(newSurge);
        if (surgeEvent) {
            switch (surgeEvent.effectType) {
                case "stress":
                    player.stress = Math.min(player.maxStress, (player.stress || 0) + surgeEvent.magnitude);
                    break;
                case "hp_drain":
                    player.hp = Math.max(1, player.hp - surgeEvent.magnitude);
                    break;
                case "item_corrupt":
                    if (player.inventory.length > 0) {
                        const idx = Math.floor(Math.random() * player.inventory.length);
                        player.inventory.splice(idx, 1);
                    }
                    break;
                case "enemy_empower":
                    if (state.currentRoom) {
                        for (const enemy of state.currentRoom.enemies) {
                            enemy.hp += surgeEvent.magnitude;
                            enemy.maxHp = (enemy.maxHp || enemy.hp) + surgeEvent.magnitude;
                        }
                    }
                    break;
                case "hazard_spawn":
                    if (state.currentRoom) {
                        state.currentRoom.hazards.push("Surge Rift");
                    }
                    break;
                case "oracle_lockout":
                    // No mechanical lockout yet; just log the warning
                    break;
            }
            state.logs.push({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                message: `⚡ SURGE EVENT: ${surgeEvent.name} — ${surgeEvent.description}`,
                type: "system"
            });
        }
    });

    builder.addCase(thunks.queryOracle.fulfilled, (state, action) => {
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

        // Surge event check
        const surgeEvent = checkSurgeEvent(newSurge);
        if (surgeEvent) {
            switch (surgeEvent.effectType) {
                case "stress":
                    player.stress = Math.min(player.maxStress, (player.stress || 0) + surgeEvent.magnitude);
                    break;
                case "hp_drain":
                    player.hp = Math.max(1, player.hp - surgeEvent.magnitude);
                    break;
                case "item_corrupt":
                    if (player.inventory.length > 0) {
                        const idx = Math.floor(Math.random() * player.inventory.length);
                        player.inventory.splice(idx, 1);
                    }
                    break;
                case "enemy_empower":
                    if (state.currentRoom) {
                        for (const enemy of state.currentRoom.enemies) {
                            enemy.hp += surgeEvent.magnitude;
                            enemy.maxHp = (enemy.maxHp || enemy.hp) + surgeEvent.magnitude;
                        }
                    }
                    break;
                case "hazard_spawn":
                    if (state.currentRoom) {
                        state.currentRoom.hazards.push("Surge Rift");
                    }
                    break;
                case "oracle_lockout":
                    break;
            }
            state.logs.push({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                message: `⚡ SURGE EVENT: ${surgeEvent.name} — ${surgeEvent.description}`,
                type: "system"
            });
        }
    });
}
