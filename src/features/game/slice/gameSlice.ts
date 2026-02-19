import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './constants';
import { addAllReducers } from './reducers';
import type { GameState } from './types';
import type { GameLogEntry } from '@/features/game/types';
import type { RootState } from '@/features/core/store';

export type { AreaCoordinates, InitializeGameOptions } from './types';

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
    selectCapability: (state, action: PayloadAction<string | null>) => {
      state.selectedCapabilityId = action.payload;
    },
    clearPendingQuestFacts: (state) => {
      state.pendingQuestFacts = [];
    },
    setAgentPondering: (state, action: PayloadAction<string>) => {
      if (!state.ponderingAgentIds.includes(action.payload)) {
        state.ponderingAgentIds.push(action.payload);
      }
    },
    clearAgentPondering: (state, action: PayloadAction<string>) => {
      state.ponderingAgentIds = state.ponderingAgentIds.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    addAllReducers(builder);
  },
});

export const { addLog, selectCapability, clearPendingQuestFacts, setAgentPondering, clearAgentPondering } = gameSlice.actions;

export {
  initializeGame,
  askOracle,
  queryOracle,
  movePlayer,
  scanSector,
  castCapability,
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
export const selectCurrentArea = createSelector(
  [selectGameState],
  (game) => game.currentArea
);
export const selectExploredAreas = createSelector(
  [selectGameState],
  (game) => game.exploredAreas
);
export const selectAreaCoordinates = createSelector(
  [selectGameState],
  (game) => game.areaCoordinates
);
// Deprecated aliases removed.
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
export const selectSelectedCapabilityId = createSelector(
  [selectGameState],
  (game) => game.selectedCapabilityId
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
export const selectPonderingAgentIds = createSelector(
  [selectGameState],
  (game) => game.ponderingAgentIds
);

export default gameSlice.reducer;
