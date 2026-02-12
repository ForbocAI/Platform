import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './constants';
import { addAllReducers } from './reducers';
import type { GameState } from './types';

export type { RoomCoordinates, InitializeGameOptions } from './types';
export { addLog, selectSpell, clearPendingQuestFacts } from './actions';
export {
    initializeGame,
    askOracle,
    queryOracle,
    movePlayer,
    scanSector,
    castSpell,
    engageHostiles,
    respawnPlayer,
    tradeBuy,
    tradeSell,
    pickUpGroundLoot,
    useItem,
    sacrificeItem,
    equipItem,
    unequipItem,
    harvestCrop,
    craftItem,
    runAutoplayTick,
} from './thunks';

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        addAllReducers(builder);
    },
});

// Selectors
export const selectPlayer = (state: { game: GameState }) => state.game.player;
export const selectCurrentRoom = (state: { game: GameState }) => state.game.currentRoom;
export const selectExploredRooms = (state: { game: GameState }) => state.game.exploredRooms;
export const selectRoomCoordinates = (state: { game: GameState }) => state.game.roomCoordinates;
export const selectLogs = (state: { game: GameState }) => state.game.logs;
export const selectIsInitialized = (state: { game: GameState }) => state.game.isInitialized;
export const selectIsLoading = (state: { game: GameState }) => state.game.isLoading;
export const selectSelectedSpellId = (state: { game: GameState }) => state.game.selectedSpellId;
export const selectActiveQuests = (state: { game: GameState }) => state.game.activeQuests;
export const selectSessionScore = (state: { game: GameState }) => state.game.sessionScore;
export const selectSessionComplete = (state: { game: GameState }) => state.game.sessionComplete;
export const selectPendingQuestFacts = (state: { game: GameState }) => state.game.pendingQuestFacts;

export default gameSlice.reducer;
