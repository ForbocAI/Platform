
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

// Selectors
export const selectOracleInput = (state: { ui: UIState }) => state.ui.oracleInput;

export default uiSlice.reducer;
