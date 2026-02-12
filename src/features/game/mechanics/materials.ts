import type { Item } from "../types";

export const MATERIALS: Item[] = [
    // ── Mushrooms ──
    { id: "glowing_mushroom", name: "Glowing Mushroom", type: "resource", description: "A faint blue fungus with regenerative properties.", cost: { spirit: 5 } },
    { id: "chromatic_cap", name: "Chromatic Cap", type: "resource", description: "Iridescent fungus from chromatic-steel growths. Shifts hue when touched.", cost: { spirit: 8 } },
    { id: "void_morel", name: "Void Morel", type: "resource", description: "A pitch-black morel that hums with dimensional resonance. Potent in rift alchemy.", cost: { spirit: 12 } },
    { id: "chthonic_truffle", name: "Chthonic Truffle", type: "resource", description: "Subterranean truffle veined with crimson. Whispers of the deep cling to it.", cost: { spirit: 14, blood: 1 } },
    { id: "ember_puffball", name: "Ember Puffball", type: "resource", description: "Smoldering orange puffball that radiates faint warmth. Used in pyrokinetic compounds.", cost: { spirit: 7 } },
    { id: "static_lichen", name: "Static Lichen", type: "resource", description: "Lichen crackling with residual noise from the Static Sea. Disrupts nearby enchantments.", cost: { spirit: 10 } },
    // ── Metals & Hides ──
    { id: "scrap_metal", name: "Scrap Metal", type: "resource", description: "Salvaged metal for smithing.", cost: { spirit: 4 } },
    { id: "leather_scraps", name: "Leather Scraps", type: "resource", description: "Tough hide for armor and gear.", cost: { spirit: 4 } },
    // ── Tech & Arcane ──
    { id: "relic_shard", name: "Relic Shard", type: "resource", description: "A buzzing shard of old tech.", cost: { spirit: 12 } },
    { id: "acid_vial", name: "Acid Vial", type: "resource", description: "Corrosive fluid for alchemy.", cost: { spirit: 6 } },
    { id: "rune_stone", name: "Rune Stone", type: "resource", description: "Inscribed stone with latent power.", cost: { spirit: 15 } },
    { id: "obsidian_shard", name: "Obsidian Shard", type: "resource", description: "Volcanic glass shard.", cost: { spirit: 10 } },
    { id: "chromatic_spore", name: "Chromatic Spore", type: "resource", description: "Spore from chromatic-steel fungi.", cost: { spirit: 14 } },
    { id: "blood_crystal", name: "Blood Crystal", type: "resource", description: "Crystallized essence from the abyss.", cost: { spirit: 18, blood: 2 } },
    { id: "void_dust", name: "Void Dust", type: "resource", description: "Residue from dimensional rifts.", cost: { spirit: 20 } },
];
