import { describe, it, expect, vi, afterEach } from 'vitest';
import { simulateInquiryResponse } from '../../src/features/game/mechanics/transformations/inquiry';
import { UNEXPECTEDLY_TABLE } from '../../src/features/game/mechanics/tables';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('simulateInquiryResponse — pure mechanic table coverage (no stress)', () => {
    const cases: Array<{ label: string; d100: number; answer: 'Yes' | 'No'; qualifier?: 'and' | 'but' | 'unexpectedly' }> = [
        { label: 'No, unexpectedly', d100: 3, answer: 'No', qualifier: 'unexpectedly' },
        { label: 'No, but', d100: 10, answer: 'No', qualifier: 'but' },
        { label: 'No, and', d100: 18, answer: 'No', qualifier: 'and' },
        { label: 'No', d100: 30, answer: 'No' },
        { label: 'Yes', d100: 61, answer: 'Yes' },
        { label: 'Yes, and', d100: 83, answer: 'Yes', qualifier: 'and' },
        { label: 'Yes, but', d100: 90, answer: 'Yes', qualifier: 'but' },
        { label: 'Yes, unexpectedly', d100: 97, answer: 'Yes', qualifier: 'unexpectedly' },
    ];

    for (const { label, d100, answer, qualifier } of cases) {
        it(`"${label}" (d100=${d100}) reports the matching answer, qualifier, and surge sign`, () => {
            vi.spyOn(Math, 'random').mockReturnValue((d100 - 0.5) / 100);

            const result = simulateInquiryResponse('Will I succeed?', 0);

            expect(result.roll).toBe(d100);
            expect(result.answer).toBe(answer);
            expect(result.qualifier).toBe(qualifier);
            expect(result.surgeUpdate).toBe(qualifier ? -1 : 2);
        });
    }
});

describe('simulateInquiryResponse — stress clamping', () => {
    it('clamps a high roll pushed over 100 by stress back down to 100', () => {
        vi.spyOn(Math, 'random').mockReturnValue(94.5 / 100); // d100 = 95, > 50 so stress is added

        const result = simulateInquiryResponse('Will I succeed?', 50);

        expect(result.roll).toBe(100);
        expect(result.answer).toBe('Yes');
        expect(result.qualifier).toBe('unexpectedly');
    });

    it('clamps a low roll pushed under 1 by stress back up to 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(9.5 / 100); // d100 = 10, <= 50 so stress is subtracted

        const result = simulateInquiryResponse('Will I succeed?', 50);

        expect(result.roll).toBe(1);
        expect(result.answer).toBe('No');
        expect(result.qualifier).toBe('unexpectedly');
    });

    it('adds stress to rolls above 50 and subtracts it from rolls at or below 50', () => {
        vi.spyOn(Math, 'random').mockReturnValue(60.5 / 100); // d100 = 61
        expect(simulateInquiryResponse('Q', 20).roll).toBe(81);

        vi.spyOn(Math, 'random').mockReturnValue(29.5 / 100); // d100 = 30
        expect(simulateInquiryResponse('Q', 20).roll).toBe(10);
    });
});

describe('simulateInquiryResponse — unexpected-event d20 determinism', () => {
    it('rolls a deterministic d20 and looks up the exact table entry, only on an "unexpectedly" qualifier', () => {
        vi.spyOn(Math, 'random')
            .mockReturnValueOnce(2.5 / 100) // d100 = 3 -> "No, unexpectedly"
            .mockReturnValueOnce(10.5 / 20); // d20 = 11

        const result = simulateInquiryResponse('Will I succeed?', 0);

        expect(result.qualifier).toBe('unexpectedly');
        expect(result.unexpectedRoll).toBe(11);
        expect(result.unexpectedEvent).toBe(UNEXPECTEDLY_TABLE[10]);
        expect(result.description).toContain(`[EVENT: ${UNEXPECTEDLY_TABLE[10]}]`);
    });

    it('does not roll a d20 or attach an event when the qualifier is not "unexpectedly"', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.6); // d100 = 61 -> clean "Yes"

        const result = simulateInquiryResponse('Will I succeed?', 0);

        expect(result.qualifier).toBeUndefined();
        expect(result.unexpectedRoll).toBeUndefined();
        expect(result.unexpectedEvent).toBeUndefined();
    });
});
