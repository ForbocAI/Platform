import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../thunks';
import type { GameState } from '../types';

export function addAutoplayReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.runAutoplayTick.fulfilled, (state) => {
        if (state.currentRoom?.features) {
            state.currentRoom.features.forEach(f => {
                if (f.type === 'farming_plot' && !f.ready) {
                    f.progress += 20;
                    if (f.progress >= 100) {
                        f.progress = 100;
                        f.ready = true;
                    }
                }
            });
        }
    });
}
