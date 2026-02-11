import type { Player, Room, GameLogEntry, ActiveQuest, SessionScore } from '@/features/game/types';

export interface RoomCoordinates {
  x: number;
  y: number;
}

export interface GameState {
  player: Player | null;
  currentRoom: Room | null;
  exploredRooms: Record<string, Room>;
  roomCoordinates: Record<string, RoomCoordinates>;
  logs: GameLogEntry[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  selectedSpellId: string | null;
  activeQuests: ActiveQuest[];
  sessionScore: SessionScore | null;
  sessionComplete: 'quests' | 'death' | null;
  pendingQuestFacts: string[];
}

export interface InitializeGameOptions {
  forceMerchant?: boolean;
  deterministic?: boolean;
  forceEnemy?: boolean;
  lowHp?: boolean;
  forceServitor?: boolean;
  /** When true with forceServitor, servitor starts at 1 HP for quick death-state testing. */
  lowServitorHp?: boolean;
  /** Force re-initialization even if already initialized (e.g. ?reset=1). */
  reset?: boolean;
}
