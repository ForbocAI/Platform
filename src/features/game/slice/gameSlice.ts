
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Player, Room, GameLogEntry, Enemy, Thread, Npc, Direction } from '@/lib/quadar/types';
import { initializePlayer, ENEMY_TEMPLATES, createMerchant } from '@/lib/quadar/engine';
import { gameApi } from '@/features/core/api/gameApi';
import { resolveDuel, resolveEnemyAttack } from '@/lib/quadar/combat';
import { generateFollowUpFacts, resolveUnexpectedlyEffect, classifyQuestion } from '@/lib/quadar/narrativeHelpers';
import {
    addFact,
    addFollowUpFacts,
    fadeInScene,
    addThread,
    applySetChange,
    setSuggestNextStage,
    setThreadRelatedNpcs,
    startVignette,
    advanceVignetteStage,
    endVignette,
} from '@/features/narrative/slice/narrativeSlice';

/** Grid position for explored map (grows through play). */
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
    concessionOffered: import('@/lib/quadar/types').Concession | null;
    pendingConcessionDamage: number;
    /** Merchant ID when trade panel is open; null when closed. */
    tradePanelMerchantId: string | null;
    /** All rooms visited this session (id -> room); map grows as player explores. */
    exploredRooms: Record<string, Room>;
    /** Grid position per room for map display (start room at 0,0). */
    roomCoordinates: Record<string, RoomCoordinates>;
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
    tradePanelMerchantId: null,
    exploredRooms: {},
    roomCoordinates: {},
};

function uniqueLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** NPC ids in room (allies + merchants) for thread relatedNpcIds sync. */
function npcIdsFromRoom(room: Room): string[] {
    const allies = (room.allies ?? []).map((a) => a.id);
    const merchants = (room.merchants ?? []).map((m) => m.id);
    return [...allies, ...merchants];
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

        const deterministic = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('deterministic') === '1';
        const player = initializePlayer({ deterministic });

        // Dev/test: low HP so one enemy hit triggers concession modal (use with forceEnemy=1)
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('lowHp') === '1') {
            player.hp = 5;
        }

        let initialRoom = await dispatch(gameApi.endpoints.getStartRoom.initiate({ deterministic })).unwrap();

        // Dev/test: force a merchant in the starting room for trading playtest
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceMerchant') === '1') {
            if (!initialRoom.merchants || initialRoom.merchants.length === 0) {
                initialRoom = { ...initialRoom, merchants: [createMerchant()] };
            }
        }
        // Dev/test: force an enemy in the starting room for combat/concession playtest
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceEnemy') === '1') {
            const names = Object.keys(ENEMY_TEMPLATES);
            const name = names[Math.floor(Math.random() * names.length)];
            const template = ENEMY_TEMPLATES[name];
            if (template && (!initialRoom.enemies || initialRoom.enemies.length === 0)) {
                initialRoom = {
                    ...initialRoom,
                    enemies: [
                        ...(initialRoom.enemies ?? []),
                        {
                            id: uniqueLogId(),
                            name,
                            ...template,
                            hp: template.maxHp ?? 30,
                            maxStress: 100,
                            stress: 0,
                        } as Enemy,
                    ],
                };
            }
        }

        const threadId = `thread_${Date.now()}`;
        dispatch(addThread({ id: threadId, name: "Reconnaissance" }));
        dispatch(fadeInScene({
            roomId: initialRoom.id,
            mainThreadId: threadId,
            stageOfScene: "To Knowledge",
            participantIds: [player.id],
        }));
        dispatch(setThreadRelatedNpcs({ threadId, npcIds: npcIdsFromRoom(initialRoom) }));

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
        const result = await dispatch(gameApi.endpoints.consultOracle.initiate({
            question,
            surgeCount: state.game.player.surgeCount,
            stage
        })).unwrap();

        dispatch(addFact({
            sourceQuestion: question,
            sourceAnswer: result.description,
            text: `${question} → ${result.description}`,
            isFollowUp: false,
            questionKind: classifyQuestion(question),
        }));
        dispatch(addLog({ message: result.description, type: "narrative" }));
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
        const stateAfter = getState() as { game: GameState; narrative: { mainThreadId: string | null } };
        if (stateAfter.game.currentRoom && stateAfter.narrative.mainThreadId) {
            dispatch(setThreadRelatedNpcs({ threadId: stateAfter.narrative.mainThreadId, npcIds: npcIdsFromRoom(stateAfter.game.currentRoom) }));
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

        const { newRoom } = await dispatch(gameApi.endpoints.navigate.initiate({
            direction,
            currentRoom: state.game.currentRoom
        })).unwrap();
        dispatch(addLog({ message: `Moved ${direction}.`, type: "exploration" }));

        const { currentSceneId, threads, mainThreadId } = state.narrative;
        const threadId = mainThreadId ?? threads[0]?.id;
        if (!currentSceneId && threads.length > 0 && newRoom && threadId) {
            dispatch(fadeInScene({
                roomId: newRoom.id,
                mainThreadId: threadId,
                stageOfScene: "To Knowledge",
                participantIds: state.game.player ? [state.game.player.id] : [],
            }));
        }
        if (threadId) dispatch(setThreadRelatedNpcs({ threadId, npcIds: npcIdsFromRoom(newRoom) }));

        return { newRoom, previousRoomId: state.game.currentRoom.id, direction: direction as Direction };
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
    const allies = room.allies?.length ? room.allies.map((a) => a.name).join(", ") : "None";
    const merchants = room.merchants?.length ? room.merchants.map((m) => m.name).join(", ") : "None";
    const hostilesPart = !room.enemies?.length
        ? "Hostiles: 0."
        : `Hostiles: ${room.enemies.length} — ${room.enemies.map((e) => `${e.name} (HP ${e.hp}/${e.maxHp})`).join("; ")}.`;
    return `Scan complete. Biome: ${room.biome}. Hazards: ${hazards}. Allies: ${allies}. Merchants: ${merchants}. ${hostilesPart} Exits: ${exits}.`;
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
        const result = await dispatch(gameApi.endpoints.consultOracle.initiate({
            question: COMMUNE_QUESTION,
            surgeCount: state.game.player.surgeCount,
            stage
        })).unwrap();

        dispatch(addFact({
            sourceQuestion: COMMUNE_QUESTION,
            sourceAnswer: result.description,
            text: `${COMMUNE_QUESTION} → ${result.description}`,
            isFollowUp: false,
        }));
        dispatch(addLog({ message: result.description, type: "narrative" }));
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
                dispatch(addAllyOrMerchantToCurrentRoom());
            }
        }
        const stateAfter = getState() as { game: GameState; narrative: { mainThreadId: string | null } };
        if (stateAfter.game.currentRoom && stateAfter.narrative.mainThreadId) {
            dispatch(setThreadRelatedNpcs({ threadId: stateAfter.narrative.mainThreadId, npcIds: npcIdsFromRoom(stateAfter.game.currentRoom) }));
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
                const damage = state.pendingConcessionDamage;
                const newHp = Math.max(0, state.player.hp - damage);

                if (newHp <= 0) {
                    // Death Logic
                    state.player.hp = state.player.maxHp;
                    state.player.stress = 0;

                    state.logs.push({
                        id: uniqueLogId(),
                        timestamp: Date.now(),
                        message: "You have succumbed to your wounds. DEATH.",
                        type: "combat"
                    });
                    state.logs.push({
                        id: uniqueLogId(),
                        timestamp: Date.now(),
                        message: "SYSTEM: Vital signs critical. Initiating emergency cloning protocol... Respawned at current location.",
                        type: "system"
                    });

                    // Clear enemies in current room to provide safety
                    if (state.currentRoom) {
                        state.currentRoom.enemies = [];
                        state.logs.push({
                            id: uniqueLogId(),
                            timestamp: Date.now(),
                            message: "Hostiles cleared from sector during reconstruction.",
                            type: "system"
                        });
                    }
                } else {
                    state.player.hp = newHp;
                    state.player.stress = Math.min(state.player.maxStress, state.player.stress + 5);
                }
            }
            state.concessionOffered = null;
            state.pendingConcessionDamage = 0;
        },
        /** Enter Stage Left: add Fellow Ranger or Merchant to current room. */
        addAllyOrMerchantToCurrentRoom: (state) => {
            if (!state.currentRoom) return;
            const hasRanger = (state.currentRoom.allies ?? []).some((a) => a.name === FELLOW_RANGER.name);
            const hasMerchant = (state.currentRoom.merchants ?? []).length > 0;
            if (Math.random() < 0.5 && !hasRanger) {
                state.currentRoom.allies = [...(state.currentRoom.allies ?? []), { ...FELLOW_RANGER, id: `ranger_${uniqueLogId()}` }];
            } else if (!hasMerchant) {
                state.currentRoom.merchants = [...(state.currentRoom.merchants ?? []), createMerchant()];
            }
        },
        openTradePanel: (state, action: PayloadAction<{ merchantId: string }>) => {
            state.tradePanelMerchantId = action.payload.merchantId;
        },
        closeTradePanel: (state) => {
            state.tradePanelMerchantId = null;
        },
        buyFromMerchant: (state, action: PayloadAction<{ merchantId: string; itemId: string }>) => {
            const { merchantId, itemId } = action.payload;
            if (!state.player || !state.currentRoom?.merchants) return;
            const merchant = state.currentRoom.merchants.find((m) => m.id === merchantId);
            if (!merchant) return;
            const idx = merchant.wares.findIndex((w) => w.id === itemId);
            if (idx < 0) return;
            const [item] = merchant.wares.splice(idx, 1);
            state.player.inventory.push(item);
            state.logs.push({ id: uniqueLogId(), timestamp: Date.now(), message: `Bought ${item.name} from ${merchant.name}.`, type: "exploration" });
        },
        sellToMerchant: (state, action: PayloadAction<{ merchantId: string; itemId: string }>) => {
            const { merchantId, itemId } = action.payload;
            if (!state.player || !state.currentRoom?.merchants) return;
            const merchant = state.currentRoom.merchants.find((m) => m.id === merchantId);
            if (!merchant) return;
            const idx = state.player.inventory.findIndex((i) => i.id === itemId);
            if (idx < 0) return;
            const [item] = state.player.inventory.splice(idx, 1);
            merchant.wares.push(item);
            state.logs.push({ id: uniqueLogId(), timestamp: Date.now(), message: `Sold ${item.name} to ${merchant.name}.`, type: "exploration" });
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
            const room = action.payload.initialRoom;
            state.exploredRooms[room.id] = room;
            state.roomCoordinates[room.id] = { x: 0, y: 0 };
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

        // Move — record explored room and link from previous room
        builder.addCase(movePlayer.fulfilled, (state, action) => {
            const { newRoom, previousRoomId, direction } = action.payload;
            state.currentRoom = newRoom;
            state.tradePanelMerchantId = null;
            state.exploredRooms[newRoom.id] = newRoom;
            const prevCoord = state.roomCoordinates[previousRoomId];
            const delta = { North: { x: 0, y: -1 }, South: { x: 0, y: 1 }, East: { x: 1, y: 0 }, West: { x: -1, y: 0 } }[direction];
            state.roomCoordinates[newRoom.id] = prevCoord ? { x: prevCoord.x + delta.x, y: prevCoord.y + delta.y } : { x: delta.x, y: delta.y };
            const prevRoom = state.exploredRooms[previousRoomId];
            if (prevRoom) {
                state.exploredRooms[previousRoomId] = { ...prevRoom, exits: { ...prevRoom.exits, [direction]: newRoom.id } };
            }
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
        // Vignette Logging
        builder.addCase(startVignette, (state, action) => {
            state.logs.push({
                id: uniqueLogId(),
                timestamp: Date.now(),
                message: `Vignette Started: "${action.payload.theme}"`,
                type: "narrative"
            });
        });
        builder.addCase(advanceVignetteStage, (state, action) => {
            state.logs.push({
                id: uniqueLogId(),
                timestamp: Date.now(),
                message: `Vignette Advanced: ${action.payload.stage}`,
                type: "narrative"
            });
        });
        builder.addCase(endVignette, (state) => {
            state.logs.push({
                id: uniqueLogId(),
                timestamp: Date.now(),
                message: "Vignette Ended.",
                type: "narrative"
            });
        });
    }
});

export const {
    addLog,
    addHazardOrEnemyToCurrentRoom,
    acceptConcession,
    rejectConcession,
    addAllyOrMerchantToCurrentRoom,
    openTradePanel,
    closeTradePanel,
    buyFromMerchant,
    sellToMerchant,
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

export const selectTradePanelMerchantId = createSelector(
    [selectGameState],
    (game) => game.tradePanelMerchantId
);

export const selectExploredRooms = createSelector(
    [selectGameState],
    (game) => game.exploredRooms
);

export const selectRoomCoordinates = createSelector(
    [selectGameState],
    (game) => game.roomCoordinates
);

export default gameSlice.reducer;
