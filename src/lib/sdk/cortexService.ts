// lib/sdk/cortexService.ts
// Environment-aware SDK Service to prevent native Node modules leaking to browser bundle.

import type { IAgent, ICortex, IBridge } from '@forbocai/core';
import type { Room, OracleResult, StageOfScene } from '@/features/game/types';

class SDKService {
    private agents: Map<string, IAgent> = new Map();
    private cortex: ICortex | null = null;
    private bridge: IBridge | null = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;

        const isBrowser = typeof window !== 'undefined';
        const apiUrl = process.env.NEXT_PUBLIC_FORBOC_API_URL || 'http://localhost:8080';

        if (isBrowser) {
            // Browser: Use @forbocai/browser (WebLLM / Orama)
            const browser = await import('@forbocai/browser');
            const core = await import('@forbocai/core');

            this.cortex = browser.createCortex({
                model: 'smollm2-135m',
                apiUrl
            });
            this.bridge = core.createBridge({ apiUrl, strictMode: true });
        } else {
            // Server/Node: Use @forbocai/node (llama-cpp / lancedb)
            const node = await import('@forbocai/node');
            const core = await import('@forbocai/core');

            this.cortex = node.createCortex({
                model: 'llama3-8b',
                temperature: 0.7,
                apiUrl
            });
            this.bridge = core.createBridge({ apiUrl, strictMode: true });
        }

        if (this.cortex) {
            await this.cortex.init();
        }

        this.initialized = true;
        console.log(`ForbocAI SDK Initialized (${isBrowser ? 'Browser' : 'Server'})`);
    }

    /** Returns an existing agent or creates a new one. */
    async getAgent(id: string = 'player-autoplay', persona: string = 'Qua\'dar Adventurer'): Promise<IAgent> {
        if (!this.initialized) await this.init();

        if (!this.agents.has(id)) {
            const apiUrl = process.env.NEXT_PUBLIC_FORBOC_API_URL || 'http://localhost:8080';
            const { createAgent } = await import('@forbocai/core');

            const agent = createAgent({
                id,
                persona,
                cortex: this.cortex!,
                memory: null, // Memory can be injected here if needed
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

    // --- COMPATIBILITY WRAPPERS (formerly in sdk-placeholder) ---

    async generateStartRoom(options?: { deterministic?: boolean; forceMerchant?: boolean; forceEnemy?: boolean }): Promise<Room> {
        const prompt = `Generate a start room for a Qua'dar TTRPG session. 
        Options: ${JSON.stringify(options)}. 
        Return ONLY valid JSON matching the Room interface. 
        Ensure biome is one of the valid Biome types.`;

        const response = await this.cortex!.complete(prompt);
        try {
            return JSON.parse(response) as Room;
        } catch (e) {
            // Fallback to a safe room if JSON fails
            return {
                id: 'start_room_fallback',
                title: 'Dimly Lit Entrance',
                description: 'You stand at the threshold of the deep ruins.',
                biome: 'Crumbling Ruins',
                hazards: [],
                exits: { North: null, South: null, East: null, West: null },
                enemies: []
            };
        }
    }

    async generateRoom(biome?: string, difficulty?: number, context?: any): Promise<Room> {
        const prompt = `Generate a new room for Qua'dar TTRPG. 
        Biome: ${biome || 'Random'}. 
        Difficulty: ${difficulty || 1}. 
        Context: ${JSON.stringify(context)}.
        Return ONLY valid JSON matching the Room interface.`;

        const response = await this.cortex!.complete(prompt);
        try {
            return JSON.parse(response) as Room;
        } catch (e) {
            return this.generateStartRoom(); // use start room as fallback
        }
    }

    async consultOracle(question: string, surgeCount: number, stage?: StageOfScene): Promise<OracleResult> {
        const prompt = `Act as the Qua'dar Oracle. Answer: "${question}". 
        Surge Count: ${surgeCount}. 
        Stage: ${stage || 'To Knowledge'}.
        Return ONLY valid JSON matching the OracleResult interface. 
        Example structure: { "answer": "Yes", "qualifier": "but", "description": "...", "roll": 15, "surgeUpdate": 1 }`;

        const response = await this.cortex!.complete(prompt);
        return JSON.parse(response) as OracleResult;
    }

    async validateMove(room: Room, direction: string): Promise<boolean> {
        if (!this.bridge) return false;
        const result = await this.bridge.validate({
            type: 'MOVE',
            payload: { direction, currentRoom: room.id }
        }, { worldState: { currentRoom: room } });
        return result.valid;
    }
}

export const sdkService = new SDKService();
