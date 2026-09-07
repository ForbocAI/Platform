import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/features/core/store';

interface ForbocState {
  readonly lastObservationByAgent: Record<string, string>;
  readonly lastVendorResponseAtById: Record<string, number>;
}

const initialState: ForbocState = {
  lastObservationByAgent: {},
  lastVendorResponseAtById: {},
};

const forbocSlice = createSlice({
  name: 'forboc',
  initialState,
  reducers: {
    agentObservationCommitted: (
      state,
      action: PayloadAction<{ readonly agentId: string; readonly observation: string }>,
    ) => {
      state.lastObservationByAgent[action.payload.agentId] = action.payload.observation;
    },
    vendorResponseCommitted: (
      state,
      action: PayloadAction<{ readonly vendorId: string; readonly respondedAt: number }>,
    ) => {
      state.lastVendorResponseAtById[action.payload.vendorId] = action.payload.respondedAt;
    },
    resetForbocSession: () => initialState,
  },
});

export const {
  agentObservationCommitted,
  resetForbocSession,
  vendorResponseCommitted,
} = forbocSlice.actions;

export const selectLastAgentObservation = (
  state: RootState,
  agentId: string,
): string | undefined => state.forboc.lastObservationByAgent[agentId];

export const selectLastVendorResponseAt = (
  state: RootState,
  vendorId: string,
): number | undefined => state.forboc.lastVendorResponseAtById[vendorId];

export default forbocSlice.reducer;
