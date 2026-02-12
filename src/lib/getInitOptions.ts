import type { InitializeGameOptions } from '@/features/game/slice/types';

/** Pure function: parses current URL search params into InitializeGameOptions. */
export function getInitOptionsFromUrl(): InitializeGameOptions {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    forceMerchant: params.get('forceMerchant') === '1',
    deterministic: params.get('deterministic') === '1',
    forceEnemy: params.get('forceEnemy') === '1',
    lowHp: params.get('lowHp') === '1',
    forceServitor: params.get('forceServitor') === '1',
    lowServitorHp: params.get('lowServitorHp') === '1',
    reset: params.get('reset') === '1',
    classId: params.get('classId') || undefined,
    autoStart: params.get('autoStart') === '1',
  };
}

