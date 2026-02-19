import type { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';
import { initialSessionScore, seedQuests } from '../constants';
import * as thunks from '../thunks';
import type { GameState } from '../types';
import type { AgentPlayer, Area } from '@/features/game/types';
import { resolveUnexpectedlyEffect } from '@/features/narrative/helpers';
import { checkSurgeEvent } from '@/features/game/mechanics/surgeEvents';
import { generateRandomAgentNPC, generateRandomVendor } from '@/features/game/engine';

export const resetGame = createAction('game/reset');

export function addInitReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.initializeGame.pending, (state) => {
        state.isLoading = true;
        state.error = null;
    });
    builder.addCase(thunks.initializeGame.fulfilled, (state, action: PayloadAction<{ player: AgentPlayer; initialArea: Area }>) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.player = action.payload.player;
        const initialArea = action.payload.initialArea;
        state.currentArea = initialArea;
        state.exploredAreas = { [initialArea.id]: initialArea };
        state.areaCoordinates = { [initialArea.id]: { x: 0, y: 0 } };
        state.activeQuests = seedQuests();
        state.sessionScore = {
            ...initialSessionScore(),
            resourcesEarned: action.payload.player.resourcePrimary ?? 0,
        };
        state.sessionComplete = null;
        state.pendingQuestFacts = [];
        state.logs.push({
            id: `${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
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
            if (effect.applyEnteringRed && state.currentArea) {
                state.currentArea.npcs.push(generateRandomAgentNPC());
                state.currentArea.hazards.push("Threat Imminent");
            }
            if (effect.applyEnterStageLeft && state.currentArea) {
                if (!state.currentArea.vendors) state.currentArea.vendors = [];
                state.currentArea.vendors.push(generateRandomVendor());
                if (!state.currentArea.allies) state.currentArea.allies = [];
                state.currentArea.allies.push({ id: Date.now().toString(), name: "Fellow Ranger" });
            }
        }

        state.logs.push({
            id: `${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
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
                    if (state.currentArea) {
                        for (const npc of state.currentArea.npcs) {
                            npc.hp += surgeEvent.magnitude;
                            npc.maxHp = (npc.maxHp || npc.hp) + surgeEvent.magnitude;
                        }
                    }
                    break;
                case "hazard_spawn":
                    if (state.currentArea) {
                        state.currentArea.hazards.push("Anomalous Surge");
                    }
                    break;
                case "oracle_lockout":
                    // No mechanical lockout yet; just log the warning
                    break;
            }
            state.logs.push({
                id: `${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
                timestamp: Date.now(),
                message: `⚡ SURGE EVENT: ${surgeEvent.name} — ${surgeEvent.description} `,
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
            if (effect.applyEnteringRed && state.currentArea) {
                state.currentArea.npcs.push(generateRandomAgentNPC());
                state.currentArea.hazards.push("Threat Imminent");
            }
            if (effect.applyEnterStageLeft && state.currentArea) {
                if (!state.currentArea.vendors) state.currentArea.vendors = [];
                state.currentArea.vendors.push(generateRandomVendor());
                if (!state.currentArea.allies) state.currentArea.allies = [];
                state.currentArea.allies.push({ id: Date.now().toString(), name: "Fellow Ranger" });
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
                    if (state.currentArea) {
                        for (const npc of state.currentArea.npcs) {
                            npc.hp += surgeEvent.magnitude;
                            npc.maxHp = (npc.maxHp || npc.hp) + surgeEvent.magnitude;
                        }
                    }
                    break;
                case "hazard_spawn":
                    if (state.currentArea) {
                        state.currentArea.hazards.push("Anomalous Surge");
                    }
                    break;
                case "oracle_lockout":
                    break;
            }
            state.logs.push({
                id: `${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
                timestamp: Date.now(),
                message: `⚡ SURGE EVENT: ${surgeEvent.name} — ${surgeEvent.description} `,
                type: "system"
            });
        }
    });
}
