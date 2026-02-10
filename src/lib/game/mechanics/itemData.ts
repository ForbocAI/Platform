import type { Item } from "../types";

export const ITEMS: Item[] = [
    {
        id: "ember_salve",
        name: "Ember Salve",
        description: "A soothing paste of crushed embers. Heals 20 HP, relieves 10 Stress.",
        type: "consumable",
        effect: "heal_20_stress_10",
        cost: { spirit: 5 }
    },
    {
        id: "spirit_echo",
        name: "Spirit Echo",
        description: "A captured whisper. Relieves 30 Stress.",
        type: "consumable",
        effect: "stress_30",
        cost: { spirit: 8 }
    },
    {
        id: "blood_vial",
        name: "Vial of Old Blood",
        description: "Thick, dark blood. Heals 50 HP but adds 10 Stress.",
        type: "consumable",
        effect: "heal_50_stress_add_10",
        cost: { spirit: 10, blood: 2 }
    },
    {
        id: "obsidian_dagger",
        name: "Obsidian Dagger",
        description: "Razor sharp volcanic glass. +2 Agi.",
        type: "weapon",
        bonus: { Agi: 2 },
        cost: { spirit: 15 }
    },
    {
        id: "iron_greatsword",
        name: "Iron Greatsword",
        description: "Heavy and brutal. +4 Str, -2 Agi.",
        type: "weapon",
        bonus: { Str: 4, Agi: -2 },
        cost: { spirit: 25 }
    },
    {
        id: "reinforced_plate",
        name: "Reinforced Plate",
        description: "Solid protection. +4 AC, -2 Agi.",
        type: "armor",
        bonus: { ac: 4, Agi: -2 },
        cost: { spirit: 30 }
    },
    {
        id: "shadow_cloak",
        name: "Shadow Cloak",
        description: "Woven from shadows. +2 AC, +2 Agi.",
        type: "armor",
        bonus: { ac: 2, Agi: 2 },
        cost: { spirit: 25 }
    },
    {
        id: "ancient_battery",
        name: "Ancient Battery",
        description: "Hums with power. +4 Arcane.",
        type: "relic",
        bonus: { Arcane: 4 },
        cost: { spirit: 40, blood: 5 }
    },
    {
        id: "contract_scout",
        name: "Contract: Ashwalker Scout",
        description: "Hires a skilled scout to join your party.",
        type: "contract",
        cost: { spirit: 50 },
        contractDetails: {
            servitorName: "Ashwalker Scout",
            role: "Scout",
            description: "A nimble explorer looking for work.",
            maxHp: 40
        }
    },
    {
        id: "contract_mercenary",
        name: "Contract: Iron Mercenary",
        description: "Hires a tough warrior to fight for you.",
        type: "contract",
        cost: { spirit: 75, blood: 10 },
        contractDetails: {
            servitorName: "Iron Mercenary",
            role: "Warrior",
            description: "A seasoned fighter clad in iron.",
            maxHp: 80
        }
    }
];
