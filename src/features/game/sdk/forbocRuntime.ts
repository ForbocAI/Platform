import {
  createBrowserCli,
  type BrowserNpcRegistration,
} from '@forbocai/browser';
import {
  agentPersona,
  oraclePersona,
  playerPersona,
  vendorPersona,
  type AgentCortexIdentity,
  type StructuredPersona,
  type VendorCortexIdentity,
} from './personaAdapters';
import {
  agentNpcId,
  forbocActorIds,
  isSuccessfulResult,
  processCommand,
  requireCortexResponse,
  runtimeRoles,
  statusCommand,
  vendorNpcId,
  type CortexResponse,
} from './runtimeAdapters';

// SDK core owns endpoint selection and the approved default key. Platform
// supplies no connection policy and uses only the public browser CLI surface.
const cli = createBrowserCli();

const registration = (
  id: string,
  structuredPersona: StructuredPersona,
): BrowserNpcRegistration => ({ id, structuredPersona });

const oracleRegistration = (): BrowserNpcRegistration =>
  registration(forbocActorIds.oracle, oraclePersona());

const playerRegistration = (): BrowserNpcRegistration =>
  registration(forbocActorIds.playerAutoplay, playerPersona());

const processNpc = async (
  actor: { readonly registration: BrowserNpcRegistration; readonly role: string },
  observation: string,
): Promise<CortexResponse> => {
  cli.configureNpc(actor.registration);
  const result = await cli.run(processCommand(actor.registration, observation));
  return requireCortexResponse(actor.role, result);
};

export const ensureApiAvailable = async (): Promise<boolean> =>
  isSuccessfulResult(await cli.run(statusCommand));

export const askOracle = async (text: string): Promise<string> => (
  await processNpc({
    registration: oracleRegistration(),
    role: runtimeRoles.oracle,
  }, text)
).dialogue;

export const askPlayerCortex = (observation: string): Promise<CortexResponse> =>
  processNpc({
    registration: playerRegistration(),
    role: runtimeRoles.player,
  }, observation);

export const askAgentCortex = (
  identity: AgentCortexIdentity,
  observation: string,
): Promise<CortexResponse> => processNpc({
  registration: registration(agentNpcId(identity.agentId), agentPersona(identity)),
  role: runtimeRoles.agent,
}, observation);

export const askVendorCortex = (
  identity: VendorCortexIdentity,
  observation: string,
): Promise<CortexResponse> => processNpc({
  registration: registration(vendorNpcId(identity.vendorId), vendorPersona(identity)),
  role: runtimeRoles.vendor,
}, observation);
