// lib/sdk/cortexService.ts
// Environment-aware SDK Service to prevent native Node modules leaking to browser bundle.

import type { IAgent, ICortex, IBridge } from '@forbocai/core';
import type { Area, OracleResult, StageOfScene, AgentNPC, AgentPlayer } from '@/features/game/types';

class SDKService {
    private agents: Map<string, IAgent> = new Map();
    private cortex: ICortex | null = null;
    private bridge: IBridge | null = null;
    private memory: any = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;
        if (typeof window === 'undefined') {
            console.log('SDKService: Server-side environment detected, skipping initialization.');
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_FORBOC_API_URL || 'http://localhost:8080';

        try {
            console.log('SDKService: Loading modules...');

            // --- Load @forbocai/browser ---
            let browserModule: any = null;
            try {
                console.log('SDKService: Importing @forbocai/browser...');
                browserModule = await import('@forbocai/browser');
            } catch (e) {
                console.error('SDKService: Critical failure loading @forbocai/browser', e);
            }

            // --- Load @forbocai/core ---
            let coreModule: any = null;
            try {
                console.log('SDKService: Importing @forbocai/core...');
                coreModule = await import('@forbocai/core');
            } catch (e) {
                console.error('SDKService: Critical failure loading @forbocai/core', e);
            }

            if (!browserModule?.createCortex || !coreModule?.createBridge) {
                console.warn('SDKService: SDK modules missing expected exports. Operating in Mock/Fallback mode.');
                this.initialized = true;
                return;
            }

            console.log('SDKService: Initializing factories...');
            this.cortex = browserModule.createCortex({
                model: 'smollm2-135m',
                apiUrl
            });
            this.memory = browserModule.createMemory?.({}) ?? null;
            this.bridge = coreModule.createBridge({ apiUrl, strictMode: true });

            if (this.cortex) {
                try {
                    await this.cortex.init();
                    console.log('ForbocAI SDK Initialized (Browser-Only Mode)');
                } catch (ce) {
                    console.error('SDKService: Cortex engine initialization failed:', ce);
                }
            }

            this.initialized = true;
        } catch (error: any) {
            console.error('SDKService: Unexpected initialization error:', error);
            this.initialized = true;
        }
    }

    /** Returns an existing agent or creates a new one. */
    async getAgent(id: string = 'player-autoplay', persona: string = 'Neutral Agent'): Promise<IAgent> {
        if (!this.initialized) await this.init();

        if (!this.agents.has(id)) {
            const apiUrl = process.env.NEXT_PUBLIC_FORBOC_API_URL || 'http://localhost:8080';
            const core: any = await import('@forbocai/core');

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

    getBridge(): IBridge {
        if (!this.bridge) throw new Error('SDK not initialized');
        return this.bridge;
    }

    /** Rehydrates an agent from a neural signature. */
    async rehydrateAgent(txId: string): Promise<IAgent> {
        if (!this.initialized) await this.init();

        // Check if already rehydrated
        if (this.agents.has(txId)) return this.agents.get(txId)!;

        const core: any = await import('@forbocai/core');

        try {
            // 1. Fetch data from persistent layer
            const soul = await core.importSoulFromArweave(txId);

            // 2. Hydrate Agent
            const agent = await core.fromSoul(soul, this.cortex!, this.memory);

            this.agents.set(txId, agent);
            this.agents.set(soul.id, agent); // Also set by internal ID

            console.log(`SDKService: Rehydrated Agent [${soul.id}] from signature [${txId}]`);
            return agent;
        } catch (e) {
            console.error(`SDKService: Failed to rehydrate agent from signature [${txId}]:`, e);
            throw e;
        }
    }

    // --- COMPATIBILITY WRAPPERS ---

    async generateStartRoom(options?: any) { return this.generateStartArea(options); }
    async generateStartArea(options?: { deterministic?: boolean; forceVendor?: boolean; forceNPC?: boolean }): Promise<Area> {
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
        const prompt = `Generate a start area for an agentic session. 
        Options: ${JSON.stringify(options)}. 
        Return ONLY valid JSON matching the Area interface. 
        Ensure regionalType is one of the valid RegionalType values.`;

        try {
            const response = await this.cortex.complete(prompt);
            return JSON.parse(response) as Area;
        } catch (e) {
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

    async generateRoom(regionalType?: string, magnitude?: number, context?: any) { return this.generateArea(regionalType, magnitude, context); }
    async generateArea(regionalType?: string, magnitude?: number, context?: any): Promise<Area> {
        if (!this.cortex) return this.generateStartArea();
        const prompt = `Generate a new Area. 
        Type: ${regionalType || 'Random'}. 
        Magnitude: ${magnitude || 1}. 
        Context: ${JSON.stringify(context)}.
        Return ONLY valid JSON matching the Area interface.
        Note: specify 'biome' as one of the valid Biome names.`;

        try {
            const response = await this.cortex.complete(prompt);
            return JSON.parse(response) as Area;
        } catch (e) {
            return this.generateStartArea(); // fallback
        }
    }

    async consultOracle(question: string, surgeCount: number, stage?: StageOfScene): Promise<OracleResult> {
        if (!this.cortex) {
            return {
                answer: Math.random() > 0.5 ? "Yes" : "No",
                description: "The Oracle is currently disconnected (fallback mode).",
                roll: Math.floor(Math.random() * 20) + 1,
                surgeUpdate: 0
            };
        }
        const prompt = `Act as the Qua'dar Oracle. Answer: "${question}". 
        Surge Count: ${surgeCount}. 
        Stage: ${stage || 'To Knowledge'}.
        Return ONLY valid JSON matching the OracleResult interface. 
        Example structure: { "answer": "Yes", "qualifier": "but", "description": "...", "roll": 15, "surgeUpdate": 1 }`;

        try {
            const response = await this.cortex.complete(prompt);
            return JSON.parse(response) as OracleResult;
        } catch (e) {
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
