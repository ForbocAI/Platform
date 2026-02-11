import { baseApi } from './baseApi';

import { SDK } from '@/lib/sdk-placeholder';
import type { Room, OracleResult, StageOfScene } from '@/features/game/types';

export const gameApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStartRoom: build.query<Room, { deterministic?: boolean } | void>({
      async queryFn(arg) {
        const deterministic = arg?.deterministic ?? false;
        const room = await SDK.Cortex.generateStartRoom({ deterministic });
        return { data: room };
      },
      keepUnusedDataFor: 0,
    }),
    consultOracle: build.mutation<
      OracleResult,
      { question: string; surgeCount: number; stage: StageOfScene }
    >({
      async queryFn({ question, surgeCount, stage }) {
        const result = await SDK.Cortex.consultOracle(
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
        const isValid = await SDK.Bridge.validateMove(currentRoom, direction);
        if (!isValid) {
          return { error: { status: 400, data: 'Invalid move' } };
        }
        const newRoom = await SDK.Cortex.generateRoom(undefined, undefined, {
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

