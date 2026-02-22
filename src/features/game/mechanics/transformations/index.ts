import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { addInitReducers } from './init';
import { addMovementReducers } from './movement';
import { addCombatReducers } from './combat';
import { addTradeReducers } from './trade';
import { addInventoryReducers } from './inventory';
import { addAutoplayReducers } from './autoplay';
import type { GameState } from '../../store/types';

export function addAllReducers(builder: ActionReducerMapBuilder<GameState>): void {
    addInitReducers(builder);
    addMovementReducers(builder);
    addCombatReducers(builder);
    addTradeReducers(builder);
    addInventoryReducers(builder);
    addAutoplayReducers(builder);
}
