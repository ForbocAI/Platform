import type { Biome, Vendor, Item } from "../types";
import { ITEMS, MATERIALS } from "../mechanics";
import { BIOME_GROUND_LOOT } from '../mechanics/systems/generation';

// --- Pure utility helpers ---

/** Create a unique instance of an item (pure). */
const instanceOf = (item: Item): Item => ({
    ...item,
    id: `${item.id}_${Math.random().toString(36).substring(7)}`
});

/** Pick N random items from a pool (pure, returns new array). */
const pickRandom = <T>(pool: readonly T[], count: number): T[] =>
    Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]);

// --- Specialist data tables (immutable) ---

const SPECIALIST_NAMES: Readonly<Record<string, readonly string[]>> = {
    "Weaponsmith": ["Ironmaw", "Steelheart", "Gornak", "Voss"],
    "Alchemist": ["Mordecai", "Sylphine", "Ashbloom", "Phex"],
    "Relic Hunter": ["Korrin", "Sable", "Thresh", "Xandric"],
    "Mercenary Captain": ["Captain"],
} as const;

const SPECIALIST_DESCRIPTIONS: Readonly<Record<string, string>> = {
    "Weaponsmith": "A burly artisan who hammers blades from obsidian and starfall.",
    "Alchemist": "A cloaked brewer surrounded by bubbling vials and noxious fumes.",
    "Relic Hunter": "A scarred scavenger who trades in dangerous artifacts.",
    "Mercenary Captain": "A battle-hardened veteran looking for clients.",
} as const;

const SPECIALIST_TYPES = ["Weaponsmith", "Alchemist", "Relic Hunter"] as const;
const VENDOR_TYPES = ["Scavenger", "Nomad", "Tech-Trader", "Mystic", "Mercenary Captain", ...SPECIALIST_TYPES] as const;

// --- Wares generation (pure functions per vendor specialty) ---

const generateWeaponsmithWares = (): Item[] => {
    const weaponItems = ITEMS.filter(i => i.type === "weapon" || i.type === "armor");
    const pool = weaponItems.length > 0 ? weaponItems : ITEMS.filter(i => i.type !== "contract");
    return pickRandom(pool, Math.floor(Math.random() * 2) + 3).map(instanceOf);
};

const generateAlchemistWares = (biome?: Biome): Item[] => {
    const matPool = biome && BIOME_GROUND_LOOT[biome]
        ? BIOME_GROUND_LOOT[biome]!
            .map(e => MATERIALS.find(m => m.id === e.materialId))
            .filter((m): m is Item => !!m)
        : [...MATERIALS];
    const pool = matPool.length > 0 ? matPool : [...MATERIALS];
    return pickRandom(pool, Math.floor(Math.random() * 3) + 3)
        .filter((m): m is Item => !!m)
        .map(instanceOf);
};

const generateRelicHunterWares = (): Item[] => {
    const rareItems = ITEMS.filter(i => (i.cost?.primary || 0) >= 15 || i.type === "relic");
    const pool = rareItems.length > 0 ? rareItems : ITEMS.filter(i => i.type !== "contract");
    return pickRandom(pool, Math.floor(Math.random() * 2) + 2).map(instanceOf);
};

const SPECIALIST_WARES: Readonly<Record<string, (biome?: Biome) => Item[]>> = {
    "Weaponsmith": generateWeaponsmithWares,
    "Alchemist": generateAlchemistWares,
    "Relic Hunter": generateRelicHunterWares,
};

/** Generate wares for a vendor (pure, data-driven). */
export const generateWares = (biome?: Biome, vendorType?: string): Item[] => {
    // Specialist curated wares
    const specialistGen = vendorType ? SPECIALIST_WARES[vendorType] : undefined;
    if (specialistGen) return specialistGen(biome);

    // Generic vendor wares
    const wares: Item[] = [];

    // Contracts for Mercenary Captain or occasional random
    if (vendorType === "Mercenary Captain" || Math.random() < 0.1) {
        const contracts = ITEMS.filter(i => i.type === "contract");
        if (contracts.length > 0) {
            wares.push(instanceOf(contracts[Math.floor(Math.random() * contracts.length)]));
        }
    }

    // Gear items
    const nonContractItems = ITEMS.filter(i => i.type !== "contract");
    const gearCount = Math.floor(Math.random() * 2) + 2;
    wares.push(...pickRandom(nonContractItems, gearCount).map(instanceOf));

    // Biome-scoped materials
    const materialPool = biome && BIOME_GROUND_LOOT[biome]
        ? BIOME_GROUND_LOOT[biome]!
            .map(e => MATERIALS.find(m => m.id === e.materialId))
            .filter((m): m is Item => !!m)
        : [...MATERIALS];
    const pool = materialPool.length > 0 ? materialPool : [...MATERIALS];
    const matCount = Math.floor(Math.random() * 3) + 1;
    wares.push(
        ...pickRandom(pool, matCount)
            .filter((m): m is Item => !!m)
            .map(instanceOf)
    );

    return wares;
};

/** Generate a single vendor (pure). */
export const generateRandomVendor = (biome?: Biome, forcedType?: string): Vendor => {
    const type = forcedType ?? VENDOR_TYPES[Math.floor(Math.random() * VENDOR_TYPES.length)];
    const wares = generateWares(biome, type);

    const namePool = SPECIALIST_NAMES[type];
    const name = namePool
        ? `${namePool[Math.floor(Math.random() * namePool.length)]} ${Math.floor(Math.random() * 100)}`
        : `${type} ${Math.floor(Math.random() * 100)}`;
    const description = SPECIALIST_DESCRIPTIONS[type] ?? "A wandering soul with goods to trade.";
    const specialty = (SPECIALIST_TYPES as readonly string[]).includes(type) ? type : undefined;

    return { id: Math.random().toString(36).substring(7), name, description, specialty, wares };
};

/** Generate a marketplace with 2 specialists + 1 generic vendor (pure). */
export const generateMarketplace = (biome?: Biome): Vendor[] => {
    const picked = [...SPECIALIST_TYPES]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    return [
        ...picked.map(s => generateRandomVendor(biome, s)),
        generateRandomVendor(biome), // one generic
    ];
};
