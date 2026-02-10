import { Room, OracleResult, Biome, StageOfScene } from '@/lib/game/types';
import { generateRoom, generateRoomWithOptions, generateStartRoom, consultOracle as runOracle, GenerateStartRoomOptions, RoomGenContext } from '@/lib/game/engine';

export const Cortex = {
    generateStartRoom: async (opts?: GenerateStartRoomOptions): Promise<Room> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateStartRoom(opts);
    },

    generateRoom: async (id?: string, biomeOverride?: Biome, options?: { forceMerchant?: boolean; context?: RoomGenContext | null }): Promise<Room> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return generateRoomWithOptions(id, biomeOverride, options);
    },

    consultOracle: async (question: string, surgeCount: number, _stage?: StageOfScene): Promise<OracleResult> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return runOracle(question, surgeCount);
    }
};
