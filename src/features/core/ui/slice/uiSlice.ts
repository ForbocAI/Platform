
import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    oracleInput: string;
    showMap: boolean;
}

const initialState: UIState = {
    oracleInput: "",
    showMap: false,
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
    }
});

export const { setOracleInput, clearOracleInput, toggleShowMap } = uiSlice.actions;

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

export default uiSlice.reducer;
