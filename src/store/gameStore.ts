import { create } from "zustand";
import { Player, Room, GameLogEntry, Direction } from "@/lib/quadar/types";

interface GameState {
    player: Player;
    currentRoom: Room | null;
    history: GameLogEntry[];

    // Actions
    setPlayer: (player: Player) => void;
    setCurrentRoom: (room: Room) => void;
    addLog: (message: string, type?: GameLogEntry["type"]) => void;
    move: (direction: Direction) => void;
    attack: () => void;
    updateHp: (amount: number) => void;
}

const initialPlayer: Player = {
    level: 12,
    characterClass: "Ranger",
    Str: 14,
    Agi: 18,
    Arcane: 10,
    maxHp: 80,
    hp: 80,
    maxStress: 100,
    stress: 20,
    inventory: [],
};

export const useGameStore = create<GameState>((set, get) => ({
    player: initialPlayer,
    currentRoom: null,
    history: [
        {
            id: "initial",
            timestamp: Date.now(),
            message: "System initialized. Welcome to the Void, Ranger.",
            type: "system",
        },
    ],

    setPlayer: (player) => set({ player }),
    setCurrentRoom: (room) => set({ currentRoom: room }),

    addLog: (message, type = "exploration") => {
        const newLog: GameLogEntry = {
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            message,
            type,
        };
        set((state) => ({
            history: [newLog, ...state.history].slice(0, 100)
        }));
    },

    move: (direction) => {
        const { addLog } = get();
        addLog(`You move ${direction}...`, "exploration");
        // Engine will handle room generation/transition
    },

    attack: () => {
        // Basic attack logic
    },

    updateHp: (amount) => {
        set((state) => ({
            player: {
                ...state.player,
                hp: Math.min(state.player.maxHp, Math.max(0, state.player.hp + amount)),
            }
        }));
    }
}));
