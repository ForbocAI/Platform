import type { ICortex, CortexStatus, CompletionOptions } from 'forbocai';

export class RemoteCortex implements ICortex {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async init(): Promise<CortexStatus> {
        return {
            id: `remote_${Date.now()}`,
            model: 'api-integrated',
            ready: true,
            engine: 'remote' as any // Type cast as 'remote' isn't in the strict enum yet but matches interface
        };
    }

    async complete(prompt: string, options?: CompletionOptions): Promise<string> {
        const response = await fetch(`${this.apiUrl}/cortex/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, ...options })
        });

        if (!response.ok) throw new Error(`Remote Cortex failed: ${response.statusText}`);
        const data = await response.json();
        return data.text;
    }

    async *completeStream(prompt: string, options?: CompletionOptions): AsyncGenerator<string> {
        // Simple mock streaming for now, or real EventSource/Fetch Stream if API supports it
        const result = await this.complete(prompt, options);
        yield result;
    }
}
