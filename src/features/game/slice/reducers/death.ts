import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addDeathReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.respawnPlayer.fulfilled, (state) => {
        if (!state.player || !state.currentArea) return;
        state.player.stats.hp = state.player.stats.maxHp;
        state.player.stats.stress = 0;
        state.currentArea.npcs = [];
        state.sessionComplete = null;
        // Mark that player just respawned - this will be used by behavior tree
        // to prioritize preparation before exploration
        state.player.justRespawned = true;
    });
}
