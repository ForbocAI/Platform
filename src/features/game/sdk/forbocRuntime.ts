// Singleton ForbocAI runtime for the Platform.
// Owns the Oracle NPC identity and dispatches processNPC thunks against the
// SDK's internal Redux store. Fully browser-compatible — no SQLite, no native modules.

import {
    store,
    setNPCInfo,
    generateNPCId,
    processNPC,
    checkApiConnectivity,
} from '@forbocai/core';

const getApiUrl = (): string =>
    process.env.NEXT_PUBLIC_FORBOC_API_URL ?? 'http://localhost:8080';

const getApiKey = (): string =>
    process.env.NEXT_PUBLIC_FORBOC_API_KEY ?? 'sk_test_key';

// ── Runtime state ─────────────────────────────────────────────────────────────
// Mutable singletons — set only by initializeOracleRuntime().
// Declared here (module scope) so askOracle() can reference them after init.
let _initialized = false;
let _oracleNpcId: string | null = null;
let _apiAvailablePromise: Promise<boolean> | null = null;

/**
 * Register the Oracle NPC and configure the runtime. Idempotent — safe to call
 * multiple times; state is set exactly once. Invoked automatically by askOracle()
 * and ensureApiAvailable() so existing callers do not need to change.
 *
 * Explicit calls are permitted for boot-time eager initialization (e.g. from a
 * BootstrapGate component), but are not required.
 */
export const initializeOracleRuntime = (): void => {
    if (_initialized) return;

    // Set _oracleNpcId before marking initialized so that a failure in
    // generateNPCId() does not leave _initialized=true with _oracleNpcId=null.
    _oracleNpcId = generateNPCId();
    _initialized = true;

    store.dispatch(
        setNPCInfo({
            id: _oracleNpcId,
            structuredPersona: {
                traits: [
                    'Mystical oracle',
                    'Ancient and wise',
                    'Answers questions with insight',
                ],
                goals: [
                    'Guide the player with truthful answers',
                    'Illuminate the path forward',
                ],
                relationships: ['Serves the realm and its seekers'],
                world: ['The game world', 'Ancient halls of knowing'],
                speakingStyle: [
                    'Cryptic but clear',
                    'Measured and deliberate',
                    'Uses metaphor when helpful',
                ],
                constraints: [
                    'Answers only what is asked',
                    'Never fabricates certainty it does not have',
                ],
            },
        })
    );
};

/** Ping the API once per session; cached after the first call. */
export const ensureApiAvailable = async (): Promise<boolean> => {
    initializeOracleRuntime();
    if (_apiAvailablePromise) return _apiAvailablePromise;
    _apiAvailablePromise = checkApiConnectivity(getApiUrl())
        .then((ok) => {
            if (ok) {
                console.log(`ForbocAI: API available at ${getApiUrl()}`);
            } else {
                console.warn(`ForbocAI: API at ${getApiUrl()} is not reachable. Oracle responses will be unavailable.`);
            }
            return ok;
        })
        .catch(() => {
            console.warn(`ForbocAI: API connectivity check failed. Oracle responses will be unavailable.`);
            return false;
        });
    return _apiAvailablePromise;
};

/**
 * Send a text message to the Oracle NPC via the ForbocAI tape-loop protocol.
 * Returns the Oracle's dialogue string, or throws on failure.
 */
export const askOracle = async (text: string): Promise<string> => {
    initializeOracleRuntime();
    const result = await store
        .dispatch(
            processNPC({
                npcId: _oracleNpcId!,
                text,
                apiUrl: getApiUrl(),
                apiKey: getApiKey(),
            })
        )
        .unwrap();
    return result.dialogue;
};
