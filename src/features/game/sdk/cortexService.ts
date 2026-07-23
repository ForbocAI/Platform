// lib/sdk/cortexService.ts
// SDK Service — thunk-based architecture via forbocRuntime.
// Oracle interactions route through askOracle() → processNPC thunk → ForbocAI API.
// Worldgen and move-validation use local procedural generators (no remote cortex).

import type { Area, Direction, InquiryResponse, StageOfScene } from '@/features/game/types';
import type { GenerateStartAreaOptions } from '@/features/game/entities/area';
import { askOracle, ensureApiAvailable } from './forbocRuntime';
import { simulateInquiryResponse } from '@/features/game/mechanics/transformations/inquiry';

const CARDINAL_DIRECTIONS: readonly Direction[] = ['North', 'South', 'East', 'West'];

export const isDirection = (value: unknown): value is Direction =>
    typeof value === 'string' && (CARDINAL_DIRECTIONS as readonly string[]).includes(value);

const isAreaReference = (value: string | null | undefined): value is string =>
    typeof value === 'string' && value.length > 0;

// The verdict is framed with <>| delimiters; strip them from the free-text
// question so a player can't inject a second, contradictory verdict tag into
// the Oracle prompt. Narration-only — the mechanical result is computed locally.
const stripVerdictDelimiters = (text: string): string => text.replace(/[<>|]/g, ' ');

const buildOracleNarrationPrompt = (
    question: string,
    verdict: InquiryResponse,
    stage?: StageOfScene
): string => {
    const qualifierWord = verdict.qualifier ? `-${verdict.qualifier}` : '';
    const eventTag = verdict.unexpectedEvent ? `|twist:${verdict.unexpectedEvent}` : '';
    const stageTag = stage ? `|scene:${stage}` : '';
    return `<${verdict.answer}${qualifierWord}${eventTag}${stageTag}> ${stripVerdictDelimiters(question)}`;
};

interface SDKAgent {
    process(signal: string, payload: Record<string, unknown>): Promise<{ dialogue: string }>;
}

interface SDKBridge {
    validate(action: Record<string, unknown>, ctx: Record<string, unknown>): Promise<{ valid: boolean }>;
}

export const createSDKService = () => {
    let initialized = false;

    const init = async () => {
        if (initialized) return;
        if (typeof window === 'undefined') return;
        try {
            console.log('SDKService: Initializing...');
            await ensureApiAvailable();
            console.log('SDKService: Ready.');
        } catch (_error) {
            console.error('SDKService: Initialization error:', _error);
        } finally {
            initialized = true;
        }
    };

    const isCortexReady = (): boolean => false;

    const getAgent = async (_id?: string, _persona?: string): Promise<SDKAgent> => {
        throw new Error('getAgent: local cortex not available in this SDK version. Use processNPC thunk via forbocRuntime.');
    };

    const getBridge = (): SDKBridge => {
        throw new Error('getBridge: bridge not available in this SDK version.');
    };

    const rehydrateAgent = async (_txId: string): Promise<SDKAgent> => {
        throw new Error('rehydrateAgent: not available in this SDK version.');
    };

    const generateStartArea = async (options?: GenerateStartAreaOptions): Promise<Area> => {
        const { generateStartArea } = await import('@/features/game/entities/area');
        return generateStartArea(options);
    };

    const generateStartRoom = async (options?: GenerateStartAreaOptions) => generateStartArea(options);

    const generateArea = async (_regionalType?: string, _magnitude?: number, _context?: Record<string, unknown>): Promise<Area> => {
        const { generateArea } = await import('@/features/game/entities/area');
        return generateArea();
    };

    const generateRoom = async (regionalType?: string, magnitude?: number, context?: Record<string, unknown>) =>
        generateArea(regionalType, magnitude, context);

    const generateInquiryResponse = async (question: string, currentSystemStress: number, stage?: StageOfScene): Promise<InquiryResponse> => {
        const mechanicalResult = simulateInquiryResponse(question, currentSystemStress);
        try {
            const dialogue = await askOracle(buildOracleNarrationPrompt(question, mechanicalResult, stage));
            return { ...mechanicalResult, description: dialogue, oracleAvailable: true };
        } catch (e) {
            console.warn('ForbocAI: Oracle narration unavailable; returning mechanical result only.', e);
            return { ...mechanicalResult, oracleAvailable: false };
        }
    };

    const validateMove = async (area: Area, direction: string): Promise<boolean> =>
        isDirection(direction) &&
        Object.hasOwn(area.exits, direction) &&
        isAreaReference(area.exits[direction]);

    return {
        init,
        isCortexReady,
        getAgent,
        getBridge,
        rehydrateAgent,
        generateStartRoom,
        generateStartArea,
        generateRoom,
        generateArea,
        generateInquiryResponse,
        validateMove,
    };
};

export const sdkService = createSDKService();
