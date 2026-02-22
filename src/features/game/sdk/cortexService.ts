// lib/sdk/cortexService.ts
// Environment-aware SDK Service to prevent native Node modules leaking to browser bundle.

import type { IAgent, ICortex, IBridge, IMemory } from '@forbocai/core';
import type { Area, InquiryResponse, StageOfScene } from '@/features/game/types';
import type { GenerateStartAreaOptions } from '@/features/game/entities/area';

class SDKService {
    private agents: Map<string, IAgent> = new Map();
    private cortex: ICortex | null = null;
    private bridge: IBridge | null = null;
    private memory: IMemory | null = null;
    private initialized = false;

    private getApiUrl(): string {
        return process.env.NEXT_PUBLIC_FORBOC_API_URL || 'https://api.forboc.ai';
    }

    async init() {
        if (this.initialized) return;
        if (typeof window === 'undefined') return;

        // --- Priority 0: URL Override ---
        const params = new URLSearchParams(window.location.search);
        if (params.get('no-sdk') === '1') {
            console.log('SDKService: no-sdk=1 detected. Skipping SDK initialization.');
            this.initialized = true;
            return;
        }

        try {
            // --- Pre-flight Check: WebGPU Support ---
            const hasGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
            if (!hasGpu) {
                console.warn('SDKService: No WebGPU support detected. Falling back to Local AI.');
                this.initialized = true;
                return;
            }

            console.log('SDKService: Initializing...');
            const [browserModule, coreModule] = await Promise.all([
                import('@forbocai/browser').catch(() => null),
                import('@forbocai/core').catch(() => null)
            ]);

            const apiUrl = this.getApiUrl();

            if (!browserModule?.createCortex || !coreModule?.createBridge) {
                console.warn('SDKService: Modules failed to load. Operating in Fallback mode.');
                this.initialized = true;
                return;
            }

            this.cortex = browserModule.createCortex({ apiUrl });
            this.memory = browserModule.createMemory?.({}) ?? null;
            this.bridge = coreModule.createBridge({ apiUrl, strictMode: true });

            if (this.cortex) {
                try {
                    const CORTEX_INIT_TIMEOUT = 10000;
                    const initPromise = this.cortex.init();
                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), CORTEX_INIT_TIMEOUT)
                    );
                    await Promise.race([initPromise, timeoutPromise]);
                    console.log('ForbocAI SDK: Initialized.');
                } catch (_ce) {
                    console.warn('ForbocAI SDK: Initialization failed or timed out. Using Fallback mode.', _ce);
                    this.cortex = null;
                }
            }

            this.initialized = true;
        } catch (_error) {
            console.error('SDKService: Initialization error:', _error);
            this.initialized = true;
        }
    }

    /** Returns true if the Cortex engine initialized successfully. */
    isCortexReady(): boolean {
        return this.initialized && this.cortex !== null;
    }

    /** Returns an existing agent or creates a new one. */
    async getAgent(id: string = 'player-autoplay', persona: string = 'Neutral Agent'): Promise<IAgent> {
        if (!this.initialized) await this.init();
        if (!this.cortex) throw new Error('Cortex not available (fallback mode)');

        if (!this.agents.has(id)) {
            const apiUrl = this.getApiUrl();
            const core = await import('@forbocai/core');

            const agent = core.createAgent({
                id,
                persona,
                cortex: this.cortex!,
                memory: this.memory,
                apiUrl
            });
            this.agents.set(id, agent);
        }

        return this.agents.get(id)!;
    }

    private async getWorldgenAgent(): Promise<IAgent> {
        return this.getAgent(
            'worldgen-agent',
            'You generate structured area data for a game world. Return only JSON.'
        );
    }

    private async getInquiryAgent(): Promise<IAgent> {
        return this.getAgent(
            'oracle-agent',
            'You answer inquiries with structured JSON responses. Return only JSON.'
        );
    }

    getBridge(): IBridge {
        if (!this.bridge) throw new Error('SDK not initialized');
        return this.bridge;
    }

    /** Rehydrates an agent from a neural signature. */
    async rehydrateAgent(txId: string): Promise<IAgent> {
        if (!this.initialized) await this.init();

        // Check if already rehydrated
        if (this.agents.has(txId)) return this.agents.get(txId)!;

        const core = await import('@forbocai/core');

        try {
            // 1. Fetch data from persistent layer
            const soul = await core.importSoulFromArweave(txId);

            // 2. Hydrate Agent
            const agent = await core.fromSoul(soul, this.cortex!, this.memory);

            this.agents.set(txId, agent);
            this.agents.set(soul.id, agent); // Also set by internal ID

            console.log(`SDKService: Rehydrated Agent [${soul.id}] from signature [${txId}]`);
            return agent;
        } catch (_e) {
            console.error(`SDKService: Failed to rehydrate agent from signature [${txId}]:`, _e);
            throw _e;
        }
    }

    // --- COMPATIBILITY WRAPPERS ---

    async generateStartRoom(options?: GenerateStartAreaOptions) { return this.generateStartArea(options); }
    async generateStartArea(options?: GenerateStartAreaOptions): Promise<Area> {
        if (!this.cortex) {
            return {
                id: 'start_area_mock',
                title: 'Testing Grounds',
                description: 'The SDK modules failed to load. Operating in local fallback mode.',
                biome: 'Quadar Tower',
                regionalType: 'Ruins',
                hazards: [],
                exits: { North: null, South: null, East: null, West: null },
                npcs: []
            };
        }

        try {
            const agent = await this.getWorldgenAgent();
            const response = await agent.process('WORLDGEN_REQUEST', {
                kind: 'worldgen',
                options
            });
            return JSON.parse(response.dialogue) as Area;
        } catch (_e) {
            // Fallback to a safe room if JSON/completion fails
            return {
                id: 'start_area_fallback',
                title: 'Entrance',
                description: 'You stand at the threshold.',
                biome: 'Quadar Tower',
                regionalType: 'Ruins',
                hazards: [],
                exits: { North: null, South: null, East: null, West: null },
                npcs: []
            };
        }
    }

    async generateRoom(regionalType?: string, magnitude?: number, context?: Record<string, unknown>) { return this.generateArea(regionalType, magnitude, context); }
    async generateArea(regionalType?: string, magnitude?: number, context?: Record<string, unknown>): Promise<Area> {
        if (!this.cortex) return this.generateStartArea();
        try {
            const agent = await this.getWorldgenAgent();
            const response = await agent.process('WORLDGEN_REQUEST', {
                kind: 'worldgen',
                regionalType: regionalType || 'Random',
                magnitude: magnitude || 1,
                context
            });
            return JSON.parse(response.dialogue) as Area;
        } catch (_e) {
            return this.generateStartArea(); // fallback
        }
    }

    async generateInquiryResponse(question: string, surgeCount: number, stage?: StageOfScene): Promise<InquiryResponse> {
        if (!this.cortex) {
            return {
                answer: Math.random() > 0.5 ? "Yes" : "No",
                description: "The inquiry engine is currently disconnected (fallback mode).",
                roll: Math.floor(Math.random() * 20) + 1,
                surgeUpdate: 0
            };
        }
        try {
            const agent = await this.getInquiryAgent();
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
    }

    async validateMove(area: Area, direction: string): Promise<boolean> {
        if (!this.bridge) return false;
        const result = await this.bridge.validate({
            type: 'MOVE',
            payload: { direction, currentArea: area.id }
        }, { worldState: { currentArea: area } });
        return result.valid;
    }
}

export const sdkService = new SDKService();
