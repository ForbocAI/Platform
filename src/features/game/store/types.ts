import type { AgentPlayer, Area, GameLogEntry, ActiveQuest, SessionScore } from '@/features/game/types';

export interface AreaCoordinates {
  x: number;
  y: number;
}

export interface GameState {
  player: AgentPlayer | null;
  currentArea: Area | null;
  exploredAreas: Record<string, Area>;
  areaCoordinates: Record<string, AreaCoordinates>;
  logs: GameLogEntry[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  selectedCapabilityId: string | null;
  activeQuests: ActiveQuest[];
  sessionScore: SessionScore | null;
  sessionComplete: 'quests' | 'death' | null;
  pendingQuestFacts: string[];
  ponderingAgentIds: string[];
}

export interface InitializeGameOptions {
  forceVendor?: boolean;
  deterministic?: boolean;
  forceNPC?: boolean | string;
  lowHp?: boolean;
  forceCompanion?: boolean;
  /** When true with forceCompanion, companion starts at 1 HP for quick death-state testing. */
  lowCompanionHp?: boolean;
  /** Force re-initialization even if already initialized (e.g. ?reset=1). */
  reset?: boolean;
  /** Select specific class to play. */
  classId?: string;
  /** Auto-enable autoplay on load (?autoStart=1). */
  autoStart?: boolean;
}
