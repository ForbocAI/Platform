// Unit tests for forbocRuntime — no running API required.
// The runtime is built on the SDK's public browser surface
// (`createBrowserCli` from @forbocai/browser), so that factory and the two
// @forbocai/core helpers it still uses are replaced with Vitest mocks. Tests
// are deterministic and execute in < 100 ms.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Shared mock state ─────────────────────────────────────────────────────────
// Declared before vi.mock() so the factories can close over them.
const mockRun = vi.fn();
const mockDispatch = vi.fn();
const mockCreateBrowserCli = vi.fn(() => ({ run: mockRun, store: { dispatch: mockDispatch } }));
const mockSetNPCInfo = vi.fn((payload: unknown) => ({ type: 'npc/setNPCInfo', payload }));
const mockGenerateNPCId = vi.fn(() => 'mock-oracle-npc-id');

vi.mock('@forbocai/browser', () => ({
    createBrowserCli: mockCreateBrowserCli,
}));

vi.mock('@forbocai/core', () => ({
    setNPCInfo: mockSetNPCInfo,
    generateNPCId: mockGenerateNPCId,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const okResult = (data: unknown = {}) => ({ status: 'ok', lines: [], data });

/** Every command string passed to cli.run(), in order. */
const runCommands = (): string[] => mockRun.mock.calls.map((call) => String(call[0]));

/** The first command issued that starts with the given prefix. */
const commandStartingWith = (prefix: string): string | undefined =>
    runCommands().find((command) => command.startsWith(prefix));

/**
 * Re-import forbocRuntime with a fresh module instance.
 * vi.resetModules() clears the module registry so the idempotency flag and
 * promise cache are reset for each test group.
 */
const freshRuntime = async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGenerateNPCId.mockReturnValue('mock-oracle-npc-id');
    mockRun.mockResolvedValue(okResult());
    return import('../src/features/game/sdk/forbocRuntime');
};

// ── initializeOracleRuntime ───────────────────────────────────────────────────

describe('initializeOracleRuntime', () => {
    it('dispatches setNPCInfo on first call', async () => {
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        expect(mockDispatch).toHaveBeenCalledOnce();
        expect(mockSetNPCInfo).toHaveBeenCalledOnce();
    });

    it('registers the Oracle with the full six-field persona', async () => {
        // The `npc create` command collapses a persona into a single traits
        // entry, which is why registration goes through the store instead.
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();

        const [call] = mockSetNPCInfo.mock.calls;
        const persona = (call[0] as { structuredPersona: Record<string, string[]> }).structuredPersona;
        expect(Object.keys(persona).sort()).toEqual(
            ['constraints', 'goals', 'relationships', 'speakingStyle', 'traits', 'world'],
        );
        expect(persona.goals.length).toBeGreaterThan(0);
        expect(persona.speakingStyle.length).toBeGreaterThan(0);
    });

    it('is idempotent — second call does not dispatch again', async () => {
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        initializeOracleRuntime();
        expect(mockDispatch).toHaveBeenCalledOnce();
    });

    it('builds the browser CLI exactly once', async () => {
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        initializeOracleRuntime();
        expect(mockCreateBrowserCli).toHaveBeenCalledOnce();
    });

    it('generates an NPC id on first call', async () => {
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        expect(mockGenerateNPCId).toHaveBeenCalledOnce();
    });

    it('does not generate a second id on repeated calls', async () => {
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        initializeOracleRuntime();
        initializeOracleRuntime();
        expect(mockGenerateNPCId).toHaveBeenCalledOnce();
    });

    it('after module re-evaluation, first call dispatches exactly once', async () => {
        // When the JS module is freshly evaluated (e.g. after a hot reload or
        // test reset), _initialized starts false and the first init call
        // dispatches once.  The store retains its own state independently —
        // this is accepted behaviour documented in the module's JSDoc.
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('does not dispatch when Oracle is disabled (production + no URL configured)', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXT_PUBLIC_FORBOC_API_URL', '');

        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();

        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockGenerateNPCId).not.toHaveBeenCalled();
        expect(mockCreateBrowserCli).not.toHaveBeenCalled();

        vi.unstubAllEnvs();
    });
});

// ── runtime configuration ─────────────────────────────────────────────────────

describe('runtime configuration', () => {
    it('configures the API URL through the runtime config surface', async () => {
        // createBrowserCli() is zero-config by design, so the URL reaches the
        // runtime via `config set` rather than a constructor option.
        process.env.NEXT_PUBLIC_FORBOC_API_URL = 'http://test-api:9090';
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();

        expect(commandStartingWith('config set _apiUrl')).toBe('config set _apiUrl http://test-api:9090');

        delete process.env.NEXT_PUBLIC_FORBOC_API_URL;
    });

    it('configures the API key through the runtime config surface', async () => {
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        expect(commandStartingWith('config set apiKey')).toBeDefined();
    });

    it('falls back to localhost:8080 when env is unset (non-production)', async () => {
        // NODE_ENV=test in Vitest → non-production → localhost fallback applies.
        const saved = process.env.NEXT_PUBLIC_FORBOC_API_URL;
        delete process.env.NEXT_PUBLIC_FORBOC_API_URL;

        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();

        expect(commandStartingWith('config set _apiUrl')).toBe('config set _apiUrl http://localhost:8080');

        if (saved !== undefined) process.env.NEXT_PUBLIC_FORBOC_API_URL = saved;
    });
});

// ── ensureApiAvailable ────────────────────────────────────────────────────────

describe('ensureApiAvailable', () => {
    beforeEach(() => {
        mockRun.mockResolvedValue(okResult());
    });

    it('runs the status command on first invocation', async () => {
        const { ensureApiAvailable } = await freshRuntime();
        await ensureApiAvailable();
        expect(runCommands()).toContain('status');
    });

    it('returns true when API is reachable', async () => {
        const { ensureApiAvailable } = await freshRuntime();
        const result = await ensureApiAvailable();
        expect(result).toBe(true);
    });

    it('returns false when the status command reports an error', async () => {
        const { ensureApiAvailable } = await freshRuntime();
        mockRun.mockResolvedValue({ status: 'error', lines: ['unreachable'] });
        const result = await ensureApiAvailable();
        expect(result).toBe(false);
    });

    it('returns false when the status command rejects', async () => {
        const { ensureApiAvailable } = await freshRuntime();
        mockRun.mockRejectedValue(new Error('network error'));
        const result = await ensureApiAvailable();
        expect(result).toBe(false);
    });

    it('runs the status command only once across multiple calls', async () => {
        // The async wrapper creates a new Promise each invocation, so object
        // identity cannot be asserted.  The meaningful invariant is that the
        // underlying connectivity check fires exactly once regardless of how
        // many callers await ensureApiAvailable().
        const { ensureApiAvailable } = await freshRuntime();
        await ensureApiAvailable();
        await ensureApiAvailable();
        await ensureApiAvailable();
        expect(runCommands().filter((command) => command === 'status')).toHaveLength(1);
    });

    it('awaiting the cached Promise returns the same value', async () => {
        const { ensureApiAvailable } = await freshRuntime();
        const r1 = await ensureApiAvailable();
        const r2 = await ensureApiAvailable();
        expect(r1).toBe(true);
        expect(r2).toBe(true);
    });

    it('automatically initializes the runtime', async () => {
        const { ensureApiAvailable } = await freshRuntime();
        await ensureApiAvailable();
        expect(mockDispatch).toHaveBeenCalled();      // setNPCInfo was dispatched
    });

    it('returns false without a network call when Oracle is disabled', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXT_PUBLIC_FORBOC_API_URL', '');

        const { ensureApiAvailable } = await freshRuntime();
        const result = await ensureApiAvailable();

        expect(result).toBe(false);
        expect(runCommands()).not.toContain('status');

        vi.unstubAllEnvs();
    });
});

// ── askOracle ────────────────────────────────────────────────────────────────

describe('askOracle', () => {
    it('runs npc process and returns dialogue', async () => {
        const { askOracle } = await freshRuntime();
        mockRun.mockResolvedValue(okResult({ dialogue: 'The stars align.' }));

        const result = await askOracle('What do the stars say?');

        expect(commandStartingWith('npc process')).toBeDefined();
        expect(result).toBe('The stars align.');
    });

    it('passes the question text in the npc process command', async () => {
        const { askOracle } = await freshRuntime();
        mockRun.mockResolvedValue(okResult({ dialogue: 'Answer.' }));

        await askOracle('Who are you?');

        expect(commandStartingWith('npc process')).toContain('Who are you?');
    });

    it('collapses newlines so the message stays on one command line', async () => {
        // The CLI parser splits on whitespace; a multi-line question would
        // otherwise break the command.
        const { askOracle } = await freshRuntime();
        mockRun.mockResolvedValue(okResult({ dialogue: '...' }));

        await askOracle('first line\nsecond line');

        const command = commandStartingWith('npc process') ?? '';
        expect(command).toContain('first line second line');
        expect(command).not.toContain('\n');
    });

    it('initializes the runtime automatically before the first command', async () => {
        const { askOracle } = await freshRuntime();
        mockRun.mockResolvedValue(okResult({ dialogue: '...' }));

        await askOracle('hello');

        expect(mockSetNPCInfo).toHaveBeenCalledOnce();
        expect(commandStartingWith('npc process')).toBeDefined();
    });

    it('uses the NPC id produced by initialization', async () => {
        mockGenerateNPCId.mockReturnValue('oracle-abc123');
        const { askOracle } = await freshRuntime();
        mockGenerateNPCId.mockReturnValue('oracle-abc123');
        mockRun.mockResolvedValue(okResult({ dialogue: '...' }));

        await askOracle('hello');

        expect(commandStartingWith('npc process')).toContain('oracle-abc123');
    });

    it('throws when the command reports an error status', async () => {
        const { askOracle } = await freshRuntime();
        mockRun.mockResolvedValue({ status: 'error', lines: ['API timeout'] });

        await expect(askOracle('hello')).rejects.toThrow('API timeout');
    });

    it('throws when the command returns no dialogue', async () => {
        const { askOracle } = await freshRuntime();
        mockRun.mockResolvedValue(okResult({}));

        await expect(askOracle('hello')).rejects.toThrow('no dialogue');
    });

    it('propagates runtime failures to the caller', async () => {
        const { askOracle } = await freshRuntime();
        mockRun.mockRejectedValue(new Error('network down'));

        await expect(askOracle('hello')).rejects.toThrow('network down');
    });

    it('throws a descriptive error when Oracle is disabled (production + no URL)', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXT_PUBLIC_FORBOC_API_URL', '');

        const { askOracle } = await freshRuntime();
        await expect(askOracle('hello')).rejects.toThrow('NEXT_PUBLIC_FORBOC_API_URL');

        vi.unstubAllEnvs();
    });
});
