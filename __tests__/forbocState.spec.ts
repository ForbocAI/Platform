import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import fixture from '../data/tests/forboc-runtime.json';
import forbocReducer, {
  agentObservationCommitted,
  resetForbocSession,
  vendorResponseCommitted,
} from '../src/features/game/sdk/state/forbocSlice';

const createStore = () => configureStore({ reducer: { forboc: forbocReducer } });

const commitResponses = (store: ReturnType<typeof createStore>) => {
  store.dispatch(agentObservationCommitted({
    agentId: fixture.agent.id,
    observation: fixture.observations.agent,
  }));
  store.dispatch(vendorResponseCommitted({
    vendorId: fixture.vendor.id,
    respondedAt: fixture.state.respondedAt,
  }));
};

describe(fixture.suite.state, () => {
  it(fixture.cases.stateIsolation, () => {
    const first = createStore();
    const second = createStore();
    commitResponses(first);
    const state = first.getState().forboc;
    expect(state.lastObservationByAgent[fixture.agent.id])
      .toBe(fixture.observations.agent);
    expect(state.lastVendorResponseAtById[fixture.vendor.id])
      .toBe(fixture.state.respondedAt);
    expect(state.lastObservationByAgent[fixture.state.otherActorId]).toBeUndefined();
    expect(state.lastVendorResponseAtById[fixture.state.otherActorId]).toBeUndefined();
    expect(second.getState().forboc).toEqual(fixture.state.empty);
  });

  it(fixture.cases.stateReset, () => {
    const store = createStore();
    commitResponses(store);
    store.dispatch(resetForbocSession());
    expect(store.getState().forboc).toEqual(fixture.state.empty);
    commitResponses(store);
    expect(store.getState().forboc.lastObservationByAgent[fixture.agent.id])
      .toBe(fixture.observations.agent);
  });
});
