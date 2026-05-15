// lib/sdk/cortexService.ts
// Environment-aware SDK Service to prevent native Node modules leaking to browser bundle.
// Refactored to functional factory per FP mandate.
//
// SDK exports are loaded dynamically at init() time so the build never breaks
// when the installed @forbocai/* packages lack the expected factory functions.

import type { Area, InquiryResponse, StageOfScene } from '@/features/game/types';
import type { GenerateStartAreaOptions } from '@/features/game/entities/area';

// Minimal local interfaces so the rest of the file compiles without importing
// types from @forbocai/* that may not exist in the installed version.
interface SDKAgent {
    process(signal: string, payload: Record<string, unknown>): Promise<{ dialogue: string }>;
}
interface SDKCortex {
    init(): Promise<void>;
}
interface SDKBridge {
    validate(action: Record<string, unknown>, ctx: Record<string, unknown>): Promise<{ valid: boolean }>;
}
interface SDKMemory {
    [key: string]: unknown;
}

export const createSDKService = () => {
    const agents: Map<string, SDKAgent> = new Map();
    let cortex: SDKCortex | null = null;
    let bridge: SDKBridge | null = null;
    let memory: SDKMemory | null = null;
    let initialized = false;

    // SDK factory functions resolved at init() time via dynamic import.
    let _createCortex: ((opts: { apiUrl: string }) => SDKCortex) | null = null;
    let _createMemory: ((opts: Record<string, unknown>) => SDKMemory) | null = null;
    let _createBridge: ((opts: { apiUrl: string; strictMode: boolean }) => SDKBridge) | null = null;
    let _createAgent: ((opts: Record<string, unknown>) => SDKAgent) | null = null;
    let _importSoulFromArweave: ((txId: string) => Promise<{ id: string }>) | null = null;
    let _fromSoul: ((soul: { id: string }, cortex: SDKCortex, memory: SDKMemory | null) => Promise<SDKAgent>) | null = null;

    const getApiUrl = (): string => {
        return process.env.NEXT_PUBLIC_FORBOC_API_URL || 'https://api.forboc.ai';
    };

    /** Attempt to load SDK factory functions. Returns true if all resolved. */
    const loadSDKModules = async (): Promise<boolean> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const [coreMod, browserMod]: [any, any] = await Promise.all([
                import('@forbocai/core').catch(() => null),
                import('@forbocai/browser').catch(() => null),
            ]);

            _createBridge = coreMod?.createBridge ?? null;
            _createAgent = coreMod?.createAgent ?? null;
            _importSoulFromArweave = coreMod?.importSoulFromArweave ?? null;
            _fromSoul = coreMod?.fromSoul ?? null;
            _createCortex = browserMod?.createCortex ?? null;
            _createMemory = browserMod?.createMemory ?? null;

            return !!(_createCortex && _createBridge);
        } catch {
            return false;
        }
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

            const modulesLoaded = await loadSDKModules();
            if (!modulesLoaded || !_createCortex || !_createBridge) {
                console.warn('SDKService: Modules failed to load. Operating in Fallback mode.');
                initialized = true;
                return;
            }

            const apiUrl = getApiUrl();

            cortex = _createCortex({ apiUrl });
            memory = (_createMemory?.({}) as SDKMemory) ?? null;
            bridge = _createBridge({ apiUrl, strictMode: true });

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

    const getAgent = async (id: string = 'player-autoplay', persona: string = 'Neutral Agent'): Promise<SDKAgent> => {
        if (!initialized) await init();
        if (!cortex || !_createAgent) throw new Error('Cortex not available (SDK disabled)');

        if (!agents.has(id)) {
            const apiUrl = getApiUrl();

            const agent = _createAgent({
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

    const getWorldgenAgent = async (): Promise<SDKAgent> => {
        return getAgent(
            'worldgen-agent',
            'You generate structured area data for a game world. Return only JSON.'
        );
    };

    const getInquiryAgent = async (): Promise<SDKAgent> => {
        return getAgent(
            'oracle-agent',
            'You answer inquiries with structured JSON responses. Return only JSON.'
        );
    };

    const getBridge = (): SDKBridge => {
        if (!bridge) throw new Error('SDK not initialized');
        return bridge;
    };

    const rehydrateAgent = async (txId: string): Promise<SDKAgent> => {
        if (!initialized) await init();

        // Check if already rehydrated
        if (agents.has(txId)) return agents.get(txId)!;

        if (!_importSoulFromArweave || !_fromSoul || !cortex) {
            throw new Error('SDK not available for rehydration');
        }

        try {
            // 1. Fetch data from persistent layer
            const soul = await _importSoulFromArweave(txId);

            // 2. Hydrate Agent
            const agent = await _fromSoul(soul, cortex!, memory);

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
                options: options as Record<string, unknown>
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
