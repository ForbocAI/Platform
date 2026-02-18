import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './constants';
import { addAllReducers } from './reducers';
import type { GameState } from './types';
import type { GameLogEntry } from '@/features/game/types';
import type { RootState } from '@/features/core/store';

export type { RoomCoordinates, InitializeGameOptions } from './types';

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<{ message: string; type: GameLogEntry['type']; portraitUrl?: string }>) => {
      state.logs.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        message: action.payload.message,
        type: action.payload.type,
        portraitUrl: action.payload.portraitUrl,
      });
    },
    selectSpell: (state, action: PayloadAction<string | null>) => {
      state.selectedSpellId = action.payload;
    },
    clearPendingQuestFacts: (state) => {
      state.pendingQuestFacts = [];
    },
  },
  extraReducers: (builder) => {
    addAllReducers(builder);
  },
});

export const { addLog, selectSpell, clearPendingQuestFacts } = gameSlice.actions;

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

// Selectors (memoized for stable references)
const selectGameState = (state: RootState) => state.game;

export const selectPlayer = createSelector(
  [selectGameState],
  (game) => game.player
);
export const selectCurrentRoom = createSelector(
  [selectGameState],
  (game) => game.currentRoom
);
export const selectExploredRooms = createSelector(
  [selectGameState],
  (game) => game.exploredRooms
);
export const selectRoomCoordinates = createSelector(
  [selectGameState],
  (game) => game.roomCoordinates
);
export const selectLogs = createSelector(
  [selectGameState],
  (game) => game.logs
);
export const selectIsInitialized = createSelector(
  [selectGameState],
  (game) => game.isInitialized
);
export const selectIsLoading = createSelector(
  [selectGameState],
  (game) => game.isLoading
);
export const selectSelectedSpellId = createSelector(
  [selectGameState],
  (game) => game.selectedSpellId
);
export const selectActiveQuests = createSelector(
  [selectGameState],
  (game) => game.activeQuests
);
export const selectSessionScore = createSelector(
  [selectGameState],
  (game) => game.sessionScore
);
export const selectSessionComplete = createSelector(
  [selectGameState],
  (game) => game.sessionComplete
);
export const selectPendingQuestFacts = createSelector(
  [selectGameState],
  (game) => game.pendingQuestFacts
);

export default gameSlice.reducer;
