
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Player, Room, GameLogEntry, LoomResult } from '@/lib/quadar/types';
import { initializePlayer } from '@/lib/quadar/engine'; // Temporary: Initialization still uses direct engine for now
import { SDK } from '@/lib/sdk-placeholder';

export interface RoomCoordinates {
    x: number;
    y: number;
}

interface GameState {
    player: Player | null;
    currentRoom: Room | null;
    logs: GameLogEntry[];
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: GameState = {
    player: null,
    currentRoom: null,
    logs: [],
    isInitialized: false,
    isLoading: false,
    error: null,
};

// Async Thunks
export const initializeGame = createAsyncThunk(
    'game/initialize',
    async (_, { dispatch }) => {
        // Simulate initial connection sequence
        dispatch(addLog({ message: "SYSTEM: Establishing Neural Link...", type: "system" }));
        await new Promise(resolve => setTimeout(resolve, 800));

        // In a real scenario, SDK.Memory.load() would happen here
        const player = initializePlayer();
        const initialRoom = await SDK.Cortex.generateRoom("start_room", "Quadar Tower");

        return { player, initialRoom };
    }
);

export const askOracle = createAsyncThunk(
    'game/askOracle',
    async (question: string, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        if (!state.game.player) throw new Error("No player");

        dispatch(addLog({ message: `Your Question: "${question}"`, type: "system" }));

        const result = await SDK.Cortex.consultOracle(question, state.game.player.surgeCount);
        return result;
    }
);

export const movePlayer = createAsyncThunk(
    'game/movePlayer',
    async (direction: string, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        if (!state.game.currentRoom) throw new Error("No room");

        const isValid = await SDK.Bridge.validateMove(state.game.currentRoom, direction);
        if (!isValid) {
            dispatch(addLog({ message: "Path blocked or invalid vector.", type: "system" }));
            throw new Error("Invalid move");
        }

        const newRoom = await SDK.Cortex.generateRoom();
        dispatch(addLog({ message: `Moved ${direction}.`, type: "exploration" }));

        return newRoom;
    }
);

const DIRECTIONS = ['North', 'South', 'East', 'West'] as const;

/** One autoplay tick: move to a random exit if available, otherwise ask the oracle. */
export const runAutoplayTick = createAsyncThunk(
    'game/runAutoplayTick',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const room = state.game.currentRoom;
        if (!room?.exits) {
            await dispatch(askOracle("What happens next?"));
            return;
        }
        const available = DIRECTIONS.filter((d) => room.exits[d]);
        if (available.length > 0) {
            const dir = available[Math.floor(Math.random() * available.length)];
            await dispatch(movePlayer(dir));
        } else {
            await dispatch(askOracle("What happens next?"));
        }
    }
);

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        addLog: (state, action: PayloadAction<{ message: string; type: GameLogEntry['type'] }>) => {
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: action.payload.message,
                type: action.payload.type
            });
        },
        autoPlayTick: () => {},
    },
    extraReducers: (builder) => {
        // Initialize
        builder.addCase(initializeGame.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(initializeGame.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isInitialized = true;
            state.player = action.payload.player;
            state.currentRoom = action.payload.initialRoom;
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: "SYSTEM: Connection Stable. Welcome to Quadar Tower, Ranger.",
                type: "system"
            });
        });

        // Oracle
        builder.addCase(askOracle.fulfilled, (state, action) => {
            if (!state.player) return;
            const result = action.payload;

            // Update Surge
            const player = state.player; // Ensure type safety
            let newSurge = player.surgeCount;

            if (result.surgeUpdate === -1) {
                newSurge = 0;
            } else {
                newSurge += result.surgeUpdate;
            }
            player.surgeCount = newSurge;

            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: `Oracle: ${result.description} (Roll: ${result.roll}, Surge: ${newSurge})`,
                type: "loom"
            });
        });

        // Move
        builder.addCase(movePlayer.fulfilled, (state, action) => {
            state.currentRoom = action.payload;
        });
    }
});

export const { addLog, autoPlayTick } = gameSlice.actions;

// Selectors
export const selectPlayer = (state: { game: GameState }) => state.game.player;
export const selectCurrentRoom = (state: { game: GameState }) => state.game.currentRoom;
export const selectLogs = (state: { game: GameState }) => state.game.logs;
export const selectIsInitialized = (state: { game: GameState }) => state.game.isInitialized;
export const selectIsLoading = (state: { game: GameState }) => state.game.isLoading;

export default gameSlice.reducer;
