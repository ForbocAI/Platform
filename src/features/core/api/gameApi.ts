import { baseApi } from './baseApi';
import { sdkService } from '@/lib/sdk/cortexService';
import type { Room, OracleResult, StageOfScene } from '@/features/game/types';

export const gameApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStartRoom: build.query<Room, { deterministic?: boolean } | void>({
      async queryFn(arg) {
        const room = await sdkService.generateStartRoom(arg || undefined);
        return { data: room };
      },
      keepUnusedDataFor: 0,
    }),
    consultOracle: build.mutation<
      OracleResult,
      { question: string; surgeCount: number; stage: StageOfScene }
    >({
      async queryFn({ question, surgeCount, stage }) {
        const result = await sdkService.consultOracle(
          question,
          surgeCount,
          stage
        );
        return { data: result };
      },
      invalidatesTags: ['Oracle'],
    }),
    navigate: build.mutation<
      { newRoom: Room },
      { direction: string; currentRoom: Room; playerLevel?: number; roomsExplored?: number }
    >({
      async queryFn({ direction, currentRoom, playerLevel = 1, roomsExplored = 0 }) {
        const isValid = await sdkService.validateMove(currentRoom, direction);
        if (!isValid) {
          return { error: { status: 400, data: 'Invalid move' } };
        }
        const newRoom = await sdkService.generateRoom(undefined, undefined, {
          context: { previousRoom: currentRoom, direction, playerLevel, roomsExplored },
        });
        return { data: { newRoom } };
      },
    }),
  }),
});

export const {
  useGetStartRoomQuery,
  useConsultOracleMutation,
  useNavigateMutation,
} = gameApi;

