// Unit tests for cortexService's local procedural move validation.
// validateMove is pure over an Area — no mocks needed.
import { describe, it, expect } from 'vitest';
import { sdkService } from '../src/features/game/sdk/cortexService';
import type { Area } from '../src/features/game/types';

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
});
