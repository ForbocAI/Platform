import { describe, it, expect, vi, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const mockAskOracle = vi.fn();
vi.mock('../src/features/game/sdk/forbocRuntime', () => ({
    askOracle: mockAskOracle,
    ensureApiAvailable: vi.fn(),
}));

const { askInquiry, performSystemInquiry } = await import('../src/features/game/mechanics/orchestrators/inquiry');
const { sdkService } = await import('../src/features/game/sdk/cortexService');
const { gameApi } = await import('../src/features/core/api/gameApi');
const { baseApi } = await import('../src/features/core/api/baseApi');
const gameReducer = (await import('../src/features/game/store/gameSlice')).default;
const uiReducer = (await import('../src/features/core/ui/slice/uiSlice')).default;
const { initialState } = await import('../src/features/game/store/constants');
import type { GameState } from '../src/features/game/store/types';
import type { StageOfScene } from '../src/features/game/types';

const makeGetState = (stress: number, stage: StageOfScene) => () => ({
    game: { player: { stats: { stress } } } as unknown as GameState,
    ui: { stageOfScene: stage },
});

afterEach(() => {
    vi.restoreAllMocks();
    mockAskOracle.mockReset();
});

describe('askInquiry / performSystemInquiry thunks thread stress and stage correctly', () => {
    it('askInquiry passes player.stats.stress and state.ui.stageOfScene positionally to generateInquiryResponse', async () => {
        mockAskOracle.mockResolvedValue('...');
        const spy = vi.spyOn(sdkService, 'generateInquiryResponse');

        await askInquiry('Will I succeed?')(vi.fn(), makeGetState(15, 'To Conflict'), undefined);

        expect(spy).toHaveBeenCalledWith('Will I succeed?', 15, 'To Conflict');
        spy.mockRestore();
    });

    it('performSystemInquiry passes the same stress and stage as askInquiry', async () => {
        mockAskOracle.mockResolvedValue('...');
        const spy = vi.spyOn(sdkService, 'generateInquiryResponse');

        await performSystemInquiry(undefined)(vi.fn(), makeGetState(15, 'To Conflict'), undefined);

        expect(spy).toHaveBeenCalledWith('System Overview', 15, 'To Conflict');
        spy.mockRestore();
    });
});

describe('the askInquiry thunk and the performInquiry RTK Query mutation agree on the same domain result', () => {
    const makeApiStore = () =>
        configureStore({
            reducer: { [baseApi.reducerPath]: baseApi.reducer },
            middleware: (getDefault) => getDefault().concat(baseApi.middleware),
        });

    it('given the same question, stress, and roll, both paths report the same answer/qualifier/roll', async () => {
        mockAskOracle.mockResolvedValue('...');
        vi.spyOn(Math, 'random').mockReturnValue(0.82); // deterministic d100 = 83 -> "Yes, and..."

        const thunkResult = await askInquiry('Will I succeed?')(vi.fn(), makeGetState(15, 'To Conflict'), undefined);

        vi.spyOn(Math, 'random').mockReturnValue(0.82);
        const store = makeApiStore();
        const mutationResult = await store.dispatch(
            gameApi.endpoints.performInquiry.initiate({
                question: 'Will I succeed?',
                currentSystemStress: 15,
                stage: 'To Conflict',
            })
        );

        expect(askInquiry.fulfilled.match(thunkResult)).toBe(true);
        expect(mutationResult.data).toBeDefined();
        if (askInquiry.fulfilled.match(thunkResult) && mutationResult.data) {
            expect(mutationResult.data.answer).toBe(thunkResult.payload.answer);
            expect(mutationResult.data.qualifier).toBe(thunkResult.payload.qualifier);
            expect(mutationResult.data.roll).toBe(thunkResult.payload.roll);
        }
    });

    it('a different stress value changes the roll identically on both paths', async () => {
        mockAskOracle.mockResolvedValue('...');
        vi.spyOn(Math, 'random').mockReturnValue(0.6); // d100 = 61

        const thunkResult = await askInquiry('Will I succeed?')(vi.fn(), makeGetState(20, 'To Knowledge'), undefined);

        vi.spyOn(Math, 'random').mockReturnValue(0.6);
        const store = makeApiStore();
        const mutationResult = await store.dispatch(
            gameApi.endpoints.performInquiry.initiate({
                question: 'Will I succeed?',
                currentSystemStress: 20,
                stage: 'To Knowledge',
            })
        );

        expect(askInquiry.fulfilled.match(thunkResult)).toBe(true);
        if (askInquiry.fulfilled.match(thunkResult) && mutationResult.data) {
            expect(thunkResult.payload.roll).toBe(81);
            expect(mutationResult.data.roll).toBe(81);
        }
    });
});

describe('player.surgeCount changes only via the reducer handling result.surgeUpdate', () => {
    it('a clean "Yes" (surgeUpdate=+2) increments surgeCount by 2 through the real reducer', async () => {
        mockAskOracle.mockResolvedValue('...');
        vi.spyOn(Math, 'random').mockReturnValue(0.6); // d100 = 61 -> clean "Yes", surgeUpdate = +2

        const store = configureStore({
            reducer: { game: gameReducer, ui: uiReducer },
            preloadedState: {
                game: {
                    ...initialState,
                    player: { stats: { stress: 0 }, surgeCount: 3 } as unknown as GameState['player'],
                } as GameState,
            },
        });

        await store.dispatch(askInquiry('Will I succeed?'));

        expect(store.getState().game.player?.surgeCount).toBe(5);
    });

    it('a qualified result (surgeUpdate=-1) resets surgeCount to 0 through the real reducer', async () => {
        mockAskOracle.mockResolvedValue('...');
        vi.spyOn(Math, 'random').mockReturnValue(0.82); // d100 = 83 -> "Yes, and...", surgeUpdate = -1

        const store = configureStore({
            reducer: { game: gameReducer, ui: uiReducer },
            preloadedState: {
                game: {
                    ...initialState,
                    player: { stats: { stress: 0 }, surgeCount: 3 } as unknown as GameState['player'],
                } as GameState,
            },
        });

        await store.dispatch(askInquiry('Will I succeed?'));

        expect(store.getState().game.player?.surgeCount).toBe(0);
    });
});
