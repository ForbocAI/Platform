// Singleton ForbocAI runtime for the Platform.
//
// Follows the architecture of the SDK's own browser consumer
// (@forbocai/test-game-browser): the runtime is built from the *public*
// zero-config surface `createBrowserCli()`, never the SDK-maintainer-only
// `@forbocai/browser/dev` surface.
//
// `createBrowserCli()` returns `{ run, store }`. Both halves are used:
//
//   store — dispatch domain actions that need richer arguments than a command
//           string can carry. The Oracle's structuredPersona has six fields,
//           and the `npc create` command flattens a persona into a single
//           `traits` entry, so the persona is registered through the store.
//   run   — issue command-shaped operations. `npc process` is what supplies
//           `memory` to processNPC internally (context.getMemory), which is why
//           the Platform never constructs an IMemory of its own.
//
// Fully browser-compatible — no SQLite, no native modules.

import { createBrowserCli } from '@forbocai/browser';
import { generateNPCId, setNPCInfo } from '@forbocai/core';

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

type BrowserCli = ReturnType<typeof createBrowserCli>;

// ── Runtime state ─────────────────────────────────────────────────────────────
// Mutable singletons — set only by initializeOracleRuntime().
// _apiUrl=null and _oracleNpcId=null together mean "Oracle disabled".
let _initialized = false;
let _cli: BrowserCli | null = null;
let _oracleNpcId: string | null = null;
let _apiUrl: string | null = null;
let _apiAvailablePromise: Promise<boolean> | null = null;

const ORACLE_PERSONA = {
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
};

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

    // Set the runtime fields before marking initialized so a failure below does
    // not leave _initialized=true with the fields null.
    const cli = createBrowserCli();

    // The public factory is zero-config by design, so the API URL and key are
    // supplied through the runtime's own config surface rather than constructor
    // options. `npc process` reads them back via context.runtimeConfig().
    void cli.run(`config set _apiUrl ${url}`);
    void cli.run(`config set apiKey ${getApiKey()}`);

    _cli = cli;
    _apiUrl = url;
    _oracleNpcId = generateNPCId();
    _initialized = true;

    console.log(`ForbocAI API configured: ${url}`);

    // Registered through the store rather than `npc create` because the command
    // collapses a persona into a single traits entry; the Oracle needs all six
    // persona fields to survive.
    cli.store.dispatch(
        setNPCInfo({
            id: _oracleNpcId,
            structuredPersona: ORACLE_PERSONA,
        })
    );
};

/**
 * Ping the API once per session; cached after the first call.
 * Returns false immediately (no network call) when the Oracle is disabled.
 */
export const ensureApiAvailable = async (): Promise<boolean> => {
    initializeOracleRuntime();
    if (!_cli || !_apiUrl) return false;
    if (_apiAvailablePromise) return _apiAvailablePromise;

    const cli = _cli;
    _apiAvailablePromise = cli
        .run('status')
        .then((result) => result.status === 'ok')
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
    if (!_cli || !_oracleNpcId || !_apiUrl) {
        throw new Error(
            'ForbocAI Oracle is not available: ' +
            'set NEXT_PUBLIC_FORBOC_API_URL in your environment to enable it.'
        );
    }

    // `npc process` is the surface that wires memory into processNPC. The
    // command parser splits on whitespace and the handler rejoins everything
    // after the id, so newlines are collapsed to keep the message on one line.
    const message = text.replace(/\s+/g, ' ').trim();
    const result = await _cli.run(`npc process ${_oracleNpcId} ${message}`);

    if (result.status !== 'ok') {
        throw new Error(
            `ForbocAI Oracle failed: ${result.lines.join(' ') || 'unknown error'}`
        );
    }

    const dialogue = (result.data as { dialogue?: string } | undefined)?.dialogue;
    if (!dialogue) {
        throw new Error('ForbocAI Oracle returned no dialogue.');
    }
    return dialogue;
};
