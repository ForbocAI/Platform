/**
 * Autoplay helpers — pure utilities for pick-best-purchase, pick-worst-sell,
 * pick-best-capability, and oracle prompt themes. Extracted from autoplay.ts for
 * refactor-by-line-count; no public API change.
 */

import { CAPABILITIES } from '@/features/game/mechanics/capabilities';
import type { Item, NonPlayerActor } from '@/features/game/types';

export const HEALING_ITEM_NAMES = [
  'Healing', 'Potion', 'Mushroom', 'Salve', 'Puffball', 'Cap', 'Morel', 'Truffle', 'Lichen',
];

export const INQUIRY_THEMES = [
  'What data anomalies exist in this regional sector?',
  'Is the system integrity weakening in this area?',
  'Can I detect background transmissions from the central node?',
  'Is there a network interface hidden amidst the environment?',
  'Does the signature of the System Administrator linger here?',
  'Are there encrypted archives waiting to be accessed?',
  'Is the system frequency shifting nearby?',
];

/** Find best item to buy from a vendor. When preferContract is true (e.g. companion prep), pick a contract if affordable. */
export function pickBestPurchase(
  wares: Item[],
  resourcePrimary: number,
  resourceSecondary: number,
  playerInventory: Item[],
  preferContract = false,
): Item | null {
  const affordable = wares.filter(w => {
    const cost = w.cost || { primary: 0 };
    return (resourcePrimary >= (cost.primary || 0)) && (resourceSecondary >= (cost.secondary || 0));
  });
  if (affordable.length === 0) return null;

  if (preferContract) {
    const contract = affordable.find(w => w.type === 'contract');
    if (contract) return contract;
  }

  const hasAnyHealing = playerInventory.some(
    i => i.type === 'consumable' && HEALING_ITEM_NAMES.some(n => i.name.includes(n)),
  );
  const hasWeapon = playerInventory.some(i => i.type === 'weapon');
  const hasArmor = playerInventory.some(i => i.type === 'armor');

  return affordable.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (!hasAnyHealing) {
      if (a.type === 'consumable') scoreA += 10;
      if (b.type === 'consumable') scoreB += 10;
    }

    const typePriority: Record<string, number> = {
      consumable: 5, weapon: 4, armor: 4, relic: 3, contract: 2, resource: 1,
    };
    scoreA += typePriority[a.type] || 0;
    scoreB += typePriority[b.type] || 0;

    if (a.type === 'weapon' && hasWeapon) scoreA -= 3;
    if (b.type === 'weapon' && hasWeapon) scoreB -= 3;
    if (a.type === 'armor' && hasArmor) scoreA -= 3;
    if (b.type === 'armor' && hasArmor) scoreB -= 3;

    return scoreB - scoreA;
  })[0] ?? null;
}

/** Determine worst item to sell (resources > consumables > others) */
export function pickWorstItem(inventory: Item[]): Item | null {
  if (inventory.length === 0) return null;
  const sellPriority: Record<string, number> = {
    resource: 1, consumable: 2, contract: 3, relic: 4, armor: 5, weapon: 6,
  };
  return [...inventory].sort((a, b) =>
    (sellPriority[a.type] || 0) - (sellPriority[b.type] || 0),
  )[0] ?? null;
}

/** Pick the best capability to use based on situation (detailed heuristic) */
export function pickBestCapability(capabilityIds: string[], npcs: NonPlayerActor[]): string | null {
  if (!capabilityIds || capabilityIds.length === 0) return null;

  let best: { id: string; score: number } | null = null;
  for (const id of capabilityIds) {
    const capability = CAPABILITIES[id];
    if (!capability) continue;

    let score = 3;
    if (capability.magnitude) {
      const match = capability.magnitude.match(/(\d+)d(\d+)/);
      if (match) score = Number(match[1]) * (Number(match[2]) + 1) / 2;
    }
    if (npcs.length > 0 && npcs[0].stats.hp > 30) score *= 1.5;
    const effectStr = typeof capability.effect === 'function' ? capability.effect({} as never, {} as never) : '';
    if (effectStr.includes('DoT') || effectStr.includes('Debuff')) score += 2;
    if (!best || score > best.score) best = { id, score };
  }
  return best?.id ?? capabilityIds[0];
}
