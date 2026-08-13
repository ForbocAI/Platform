import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../src/features/game/store/gameSlice';
import { movePlayer } from '../src/features/game/mechanics/orchestrators/exploration';
import { initialState } from '../src/features/game/store/constants';
import type { GameState } from '../src/features/game/store/types';
import type { Direction, Sector, PerformanceMetrics } from '../src/features/game/types';

const makeArea = (exits: Record<string, string | null>): Sector => ({
    id: 'area-1',
    title: 'Test Sector',
    description: 'A test sector.',
    regionalType: 'Meadows',
    hazards: [],
    exits,
    npcs: [],
});

const makeSessionScore = (): PerformanceMetrics => ({
    resourcesEarned: 0,
    startTime: Date.now(),
    endTime: null,
    areasExplored: 0,
    areasScanned: 0,
    npcsDefeated: 0,
    vendorTrades: 0,
    questsCompleted: 0,
});

const makeRealStore = (area: Sector) =>
    configureStore({
        reducer: { game: gameReducer },
        preloadedState: {
            game: { ...initialState, currentArea: area, sessionScore: makeSessionScore() } as GameState,
        },
    });

describe('movePlayer thunk against a real store — no mutation on rejection', () => {
    it('a valid direction mutates currentArea, exploredAreas, and sessionScore, and logs "Moved"', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        const store = makeRealStore(area);

        await store.dispatch(movePlayer('North'));

        const state = store.getState().game;
        expect(state.currentArea).not.toBe(area);
        expect(Object.keys(state.exploredAreas)).toHaveLength(1);
        expect(state.sessionScore?.areasExplored).toBe(1);
        expect(state.logs.some((l) => l.message === 'Moved North.')).toBe(true);
    });

    it('an inherited-property direction ("constructor") leaves currentArea, exploredAreas, and sessionScore untouched', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        const store = makeRealStore(area);

        await store.dispatch(movePlayer('constructor' as Direction));

        const state = store.getState().game;
        expect(state.currentArea).toBe(area);
        expect(state.exploredAreas).toEqual({});
        expect(state.sessionScore?.areasExplored).toBe(0);
        expect(state.logs.map((l) => l.message)).toEqual(['Path blocked or invalid vector.']);
        expect(state.logs.some((l) => l.message.includes('Moved'))).toBe(false);
    });

    it('"toString" and "__proto__" likewise leave state untouched', async () => {
        for (const bad of ['toString', '__proto__'] as unknown as Direction[]) {
            const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
            const store = makeRealStore(area);

            await store.dispatch(movePlayer(bad));

            const state = store.getState().game;
            expect(state.currentArea).toBe(area);
            expect(state.exploredAreas).toEqual({});
            expect(state.logs.some((l) => l.message.includes('Moved'))).toBe(false);
        }
    });
});
