import type { InitializeGameOptions } from '@/features/game/store/types';

/** Pure function: parses current URL search params into InitializeGameOptions. */
export function getInitOptionsFromUrl(): InitializeGameOptions {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);

  const boolParam = (key: string): boolean | undefined =>
    params.has(key) ? params.get(key) !== '0' && params.get(key) !== 'false' : undefined;

  const forceNPCRaw = params.get('forceNPC');
  const forceNPC: boolean | string | undefined =
    forceNPCRaw === null ? undefined
    : forceNPCRaw === '1' || forceNPCRaw === 'true' ? true
    : forceNPCRaw === '0' || forceNPCRaw === 'false' ? false
    : forceNPCRaw; // treat as NPC id string

  const classId = params.get('classId') ?? undefined;

  const opts: InitializeGameOptions = {
    ...(boolParam('forceVendor') !== undefined && { forceVendor: boolParam('forceVendor') }),
    ...(boolParam('deterministic') !== undefined && { deterministic: boolParam('deterministic') }),
    ...(forceNPC !== undefined && { forceNPC }),
    ...(boolParam('lowHp') !== undefined && { lowHp: boolParam('lowHp') }),
    ...(boolParam('forceCompanion') !== undefined && { forceCompanion: boolParam('forceCompanion') }),
    ...(boolParam('lowCompanionHp') !== undefined && { lowCompanionHp: boolParam('lowCompanionHp') }),
    ...(boolParam('reset') !== undefined && { reset: boolParam('reset') }),
    ...(classId !== undefined && { classId }),
    ...(boolParam('autoStart') !== undefined && { autoStart: boolParam('autoStart') }),
  };

  return opts;
}

