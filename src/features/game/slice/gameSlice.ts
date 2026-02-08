
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Player, Room, GameLogEntry, Enemy } from '@/lib/quadar/types';
import { initializePlayer } from '@/lib/quadar/engine'; // Temporary: Initialization still uses direct engine for now
import { SDK } from '@/lib/sdk-placeholder';
import { resolveDuel, resolveEnemyAttack } from '@/lib/quadar/combat';

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

function uniqueLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Async Thunks
export const initializeGame = createAsyncThunk(
    'game/initialize',
    async (_, { dispatch }) => {
        // Dev/test: ?simulateInitError=1 to exercise error/retry UI
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('simulateInitError') === '1') {
            throw new Error('Simulated init failure.');
        }
        // Simulate initial connection sequence
        dispatch(addLog({ message: "SYSTEM: Establishing Neural Link...", type: "system" }));
        await new Promise(resolve => setTimeout(resolve, 800));

        // In a real scenario, SDK.Memory.load() would happen here
        const player = initializePlayer();
        const initialRoom = await SDK.Cortex.generateStartRoom();

        return { player, initialRoom };
    }
);

export const askOracle = createAsyncThunk(
    'game/askOracle',
    async (question: string, { getState, dispatch, rejectWithValue }) => {
        if (!question?.trim()) return rejectWithValue('empty');
        const state = getState() as { game: GameState; ui: { stageOfScene: import('@/lib/quadar/types').StageOfScene } };
        if (!state.game.player) throw new Error("No player");

        dispatch(addLog({ message: `Your Question: "${question}"`, type: "system" }));

        const stage = state.ui?.stageOfScene ?? "To Knowledge";
        const result = await SDK.Cortex.consultOracle(question, state.game.player.surgeCount, stage);
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

export const engageEnemy = createAsyncThunk(
    'game/engageEnemy',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const { player, currentRoom } = state.game;
        if (!player || !currentRoom) throw new Error("No player or room");

        if (!currentRoom.enemies?.length) {
            dispatch(addLog({ message: "No hostiles in range.", type: "combat" }));
            return { updatedRoom: null };
        }

        const target = currentRoom.enemies[0];
        const result = resolveDuel(player, target);
        dispatch(addLog({ message: result.message, type: "combat" }));

        const newHp = result.hit ? Math.max(0, target.hp - result.damage) : target.hp;
        const updatedEnemies: Enemy[] = currentRoom.enemies
            .map((e, i) =>
                i === 0 ? { ...e, hp: newHp } : e
            )
            .filter((e) => e.hp > 0);

        if (newHp <= 0) {
            dispatch(addLog({ message: `${target.name} has fallen.`, type: "combat" }));
        }

        let playerDamage = 0;
        if (newHp > 0) {
            const counterResult = resolveEnemyAttack(target, player);
            dispatch(addLog({ message: counterResult.message, type: "combat" }));
            if (counterResult.hit) playerDamage = counterResult.damage;
        }

        return {
            updatedRoom: {
                ...currentRoom,
                enemies: updatedEnemies,
            },
            playerDamage,
        };
    }
);

function buildScanReadout(room: Room): string {
    const hazards = room.hazards?.length ? room.hazards.join(", ") : "None";
    const exitDirs = (["North", "South", "East", "West"] as const)
        .filter((d) => room.exits[d])
        .map((d) => d.charAt(0))
        .join(", ");
    const exits = exitDirs || "None";
    if (!room.enemies?.length) {
        return `Scan complete. Biome: ${room.biome}. Hazards: ${hazards}. Hostiles: 0. Exits: ${exits}.`;
    }
    const hostiles = room.enemies
        .map((e) => `${e.name} (HP ${e.hp}/${e.maxHp})`)
        .join("; ");
    return `Scan complete. Biome: ${room.biome}. Hazards: ${hazards}. Hostiles: ${room.enemies.length} — ${hostiles}. Exits: ${exits}.`;
}

export const scanSector = createAsyncThunk(
    'game/scanSector',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        if (!state.game.currentRoom) throw new Error("No room");

        dispatch(addLog({ message: "Scanning current sector...", type: "exploration" }));

        const readout = buildScanReadout(state.game.currentRoom);
        dispatch(addLog({ message: readout, type: "exploration" }));
    }
);

const COMMUNE_QUESTION = "What does the void reveal?";

export const communeWithVoid = createAsyncThunk(
    'game/communeWithVoid',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState; ui: { stageOfScene: import('@/lib/quadar/types').StageOfScene } };
        if (!state.game.player) throw new Error("No player");

        dispatch(addLog({ message: "You attempt to commune with the void...", type: "loom" }));

        const stage = state.ui?.stageOfScene ?? "To Knowledge";
        const result = await SDK.Cortex.consultOracle(COMMUNE_QUESTION, state.game.player.surgeCount, stage);
        return result;
    }
);

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        addLog: (state, action: PayloadAction<{ message: string; type: GameLogEntry['type'] }>) => {
            state.logs.push({
                id: uniqueLogId(),
                timestamp: Date.now(),
                message: action.payload.message,
                type: action.payload.type
            });
        }
    },
    extraReducers: (builder) => {
        // Initialize
        builder.addCase(initializeGame.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(initializeGame.rejected, (state, action) => {
            state.isLoading = false;
            state.error = (action.error?.message as string) ?? "Failed to initialize.";
        });
        builder.addCase(initializeGame.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isInitialized = true;
            state.player = action.payload.player;
            state.currentRoom = action.payload.initialRoom;
            state.logs.push({
                id: uniqueLogId(),
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
            const player = state.player;
            let newSurge = player.surgeCount;

            if (result.surgeUpdate === -1) {
                newSurge = 0;
            } else {
                newSurge += result.surgeUpdate;
            }
            player.surgeCount = newSurge;

            // Stress: +10 on "and unexpectedly" (narrative strain)
            if (result.qualifier === "unexpectedly") {
                player.stress = Math.min(player.maxStress, player.stress + 10);
            }

            state.logs.push({
                id: uniqueLogId(),
                timestamp: Date.now(),
                message: `Oracle: ${result.description} (Roll: ${result.roll}, Surge: ${newSurge})`,
                type: "loom"
            });
        });
        builder.addCase(askOracle.rejected, (state, action) => {
            if (action.payload === "empty") {
                state.logs.push({
                    id: uniqueLogId(),
                    timestamp: Date.now(),
                    message: "Question cannot be empty.",
                    type: "system"
                });
            }
        });

        // Move
        builder.addCase(movePlayer.fulfilled, (state, action) => {
            state.currentRoom = action.payload;
        });

        // Engage (combat)
        builder.addCase(engageEnemy.fulfilled, (state, action) => {
            if (action.payload.updatedRoom) {
                state.currentRoom = action.payload.updatedRoom;
            }
            if (state.player && action.payload.playerDamage && action.payload.playerDamage > 0) {
                state.player.hp = Math.max(0, state.player.hp - action.payload.playerDamage);
                // Stress: +5 when taking combat damage
                state.player.stress = Math.min(state.player.maxStress, state.player.stress + 5);
            }
        });

        // Commune (Loom of Fate – void)
        builder.addCase(communeWithVoid.fulfilled, (state, action) => {
            if (!state.player) return;
            const result = action.payload;
            let newSurge = state.player.surgeCount;
            if (result.surgeUpdate === -1) {
                newSurge = 0;
            } else {
                newSurge += result.surgeUpdate;
            }
            state.player.surgeCount = newSurge;

            // Stress: +10 on "and unexpectedly"
            if (result.qualifier === "unexpectedly") {
                state.player.stress = Math.min(state.player.maxStress, state.player.stress + 10);
            }

            state.logs.push({
                id: uniqueLogId(),
                timestamp: Date.now(),
                message: `The Void: ${result.description} (Roll: ${result.roll}, Surge: ${newSurge})`,
                type: "loom"
            });
        });
    }
});

export const { addLog } = gameSlice.actions;

// Selectors (memoized for stable references)
const selectGameState = (state: { game: GameState }) => state.game;

export const selectPlayer = createSelector(
    [selectGameState],
    (game) => game.player
);

export const selectCurrentRoom = createSelector(
    [selectGameState],
    (game) => game.currentRoom
);

export const selectLogs = createSelector(
    [selectGameState],
    (game) => game.logs
);

export const selectIsInitialized = createSelector(
    [selectGameState],
    (game) => game.isInitialized
);

export const selectIsLoading = createSelector(
    [selectGameState],
    (game) => game.isLoading
);

export const selectError = createSelector(
    [selectGameState],
    (game) => game.error
);

export default gameSlice.reducer;
