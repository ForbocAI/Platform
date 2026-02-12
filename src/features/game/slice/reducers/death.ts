import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addDeathReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.respawnPlayer.fulfilled, (state) => {
        if (!state.player || !state.currentRoom) return;
        state.player.hp = state.player.maxHp;
        state.player.stress = 0;
        state.currentRoom.enemies = [];
        state.sessionComplete = null;
    });
}
