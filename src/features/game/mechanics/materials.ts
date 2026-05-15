import type { Item } from "../types";

export const MATERIALS: Item[] = [
    // ── Mushrooms ──
    { id: "glowing_mushroom", name: "Glowing Mushroom", type: "resource", description: "A faint blue fungus with regenerative properties.", cost: { primary: 5 } },
    { id: "chromatic_cap", name: "Chromatic Cap", type: "resource", description: "Iridescent fungus from mushroom ring growths. Shifts hue when touched.", cost: { primary: 8 } },
    { id: "dewdrop_morel", name: "Dewdrop Morel", type: "resource", description: "A pearl-toned morel that hums with gentle resonance. Used in careful alchemy.", cost: { primary: 12 } },
    { id: "root_truffle", name: "Root Truffle", type: "resource", description: "Subterranean truffle veined with amber. Whispers of the deep roots cling to it.", cost: { primary: 14, secondary: 1 } },
    { id: "ember_puffball", name: "Ember Puffball", type: "resource", description: "Smoldering orange puffball that radiates faint warmth. Used in warming compounds.", cost: { primary: 7 } },
    { id: "static_lichen", name: "Static Lichen", type: "resource", description: "Lichen crackling with residual hum from the creek crossings. Disrupts nearby enchantments.", cost: { primary: 10 } },
    // ── Metals & Hides ──
    { id: "scrap_metal", name: "Scrap Metal", type: "resource", description: "Salvaged metal for smithing.", cost: { primary: 4 } },
    { id: "leather_scraps", name: "Leather Scraps", type: "resource", description: "Tough hide for armor and gear.", cost: { primary: 4 } },
    // ── Craft & Arcane ──
    { id: "relic_shard", name: "Keepsake Shard", type: "resource", description: "A humming keepsake fragment still holding a trace of stored light.", cost: { primary: 12 } },
    { id: "acid_vial", name: "Acid Vial", type: "resource", description: "Corrosive fluid for alchemy.", cost: { primary: 6 } },
    { id: "rune_stone", name: "Rune Stone", type: "resource", description: "Inscribed stone with latent power.", cost: { primary: 15 } },
    { id: "moonstone_shard", name: "Moonstone Shard", type: "resource", description: "A luminous stone fragment.", cost: { primary: 10 } },
    { id: "chromatic_spore", name: "Chromatic Spore", type: "resource", description: "Spore from mushroom ring fungi.", cost: { primary: 14 } },
    { id: "glowstone_cluster", name: "Glowstone Cluster", type: "resource", description: "A bright mineral cluster used for charms, routes, and careful upgrades.", cost: { primary: 18, secondary: 2 } },
    { id: "morning_dew", name: "Morning Dew", type: "resource", description: "Glistening dew with unusual properties.", cost: { primary: 20 } },
];
