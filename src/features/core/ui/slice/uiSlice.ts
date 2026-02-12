import type { StageOfScene, CharacterClass } from '@/features/game/types';
import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';

const DEFAULT_SELECTED_CLASS: CharacterClass = 'Ashwalker';

interface UIState {
  oracleInput: string;
  showMap: boolean;
  stageOfScene: StageOfScene;
  autoPlay: boolean;
  textToSpeech: boolean;
  factsPanelOpen: boolean;
  vignetteThemeInput: string;
  inventoryOpen: boolean;
  spellsPanelOpen: boolean;
  skillsPanelOpen: boolean;
  servitorPanelOpen: boolean;
  /** Set true when app/bootstrap runs (client); used to avoid hydration mismatch (e.g. runes). */
  clientHydrated: boolean;
  activeMerchantId: string | null;
  craftingPanelOpen: boolean;
  /** Selected class on class selection screen (UI state). */
  selectedClassId: CharacterClass;
}

const initialState: UIState = {
  oracleInput: "",
  showMap: false,
  stageOfScene: "To Knowledge",
  autoPlay: false,
  textToSpeech: true,
  factsPanelOpen: false,
  vignetteThemeInput: "",
  inventoryOpen: false,
  spellsPanelOpen: false,
  skillsPanelOpen: false,
  servitorPanelOpen: false,
  clientHydrated: false,
  activeMerchantId: null,
  craftingPanelOpen: false,
  selectedClassId: DEFAULT_SELECTED_CLASS,
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
    toggleInventory: (state) => {
      state.inventoryOpen = !state.inventoryOpen;
    },
    toggleSpellsPanel: (state) => {
      state.spellsPanelOpen = !state.spellsPanelOpen;
    },
    toggleSkillsPanel: (state) => {
      state.skillsPanelOpen = !state.skillsPanelOpen;
    },
    toggleServitorPanel: (state) => {
      state.servitorPanelOpen = !state.servitorPanelOpen;
    },
    openTrade: (state, action: PayloadAction<string>) => {
      state.activeMerchantId = action.payload;
    },
    closeTrade: (state) => {
      state.activeMerchantId = null;
    },
    toggleCraftingPanel: (state, action: PayloadAction<boolean | undefined>) => {
      state.craftingPanelOpen = action.payload !== undefined ? action.payload : !state.craftingPanelOpen;
    },
    setSelectedClassId: (state, action: PayloadAction<CharacterClass>) => {
      state.selectedClassId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type === 'app/bootstrap',
      (state) => {
        state.clientHydrated = true;
      }
    );
  },
});

export const { setOracleInput, clearOracleInput, toggleShowMap, setStageOfScene, toggleAutoPlay, toggleTextToSpeech, toggleFactsPanel, setVignetteThemeInput, clearVignetteThemeInput, toggleInventory, toggleSpellsPanel, toggleSkillsPanel, toggleServitorPanel, openTrade, closeTrade, toggleCraftingPanel, setSelectedClassId } = uiSlice.actions;

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

export const selectInventoryOpen = createSelector(
  [selectUIState],
  (ui) => ui.inventoryOpen
);

export const selectSpellsPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.spellsPanelOpen
);

export const selectSkillsPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.skillsPanelOpen
);

export const selectServitorPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.servitorPanelOpen
);

export const selectClientHydrated = createSelector(
  [selectUIState],
  (ui) => ui.clientHydrated
);

export const selectActiveMerchantId = createSelector(
  [selectUIState],
  (ui) => ui.activeMerchantId
);

export const selectCraftingPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.craftingPanelOpen
);

export const selectSelectedClassId = createSelector(
  [selectUIState],
  (ui) => ui.selectedClassId
);

export default uiSlice.reducer;
