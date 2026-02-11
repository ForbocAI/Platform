import type { Item } from "@/features/game/types";

export const MATERIALS: Item[] = [
    { id: "glowing_mushroom", name: "Glowing Mushroom", type: "resource", description: "A faint blue fungus with regenerative properties.", cost: { spirit: 5 } },
    { id: "scrap_metal", name: "Scrap Metal", type: "resource", description: "Salvaged metal for smithing.", cost: { spirit: 4 } },
    { id: "leather_scraps", name: "Leather Scraps", type: "resource", description: "Tough hide for armor and gear.", cost: { spirit: 4 } },
    { id: "relic_shard", name: "Relic Shard", type: "resource", description: "A buzzing shard of old tech.", cost: { spirit: 12 } },
    { id: "acid_vial", name: "Acid Vial", type: "resource", description: "Corrosive fluid for alchemy.", cost: { spirit: 6 } },
    { id: "rune_stone", name: "Rune Stone", type: "resource", description: "Inscribed stone with latent power.", cost: { spirit: 15 } },
    { id: "obsidian_shard", name: "Obsidian Shard", type: "resource", description: "Volcanic glass shard.", cost: { spirit: 10 } },
    { id: "chromatic_spore", name: "Chromatic Spore", type: "resource", description: "Spore from chromatic-steel fungi.", cost: { spirit: 14 } },
    { id: "blood_crystal", name: "Blood Crystal", type: "resource", description: "Crystallized essence from the abyss.", cost: { spirit: 18, blood: 2 } },
    { id: "void_dust", name: "Void Dust", type: "resource", description: "Residue from dimensional rifts.", cost: { spirit: 20 } },
];
