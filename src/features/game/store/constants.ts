import type { SessionScore, ActiveQuest, VignetteStage } from '@/features/game/types';
import { advanceVignetteStage, endVignette } from '@/features/narrative/slice/narrativeSlice';
import type { GameState } from './types';
import { addLog } from './gameSlice';

export const initialSessionScore = (): SessionScore => ({
  areasExplored: 0,
  areasScanned: 0,
  npcsDefeated: 0,
  vendorTrades: 0,
  questsCompleted: 0,
  resourcesEarned: 0,
  startTime: Date.now(),
  endTime: null,
});

const VIGNETTE_STAGES: VignetteStage[] = ['Exposition', 'Rising Action', 'Climax', 'Epilogue'];

function nextVignetteStage(current: VignetteStage): VignetteStage | null {
  const i = VIGNETTE_STAGES.indexOf(current);
  return VIGNETTE_STAGES[i + 1] ?? null;
}

export function handleVignetteProgression(dispatch: (a: unknown) => void, getState: () => unknown): void {
  const state = getState() as { narrative?: { vignette?: { theme: string; stage: VignetteStage } }; game: GameState };
  const vignette = state.narrative?.vignette;

  if (vignette) {
    const next = nextVignetteStage(vignette.stage);
    if (next) {
      dispatch(addLog({ message: `Narrative progression: ${vignette.theme} · ${next}`, type: 'system' }));
      dispatch(advanceVignetteStage({ stage: next }));
    } else {
      dispatch(addLog({ message: `Narrative concluded: ${vignette.theme}`, type: 'system' }));
      dispatch(endVignette());
      // DO NOT auto-restart here to avoid infinite loop
    }
  } else {
    // Only start a vignette if specifically needed (e.g. on game init)
    // For now, let the game handle this via specific triggers
  }
}

export function seedQuests(): ActiveQuest[] {
  return [
    { id: 'recon-1', kind: 'reconnaissance', label: 'Scan 5 sectors', target: 5, progress: 0, complete: false },
    { id: 'rescue-1', kind: 'rescue', label: 'Find a Fellow Agent', target: 1, progress: 0, complete: false },
    { id: 'hostiles-1', kind: 'hostiles', label: 'Defeat 3 hostiles', target: 3, progress: 0, complete: false },
    { id: 'vendor-1', kind: 'vendor', label: 'Trade with 2 vendors', target: 2, progress: 0, complete: false },
  ];
}

export const initialState: GameState = {
  player: null,
  currentArea: null,
  exploredAreas: {},
  areaCoordinates: {},
  logs: [],
  isInitialized: false,
  isLoading: false,
  error: null,
  selectedCapabilityId: null,
  activeQuests: [],
  sessionScore: null,
  sessionComplete: null,
  pendingQuestFacts: [],
  ponderingAgentIds: [],
  activeBarks: [],
};
