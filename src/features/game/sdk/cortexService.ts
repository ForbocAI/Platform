// lib/sdk/cortexService.ts
// SDK Service — thunk-based architecture via forbocRuntime.
// Oracle interactions route through askOracle() → processNPC thunk → ForbocAI API.
// Worldgen and move-validation use local procedural generators (no remote cortex).

import type { Area, Direction } from "@/features/game/types";
import type { InquiryResponse, StageOfScene } from "@/features/narrative/types";
import type { GenerateStartAreaOptions } from '@/features/game/entities/area';
import { askOracle, ensureApiAvailable } from './forbocRuntime';
import { choose } from '@/features/core/fp/choice';
import { simulateInquiryResponse } from '@/features/game/mechanics/transformations/inquiry';
import {
    buildOracleNarrationPrompt,
    isOracleDirection,
    oracleMessages,
} from './oracleAdapters';

export const isDirection = (value: unknown): value is Direction =>
    isOracleDirection(value);

const isAreaReference = (value: string | null | undefined): value is string =>
    typeof value === 'string' && value.length > 0;

export const createSDKService = () => {
    const init = async () => {
        if (typeof window === 'undefined') return;
        try {
            console.log(oracleMessages.initializing);
            choose(
                await ensureApiAvailable(),
                () => console.log(oracleMessages.ready),
                () => console.error(oracleMessages.initializationError),
            );
        } catch (_error) {
            console.error(oracleMessages.initializationError, _error);
        }
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
            console.warn(oracleMessages.narrationUnavailable, e);
            return { ...mechanicalResult, oracleAvailable: false };
        }
    };

    const validateMove = async (area: Area, direction: string): Promise<boolean> =>
        isDirection(direction) &&
        Object.hasOwn(area.exits, direction) &&
        isAreaReference(area.exits[direction]);

    return {
        init,
        generateStartRoom,
        generateStartArea,
        generateRoom,
        generateArea,
        generateInquiryResponse,
        validateMove,
    };
};

export const sdkService = createSDKService();
