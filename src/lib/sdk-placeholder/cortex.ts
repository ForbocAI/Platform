import { Room, LoomResult, Biome, StageOfScene } from '@/lib/quadar/types';
import { generateRoom, generateStartRoom, consultLoom, GenerateStartRoomOptions } from '@/lib/quadar/engine';

// Cortex: Emits narrative and simulation data ("The Mind")
export const Cortex = {
    generateStartRoom: async (opts?: GenerateStartRoomOptions): Promise<Room> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateStartRoom(opts);
    },

    // Simulates AI generation of a room description/state
    generateRoom: async (id?: string, biomeOverride?: Biome): Promise<Room> => {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateRoom(id, biomeOverride);
    },

    // Simulates AI oracle response (Loom of Fate)
    consultOracle: async (question: string, surgeCount: number, stage: StageOfScene = "To Knowledge"): Promise<LoomResult> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return consultLoom(question, surgeCount, stage);
    }
};
