import type { BrowserCliResult, BrowserNpcRegistration } from '@forbocai/browser';
import { choose } from '@/features/core/fp/choice';
import runtimeData from './data/runtime.json';

export interface CortexResponse {
  readonly dialogue: string;
  readonly action?: {
    readonly type: string;
    readonly payload?: Record<string, unknown>;
  };
}

export const forbocActorIds = Object.freeze({ ...runtimeData.actorIds });
export const vendorSpeakCooldownMilliseconds = runtimeData.vendor.speakCooldownMilliseconds;

const whitespace = new RegExp(
  runtimeData.normalization.whitespacePattern,
  runtimeData.normalization.flags,
);

const renderError = (
  template: string,
  values: Readonly<Record<string, string>>,
): string => Object.entries(values).reduce(
  (text, [key, value]) => text.replaceAll(`{${key}}`, value),
  template,
);

export const normalizeObservation = (text: string): string =>
  text.replace(whitespace, runtimeData.normalization.replacement).trim();

export const agentNpcId = (agentId: string): string =>
  `${forbocActorIds.agentPrefix}${encodeURIComponent(agentId)}`;

export const vendorNpcId = (vendorId: string): string =>
  `${forbocActorIds.vendorPrefix}${encodeURIComponent(vendorId)}`;

export const processCommand = (
  registration: BrowserNpcRegistration,
  observation: string,
): string => [
  runtimeData.commands.npcProcess,
  registration.id,
  normalizeObservation(observation),
].join(runtimeData.normalization.replacement);

export const isSuccessfulResult = (result: BrowserCliResult): boolean =>
  result.status === runtimeData.result.okStatus;

const fail = (message: string): never => {
  throw new Error(message);
};

export const requireCortexResponse = (
  role: string,
  result: BrowserCliResult,
): CortexResponse => {
  const response = result.data as CortexResponse | undefined;
  return choose(
    isSuccessfulResult(result),
    () => choose(
      typeof response?.dialogue === 'string' && Boolean(response.dialogue.trim()),
      () => response!,
      () => fail(renderError(runtimeData.errors.empty, { role })),
    ),
    () => fail(renderError(runtimeData.errors.failed, {
      role,
      details: result.lines.join(runtimeData.normalization.replacement)
        || runtimeData.result.unknownError,
    })),
  );
};

export const runtimeRoles = Object.freeze({ ...runtimeData.roles });
export const statusCommand = runtimeData.commands.status;
