import type { StageOfScene } from '@/lib/quadar/types';
import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    oracleInput: string;
    showMap: boolean;
    stageOfScene: StageOfScene;
    autoPlay: boolean;
    textToSpeech: boolean;
    factsPanelOpen: boolean;
    vignetteThemeInput: string;
}

const initialState: UIState = {
    oracleInput: "",
    showMap: false,
    stageOfScene: "To Knowledge",
    autoPlay: false,
    textToSpeech: true,
    factsPanelOpen: false,
    vignetteThemeInput: "",
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
        toggleAutoPlay: (state) => {
            state.autoPlay = !state.autoPlay;
        },
        toggleTextToSpeech: (state) => {
            state.textToSpeech = !state.textToSpeech;
        },
        toggleFactsPanel: (state) => {
            state.factsPanelOpen = !state.factsPanelOpen;
        },
        setVignetteThemeInput: (state, action: PayloadAction<string>) => {
            state.vignetteThemeInput = action.payload;
        },
        clearVignetteThemeInput: (state) => {
            state.vignetteThemeInput = "";
        },
    }
});

export const { setOracleInput, clearOracleInput, toggleShowMap, setStageOfScene, toggleAutoPlay, toggleTextToSpeech, toggleFactsPanel, setVignetteThemeInput, clearVignetteThemeInput } = uiSlice.actions;

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

export const selectAutoPlay = createSelector(
  [selectUIState],
  (ui) => ui.autoPlay
);

export const selectTextToSpeech = createSelector(
  [selectUIState],
  (ui) => ui.textToSpeech
);

export const selectFactsPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.factsPanelOpen
);

export const selectVignetteThemeInput = createSelector(
  [selectUIState],
  (ui) => ui.vignetteThemeInput
);

export default uiSlice.reducer;
