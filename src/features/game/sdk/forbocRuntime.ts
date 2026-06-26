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

/**
 * Resolve the ForbocAI API URL from environment.
 *
 * Returns null in production builds when NEXT_PUBLIC_FORBOC_API_URL is not
 * configured — silently falling back to localhost in a deployed build always
 * fails with confusing CORS / network errors, so we disable the Oracle instead
 * and log a clear error. Non-production environments (local dev, test) fall
 * back to localhost so no extra configuration is needed there.
 */
const resolveApiUrl = (): string | null => {
    const configured = process.env.NEXT_PUBLIC_FORBOC_API_URL;
    if (configured) return configured;
    if (process.env.NODE_ENV !== 'production') return 'http://localhost:8080';
    return null;
};

const getApiKey = (): string =>
    process.env.NEXT_PUBLIC_FORBOC_API_KEY ?? 'sk_test_key';

// ── Runtime state ─────────────────────────────────────────────────────────────
// Mutable singletons — set only by initializeOracleRuntime().
// _apiUrl=null and _oracleNpcId=null together mean "Oracle disabled".
let _initialized = false;
let _oracleNpcId: string | null = null;
let _apiUrl: string | null = null;
let _apiAvailablePromise: Promise<boolean> | null = null;

/**
 * Register the Oracle NPC and configure the runtime. Idempotent — safe to call
 * multiple times; state is set exactly once. Invoked automatically by askOracle()
 * and ensureApiAvailable() so existing callers do not need to change.
 *
 * When NEXT_PUBLIC_FORBOC_API_URL is absent in a production build, the Oracle
 * is disabled and a configuration error is written to the console. No localhost
 * fallback is used in production — that would always fail silently with CORS
 * errors from the browser.
 */
export const initializeOracleRuntime = (): void => {
    if (_initialized) return;

    const url = resolveApiUrl();

    if (!url) {
        // Mark initialized first so repeated calls do not spam the error log.
        _initialized = true;
        console.error(
            'ForbocAI: NEXT_PUBLIC_FORBOC_API_URL is not set. ' +
            'Oracle is disabled in this deployment. ' +
            'Set the environment variable in your Vercel project settings to enable it.'
        );
        return;
    }

    // Set _apiUrl and _oracleNpcId before marking initialized so that a failure
    // in generateNPCId() does not leave _initialized=true with the fields null.
    _apiUrl = url;
    _oracleNpcId = generateNPCId();
    _initialized = true;

    console.log(`ForbocAI API configured: ${url}`);

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

/**
 * Ping the API once per session; cached after the first call.
 * Returns false immediately (no network call) when the Oracle is disabled.
 */
export const ensureApiAvailable = async (): Promise<boolean> => {
    initializeOracleRuntime();
    if (!_apiUrl) return false;
    if (_apiAvailablePromise) return _apiAvailablePromise;
    _apiAvailablePromise = checkApiConnectivity(_apiUrl)
        .then((ok) => {
            if (ok) {
                console.log(`ForbocAI: API available at ${_apiUrl}`);
            } else {
                console.warn(
                    `ForbocAI: API at ${_apiUrl} is not reachable. Oracle responses will be unavailable.`
                );
            }
            return ok;
        })
        .catch(() => {
            console.warn('ForbocAI: API connectivity check failed. Oracle responses will be unavailable.');
            return false;
        });
    return _apiAvailablePromise;
};

/**
 * Send a text message to the Oracle NPC via the ForbocAI tape-loop protocol.
 * Returns the Oracle's dialogue string, or throws on failure.
 * Throws a descriptive error when the Oracle is disabled (API URL not configured).
 */
export const askOracle = async (text: string): Promise<string> => {
    initializeOracleRuntime();
    if (!_oracleNpcId || !_apiUrl) {
        throw new Error(
            'ForbocAI Oracle is not available: ' +
            'set NEXT_PUBLIC_FORBOC_API_URL in your environment to enable it.'
        );
    }
    const result = await store
        .dispatch(
            processNPC({
                npcId: _oracleNpcId,
                text,
                apiUrl: _apiUrl,
                apiKey: getApiKey(),
            })
        )
        .unwrap();
    return result.dialogue;
};
