import type { SessionScore, ActiveQuest } from '@/lib/game/types';
import type { VignetteStage } from '@/lib/game/types';
import { advanceVignetteStage, startVignette, endVignette } from '@/features/narrative/slice/narrativeSlice';
import { VIGNETTE_THEMES } from '@/lib/game/narrativeHelpers';
import type { GameState } from './types';

export const initialSessionScore = (): SessionScore => ({
  roomsExplored: 0,
  roomsScanned: 0,
  enemiesDefeated: 0,
  merchantTrades: 0,
  questsCompleted: 0,
  spiritEarned: 0,
  startTime: Date.now(),
  endTime: null,
});

const VIGNETTE_STAGES: VignetteStage[] = ['Exposition', 'Rising Action', 'Climax', 'Epilogue'];

function nextVignetteStage(current: VignetteStage): VignetteStage | null {
  const i = VIGNETTE_STAGES.indexOf(current);
  return VIGNETTE_STAGES[i + 1] ?? null;
}

export function handleVignetteProgression(dispatch: (a: unknown) => void, getState: () => unknown): void {
  const state = getState() as { narrative?: { vignette?: { stage: VignetteStage } } };
  const vignette = state.narrative?.vignette;

  if (vignette) {
    const next = nextVignetteStage(vignette.stage);
    if (next) {
      dispatch(advanceVignetteStage({ stage: next }));
    } else {
      dispatch(endVignette());
      const theme = VIGNETTE_THEMES[Math.floor(Math.random() * VIGNETTE_THEMES.length)];
      dispatch(startVignette({ theme }));
    }
  } else {
    const theme = VIGNETTE_THEMES[Math.floor(Math.random() * VIGNETTE_THEMES.length)];
    dispatch(startVignette({ theme }));
  }
}

export function seedQuests(): ActiveQuest[] {
  return [
    { id: 'recon-1', kind: 'reconnaissance', label: 'Scan 5 sectors', target: 5, progress: 0, complete: false },
    { id: 'rescue-1', kind: 'rescue', label: 'Find a Fellow Ranger', target: 1, progress: 0, complete: false },
    { id: 'hostiles-1', kind: 'hostiles', label: 'Defeat 3 hostiles', target: 3, progress: 0, complete: false },
    { id: 'merchant-1', kind: 'merchant', label: 'Trade with 2 merchants', target: 2, progress: 0, complete: false },
  ];
}

export const initialState: GameState = {
  player: null,
  currentRoom: null,
  exploredRooms: {},
  roomCoordinates: {},
  logs: [],
  isInitialized: false,
  isLoading: false,
  error: null,
  selectedSpellId: null,
  activeQuests: [],
  sessionScore: null,
  sessionComplete: null,
  pendingQuestFacts: [],
};
