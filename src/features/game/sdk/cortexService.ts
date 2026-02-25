// lib/sdk/cortexService.ts
// Environment-aware SDK Service to prevent native Node modules leaking to browser bundle.
// Refactored to functional factory per FP mandate.

import type { IAgent, ICortex, IBridge, IMemory } from '@forbocai/core';
import { createBridge, createAgent, importSoulFromArweave, fromSoul } from '@forbocai/core';
import { createCortex, createMemory } from '@forbocai/browser';
import type { Area, InquiryResponse, StageOfScene } from '@/features/game/types';
import type { GenerateStartAreaOptions } from '@/features/game/entities/area';

export const createSDKService = () => {
    const agents: Map<string, IAgent> = new Map();
    let cortex: ICortex | null = null;
    let bridge: IBridge | null = null;
    let memory: IMemory | null = null;
    let initialized = false;

    const getApiUrl = (): string => {
        return process.env.NEXT_PUBLIC_FORBOC_API_URL || 'https://api.forboc.ai';
    };

    const init = async () => {
        if (initialized) return;
        if (typeof window === 'undefined') return;

        // --- Feature Gate: SDK is OFF by default ---
        const params = new URLSearchParams(window.location.search);
        if (params.get('FORBOCAI_SDK') !== 'ON') {
            console.log('SDKService: FORBOCAI_SDK is OFF. Skipping SDK initialization.');
            initialized = true;
            return;
        }

        try {
            // --- Pre-flight Check: WebGPU Support ---
            const hasGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
            if (!hasGpu) {
                console.warn('SDKService: No WebGPU support detected. Falling back to Local AI.');
                initialized = true;
                return;
            }

            console.log('SDKService: Initializing...');

            const apiUrl = getApiUrl();

            if (!createCortex || !createBridge) {
                console.warn('SDKService: Modules failed to load. Operating in Fallback mode.');
                initialized = true;
                return;
            }

            cortex = createCortex({ apiUrl });
            memory = (createMemory?.({}) as IMemory) ?? null;
            bridge = createBridge({ apiUrl, strictMode: true });

            if (cortex) {
                try {
                    const CORTEX_INIT_TIMEOUT = 10000;
                    const initPromise = cortex.init();
                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), CORTEX_INIT_TIMEOUT)
                    );
                    await Promise.race([initPromise, timeoutPromise]);
                    console.log('ForbocAI SDK: Initialized.');
                } catch (_ce) {
                    console.warn('ForbocAI SDK: Initialization failed or timed out. Using Fallback mode.', _ce);
                    cortex = null;
                }
            }

            initialized = true;
        } catch (_error) {
            console.error('SDKService: Initialization error:', _error);
            initialized = true;
        }
    };

    const isCortexReady = (): boolean => {
        return initialized && cortex !== null;
    };

    const getAgent = async (id: string = 'player-autoplay', persona: string = 'Neutral Agent'): Promise<IAgent> => {
        if (!initialized) await init();
        if (!cortex) throw new Error('Cortex not available (SDK disabled)');

        if (!agents.has(id)) {
            const apiUrl = getApiUrl();

            const agent = createAgent({
                id,
                persona,
                cortex: cortex!,
                memory: memory,
                apiUrl
            });
            agents.set(id, agent);
        }

        return agents.get(id)!;
    };

    const getWorldgenAgent = async (): Promise<IAgent> => {
        return getAgent(
            'worldgen-agent',
            'You generate structured area data for a game world. Return only JSON.'
        );
    };

    const getInquiryAgent = async (): Promise<IAgent> => {
        return getAgent(
            'oracle-agent',
            'You answer inquiries with structured JSON responses. Return only JSON.'
        );
    };

    const getBridge = (): IBridge => {
        if (!bridge) throw new Error('SDK not initialized');
        return bridge;
    };

    const rehydrateAgent = async (txId: string): Promise<IAgent> => {
        if (!initialized) await init();

        // Check if already rehydrated
        if (agents.has(txId)) return agents.get(txId)!;

        try {
            // 1. Fetch data from persistent layer
            const soul = await importSoulFromArweave(txId);

            // 2. Hydrate Agent
            const agent = await fromSoul(soul, cortex!, memory);

            agents.set(txId, agent);
            agents.set(soul.id, agent); // Also set by internal ID

            console.log(`SDKService: Rehydrated Agent [${soul.id}] from signature [${txId}]`);
            return agent;
        } catch (_e) {
            console.error(`SDKService: Failed to rehydrate agent from signature [${txId}]:`, _e);
            throw _e;
        }
    };

    // --- COMPATIBILITY WRAPPERS ---

    const generateStartArea = async (options?: GenerateStartAreaOptions): Promise<Area> => {
        if (!cortex) {
            const { generateStartArea } = await import('@/features/game/entities/area');
            return generateStartArea(options);
        }

        try {
            const agent = await getWorldgenAgent();
            const response = await agent.process('WORLDGEN_REQUEST', {
                kind: 'worldgen',
                options
            });
            return JSON.parse(response.dialogue) as Area;
        } catch (_e) {
            const { generateStartArea } = await import('@/features/game/entities/area');
            return generateStartArea(options);
        }
    };

    const generateStartRoom = async (options?: GenerateStartAreaOptions) => generateStartArea(options);

    const generateArea = async (regionalType?: string, magnitude?: number, context?: Record<string, unknown>): Promise<Area> => {
        if (!cortex) {
            const { generateArea } = await import('@/features/game/entities/area');
            return generateArea();
        }
        try {
            const agent = await getWorldgenAgent();
            const response = await agent.process('WORLDGEN_REQUEST', {
                kind: 'worldgen',
                regionalType: regionalType || 'Random',
                magnitude: magnitude || 1,
                context
            });
            return JSON.parse(response.dialogue) as Area;
        } catch (_e) {
            const { generateArea } = await import('@/features/game/entities/area');
            return generateArea(); // Use native procedural generation
        }
    };

    const generateRoom = async (regionalType?: string, magnitude?: number, context?: Record<string, unknown>) => generateArea(regionalType, magnitude, context);

    const generateInquiryResponse = async (question: string, surgeCount: number, stage?: StageOfScene): Promise<InquiryResponse> => {
        if (!cortex) {
            return {
                answer: Math.random() > 0.5 ? "Yes" : "No",
                description: "The SDK is not enabled. The Oracle remains silent.",
                roll: Math.floor(Math.random() * 20) + 1,
                surgeUpdate: 0
            };
        }
        try {
            const agent = await getInquiryAgent();
            const response = await agent.process('INQUIRY_REQUEST', {
                kind: 'inquiry',
                question,
                surgeCount,
                stage: stage || 'Initialization'
            });
            return JSON.parse(response.dialogue) as InquiryResponse;
        } catch (_e) {
            return {
                answer: "No",
                description: "The Oracle remains silent.",
                roll: 1,
                surgeUpdate: 0
            };
        }
    };

    const validateMove = async (area: Area, direction: string): Promise<boolean> => {
        if (!bridge) return false;
        const result = await bridge.validate({
            type: 'MOVE',
            payload: { direction, currentArea: area.id }
        }, { worldState: { currentArea: area } });
        return result.valid;
    };

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
        validateMove
    };
};

export const sdkService = createSDKService();
