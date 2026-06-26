// Unit tests for forbocRuntime — no running API required.
// All @forbocai/core calls are replaced with Vitest mocks so tests
// are deterministic and execute in < 100 ms.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Shared mock state ─────────────────────────────────────────────────────────
// Declared before vi.mock() so the factory can close over them.
const mockDispatch = vi.fn();
const mockSetNPCInfo = vi.fn((payload: unknown) => ({ type: 'npc/setNPCInfo', payload }));
const mockGenerateNPCId = vi.fn(() => 'mock-oracle-npc-id');
const mockProcessNPC = vi.fn((payload: unknown) => ({ type: 'npc/processNPC', payload }));
const mockCheckApiConnectivity = vi.fn();

vi.mock('@forbocai/core', () => ({
    store: { dispatch: mockDispatch },
    setNPCInfo: mockSetNPCInfo,
    generateNPCId: mockGenerateNPCId,
    processNPC: mockProcessNPC,
    checkApiConnectivity: mockCheckApiConnectivity,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Re-import forbocRuntime with a fresh module instance.
 * vi.resetModules() clears the module registry so the idempotency flag and
 * promise cache are reset for each test group.
 */
const freshRuntime = async () => {
    vi.resetModules();
    vi.clearAllMocks();
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

    it('is idempotent — second call does not dispatch again', async () => {
        const { initializeOracleRuntime } = await freshRuntime();
        initializeOracleRuntime();
        initializeOracleRuntime();
        expect(mockDispatch).toHaveBeenCalledOnce();
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
});

// ── ensureApiAvailable ────────────────────────────────────────────────────────

describe('ensureApiAvailable', () => {
    beforeEach(() => {
        mockCheckApiConnectivity.mockResolvedValue(true);
    });

    it('calls checkApiConnectivity on first invocation', async () => {
        const { ensureApiAvailable } = await freshRuntime();
        await ensureApiAvailable();
        expect(mockCheckApiConnectivity).toHaveBeenCalledOnce();
    });

    it('returns true when API is reachable', async () => {
        mockCheckApiConnectivity.mockResolvedValue(true);
        const { ensureApiAvailable } = await freshRuntime();
        const result = await ensureApiAvailable();
        expect(result).toBe(true);
    });

    it('returns false when API is unreachable', async () => {
        mockCheckApiConnectivity.mockResolvedValue(false);
        const { ensureApiAvailable } = await freshRuntime();
        const result = await ensureApiAvailable();
        expect(result).toBe(false);
    });

    it('returns false when connectivity check rejects', async () => {
        mockCheckApiConnectivity.mockRejectedValue(new Error('network error'));
        const { ensureApiAvailable } = await freshRuntime();
        const result = await ensureApiAvailable();
        expect(result).toBe(false);
    });

    it('calls checkApiConnectivity only once across multiple calls', async () => {
        // The async wrapper creates a new Promise each invocation, so object
        // identity cannot be asserted.  The meaningful invariant is that the
        // underlying connectivity check fires exactly once regardless of how
        // many callers await ensureApiAvailable().
        const { ensureApiAvailable } = await freshRuntime();
        await ensureApiAvailable();
        await ensureApiAvailable();
        await ensureApiAvailable();
        expect(mockCheckApiConnectivity).toHaveBeenCalledOnce();
    });

    it('awaiting the cached Promise returns the same value', async () => {
        mockCheckApiConnectivity.mockResolvedValue(true);
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
});

// ── askOracle ────────────────────────────────────────────────────────────────

describe('askOracle', () => {
    it('dispatches processNPC and returns dialogue', async () => {
        const { askOracle } = await freshRuntime();
        const mockUnwrap = vi.fn().mockResolvedValue({ dialogue: 'The stars align.' });
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        const result = await askOracle('What do the stars say?');

        expect(mockProcessNPC).toHaveBeenCalledOnce();
        expect(result).toBe('The stars align.');
    });

    it('passes the question text to processNPC', async () => {
        const { askOracle } = await freshRuntime();
        const mockUnwrap = vi.fn().mockResolvedValue({ dialogue: 'Answer.' });
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        await askOracle('Who are you?');

        const [call] = mockProcessNPC.mock.calls;
        expect(call[0]).toMatchObject({ text: 'Who are you?' });
    });

    it('initializes the runtime automatically before the first dispatch', async () => {
        const { askOracle } = await freshRuntime();
        const mockUnwrap = vi.fn().mockResolvedValue({ dialogue: '...' });
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        await askOracle('hello');

        // setNPCInfo (from initializeOracleRuntime) + processNPC both go through dispatch
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockSetNPCInfo).toHaveBeenCalledOnce();
        expect(mockProcessNPC).toHaveBeenCalledOnce();
    });

    it('uses the NPC id produced by initialization', async () => {
        mockGenerateNPCId.mockReturnValue('oracle-abc123');
        const { askOracle } = await freshRuntime();
        const mockUnwrap = vi.fn().mockResolvedValue({ dialogue: '...' });
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        await askOracle('hello');

        const [call] = mockProcessNPC.mock.calls;
        expect(call[0]).toMatchObject({ npcId: 'oracle-abc123' });
    });

    it('propagates thunk failures to the caller', async () => {
        const { askOracle } = await freshRuntime();
        const mockUnwrap = vi.fn().mockRejectedValue(new Error('API timeout'));
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        await expect(askOracle('hello')).rejects.toThrow('API timeout');
    });

    it('includes the API URL from env in the processNPC call', async () => {
        process.env.NEXT_PUBLIC_FORBOC_API_URL = 'http://test-api:9090';
        const { askOracle } = await freshRuntime();
        const mockUnwrap = vi.fn().mockResolvedValue({ dialogue: '...' });
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        await askOracle('hello');

        const [call] = mockProcessNPC.mock.calls;
        expect(call[0]).toMatchObject({ apiUrl: 'http://test-api:9090' });

        delete process.env.NEXT_PUBLIC_FORBOC_API_URL;
    });

    it('falls back to localhost:8080 when env is unset', async () => {
        const saved = process.env.NEXT_PUBLIC_FORBOC_API_URL;
        delete process.env.NEXT_PUBLIC_FORBOC_API_URL;
        const { askOracle } = await freshRuntime();
        const mockUnwrap = vi.fn().mockResolvedValue({ dialogue: '...' });
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        await askOracle('hello');

        const [call] = mockProcessNPC.mock.calls;
        expect(call[0]).toMatchObject({ apiUrl: 'http://localhost:8080' });

        if (saved !== undefined) process.env.NEXT_PUBLIC_FORBOC_API_URL = saved;
    });
});
