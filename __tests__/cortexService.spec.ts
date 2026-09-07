import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../data/tests/cortex-service.json';
import oracleData from '../src/features/game/sdk/data/oracle.json';
import type { Area, StageOfScene } from '../src/features/game/types';

const mocks = vi.hoisted(() => ({
  askOracle: vi.fn(),
  ensureApiAvailable: vi.fn(),
}));

vi.mock('../src/features/game/sdk/forbocRuntime', () => ({
  askOracle: mocks.askOracle,
  ensureApiAvailable: mocks.ensureApiAvailable,
}));

const { sdkService } = await import('../src/features/game/sdk/cortexService');
const area = fixture.area as Area;

describe(fixture.suites.initialization, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mocks.ensureApiAvailable.mockReset();
  });

  it(fixture.cases.initializationReady, async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    mocks.ensureApiAvailable.mockResolvedValue(true);
    await sdkService.init();
    expect(log).toHaveBeenCalledWith(oracleData.messages.ready);
  });

  it(fixture.cases.initializationUnavailable, async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.ensureApiAvailable.mockResolvedValue(false);
    await sdkService.init();
    expect(log).not.toHaveBeenCalledWith(oracleData.messages.ready);
    expect(error).toHaveBeenCalledWith(oracleData.messages.initializationError);
  });

  it(fixture.cases.initializationRejected, async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error(fixture.oracle.failure);
    mocks.ensureApiAvailable.mockRejectedValue(failure);
    await sdkService.init();
    expect(log).not.toHaveBeenCalledWith(oracleData.messages.ready);
    expect(error).toHaveBeenCalledWith(oracleData.messages.initializationError, failure);
  });
});

describe(fixture.suites.move, () => {
  it(fixture.cases.openExit, async () => {
    await expect(sdkService.validateMove(area, fixture.directions.open)).resolves.toBe(true);
  });

  it(fixture.cases.blockedExit, async () => {
    await expect(sdkService.validateMove(area, fixture.directions.blocked)).resolves.toBe(false);
  });

  it(fixture.cases.missingExit, async () => {
    await expect(sdkService.validateMove(area, fixture.directions.missing)).resolves.toBe(false);
  });

  it.each(fixture.directions.invalid)(
    fixture.cases.invalidDirections,
    async (direction) => {
      await expect(sdkService.validateMove(area, direction)).resolves.toBe(false);
    },
  );
});

describe(fixture.suites.inquiry, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mocks.askOracle.mockReset();
  });

  it(fixture.cases.oracleDialogue, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.clean);
    mocks.askOracle.mockResolvedValue(fixture.oracle.dialogue);
    const result = await sdkService.generateInquiryResponse(
      fixture.questions.standard,
      fixture.stress.none,
    );
    expect(result.answer).toBe(fixture.expected.yes);
    expect(result.description).toBe(fixture.oracle.dialogue);
    expect(result.oracleAvailable).toBe(true);
  });

  it(fixture.cases.qualifiedPrompt, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.qualified);
    mocks.askOracle.mockResolvedValue(fixture.oracle.placeholderDialogue);
    await sdkService.generateInquiryResponse(fixture.questions.standard, fixture.stress.none);
    expect(mocks.askOracle).toHaveBeenCalledWith(fixture.oracle.qualifiedPrompt);
  });

  it(fixture.cases.unexpectedPrompt, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.unexpected);
    mocks.askOracle.mockResolvedValue(fixture.oracle.placeholderDialogue);
    await sdkService.generateInquiryResponse(
      fixture.questions.standard,
      fixture.stress.none,
      fixture.stage as StageOfScene,
    );
    const prompt = mocks.askOracle.mock.calls[0][0] as string;
    fixture.oracle.unexpectedPromptFragments.forEach(
      (fragment) => expect(prompt).toContain(fragment),
    );
  });

  it(fixture.cases.rollRange, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.clean);
    mocks.askOracle.mockResolvedValue(fixture.oracle.placeholderDialogue);
    const result = await sdkService.generateInquiryResponse(
      fixture.questions.standard,
      fixture.stress.none,
    );
    expect(result.roll).toBe(fixture.expected.cleanRoll);
    expect(result.surgeUpdate).toBe(fixture.expected.cleanSurge);
  });

  it(fixture.cases.qualifiedSurge, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.qualified);
    mocks.askOracle.mockResolvedValue(fixture.oracle.placeholderDialogue);
    const result = await sdkService.generateInquiryResponse(
      fixture.questions.standard,
      fixture.stress.none,
    );
    expect(result.qualifier).toBe(fixture.expected.qualified);
    expect(result.surgeUpdate).toBe(fixture.expected.qualifiedSurge);
  });

  it(fixture.cases.unexpectedEvent, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.unexpected);
    mocks.askOracle.mockResolvedValue(fixture.oracle.placeholderDialogue);
    const result = await sdkService.generateInquiryResponse(
      fixture.questions.standard,
      fixture.stress.none,
    );
    expect(result.qualifier).toBe(fixture.expected.unexpected);
    expect(result.unexpectedRoll).toBeGreaterThanOrEqual(
      fixture.expected.minimumUnexpectedRoll,
    );
    expect(result.unexpectedEvent).toBeTruthy();
  });

  it(fixture.cases.unavailable, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.clean);
    mocks.askOracle.mockRejectedValue(new Error(fixture.oracle.failure));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = await sdkService.generateInquiryResponse(
      fixture.questions.standard,
      fixture.stress.none,
    );
    expect(result.answer).toBe(fixture.expected.yes);
    expect(result.description).toContain(fixture.expected.mechanicalDescriptionFragment);
    expect(result.oracleAvailable).toBe(false);
    expect(warn).toHaveBeenCalled();
  });

  it(fixture.cases.stress, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.clean);
    mocks.askOracle.mockResolvedValue(fixture.oracle.placeholderDialogue);
    const result = await sdkService.generateInquiryResponse(
      fixture.questions.standard,
      fixture.stress.high,
    );
    expect(result.roll).toBe(fixture.expected.stressedRoll);
    expect(result.qualifier).toBe(fixture.expected.qualified);
  });

  it(fixture.cases.sanitization, async () => {
    vi.spyOn(Math, 'random').mockReturnValue(fixture.random.clean);
    mocks.askOracle.mockResolvedValue(fixture.oracle.placeholderDialogue);
    const result = await sdkService.generateInquiryResponse(
      fixture.questions.injected,
      fixture.stress.none,
    );
    const prompt = mocks.askOracle.mock.calls[0][0] as string;
    fixture.oracle.reservedDelimiters.forEach(
      (delimiter) => expect(prompt).not.toContain(delimiter),
    );
    expect(prompt).not.toContain(fixture.oracle.injectedFragment);
    expect(result.answer).toBe(fixture.expected.yes);
    expect(result.roll).toBe(fixture.expected.cleanRoll);
  });
});
