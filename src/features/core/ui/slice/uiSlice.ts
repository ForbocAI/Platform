
import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    oracleInput: string;
}

const initialState: UIState = {
    oracleInput: "",
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
        }
    }
});

export const { setOracleInput, clearOracleInput } = uiSlice.actions;

// Selectors (memoized for stable references)
const selectUIState = (state: { ui: UIState }) => state.ui;

export const selectOracleInput = createSelector(
  [selectUIState],
  (ui) => ui.oracleInput
);

export default uiSlice.reducer;
