
import { Player, Room, GameLogEntry } from '@/lib/game/types';

const STORAGE_KEY = 'forboc_platform_state_v1';

interface SaveState {
    player: Player;
    currentRoom: Room;
    logs: GameLogEntry[];
    timestamp: number;
}

// Memory: Persistent storage ("The Soul")
export const Memory = {
    save: async (player: Player, currentRoom: Room, logs: GameLogEntry[]): Promise<void> => {
        // Fire and forget, but async just in case
        try {
            const state: SaveState = {
                player,
                currentRoom,
                logs: logs.slice(-50), // Keep last 50 logs only for storage
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("Memory Bank Failure:", e);
        }
    },

    load: async (): Promise<SaveState | null> => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as SaveState;
        } catch (e) {
            console.error("Memory Bank Corruption:", e);
            return null;
        }
    },

    clear: async (): Promise<void> => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
