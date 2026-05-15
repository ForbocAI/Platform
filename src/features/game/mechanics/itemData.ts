import type { Item } from "../types";

export const ITEMS: Item[] = [
    {
        id: "ember_salve",
        name: "Hearth Poultice",
        description: "A soothing paste of warm herbs and embermoss. Heals 20 HP, relieves 10 Stress.",
        type: "consumable",
        effect: "heal_20_stress_10",
        cost: { primary: 5 }
    },
    {
        id: "spirit_echo",
        name: "Calming Tea Bundle",
        description: "A wrapped bundle of meadow tea and mint. Relieves 30 Stress.",
        type: "consumable",
        effect: "stress_30",
        cost: { primary: 8 }
    },
    {
        id: "blood_vial",
        name: "Glowstone Cordial",
        description: "A bright tonic brewed with crushed glowstones. Heals 50 HP but adds 10 Stress.",
        type: "consumable",
        effect: "heal_50_stress_add_10",
        cost: { primary: 10, secondary: 2 }
    },
    {
        id: "obsidian_dagger",
        name: "Brambleknife",
        description: "A nimble trail knife for thorny paths and close scrapes.",
        type: "weapon",
        cost: { primary: 15 }
    },
    {
        id: "iron_greatsword",
        name: "Bridgewarden Greatblade",
        description: "Heavy, dependable, and built for rough weather patrols.",
        type: "weapon",
        cost: { primary: 25 }
    },
    {
        id: "reinforced_plate",
        name: "Bridgewarden Plate",
        description: "Solid rain-tested protection. +4 AC.",
        type: "armor",
        bonus: { defense: 4 },
        cost: { primary: 30 }
    },
    {
        id: "shadow_cloak",
        name: "Moonpetal Cloak",
        description: "A soft travel cloak stitched for quiet routes. +2 AC.",
        type: "armor",
        bonus: { defense: 2 },
        cost: { primary: 25 }
    },
    {
        id: "ancient_battery",
        name: "Lantern Heart",
        description: "An old glow core that hums with stored light.",
        type: "relic",
        cost: { primary: 40, secondary: 5 }
    },
    {
        id: "contract_scout",
        name: "Wayfinder Writ: Mossstep Scout",
        description: "Invites a skilled scout to join your party.",
        type: "contract",
        cost: { primary: 50 },
        contractDetails: {
            targetName: "Mossstep Scout",
            role: "Scout",
            description: "A nimble courier who knows the side paths.",
            maxHp: 40
        }
    },
    {
        id: "contract_mercenary",
        name: "Wayfinder Writ: Bridge Warden",
        description: "Invites a steady guardian to travel with you.",
        type: "contract",
        cost: { primary: 75, secondary: 10 },
        contractDetails: {
            targetName: "Bridge Warden",
            role: "Warrior",
            description: "A sturdy pathkeeper who keeps lantern routes safe.",
            maxHp: 80
        }
    }
];
