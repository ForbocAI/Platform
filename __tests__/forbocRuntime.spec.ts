import { beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../data/tests/forboc-runtime.json';
import personaData from '../src/features/game/sdk/data/personas.json';
import runtimeData from '../src/features/game/sdk/data/runtime.json';

const mocks = vi.hoisted(() => ({
  configureNpc: vi.fn(),
  createBrowserCli: vi.fn(),
  run: vi.fn(),
}));

vi.mock('@forbocai/browser', () => ({
  createBrowserCli: mocks.createBrowserCli,
}));

const okResult = (data: unknown = {}) => ({
  status: runtimeData.result.okStatus,
  lines: [],
  data,
});

const freshRuntime = async () => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.run.mockResolvedValue(okResult());
  mocks.createBrowserCli.mockReturnValue({
    configureNpc: mocks.configureNpc,
    run: mocks.run,
  });
  return import('../src/features/game/sdk/forbocRuntime');
};

const configuredNpc = (id: string) => mocks.configureNpc.mock.calls
  .map(([value]) => value)
  .find((value) => value.id === id);

describe(fixture.suite.construction, () => {
  it(fixture.cases.zeroConfig, async () => {
    await freshRuntime();
    expect(mocks.createBrowserCli).toHaveBeenCalledWith();
  });

  it(fixture.cases.initialRegistration, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue(okResult({ dialogue: fixture.responses.oracle }));
    await runtime.askOracle(fixture.observations.oracle);
    await runtime.askPlayerCortex(fixture.observations.agent);
    expect(configuredNpc(runtimeData.actorIds.oracle)?.structuredPersona)
      .toEqual(personaData.oracle);
    expect(configuredNpc(runtimeData.actorIds.playerAutoplay)?.structuredPersona)
      .toEqual(personaData.player);
  });
});

describe(fixture.suite.status, () => {
  beforeEach(() => mocks.run.mockResolvedValue(okResult()));

  it(fixture.cases.freshStatus, async () => {
    const runtime = await freshRuntime();
    await runtime.ensureApiAvailable();
    await runtime.ensureApiAvailable();
    expect(mocks.run).toHaveBeenCalledTimes(fixture.expectations.statusCallCount);
    expect(mocks.run).toHaveBeenNthCalledWith(
      fixture.expectations.firstCallNumber,
      runtimeData.commands.status,
    );
  });

  it(fixture.cases.failedStatus, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue({ status: runtimeData.result.errorStatus, lines: [] });
    await expect(runtime.ensureApiAvailable()).resolves.toBe(false);
  });
});

describe(fixture.suite.oracle, () => {
  it(fixture.cases.dialogue, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue(okResult({ dialogue: fixture.responses.oracle }));
    await expect(runtime.askOracle(fixture.observations.oracle))
      .resolves.toBe(fixture.responses.oracle);
    expect(mocks.run.mock.calls[0][0]).toContain(runtimeData.actorIds.oracle);
  });

  it(fixture.cases.whitespace, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue(okResult({ dialogue: fixture.responses.oracle }));
    await runtime.askOracle(fixture.observations.multiline);
    expect(mocks.run.mock.calls[0][0]).toContain(fixture.observations.normalizedMultiline);
    expect(mocks.run.mock.calls[0][0]).not.toContain(fixture.observations.lineBreak);
  });

  it(fixture.cases.commandFailure, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue({
      status: runtimeData.result.errorStatus,
      lines: [fixture.errors.command],
    });
    await expect(runtime.askOracle(fixture.observations.oracle))
      .rejects.toThrow(fixture.errors.command);
  });

  it(fixture.cases.emptyDialogue, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue(okResult());
    await expect(runtime.askOracle(fixture.observations.oracle))
      .rejects.toThrow(fixture.errors.emptyFragment);
  });

  it.each(fixture.invalidResponses)(fixture.cases.malformedDialogue, async ({ data }) => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue(okResult(data));
    await expect(runtime.askOracle(fixture.observations.oracle))
      .rejects.toThrow(fixture.errors.emptyFragment);
  });
});

describe(fixture.suite.actors, () => {
  it(fixture.cases.agentPersona, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue(okResult({ dialogue: fixture.responses.agent }));
    await runtime.askAgentCortex({
      agentId: fixture.agent.id,
      displayName: fixture.agent.displayName,
      agentType: fixture.agent.agentType as 'companion',
      lore: {
        role: fixture.agent.role,
        description: fixture.agent.description,
      },
    }, fixture.observations.agent);
    const expectedId = `${runtimeData.actorIds.agentPrefix}${encodeURIComponent(fixture.agent.id)}`;
    const persona = configuredNpc(expectedId)?.structuredPersona;
    expect(Object.keys(persona).sort()).toEqual(fixture.personaFields);
    expect(persona.traits).toContain(fixture.agent.description);
  });

  it(fixture.cases.vendorPersona, async () => {
    const runtime = await freshRuntime();
    mocks.run.mockResolvedValue(okResult({ dialogue: fixture.responses.vendor }));
    await runtime.askVendorCortex({
      vendorId: fixture.vendor.id,
      name: fixture.vendor.name,
      description: fixture.vendor.description,
      specialty: fixture.vendor.specialty,
    }, fixture.observations.vendor);
    const expectedId = `${runtimeData.actorIds.vendorPrefix}${encodeURIComponent(fixture.vendor.id)}`;
    expect(configuredNpc(expectedId)?.structuredPersona.traits)
      .toContain(fixture.vendor.description);
  });
});
