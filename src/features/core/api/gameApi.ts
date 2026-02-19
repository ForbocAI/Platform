import { baseApi } from './baseApi';
import { sdkService } from '@/features/game/sdk/cortexService';
import type { Area, OracleResult, StageOfScene } from '@/features/game/types';

export const gameApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getStartRoom: build.query<Area, { deterministic?: boolean } | void>({
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
      { newRoom: Area },
      { direction: string; currentRoom: Area; playerLevel?: number; areasExplored?: number }
    >({
      async queryFn({ direction, currentRoom, playerLevel = 1, areasExplored = 0 }) {
        const isValid = await sdkService.validateMove(currentRoom, direction);
        if (!isValid) {
          return { error: { status: 400, data: 'Invalid move' } };
        }
        const newRoom = await sdkService.generateRoom(undefined, undefined, {
          context: { previousArea: currentRoom, direction, playerLevel, areasExplored },
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

