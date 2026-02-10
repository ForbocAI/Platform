
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Player, Room, GameLogEntry, LoomResult, Enemy, ActiveQuest, SessionScore } from '@/lib/quadar/types';
import { initializePlayer, generateRandomEnemy, generateRandomMerchant } from '@/lib/quadar/engine';
import { SDK } from '@/lib/sdk-placeholder';
import { addFact, advanceVignetteStage } from '@/features/narrative/slice/narrativeSlice';
import { resolveDuel, resolveEnemyAttack, resolveSpellDuel } from '@/lib/quadar/combat';
import { SPELLS, getSpellUnlockForLevel, getSkillUnlockForLevel, getSkillsForLevels } from '@/lib/quadar/mechanics';
import type { VignetteStage } from '@/lib/quadar/types';
import { resolveUnexpectedlyEffect } from '@/lib/quadar/narrativeHelpers';
import { applyDamageDealtBonus, applyDamageTakenReduction, getKeenSensesScanExtra } from '@/lib/quadar/skills';

export interface RoomCoordinates {
    x: number;
    y: number;
}

interface GameState {
    player: Player | null;
    /** Current room where player is located. */
    currentRoom: Room | null;
    /** All rooms visited this session; map grid grows as player moves. */
    exploredRooms: Record<string, Room>;
    /** Grid position per room (start at 0,0). */
    roomCoordinates: Record<string, RoomCoordinates>;
    logs: GameLogEntry[];
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    selectedSpellId: string | null;
    /** Active quests (reconnaissance, rescue). Progress updated by move/scan/combat. */
    activeQuests: ActiveQuest[];
    /** Session stats for scoring. */
    sessionScore: SessionScore | null;
    /** "quests" = all quests done; "death" = died; null = in progress. */
    sessionComplete: "quests" | "death" | null;
    /** Facts to flush to narrative when quests complete (component dispatches addFact then clear). */
    pendingQuestFacts: string[];
}

const initialSessionScore = (): SessionScore => ({
    roomsExplored: 0,
    roomsScanned: 0,
    enemiesDefeated: 0,
    merchantTrades: 0,
    questsCompleted: 0,
    spiritEarned: 0,
    startTime: Date.now(),
    endTime: null,
});

const VIGNETTE_STAGES: VignetteStage[] = ["Exposition", "Rising Action", "Climax", "Epilogue"];

function nextVignetteStage(current: VignetteStage): VignetteStage | null {
    const i = VIGNETTE_STAGES.indexOf(current);
    return VIGNETTE_STAGES[i + 1] ?? null;
}

/** Seed starting quests: recon (scan 5), rescue (find 1 ally), hostiles (defeat 3), merchant (trade 2). */
function seedQuests(): ActiveQuest[] {
    return [
        { id: "recon-1", kind: "reconnaissance", label: "Scan 5 sectors", target: 5, progress: 0, complete: false },
        { id: "rescue-1", kind: "rescue", label: "Find a Fellow Ranger", target: 1, progress: 0, complete: false },
        { id: "hostiles-1", kind: "hostiles", label: "Defeat 3 hostiles", target: 3, progress: 0, complete: false },
        { id: "merchant-1", kind: "merchant", label: "Trade with 2 merchants", target: 2, progress: 0, complete: false },
    ];
}

const initialState: GameState = {
    player: null,
    currentRoom: null,
    exploredRooms: {},
    roomCoordinates: {},
    logs: [],
    isInitialized: false,
    isLoading: false,
    error: null,
    selectedSpellId: null,
    activeQuests: [],
    sessionScore: null,
    sessionComplete: null,
    pendingQuestFacts: [],
};

// Async Thunks
export interface InitializeGameOptions {
    forceMerchant?: boolean;
    deterministic?: boolean;
    forceEnemy?: boolean;
    lowHp?: boolean;
}

export const initializeGame = createAsyncThunk(
    'game/initialize',
    async (options: InitializeGameOptions | undefined, { dispatch }) => {
        // Simulate initial connection sequence
        dispatch(addLog({ message: "SYSTEM: Establishing Neural Link...", type: "system" }));
        await new Promise(resolve => setTimeout(resolve, 800));

        const player = initializePlayer();
        player.skills = getSkillsForLevels(player.characterClass, player.level);
        if (options?.lowHp) {
            player.hp = 5;
        }
        const initialRoom = await SDK.Cortex.generateStartRoom({
            deterministic: options?.deterministic,
            forceMerchant: options?.forceMerchant,
            forceEnemy: options?.forceEnemy,
        });

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

        dispatch(addFact({
            sourceQuestion: question,
            sourceAnswer: result.description,
            text: `Oracle answered: ${result.description}`,
            questionKind: "oracle",
            isFollowUp: false,
        }));

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

        return { room: newRoom, direction };
    }
);

export const scanSector = createAsyncThunk(
    'game/scanSector',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const room = state.game.currentRoom;
        if (!room) return;

        dispatch(addLog({ message: "Scanning sector...", type: "system" }));
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate scan time

        const enemies = room.enemies.length > 0 ? room.enemies.map(e => `${e.name} (${e.hp} HP)`).join(", ") : "None";
        const allies = room.allies ? room.allies.map(a => a.name).join(", ") : "None";
        const exits = Object.keys(room.exits).filter(k => room.exits[k as keyof typeof room.exits]).join(", ") || "None"; // Only show available exits

        let message = `[SCAN RESULT]\nLocation: ${room.title}\nBiome: ${room.biome}\nHazards: ${room.hazards.join(", ") || "None"}\nHostiles: ${enemies}\nAllies: ${allies}\nExits: ${exits}`;
        const player = state.game.player;
        if (player?.skills?.includes("keen_senses")) {
            message += `\n${getKeenSensesScanExtra(room)}`;
        }

        dispatch(addLog({ message, type: "exploration" }));
        dispatch(addFact({
            text: `Scanned ${room.title}: ${enemies === "None" ? "Secure" : "Hostiles present"}.`,
            questionKind: "scan",
            isFollowUp: false,
        }));
    }
);

export const communeWithVoid = createAsyncThunk(
    'game/communeWithVoid',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        if (!state.game.player) return;

        dispatch(addLog({ message: "You attempt to commune with the void...", type: "system" }));

        // Reuse consultLoom but with a generic prompt
        const result = await SDK.Cortex.consultOracle("Commune", state.game.player.surgeCount);

        dispatch(addLog({ message: `Loom: ${result.description}`, type: "loom" }));
        dispatch(addFact({
            text: `Communed with void: ${result.description}`,
            questionKind: "commune",
            sourceAnswer: result.description,
            isFollowUp: false,
        }));

        return result;
    }
);

export const castSpell = createAsyncThunk(
    'game/castSpell',
    async ({ spellId }: { spellId: string }, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const { player, currentRoom } = state.game;

        if (!player || !currentRoom) return;

        if (currentRoom.enemies.length === 0) {
            dispatch(addLog({ message: "No target for spell.", type: "system" }));
            return null;
        }

        const spell = SPELLS[spellId];
        if (!spell) {
            dispatch(addLog({ message: "Unknown spell.", type: "system" }));
            return null;
        }

        const enemy = currentRoom.enemies[0]; // Target first enemy

        // Player casts spell
        const duelResult = resolveSpellDuel(player, enemy, spell);
        dispatch(addLog({ message: duelResult.message, type: "combat" }));

        let enemyDamage = 0;
        let enemyDefeated = false;

        if (duelResult.hit) {
            enemyDamage = duelResult.damage;
            if (enemy.hp - enemyDamage <= 0) {
                enemyDefeated = true;
                dispatch(addLog({ message: `${enemy.name} has been eradicated by arcane force!`, type: "combat" }));
                dispatch(addFact({ text: `Vanquished ${enemy.name} with ${spell.name}.`, questionKind: "combat", isFollowUp: false }));
                const narrativeState = getState() as { narrative: { vignette: { stage: VignetteStage } | null } };
                if (narrativeState.narrative?.vignette) {
                    const next = nextVignetteStage(narrativeState.narrative.vignette.stage);
                    if (next) dispatch(advanceVignetteStage({ stage: next }));
                }
            }
        }

        let playerDamage = 0;
        // Enemy counter-attack if still alive
        if (!enemyDefeated) {
            const enemyAttack = resolveEnemyAttack(enemy, player);
            dispatch(addLog({ message: enemyAttack.message, type: "combat" }));
            if (enemyAttack.hit) {
                playerDamage = enemyAttack.damage;
            }
        }

        return {
            enemyId: enemy.id,
            enemyDamage,
            enemyDefeated,
            playerDamage,
            xpGain: enemyDefeated ? 50 : 0
        };
    }
);

export const engageHostiles = createAsyncThunk(
    'game/engageHostiles',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const { player, currentRoom, selectedSpellId } = state.game;

        if (!player || !currentRoom) return;

        // If spell selected, delegate to castSpell
        if (selectedSpellId) {
            await dispatch(castSpell({ spellId: selectedSpellId }));
            // Use action creator from slice (will be defined by runtime execution time)
            dispatch(gameSlice.actions.selectSpell(null));
            return null;
        }

        if (currentRoom.enemies.length === 0) {
            dispatch(addLog({ message: "No hostiles to engage.", type: "combat" }));
            return null;
        }

        const enemy = currentRoom.enemies[0]; // Target first enemy

        // Player attacks (Basic Attack)
        const duelResult = resolveDuel(player, enemy);
        dispatch(addLog({ message: duelResult.message, type: "combat" }));

        let enemyDamage = 0;
        let enemyDefeated = false;

        if (duelResult.hit) {
            enemyDamage = duelResult.damage;
            if (enemy.hp - enemyDamage <= 0) {
                enemyDefeated = true;
                dispatch(addLog({ message: `${enemy.name} has fallen!`, type: "combat" }));
                dispatch(addFact({ text: `Heroically defeated ${enemy.name}.`, questionKind: "combat", isFollowUp: false }));
                const narrativeState = getState() as { narrative: { vignette: { stage: VignetteStage } | null } };
                if (narrativeState.narrative?.vignette) {
                    const next = nextVignetteStage(narrativeState.narrative.vignette.stage);
                    if (next) dispatch(advanceVignetteStage({ stage: next }));
                }
            }
        }

        let playerDamage = 0;
        // Enemy counter-attack if still alive
        if (!enemyDefeated) {
            const enemyAttack = resolveEnemyAttack(enemy, player);
            dispatch(addLog({ message: enemyAttack.message, type: "combat" }));
            if (enemyAttack.hit) {
                playerDamage = enemyAttack.damage;
            }
        }

        return {
            enemyId: enemy.id,
            enemyDamage,
            enemyDefeated,
            playerDamage,
            xpGain: enemyDefeated ? 50 : 0
        };
    }
);

export const respawnPlayer = createAsyncThunk(
    'game/respawn',
    async (_, { getState, dispatch }) => {
        dispatch(addLog({ message: "Resurrecting...", type: "system" }));
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch(addLog({ message: "You gasp for breath as the void releases you.", type: "system" }));
        dispatch(addFact({ text: "Died and returned from the void.", questionKind: "respawn", isFollowUp: false }));
    }
);

export const tradeBuy = createAsyncThunk(
    'game/tradeBuy',
    async ({ merchantId, itemId }: { merchantId: string; itemId: string }, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const { currentRoom, player } = state.game;
        if (!currentRoom || !player) return;

        const merchant = currentRoom.merchants?.find(m => m.id === merchantId);
        if (!merchant) return;

        const item = merchant.wares.find(i => i.id === itemId);
        if (!item) return;

        const cost = item.cost || { spirit: 0 };
        const spiritCost = cost.spirit || 0;
        const bloodCost = cost.blood || 0;

        if ((player.spirit || 0) < spiritCost || (player.blood || 0) < bloodCost) {
            dispatch(addLog({ message: "Insufficent currency.", type: "system" }));
            return;
        }

        dispatch(addLog({ message: `Purchased ${item.name} from ${merchant.name}.`, type: "system" }));
        dispatch(addFact({ text: `Purchased ${item.name} from ${merchant.name}.`, questionKind: "trade", isFollowUp: false }));
        const narrativeState = getState() as { narrative: { vignette: { stage: VignetteStage } | null } };
        if (narrativeState.narrative?.vignette) {
            const next = nextVignetteStage(narrativeState.narrative.vignette.stage);
            if (next) dispatch(advanceVignetteStage({ stage: next }));
        }
        return { item, spiritCost, bloodCost };
    }
);

export const tradeSell = createAsyncThunk(
    'game/tradeSell',
    async ({ itemId }: { itemId: string }, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const { player } = state.game;
        if (!player) return;

        const itemIndex = player.inventory.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = player.inventory[itemIndex];
        const cost = item.cost || { spirit: 10 }; // Default value if generic item
        const value = Math.floor((cost.spirit || 0) / 2);

        dispatch(addLog({ message: `Sold ${item.name} for ${value} Spirit.`, type: "system" }));
        dispatch(addFact({ text: `Sold ${item.name}.`, questionKind: "trade", isFollowUp: false }));
        const narrativeState = getState() as { narrative: { vignette: { stage: VignetteStage } | null } };
        if (narrativeState.narrative?.vignette) {
            const next = nextVignetteStage(narrativeState.narrative.vignette.stage);
            if (next) dispatch(advanceVignetteStage({ stage: next }));
        }
        return { itemIndex, value };
    }
);

const DIRECTIONS = ['North', 'South', 'East', 'West'] as const;

/** One autoplay tick: simulates a relentless chronicler following the Shadows of Fate. */
export const runAutoplayTick = createAsyncThunk(
    'game/runAutoplayTick',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: any };
        const { currentRoom: room, player } = state.game;

        if (!room || !player) return;

        // 1. COMBAT PRIORITY: If malevolent adversaries cross our path, vanquish foes.
        if (room.enemies.length > 0) {
            await dispatch(engageHostiles());
            return;
        }

        // 2. SURVIVAL/RESPAWN: If the void is claiming us (HP < 10), we gasp for air.
        if (player.hp <= 0) {
            await dispatch(respawnPlayer());
            return;
        }

        // 3. TRADE PRIORITY: Exchange gems for cryptic artifacts if a merchant materialize.
        if (room.merchants && room.merchants.length > 0 && (player.spirit > 50 || player.blood > 10)) {
            const merchant = room.merchants[0];
            const item = merchant.wares[0];
            if (item) {
                await dispatch(tradeBuy({ merchantId: merchant.id, itemId: item.id }));
                return;
            }
        }

        // 4. INFORMATION GATHERING: The chronicler must catalog the labyrinth.
        // If we haven't scanned this room yet (check logs?), we scan.
        const recentLogs = state.game.logs.slice(-5);
        const alreadyScanned = recentLogs.some((l: any) => l.message.includes("[SCAN RESULT]") && l.message.includes(room.title));

        if (!alreadyScanned) {
            await dispatch(scanSector());
            return;
        }

        // 5. MYSTICAL CONECTION: At times, we must commune with the void.
        if (Math.random() < 0.15) {
            await dispatch(communeWithVoid());
            return;
        }

        // 6. MOVEMENT: Advance through the interdimensional tapestry.
        const available = DIRECTIONS.filter((d) => room.exits[d]);
        if (available.length > 0) {
            // Favor unexplored or interesting vectors
            const dir = available[Math.floor(Math.random() * available.length)];
            await dispatch(movePlayer(dir));
            return;
        }

        // 7. ORACLE FALLBACK: When reality ripples, interpellate the Loom of Fate.
        const themes = [
            "What shadows lurk in this corner of the otherworld?",
            "Is the fabric of reality weakening here?",
            "Can I hear the whispers of the ancient ones?",
            "Is there a slipgate hidden amidst the eerige foliage?",
            "Does the presence of the Governor of Qua'dar linger here?"
        ];
        const question = themes[Math.floor(Math.random() * themes.length)];
        await dispatch(askOracle(question));
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
        selectSpell: (state, action: PayloadAction<string | null>) => {
            state.selectedSpellId = action.payload;
        },
        clearPendingQuestFacts: (state) => {
            state.pendingQuestFacts = [];
        },
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
            const initialRoom = action.payload.initialRoom;
            state.currentRoom = initialRoom;
            state.exploredRooms = { [initialRoom.id]: initialRoom };
            state.roomCoordinates = { [initialRoom.id]: { x: 0, y: 0 } };
            state.activeQuests = seedQuests();
            state.sessionScore = {
                ...initialSessionScore(),
                spiritEarned: action.payload.player.spirit ?? 0,
            };
            state.sessionComplete = null;
            state.pendingQuestFacts = [];
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: "SYSTEM: Connection Stable. Welcome to Quadar Tower, Ranger.",
                type: "system"
            });
        });

        // Oracle / Commune
        builder.addCase(askOracle.fulfilled, (state, action) => {
            if (!state.player) return;
            const result = action.payload;
            const player = state.player;

            // Surge Update
            let newSurge = player.surgeCount;
            if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
            player.surgeCount = newSurge;

            // Handle Unexpectedly Event
            if (result.unexpectedRoll) {
                const effect = resolveUnexpectedlyEffect(result.unexpectedRoll, result.unexpectedEvent || "");
                if (effect.applyEnteringRed && state.currentRoom) {
                    // Add random enemy
                    state.currentRoom.enemies.push(generateRandomEnemy());
                    state.currentRoom.hazards.push("Threat Imminent");
                }
                if (effect.applyEnterStageLeft && state.currentRoom) {
                    // Add merchant and ally
                    if (!state.currentRoom.merchants) state.currentRoom.merchants = [];
                    state.currentRoom.merchants.push(generateRandomMerchant());

                    if (!state.currentRoom.allies) state.currentRoom.allies = [];
                    state.currentRoom.allies.push({ id: Date.now().toString(), name: "Fellow Ranger" });
                }
            }

            // Log is handled in thunk but we add the Oracle result here too for persistent log state
            state.logs.push({
                id: Date.now().toString(),
                timestamp: Date.now(),
                message: `Oracle: ${result.description} (Roll: ${result.roll}, Surge: ${newSurge})`,
                type: "loom"
            });
        });

        builder.addCase(communeWithVoid.fulfilled, (state, action) => {
            if (!state.player || !action.payload) return;
            const result = action.payload;
            const player = state.player;

            // Surge Update
            let newSurge = player.surgeCount;
            if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
            player.surgeCount = newSurge;

            // Handle Unexpectedly Event
            if (result.unexpectedRoll) {
                const effect = resolveUnexpectedlyEffect(result.unexpectedRoll, result.unexpectedEvent || "");
                if (effect.applyEnteringRed && state.currentRoom) {
                    state.currentRoom.enemies.push(generateRandomEnemy());
                    state.currentRoom.hazards.push("Threat Imminent");
                }
                if (effect.applyEnterStageLeft && state.currentRoom) {
                    if (!state.currentRoom.merchants) state.currentRoom.merchants = [];
                    state.currentRoom.merchants.push(generateRandomMerchant());

                    if (!state.currentRoom.allies) state.currentRoom.allies = [];
                    state.currentRoom.allies.push({ id: Date.now().toString(), name: "Fellow Ranger" });
                }
            }
        });

        // Move
        builder.addCase(movePlayer.fulfilled, (state, action) => {
            const { room: newRoom } = action.payload;
            const prevRoom = state.currentRoom;
            if (!prevRoom) return;
            const prevCoord = state.roomCoordinates[prevRoom.id] ?? { x: 0, y: 0 };
            const direction = action.payload.direction;
            const delta = { North: { x: 0, y: -1 }, South: { x: 0, y: 1 }, East: { x: 1, y: 0 }, West: { x: -1, y: 0 } }[direction] ?? { x: 0, y: 0 };
            const newCoord = { x: prevCoord.x + delta.x, y: prevCoord.y + delta.y };
            state.currentRoom = newRoom;
            state.exploredRooms[newRoom.id] = newRoom;
            state.roomCoordinates[newRoom.id] = newCoord;
            if (state.sessionScore) state.sessionScore.roomsExplored += 1;
            // Rescue: find Fellow Ranger in this room
            if (newRoom.allies?.length && state.sessionScore) {
                const rescue = state.activeQuests.find(q => q.kind === "rescue" && !q.complete);
                if (rescue) {
                    rescue.progress = 1;
                    rescue.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${rescue.label}.`);
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${rescue.label}.`, type: "system" });
                    if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                        state.sessionComplete = "quests";
                        state.sessionScore.endTime = Date.now();
                    }
                }
            }
        });

        // Scan: advance reconnaissance and session score
        builder.addCase(scanSector.fulfilled, (state) => {
            if (state.sessionScore) state.sessionScore.roomsScanned += 1;
            const recon = state.activeQuests.find(q => q.kind === "reconnaissance" && !q.complete);
            if (recon && state.sessionScore) {
                recon.progress = state.sessionScore.roomsScanned;
                if (recon.progress >= recon.target) {
                    recon.complete = true;
                    state.sessionScore.questsCompleted += 1;
                    state.pendingQuestFacts.push(`Completed quest: ${recon.label}.`);
                    state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${recon.label}.`, type: "system" });
                    if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                        state.sessionComplete = "quests";
                        state.sessionScore.endTime = Date.now();
                    }
                }
            }
        });

        // Combat
        builder.addCase(engageHostiles.fulfilled, (state, action) => {
            if (!action.payload || !state.player || !state.currentRoom) return;
            const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;
            const skills = state.player.skills ?? [];
            const actualPlayerDamage = applyDamageTakenReduction(skills, playerDamage);
            const actualEnemyDamage = applyDamageDealtBonus(skills, enemyDamage);

            // Update Player
            state.player.hp -= actualPlayerDamage;
            if (state.player.hp < 0) state.player.hp = 0;
            state.player.stress += 1;

            // Update Enemy
            const enemies = state.currentRoom.enemies.map(e => {
                if (e.id === enemyId) {
                    return { ...e, hp: e.hp - actualEnemyDamage };
                }
                return e;
            });

            if (enemyDefeated) {
                // Remove defeated enemy
                state.currentRoom.enemies = enemies.filter(e => e.id !== enemyId);
                // Rewards
                state.player.spirit = (state.player.spirit || 0) + 5;
                state.player.blood = (state.player.blood || 0) + 2;
                if (state.sessionScore) {
                    state.sessionScore.enemiesDefeated += 1;
                    state.sessionScore.spiritEarned += 5;
                    // Hostiles quest
                    const hostilesQuest = state.activeQuests.find(q => q.kind === "hostiles" && !q.complete);
                    if (hostilesQuest) {
                        hostilesQuest.progress = state.sessionScore.enemiesDefeated;
                        if (hostilesQuest.progress >= hostilesQuest.target) {
                            hostilesQuest.complete = true;
                            state.sessionScore.questsCompleted += 1;
                            state.pendingQuestFacts.push(`Completed quest: ${hostilesQuest.label}.`);
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${hostilesQuest.label}.`, type: "system" });
                            if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                                state.sessionComplete = "quests";
                                state.sessionScore.endTime = Date.now();
                            }
                        }
                    }
                }

                // XP Logic and level-up spell/skill unlock
                const xpGain = (action.payload as any).xpGain || 0;
                if (xpGain > 0) {
                    state.player.xp += xpGain;
                    if (state.player.xp >= state.player.maxXp) {
                        state.player.xp -= state.player.maxXp;
                        state.player.level += 1;
                        state.player.maxXp += 100;
                        state.player.maxHp += 10;
                        state.player.hp = state.player.maxHp;
                        state.player.stress = Math.max(0, state.player.stress - 20);
                        const newSpell = getSpellUnlockForLevel(state.player.characterClass, state.player.level);
                        const newSkill = getSkillUnlockForLevel(state.player.characterClass, state.player.level);
                        if (newSpell && !state.player.spells.includes(newSpell)) {
                            state.player.spells = [...state.player.spells, newSpell];
                            const spellName = SPELLS[newSpell]?.name ?? newSpell;
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked: ${spellName}.`, type: "system" });
                        } else if (newSkill) {
                            const skills = state.player.skills ?? [];
                            if (!skills.includes(newSkill)) {
                                state.player.skills = [...skills, newSkill];
                                state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked skill: ${newSkill}.`, type: "system" });
                            } else {
                                state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                            }
                        } else {
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                        }
                    } else {
                        state.logs.push({
                            id: Date.now().toString(),
                            timestamp: Date.now(),
                            message: `Gained ${xpGain} XP.`,
                            type: "system"
                        });
                    }
                }
            } else {
                state.currentRoom.enemies = enemies;
            }
        });

        // Cast Spell
        builder.addCase(castSpell.fulfilled, (state, action) => {
            if (!action.payload || !state.player || !state.currentRoom) return;
            const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;
            const spellSkills = state.player.skills ?? [];
            const actualPlayerDamageSpell = applyDamageTakenReduction(spellSkills, playerDamage);
            const actualEnemyDamageSpell = applyDamageDealtBonus(spellSkills, enemyDamage);

            // Update Player
            state.player.hp -= actualPlayerDamageSpell;
            if (state.player.hp < 0) state.player.hp = 0;
            state.player.stress += 1;

            // Update Enemy
            const enemiesSpell = state.currentRoom.enemies.map(e => {
                if (e.id === enemyId) {
                    return { ...e, hp: e.hp - actualEnemyDamageSpell };
                }
                return e;
            });

            if (enemyDefeated) {
                // Remove defeated enemy
                state.currentRoom.enemies = enemiesSpell.filter(e => e.id !== enemyId);
                // Rewards
                state.player.spirit = (state.player.spirit || 0) + 5;
                state.player.blood = (state.player.blood || 0) + 2;
                if (state.sessionScore) {
                    state.sessionScore.enemiesDefeated += 1;
                    state.sessionScore.spiritEarned += 5;
                    const hostilesQuest = state.activeQuests.find(q => q.kind === "hostiles" && !q.complete);
                    if (hostilesQuest) {
                        hostilesQuest.progress = state.sessionScore.enemiesDefeated;
                        if (hostilesQuest.progress >= hostilesQuest.target) {
                            hostilesQuest.complete = true;
                            state.sessionScore.questsCompleted += 1;
                            state.pendingQuestFacts.push(`Completed quest: ${hostilesQuest.label}.`);
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${hostilesQuest.label}.`, type: "system" });
                            if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                                state.sessionComplete = "quests";
                                state.sessionScore.endTime = Date.now();
                            }
                        }
                    }
                }

                // XP Logic and level-up spell/skill unlock
                const xpGain = (action.payload as any).xpGain || 0;
                if (xpGain > 0) {
                    state.player.xp += xpGain;
                    if (state.player.xp >= state.player.maxXp) {
                        state.player.xp -= state.player.maxXp;
                        state.player.level += 1;
                        state.player.maxXp += 100;
                        state.player.maxHp += 10;
                        state.player.hp = state.player.maxHp;
                        state.player.stress = Math.max(0, state.player.stress - 20);
                        const newSpell = getSpellUnlockForLevel(state.player.characterClass, state.player.level);
                        const newSkill = getSkillUnlockForLevel(state.player.characterClass, state.player.level);
                        if (newSpell && !state.player.spells.includes(newSpell)) {
                            state.player.spells = [...state.player.spells, newSpell];
                            const spellName = SPELLS[newSpell]?.name ?? newSpell;
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked: ${spellName}.`, type: "system" });
                        } else if (newSkill) {
                            const skills = state.player.skills ?? [];
                            if (!skills.includes(newSkill)) {
                                state.player.skills = [...skills, newSkill];
                                state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Unlocked skill: ${newSkill}.`, type: "system" });
                            } else {
                                state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                            }
                        } else {
                            state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `LEVEL UP! You are now level ${state.player.level}! Max HP increased.`, type: "system" });
                        }
                    } else {
                        state.logs.push({
                            id: Date.now().toString(),
                            timestamp: Date.now(),
                            message: `Gained ${xpGain} XP.`,
                            type: "system"
                        });
                    }
                }
            } else {
                state.currentRoom.enemies = enemiesSpell;
            }
        });

        // Respawn: session ends on death
        builder.addCase(respawnPlayer.fulfilled, (state) => {
            if (!state.player || !state.currentRoom) return;
            state.player.hp = state.player.maxHp;
            state.player.stress = 0;
            state.currentRoom.enemies = [];
            state.sessionComplete = "death";
            if (state.sessionScore) state.sessionScore.endTime = Date.now();
        });

        // Trade
        builder.addCase(tradeBuy.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { item, spiritCost, bloodCost } = action.payload;

            state.player.spirit = (state.player.spirit || 0) - spiritCost;
            state.player.blood = (state.player.blood || 0) - bloodCost;
            state.player.inventory.push({ ...item });

            if (state.sessionScore) {
                state.sessionScore.merchantTrades += 1;
                const merchantQuest = state.activeQuests.find(q => q.kind === "merchant" && !q.complete);
                if (merchantQuest) {
                    merchantQuest.progress = state.sessionScore.merchantTrades;
                    if (merchantQuest.progress >= merchantQuest.target) {
                        merchantQuest.complete = true;
                        state.sessionScore.questsCompleted += 1;
                        state.pendingQuestFacts.push(`Completed quest: ${merchantQuest.label}.`);
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${merchantQuest.label}.`, type: "system" });
                        if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                            state.sessionComplete = "quests";
                            state.sessionScore.endTime = Date.now();
                        }
                    }
                }
            }
        });

        builder.addCase(tradeSell.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { itemIndex, value } = action.payload;

            state.player.inventory.splice(itemIndex, 1);
            state.player.spirit = (state.player.spirit || 0) + value;

            if (state.sessionScore) {
                state.sessionScore.merchantTrades += 1;
                const merchantQuest = state.activeQuests.find(q => q.kind === "merchant" && !q.complete);
                if (merchantQuest) {
                    merchantQuest.progress = state.sessionScore.merchantTrades;
                    if (merchantQuest.progress >= merchantQuest.target) {
                        merchantQuest.complete = true;
                        state.sessionScore.questsCompleted += 1;
                        state.pendingQuestFacts.push(`Completed quest: ${merchantQuest.label}.`);
                        state.logs.push({ id: Date.now().toString(), timestamp: Date.now(), message: `Quest complete: ${merchantQuest.label}.`, type: "system" });
                        if (state.activeQuests.every(q => q.complete) && state.sessionScore) {
                            state.sessionComplete = "quests";
                            state.sessionScore.endTime = Date.now();
                        }
                    }
                }
            }
        });
    }
});

export const { addLog, selectSpell, clearPendingQuestFacts } = gameSlice.actions;

// Selectors
export const selectPlayer = (state: { game: GameState }) => state.game.player;
export const selectCurrentRoom = (state: { game: GameState }) => state.game.currentRoom;
export const selectExploredRooms = (state: { game: GameState }) => state.game.exploredRooms;
export const selectRoomCoordinates = (state: { game: GameState }) => state.game.roomCoordinates;
export const selectLogs = (state: { game: GameState }) => state.game.logs;
export const selectIsInitialized = (state: { game: GameState }) => state.game.isInitialized;
export const selectIsLoading = (state: { game: GameState }) => state.game.isLoading;
export const selectSelectedSpellId = (state: { game: GameState }) => state.game.selectedSpellId;
export const selectActiveQuests = (state: { game: GameState }) => state.game.activeQuests;
export const selectSessionScore = (state: { game: GameState }) => state.game.sessionScore;
export const selectSessionComplete = (state: { game: GameState }) => state.game.sessionComplete;
export const selectPendingQuestFacts = (state: { game: GameState }) => state.game.pendingQuestFacts;

export default gameSlice.reducer;
