
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Player, Room, GameLogEntry, LoomResult, Enemy } from '@/lib/quadar/types';
import { initializePlayer } from '@/lib/quadar/engine';
import { SDK } from '@/lib/sdk-placeholder';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { resolveDuel, resolveEnemyAttack } from '@/lib/quadar/combat';

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
};

// Async Thunks
export interface InitializeGameOptions {
    forceMerchant?: boolean;
}

export const initializeGame = createAsyncThunk(
    'game/initialize',
    async (options: InitializeGameOptions | undefined, { dispatch }) => {
        // Simulate initial connection sequence
        dispatch(addLog({ message: "SYSTEM: Establishing Neural Link...", type: "system" }));
        await new Promise(resolve => setTimeout(resolve, 800));

        const player = initializePlayer();
        const initialRoom = await SDK.Cortex.generateRoom("start_room", "Quadar Tower", { forceMerchant: options?.forceMerchant });

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

        const message = `[SCAN RESULT]\nLocation: ${room.title}\nBiome: ${room.biome}\nHazards: ${room.hazards.join(", ") || "None"}\nHostiles: ${enemies}\nAllies: ${allies}\nExits: ${exits}`;

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

export const engageHostiles = createAsyncThunk(
    'game/engageHostiles',
    async (_, { getState, dispatch }) => {
        const state = getState() as { game: GameState };
        const { player, currentRoom } = state.game;

        if (!player || !currentRoom) return;

        if (currentRoom.enemies.length === 0) {
            dispatch(addLog({ message: "No hostiles to engage.", type: "combat" }));
            return null;
        }

        const enemy = currentRoom.enemies[0]; // Target first enemy

        // Player attacks
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
            playerDamage
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
            let newSurge = player.surgeCount;
            if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
            player.surgeCount = newSurge;

            // Log is handled in thunk
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
            let newSurge = player.surgeCount;
            if (result.surgeUpdate === -1) { newSurge = 0; } else { newSurge += result.surgeUpdate; }
            player.surgeCount = newSurge;
        });

        // Move
        builder.addCase(movePlayer.fulfilled, (state, action) => {
            const { room: newRoom, direction } = action.payload;
            const prevRoom = state.currentRoom;
            if (!prevRoom) return;
            const prevCoord = state.roomCoordinates[prevRoom.id] ?? { x: 0, y: 0 };
            const delta = { North: { x: 0, y: -1 }, South: { x: 0, y: 1 }, East: { x: 1, y: 0 }, West: { x: -1, y: 0 } }[direction] ?? { x: 0, y: 0 };
            const newCoord = { x: prevCoord.x + delta.x, y: prevCoord.y + delta.y };
            state.currentRoom = newRoom;
            state.exploredRooms[newRoom.id] = newRoom;
            state.roomCoordinates[newRoom.id] = newCoord;
        });

        // Combat
        builder.addCase(engageHostiles.fulfilled, (state, action) => {
            if (!action.payload || !state.player || !state.currentRoom) return;
            const { enemyId, enemyDamage, enemyDefeated, playerDamage } = action.payload;

            // Update Player
            state.player.hp -= playerDamage;
            if (state.player.hp < 0) state.player.hp = 0;
            state.player.stress += 1;

            // Update Enemy
            const enemies = state.currentRoom.enemies.map(e => {
                if (e.id === enemyId) {
                    return { ...e, hp: e.hp - enemyDamage };
                }
                return e;
            });

            if (enemyDefeated) {
                // Remove defeated enemy
                state.currentRoom.enemies = enemies.filter(e => e.id !== enemyId);
                // Rewards
                state.player.spirit = (state.player.spirit || 0) + 5;
                state.player.blood = (state.player.blood || 0) + 2;
            } else {
                state.currentRoom.enemies = enemies;
            }
        });

        // Respawn
        builder.addCase(respawnPlayer.fulfilled, (state) => {
            if (!state.player || !state.currentRoom) return;
            state.player.hp = state.player.maxHp;
            state.player.stress = 0; // Reset stress too? Usually.
            state.player.stress = 0; // Reset stress too? Usually.
            state.currentRoom.enemies = []; // Clear enemies as per doc.
        });

        // Trade
        builder.addCase(tradeBuy.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { item, spiritCost, bloodCost } = action.payload;

            // Deduct cost
            state.player.spirit = (state.player.spirit || 0) - spiritCost;
            state.player.blood = (state.player.blood || 0) - bloodCost;

            // Add item (clone with new unique ID just in case, though simple ID is fine for now)
            // actually engine.ts generates unique IDs for wares, so we can likely push directly or clone to be safe
            state.player.inventory.push({ ...item });
        });

        builder.addCase(tradeSell.fulfilled, (state, action) => {
            if (!action.payload || !state.player) return;
            const { itemIndex, value } = action.payload;

            // Remove item
            state.player.inventory.splice(itemIndex, 1);

            // Add value
            state.player.spirit = (state.player.spirit || 0) + value;
        });
    }
});

export const { addLog } = gameSlice.actions;

// Selectors
export const selectPlayer = (state: { game: GameState }) => state.game.player;
export const selectCurrentRoom = (state: { game: GameState }) => state.game.currentRoom;
export const selectExploredRooms = (state: { game: GameState }) => state.game.exploredRooms;
export const selectRoomCoordinates = (state: { game: GameState }) => state.game.roomCoordinates;
export const selectLogs = (state: { game: GameState }) => state.game.logs;
export const selectIsInitialized = (state: { game: GameState }) => state.game.isInitialized;
export const selectIsLoading = (state: { game: GameState }) => state.game.isLoading;

export default gameSlice.reducer;
