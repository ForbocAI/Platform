import { baseApi } from './baseApi';

export const gameApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoom: build.query<{ id: string; name: string }, string>({
      query: (roomId) => ({ url: `rooms/${roomId}` }),
      providesTags: (_result, _err, id) => [{ type: 'Room', id }],
    }),
    consultOracle: build.mutation<
      { description: string; roll: number; surgeUpdate: number },
      { question: string; surgeCount: number }
    >({
      query: (body) => ({
        url: 'oracle/consult',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Oracle' }],
    }),
  }),
});

export const { useGetRoomQuery, useConsultOracleMutation } = gameApi;
