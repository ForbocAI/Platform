
import { Room, LoomResult } from '@/lib/quadar/types';
import { generateRoom, consultLoom } from '@/lib/quadar/engine';

// Cortex: Emits narrative and simulation data ("The Mind")
export const Cortex = {
    // Simulates AI generation of a room description/state
    generateRoom: async (id?: string, biomeOverride?: any): Promise<Room> => {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateRoom(id, biomeOverride);
    },

    // Simulates AI oracle response
    consultOracle: async (question: string, surgeCount: number): Promise<LoomResult> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return consultLoom(question, surgeCount);
    }
};
