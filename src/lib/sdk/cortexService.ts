import { createAgent, createBridge } from 'forbocai';
import type { IAgent, ICortex } from 'forbocai';
import { RemoteCortex } from './remoteCortex';

class SDKService {
    private agent: IAgent | null = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;

        const apiUrl = process.env.NEXT_PUBLIC_FORBOC_API_URL || 'http://localhost:8080';

        // Use RemoteCortex for Browser, Real Cortex for Node if possible
        const isBrowser = typeof window !== 'undefined';
        const cortex: ICortex = isBrowser
            ? new RemoteCortex(apiUrl) as any
            : (await import('forbocai')).createCortex({
                model: 'llama-3-8b',
                temperature: 0.7,
            });

        const bridge = createBridge({
            apiUrl
        });

        this.agent = createAgent({
            id: 'player-autoplay',
            persona: 'Qua\'dar Adventurer',
            cortex,
            memory: null, // Agent expects memory, can be null if not using RAG
            apiUrl
        });

        // Initialize cortex (downloads/loads model if needed)
        await cortex.init();

        this.initialized = true;
        console.log('ForbocAI SDK Initialized');
    }

    getAgent() {
        if (!this.agent) {
            throw new Error('SDK not initialized. Call init() first.');
        }
        return this.agent;
    }
}

export const sdkService = new SDKService();
