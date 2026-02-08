import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? '')
  : (process.env.API_BASE_URL ?? '');

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl || '/api',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [],
  endpoints: () => ({}),
});
