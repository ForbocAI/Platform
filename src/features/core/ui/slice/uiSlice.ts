import type { StageOfScene } from '@/lib/quadar/types';
import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    oracleInput: string;
    showMap: boolean;
    stageOfScene: StageOfScene;
}

const initialState: UIState = {
    oracleInput: "",
    showMap: false,
    stageOfScene: "To Knowledge",
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setOracleInput: (state, action: PayloadAction<string>) => {
            state.oracleInput = action.payload;
        },
        clearOracleInput: (state) => {
            state.oracleInput = "";
        },
        toggleShowMap: (state) => {
            state.showMap = !state.showMap;
        },
        setStageOfScene: (state, action: PayloadAction<StageOfScene>) => {
            state.stageOfScene = action.payload;
        },
    }
});

export const { setOracleInput, clearOracleInput, toggleShowMap, setStageOfScene } = uiSlice.actions;

// Selectors (memoized for stable references)
const selectUIState = (state: { ui: UIState }) => state.ui;

export const selectOracleInput = createSelector(
  [selectUIState],
  (ui) => ui.oracleInput
);

export const selectShowMap = createSelector(
  [selectUIState],
  (ui) => ui.showMap
);

export const selectStageOfScene = createSelector(
  [selectUIState],
  (ui) => ui.stageOfScene
);

export default uiSlice.reducer;
