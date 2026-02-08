import {
  createSlice,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";
import type {
  Thread,
  SceneRecord,
  Fact,
  Vignette,
  StageOfScene,
  VignetteStage,
} from "@/lib/quadar/types";

function nanoid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export interface NarrativeState {
  threads: Thread[];
  scenes: SceneRecord[];
  currentSceneId: string | null;
  facts: Fact[];
  vignette: Vignette | null;
  mainThreadId: string | null;
  /** Suggested stage for next scene (from Unexpectedly e.g. To Conflict). */
  suggestNextStage: StageOfScene | null;
}

const initialState: NarrativeState = {
  threads: [],
  scenes: [],
  currentSceneId: null,
  facts: [],
  vignette: null,
  mainThreadId: null,
  suggestNextStage: null,
};

export const narrativeSlice = createSlice({
  name: "narrative",
  initialState,
  reducers: {
    addThread: (state, action: PayloadAction<Omit<Thread, "id" | "createdAt" | "visitedSceneIds" | "relatedNpcIds" | "facts"> & { id?: string }>) => {
      const id = action.payload.id ?? nanoid();
      state.threads.push({
        id,
        name: action.payload.name,
        stage: action.payload.stage,
        visitedSceneIds: [],
        relatedNpcIds: [],
        facts: [],
        createdAt: Date.now(),
      });
    },
    setMainThread: (state, action: PayloadAction<string | null>) => {
      state.mainThreadId = action.payload;
    },
    addFact: (state, action: PayloadAction<Omit<Fact, "id" | "timestamp"> & { id?: string }>) => {
      state.facts.push({
        id: action.payload.id ?? nanoid(),
        sourceQuestion: action.payload.sourceQuestion,
        sourceAnswer: action.payload.sourceAnswer,
        text: action.payload.text,
        isFollowUp: action.payload.isFollowUp ?? false,
        questionKind: action.payload.questionKind,
        timestamp: Date.now(),
      });
    },
    addFollowUpFacts: (state, action: PayloadAction<{ facts: string[] }>) => {
      action.payload.facts.forEach((text) =>
        state.facts.push({
          id: nanoid(),
          text,
          isFollowUp: true,
          timestamp: Date.now(),
        })
      );
    },
    fadeInScene: (
      state,
      action: PayloadAction<{
        sceneId?: string;
        roomId: string;
        mainThreadId: string;
        stageOfScene: StageOfScene;
        participantIds?: string[];
      }>
    ) => {
      const sceneId = action.payload.sceneId ?? nanoid();
      state.scenes.push({
        id: sceneId,
        locationRoomId: action.payload.roomId,
        mainThreadId: action.payload.mainThreadId,
        stageOfScene: action.payload.stageOfScene,
        participantIds: action.payload.participantIds ?? [],
        status: "active",
        openedAt: Date.now(),
      });
      state.currentSceneId = sceneId;
      state.mainThreadId = action.payload.mainThreadId;
      const thread = state.threads.find((t) => t.id === action.payload.mainThreadId);
      if (thread) {
        thread.visitedSceneIds = [...thread.visitedSceneIds, sceneId];
      }
    },
    fadeOutScene: (state, action: PayloadAction<{ sceneId?: string }>) => {
      const sceneId = action.payload.sceneId ?? state.currentSceneId;
      const scene = state.scenes.find((s) => s.id === sceneId);
      if (scene) {
        scene.status = "faded";
        scene.closedAt = Date.now();
      }
      if (state.currentSceneId === sceneId) {
        state.currentSceneId = null;
      }
    },
    startVignette: (
      state,
      action: PayloadAction<{ theme: string; threadIds?: string[] }>
    ) => {
      state.vignette = {
        id: nanoid(),
        theme: action.payload.theme,
        stage: "Exposition",
        threadIds: action.payload.threadIds ?? [],
        createdAt: Date.now(),
      };
    },
    advanceVignetteStage: (
      state,
      action: PayloadAction<{ stage: VignetteStage }>
    ) => {
      if (state.vignette) {
        state.vignette.stage = action.payload.stage;
      }
    },
    endVignette: (state) => {
      state.vignette = null;
    },
    applySetChange: (state) => {
      // Mechanical effect: close current scene so next move/room is a new scene.
      if (state.currentSceneId) {
        const scene = state.scenes.find((s) => s.id === state.currentSceneId);
        if (scene) {
          scene.status = "faded";
          scene.closedAt = Date.now();
        }
        state.currentSceneId = null;
      }
    },
    applyEnteringRed: (state) => {
      // Flag is consumed by game slice to add hazard/enemy. We just mark intent.
      // Actual application happens in gameSlice when processing Loom result.
      // No state change needed here; game slice will add hazard/enemy to room.
    },
    setSuggestNextStage: (state, action: PayloadAction<StageOfScene | null>) => {
      state.suggestNextStage = action.payload;
    },
    crossStitchThread: (state, action: PayloadAction<string>) => {
      state.mainThreadId = action.payload;
    },
    /** Sync thread's related NPCs from current room (allies + merchants). */
    setThreadRelatedNpcs: (state, action: PayloadAction<{ threadId: string; npcIds: string[] }>) => {
      const thread = state.threads.find((t) => t.id === action.payload.threadId);
      if (thread) thread.relatedNpcIds = action.payload.npcIds;
    },
    resetNarrative: () => initialState,
  },
});

export const {
  addThread,
  setMainThread,
  addFact,
  addFollowUpFacts,
  fadeInScene,
  fadeOutScene,
  startVignette,
  advanceVignetteStage,
  endVignette,
  applySetChange,
  applyEnteringRed,
  setSuggestNextStage,
  crossStitchThread,
  setThreadRelatedNpcs,
  resetNarrative,
} = narrativeSlice.actions;

const selectNarrativeState = (state: { narrative: NarrativeState }) =>
  state.narrative;

export const selectThreads = createSelector(
  [selectNarrativeState],
  (n) => n.threads
);
export const selectScenes = createSelector(
  [selectNarrativeState],
  (n) => n.scenes
);
export const selectCurrentSceneId = createSelector(
  [selectNarrativeState],
  (n) => n.currentSceneId
);
export const selectFacts = createSelector(
  [selectNarrativeState],
  (n) => n.facts
);
export const selectVignette = createSelector(
  [selectNarrativeState],
  (n) => n.vignette
);
export const selectMainThreadId = createSelector(
  [selectNarrativeState],
  (n) => n.mainThreadId
);

export const selectCurrentScene = createSelector(
  [selectNarrativeState],
  (n) =>
    n.currentSceneId
      ? n.scenes.find((s) => s.id === n.currentSceneId) ?? null
      : null
);

export const selectMainThread = createSelector(
  [selectNarrativeState],
  (n) =>
    n.mainThreadId
      ? n.threads.find((t) => t.id === n.mainThreadId) ?? null
      : null
);

export default narrativeSlice.reducer;
