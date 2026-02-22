import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from '../orchestrators';
import type { GameState } from '../../store/types';

export function addAutoplayReducers(builder: ActionReducerMapBuilder<GameState>): void {
    builder.addCase(thunks.runAutoplayTick.fulfilled, (state) => {
        if (state.currentArea?.features) {
            state.currentArea.features.forEach(f => {
                if (f.type === 'resource_plot' && !f.ready) {
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
