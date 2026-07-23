// Unit tests for cortexService — local procedural move validation and
// inquiry response generation.
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Area } from '../src/features/game/types';

const mockAskOracle = vi.fn();
vi.mock('../src/features/game/sdk/forbocRuntime', () => ({
    askOracle: mockAskOracle,
    ensureApiAvailable: vi.fn(),
}));

const { sdkService } = await import('../src/features/game/sdk/cortexService');

const makeArea = (exits: Record<string, string | null>): Area => ({
    id: 'area-1',
    title: 'Test Sector',
    description: 'A test sector.',
    regionalType: 'Meadows',
    hazards: [],
    exits,
    npcs: [],
});

describe('cortexService.validateMove', () => {
    it('returns true for a direction with an open exit', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, 'North')).resolves.toBe(true);
    });

    it('returns false for a direction whose exit is null (blocked)', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, 'South')).resolves.toBe(false);
    });

    it('returns false for a direction that is not a key in exits at all', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, 'Up')).resolves.toBe(false);
    });

    it('rejects "constructor" even though every object inherits it from Object.prototype', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, 'constructor')).resolves.toBe(false);
    });

    it('rejects "toString" even though every object inherits it from Object.prototype', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, 'toString')).resolves.toBe(false);
    });

    it('rejects "__proto__"', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, '__proto__')).resolves.toBe(false);
    });

    it('rejects "hasOwnProperty" (another Object.prototype member)', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, 'hasOwnProperty')).resolves.toBe(false);
    });

    it('rejects a lowercase variant of a valid direction ("north")', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, 'north')).resolves.toBe(false);
    });

    it('rejects a whitespace-padded variant of a valid direction (" North")', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, ' North')).resolves.toBe(false);
    });

    it('rejects an empty string', async () => {
        const area = makeArea({ North: 'new-area', South: null, East: null, West: null });
        await expect(sdkService.validateMove(area, '')).resolves.toBe(false);
    });
});

describe('cortexService.generateInquiryResponse', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        mockAskOracle.mockReset();
    });

    it('uses the Oracle dialogue as the description on success (no mechanical prefix glued on)', async () => {
        // d100 roll of 61, no stress: modifiedRoll=61 -> clean "Yes", no qualifier.
        vi.spyOn(Math, 'random').mockReturnValue(0.6);
        mockAskOracle.mockResolvedValue('The stars align in your favor.');

        const result = await sdkService.generateInquiryResponse('Will I succeed?', 0);

        expect(result.answer).toBe('Yes');
        expect(result.description).toBe('The stars align in your favor.');
        expect(result.oracleAvailable).toBe(true);
    });

    it('sends a terse, non-prose verdict tag to the Oracle, not just the bare question', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.82); // d100 = 83 -> "Yes, and..."
        mockAskOracle.mockResolvedValue('...');

        await sdkService.generateInquiryResponse('Will I succeed?', 0);

        expect(mockAskOracle).toHaveBeenCalledTimes(1);
        const sentText = mockAskOracle.mock.calls[0][0] as string;
        expect(sentText).toBe('<Yes-and> Will I succeed?');
    });

    it('includes the unexpected event and scene stage as compact tags in the prompt sent to the Oracle', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.97); // d100 = 98 -> "unexpectedly"
        mockAskOracle.mockResolvedValue('...');

        await sdkService.generateInquiryResponse('Will I succeed?', 0, 'To Conflict');

        const sentText = mockAskOracle.mock.calls[0][0] as string;
        expect(sentText).toContain('<Yes-unexpectedly');
        expect(sentText).toContain('|twist:');
        expect(sentText).toContain('|scene:To Conflict>');
        expect(sentText).toContain('Will I succeed?');
    });

    it('reports a real d100-range roll and a non-zero surge update, not the old hardcoded d20/0 stub', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.6);
        mockAskOracle.mockResolvedValue('...');

        const result = await sdkService.generateInquiryResponse('Will I succeed?', 0);

        expect(result.roll).toBe(61);
        expect(result.surgeUpdate).toBe(2); // clean answer, no qualifier -> +2 surge
    });

    it('applies a negative surge update when the roll produces a qualifier', async () => {
        // d100 roll of 83, no stress: modifiedRoll=83 -> "Yes, and..." qualifier.
        vi.spyOn(Math, 'random').mockReturnValue(0.82);
        mockAskOracle.mockResolvedValue('...');

        const result = await sdkService.generateInquiryResponse('Will I succeed?', 0);

        expect(result.qualifier).toBe('and');
        expect(result.surgeUpdate).toBe(-1);
    });

    it('surfaces an unexpected event and its d20 roll on an "unexpectedly" result', async () => {
        // d100 roll of 98, no stress: modifiedRoll=98 -> "unexpectedly" qualifier.
        vi.spyOn(Math, 'random').mockReturnValue(0.97);
        mockAskOracle.mockResolvedValue('...');

        const result = await sdkService.generateInquiryResponse('Will I succeed?', 0);

        expect(result.qualifier).toBe('unexpectedly');
        expect(result.unexpectedRoll).toBeGreaterThanOrEqual(1);
        expect(result.unexpectedEvent).toBeTruthy();
    });

    it('still returns a coherent mechanical result when the Oracle is unavailable, with the failure explicit and observable', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.6);
        mockAskOracle.mockRejectedValue(new Error('API unavailable'));
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await sdkService.generateInquiryResponse('Will I succeed?', 0);

        expect(result.answer).toBe('Yes');
        expect(result.roll).toBe(61);
        expect(result.surgeUpdate).toBe(2);
        expect(result.description).toContain('confirms');
        expect(result.oracleAvailable).toBe(false);
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it('factors current system stress into the roll', async () => {
        // d100 roll of 61 (r=0.6), stress=20 pushed onto a >50 roll -> modifiedRoll=81 -> "Yes, and...".
        vi.spyOn(Math, 'random').mockReturnValue(0.6);
        mockAskOracle.mockResolvedValue('...');

        const result = await sdkService.generateInquiryResponse('Will I succeed?', 20);

        expect(result.roll).toBe(81);
        expect(result.qualifier).toBe('and');
    });
});
