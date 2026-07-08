// lib/sdk/cortexService.ts
// SDK Service — thunk-based architecture via forbocRuntime.
// Oracle interactions route through askOracle() → processNPC thunk → ForbocAI API.
// Worldgen and move-validation use local procedural generators (no remote cortex).

import type { Area, InquiryResponse, StageOfScene } from '@/features/game/types';
import type { GenerateStartAreaOptions } from '@/features/game/entities/area';
import { askOracle, ensureApiAvailable } from './forbocRuntime';

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

    const generateInquiryResponse = async (question: string, surgeCount: number, stage?: StageOfScene): Promise<InquiryResponse> => {
        void stage;
        const { simulateInquiryResponse } = await import('@/features/game/engine');
        const mechanicalResult = simulateInquiryResponse(question, surgeCount);
        try {
            const dialogue = await askOracle(question);
            return { ...mechanicalResult, description: `${mechanicalResult.description} ${dialogue}` };
        } catch (_e) {
            return mechanicalResult;
        }
    };

    const validateMove = async (area: Area, direction: string): Promise<boolean> =>
        Boolean(area.exits?.[direction]);

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
