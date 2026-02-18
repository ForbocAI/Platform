import { createAgent, createBridge } from 'forbocai';
import type { IAgent, ICortex } from 'forbocai';
import { RemoteCortex } from './remoteCortex';

class SDKService {
    private agents: Map<string, IAgent> = new Map();
    private cortex: ICortex | null = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;

        const apiUrl = process.env.NEXT_PUBLIC_FORBOC_API_URL || 'http://localhost:8080';

        // Use RemoteCortex for Browser, Real Cortex for Node if possible
        const isBrowser = typeof window !== 'undefined';
        this.cortex = isBrowser
            ? new RemoteCortex(apiUrl) as any
            : (await import('forbocai')).createCortex({
                model: 'llama-3-8b',
                temperature: 0.7,
            });

        // Initialize cortex (downloads/loads model if needed)
        await this.cortex!.init();

        this.initialized = true;
        console.log('ForbocAI SDK Initialized');
    }

    /** Returns an existing agent or creates a new one for the given ID. */
    getAgent(id: string = 'player-autoplay', persona: string = 'Qua\'dar Adventurer'): IAgent {
        if (!this.initialized || !this.cortex) {
            throw new Error('SDK not initialized. Call init() first.');
        }

        if (!this.agents.has(id)) {
            const apiUrl = process.env.NEXT_PUBLIC_FORBOC_API_URL || 'http://localhost:8080';
            const agent = createAgent({
                id,
                persona,
                cortex: this.cortex,
                memory: null,
                apiUrl
            });
            this.agents.set(id, agent);
            console.log(`SDKService: Agent [${id}] created with persona [${persona}]`);
        }

        return this.agents.get(id)!;
    }
}

export const sdkService = new SDKService();
