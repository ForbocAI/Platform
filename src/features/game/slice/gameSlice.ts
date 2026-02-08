
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Player, Room, GameLogEntry, Enemy, Thread, Npc } from '@/lib/quadar/types';
import { initializePlayer, ENEMY_TEMPLATES } from '@/lib/quadar/engine';
import { SDK } from '@/lib/sdk-placeholder';
import { resolveDuel, resolveEnemyAttack } from '@/lib/quadar/combat';
import { generateFollowUpFacts, resolveUnexpectedlyEffect, classifyQuestion } from '@/lib/quadar/narrativeHelpers';
import {
    addFact,
    addFollowUpFacts,
    fadeInScene,
    addThread,
    applySetChange,
    setSuggestNextStage,
} from '@/features/narrative/slice/narrativeSlice';

interface GameState {
    player: Player | null;
    currentRoom: Room | null;
    logs: GameLogEntry[];
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    concessionOffered: import('@/lib/quadar/types').Concession | null;
    /** Damage that would be dealt if player rejects concession. */
    pendingConcessionDamage: number;
}

const initialState: GameState = {
    player: null,
    currentRoom: null,
    logs: [],
    isInitialized: false,
    isLoading: false,
    error: null,
    concessionOffered: null,
    pendingConcessionDamage: 0,
};

function uniqueLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Async Thunks
export const initializeGame = createAsyncThunk(
    'game/initialize',
    async (_, { dispatch }) => {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('simulateInitError') === '1') {
            throw new Error('Simulated init failure.');
        }
        dispatch(addLog({ message: "SYSTEM: Establishing Neural Link...", type: "system" }));
        await new Promise(resolve => setTimeout(resolve, 800));

        const player = initializePlayer();
        const initialRoom = await SDK.Cortex.generateStartRoom();

        const threadId = `thread_${Date.now()}`;
        dispatch(addThread({ id: threadId, name: "Reconnaissance" }));
        dispatch(fadeInScene({
            roomId: initialRoom.id,
            mainThreadId: threadId,
            stageOfScene: "To Knowledge",
            participantIds: [player.id],
        }));

        return { player, initialRoom };
    }
);

export const askOracle = createAsyncThunk(
    'game/askOracle',
    async (question: string, { getState, dispatch, rejectWithValue }) => {
        if (!question?.trim()) return rejectWithValue('empty');
        const state = getState() as {
            game: GameState;
            ui: { stageOfScene: import('@/lib/quadar/types').StageOfScene };
            narrative: { currentSceneId: string | null; threads: { id: string }[] };
        };
        if (!state.game.player) throw new Error("No player");

        dispatch(addLog({ message: `Your Question: "${question}"`, type: "system" }));

        const stage = state.ui?.stageOfScene ?? "To Knowledge";
        const result = await SDK.Cortex.consultOracle(question, state.game.player.surgeCount, stage);

        dispatch(addFact({
            sourceQuestion: question,
            sourceAnswer: result.description,
            text: `${question} → ${result.description}`,
            isFollowUp: false,
            questionKind: classifyQuestion(question),
        }));
        const followUps = generateFollowUpFacts(question, result);
        if (followUps.length) dispatch(addFollowUpFacts({ facts: followUps }));

        if (result.qualifier === "unexpectedly" && result.unexpectedEventIndex != null && result.unexpectedEventLabel) {
            const effect = resolveUnexpectedlyEffect(result.unexpectedEventIndex, result.unexpectedEventLabel);
            if (effect.applySetChange) dispatch(applySetChange());
            if (effect.suggestNextStage) dispatch(setSuggestNextStage(effect.suggestNextStage));
            if (effect.applyEnteringRed && state.game.currentRoom) {
                dispatch(addHazardOrEnemyToCurrentRoom());
            }
        }

        return result;
    }
);

export const movePlayer = createAsyncThunk(
    'game/movePlayer',
    async (direction: string, { getState, dispatch }) => {
        const state = getState() as {
            game: GameState;
            narrative: { currentSceneId: string | null; threads: Thread[]; mainThreadId: string | null };
        };
        if (!state.game.currentRoom) throw new Error("No room");

        const isValid = await SDK.Bridge.validateMove(state.game.currentRoom, direction);
        if (!isValid) {
            dispatch(addLog({ message: "Path blocked or invalid vector.", type: "system" }));
            throw new Error("Invalid move");
        }

        const newRoom = await SDK.Cortex.generateRoom();
        dispatch(addLog({ message: `Moved ${direction}.`, type: "exploration" }));

        const { currentSceneId, threads, mainThreadId } = state.narrative;
        if (!currentSceneId && threads.length > 0 && newRoom) {
            const threadId = mainThreadId ?? threads[0].id;
            dispatch(fadeInScene({
                roomId: newRoom.id,
                mainThreadId: threadId,
                stageOfScene: "To Knowledge",
                participantIds: state.game.player ? [state.game.player.id] : [],
            }));
        }

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
            return { updatedRoom: null, playerDamage: 0 };
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

        const wouldBeTakenOut = player && playerDamage > 0 && player.hp - playerDamage <= 0;
        const concession = wouldBeTakenOut
            ? { offered: true as const, outcome: undefined as import('@/lib/quadar/types').ConcessionOutcome | undefined, narrative: undefined as string | undefined }
            : null;

        return {
            updatedRoom: {
                ...currentRoom,
                enemies: updatedEnemies,
            },
            playerDamage: concession ? 0 : playerDamage,
            concessionOffered: concession,
            pendingConcessionDamage: concession ? playerDamage : 0,
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
        const state = getState() as {
            game: GameState;
            ui: { stageOfScene: import('@/lib/quadar/types').StageOfScene };
            narrative: { currentSceneId: string | null };
        };
        if (!state.game.player) throw new Error("No player");

        dispatch(addLog({ message: "You attempt to commune with the void...", type: "loom" }));

        const stage = state.ui?.stageOfScene ?? "To Knowledge";
        const result = await SDK.Cortex.consultOracle(COMMUNE_QUESTION, state.game.player.surgeCount, stage);

        dispatch(addFact({
            sourceQuestion: COMMUNE_QUESTION,
            sourceAnswer: result.description,
            text: `${COMMUNE_QUESTION} → ${result.description}`,
            isFollowUp: false,
        }));
        const followUps = generateFollowUpFacts(COMMUNE_QUESTION, result);
        if (followUps.length) dispatch(addFollowUpFacts({ facts: followUps }));

        if (result.qualifier === "unexpectedly" && result.unexpectedEventIndex != null && result.unexpectedEventLabel) {
            const effect = resolveUnexpectedlyEffect(result.unexpectedEventIndex, result.unexpectedEventLabel);
            if (effect.applySetChange) dispatch(applySetChange());
            if (effect.suggestNextStage) dispatch(setSuggestNextStage(effect.suggestNextStage));
            if (effect.applyEnteringRed && state.game.currentRoom) {
                dispatch(addHazardOrEnemyToCurrentRoom());
            }
            if (effect.applyEnterStageLeft && state.game.currentRoom) {
                dispatch(addAllyToCurrentRoom());
            }
        }

        return result;
    }
);

const FELLOW_RANGER: Npc = {
    id: "fellow_ranger",
    name: "Fellow Ranger",
    description: "A fresh recruit. Reconnaissance objective.",
};

const AUTO_PLAY_ORACLE_QUESTIONS = [
    "What lurks ahead?",
    "Is the path safe?",
    "What does the void reveal?",
    "Any signs of hostiles?",
    "What is the room's secret?",
];

/** Dispatched on an interval when auto-play is on. Picks one random valid action and runs it. */
export const autoPlayTick = createAsyncThunk(
    'game/autoPlayTick',
    async (_, { getState, dispatch }) => {
        const state = getState() as {
            game: GameState;
            ui: { autoPlay?: boolean };
        };
        if (!state.ui?.autoPlay) return;
        if (!state.game.player || !state.game.currentRoom) return;

        const { currentRoom, concessionOffered } = state.game;

        if (concessionOffered?.offered) {
            const accept = Math.random() < 0.5;
            if (accept) {
                const outcomes: Array<import('@/lib/quadar/types').ConcessionOutcome> = ['flee', 'knocked_away', 'captured', 'other'];
                const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                const narratives: Record<string, string> = {
                    flee: "You break away and flee the fray.",
                    knocked_away: "You are knocked from the fight but survive.",
                    captured: "You are taken captive instead of slain.",
                    other: "You concede on your own terms.",
                };
                dispatch(acceptConcession({ outcome, narrative: narratives[outcome] ?? "" }));
            } else {
                dispatch(rejectConcession());
            }
            return;
        }

        type Action = () => void;
        const actions: Action[] = [];

        if (currentRoom.exits?.North) actions.push(() => dispatch(movePlayer("North")));
        if (currentRoom.exits?.South) actions.push(() => dispatch(movePlayer("South")));
        if (currentRoom.exits?.East) actions.push(() => dispatch(movePlayer("East")));
        if (currentRoom.exits?.West) actions.push(() => dispatch(movePlayer("West")));
        actions.push(() => dispatch(scanSector()));
        if (currentRoom.enemies?.length) actions.push(() => dispatch(engageEnemy()));
        actions.push(() => dispatch(communeWithVoid()));
        const oracleQ = AUTO_PLAY_ORACLE_QUESTIONS[Math.floor(Math.random() * AUTO_PLAY_ORACLE_QUESTIONS.length)];
        actions.push(() => dispatch(askOracle(oracleQ)));

        const pick = actions[Math.floor(Math.random() * actions.length)];
        pick();
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
        },
        /** Entering the Red: add hazard or enemy to current room. */
        addHazardOrEnemyToCurrentRoom: (state) => {
            if (!state.currentRoom) return;
            const roll = Math.random();
            if (roll < 0.5 && !state.currentRoom.enemies.length) {
                const names = Object.keys(ENEMY_TEMPLATES);
                const name = names[Math.floor(Math.random() * names.length)];
                const template = ENEMY_TEMPLATES[name];
                if (template) {
                    state.currentRoom.enemies.push({
                        id: uniqueLogId(),
                        name,
                        ...template,
                        hp: template.maxHp ?? 30,
                        maxStress: 100,
                        stress: 0,
                    } as Enemy);
                }
            } else {
                if (!state.currentRoom.hazards.includes("Threat Imminent")) {
                    state.currentRoom.hazards = [...state.currentRoom.hazards, "Threat Imminent"];
                }
            }
        },
        acceptConcession: (state, action: PayloadAction<{ outcome: import('@/lib/quadar/types').ConcessionOutcome; narrative?: string }>) => {
            state.concessionOffered = null;
            state.pendingConcessionDamage = 0;
            if (action.payload.narrative) {
                state.logs.push({
                    id: uniqueLogId(),
                    timestamp: Date.now(),
                    message: action.payload.narrative,
                    type: "combat"
                });
            }
        },
        rejectConcession: (state) => {
            if (state.player && state.pendingConcessionDamage > 0) {
                state.player.hp = Math.max(0, state.player.hp - state.pendingConcessionDamage);
                state.player.stress = Math.min(state.player.maxStress, state.player.stress + 5);
            }
            state.concessionOffered = null;
            state.pendingConcessionDamage = 0;
        },
        /** Enter Stage Left: add Fellow Ranger (or similar) to current room. */
        addAllyToCurrentRoom: (state) => {
            if (!state.currentRoom) return;
            const allies = state.currentRoom.allies ?? [];
            if (allies.some((a) => a.name === FELLOW_RANGER.name)) return;
            state.currentRoom.allies = [
                ...allies,
                { ...FELLOW_RANGER, id: `ranger_${uniqueLogId()}` },
            ];
        },
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
            if (action.payload.concessionOffered) {
                state.concessionOffered = action.payload.concessionOffered;
                state.pendingConcessionDamage = action.payload.pendingConcessionDamage ?? 0;
            } else if (state.player && action.payload.playerDamage && action.payload.playerDamage > 0) {
                state.player.hp = Math.max(0, state.player.hp - action.payload.playerDamage);
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

export const {
    addLog,
    addHazardOrEnemyToCurrentRoom,
    acceptConcession,
    rejectConcession,
    addAllyToCurrentRoom,
} = gameSlice.actions;

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

export const selectConcessionOffered = createSelector(
    [selectGameState],
    (game) => game.concessionOffered
);

export default gameSlice.reducer;
