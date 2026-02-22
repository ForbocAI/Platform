import type { PlayerActor, Sector, SignalEntry, OperationalObjective, PerformanceMetrics } from '@/features/game/types';

export interface SectorLocation {
  x: number;
  y: number;
}

export interface SystemState {
  player: PlayerActor | null;
  currentArea: Sector | null;
  exploredAreas: Record<string, Sector>;
  areaCoordinates: Record<string, SectorLocation>;
  logs: SignalEntry[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  selectedCapabilityId: string | null;
  activeQuests: OperationalObjective[];
  sessionScore: PerformanceMetrics | null;
  sessionComplete: 'quests' | 'death' | null;
  pendingQuestFacts: string[];
  ponderingAgentIds: string[];
}

export interface SystemBootOptions {
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
