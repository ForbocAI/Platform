import type { StageOfScene, AgentClass } from '@/features/game/types';
import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '@/features/core/store';

const DEFAULT_SELECTED_CLASS: AgentClass = 'Ashwalker';

/** Payload for scheduling next autoplay tick (reducer-only scheduling). */
export interface AutoplaySchedulePayload {
  nextTickAt: number | null;
  nextDelayMs?: number;
}

interface UIState {
  inquiryInput: string;
  showMap: boolean;
  stageOfScene: StageOfScene;
  autoPlay: boolean;
  /** When to run next autoplay tick (timestamp). Set by reducers only; poll dispatches tick when due. */
  autoplayNextTickAt: number | null;
  /** Current delay between ticks (ms). Updated by runAutoplayTick.fulfilled reducer. */
  autoplayDelayMs: number;
  textToSpeech: boolean;
  factsPanelOpen: boolean;
  vignetteThemeInput: string;
  inventoryOpen: boolean;
  capabilitiesPanelOpen: boolean;
  skillsPanelOpen: boolean;
  companionPanelOpen: boolean;
  /** Map of agentId -> timestamp for next tick. Managed by BotOrchestrator and agent Tick thunks. */
  agentTickSchedule: Record<string, number | null>;
  /** Set true when app/bootstrap runs (client); used to avoid hydration mismatch (e.g. runes). */
  clientHydrated: boolean;
  activeVendorId: string | null;
  craftingPanelOpen: boolean;
  /** Selected class on class selection screen (UI state). */
  selectedClassId: AgentClass;
}

const initialState: UIState = {
  inquiryInput: "",
  showMap: false,
  stageOfScene: "To Knowledge",
  autoPlay: false,
  autoplayNextTickAt: null,
  autoplayDelayMs: 2800,
  textToSpeech: true,
  factsPanelOpen: false,
  vignetteThemeInput: "",
  inventoryOpen: false,
  capabilitiesPanelOpen: false,
  skillsPanelOpen: false,
  companionPanelOpen: false,
  agentTickSchedule: {},
  clientHydrated: false,
  activeVendorId: null,
  craftingPanelOpen: false,
  selectedClassId: DEFAULT_SELECTED_CLASS,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setInquiryInput: (state, action: PayloadAction<string>) => {
      state.inquiryInput = action.payload;
    },
    clearInquiryInput: (state) => {
      state.inquiryInput = "";
    },
    toggleShowMap: (state) => {
      state.showMap = !state.showMap;
    },
    setStageOfScene: (state, action: PayloadAction<StageOfScene>) => {
      state.stageOfScene = action.payload;
    },
    toggleAutoPlay: (state) => {
      state.autoPlay = !state.autoPlay;
      if (state.autoPlay) {
        // Kickstart the loop with a 1s delay
        state.autoplayNextTickAt = Date.now() + 1000;
        state.autoplayDelayMs = 2800; // Reset to default
      } else {
        state.autoplayNextTickAt = null;
        state.agentTickSchedule = {};
      }
    },
    /** Set when next autoplay tick should run (and optionally delay for next). Pure reducer; called by listeners when toggling on or after concession. */
    setAutoplaySchedule: (state, action: PayloadAction<AutoplaySchedulePayload>) => {
      state.autoplayNextTickAt = action.payload.nextTickAt;
      if (action.payload.nextDelayMs !== undefined) state.autoplayDelayMs = action.payload.nextDelayMs;
    },
    /** Set next tick for a specific agent. */
    setAgentSchedule: (state, action: PayloadAction<{ agentId: string; nextTickAt: number | null }>) => {
      state.agentTickSchedule[action.payload.agentId] = action.payload.nextTickAt;
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
    toggleCapabilitiesPanel: (state) => {
      state.capabilitiesPanelOpen = !state.capabilitiesPanelOpen;
    },
    toggleSkillsPanel: (state) => {
      state.skillsPanelOpen = !state.skillsPanelOpen;
    },
    toggleCompanionPanel: (state) => {
      state.companionPanelOpen = !state.companionPanelOpen;
    },
    openTrade: (state, action: PayloadAction<string>) => {
      state.activeVendorId = action.payload;
    },
    closeTrade: (state) => {
      state.activeVendorId = null;
    },
    toggleCraftingPanel: (state, action: PayloadAction<boolean | undefined>) => {
      state.craftingPanelOpen = action.payload !== undefined ? action.payload : !state.craftingPanelOpen;
    },
    setSelectedClassId: (state, action: PayloadAction<AgentClass>) => {
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
    builder.addMatcher(
      (action): action is PayloadAction<{ nextTickAt?: number; nextDelayMs?: number } | undefined> =>
        action.type === 'game/runAutoplayTick/fulfilled',
      (state, action) => {
        if (!state.autoPlay) return;
        const payload = action.payload;

        // If thunk returned a schedule, use it. Otherwise, use current delay to keep logic moving.
        const nextDelayMs = payload?.nextDelayMs ?? state.autoplayDelayMs;
        const nextTickAt = payload?.nextTickAt ?? (Date.now() + nextDelayMs);

        state.autoplayNextTickAt = nextTickAt;
        state.autoplayDelayMs = nextDelayMs;
      }
    );
    builder.addMatcher(
      (action): action is PayloadAction<{ agentId: string; nextTickAt: number } | undefined> =>
        action.type === 'game/runAgentTick/fulfilled',
      (state, action) => {
        const payload = action.payload;
        if (payload?.agentId && payload.nextTickAt) {
          state.agentTickSchedule[payload.agentId] = payload.nextTickAt;
        }
      }
    );
  },
});

export const { setInquiryInput, clearInquiryInput, toggleShowMap, setStageOfScene, toggleAutoPlay, setAutoplaySchedule, setAgentSchedule, toggleTextToSpeech, toggleFactsPanel, setVignetteThemeInput, clearVignetteThemeInput, toggleInventory, toggleCapabilitiesPanel, toggleSkillsPanel, toggleCompanionPanel, openTrade, closeTrade, toggleCraftingPanel, setSelectedClassId } = uiSlice.actions;

// Selectors (memoized for stable references)
const selectUIState = (state: RootState) => state.ui;

export const selectInquiryInput = createSelector(
  [selectUIState],
  (ui) => ui.inquiryInput
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

export const selectAutoplayNextTickAt = createSelector(
  [selectUIState],
  (ui) => ui.autoplayNextTickAt
);

export const selectAutoplayDelayMs = createSelector(
  [selectUIState],
  (ui) => ui.autoplayDelayMs
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

export const selectCapabilitiesPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.capabilitiesPanelOpen
);

export const selectSkillsPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.skillsPanelOpen
);

export const selectCompanionPanelOpen = createSelector(
  [selectUIState],
  (ui) => ui.companionPanelOpen
);

export const selectClientHydrated = createSelector(
  [selectUIState],
  (ui) => ui.clientHydrated
);

export const selectActiveVendorId = createSelector(
  [selectUIState],
  (ui) => ui.activeVendorId
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
