/**
 * Forboc.AI Platform Lore
 *
 * Consolidated canon from:
 * - quadar.md (Qua'dar TTRPG): Umbralyn, Goetéian Chthonica, Migdal Kudar, the churning
 * - GoeteianChthonica.md: The Sterile Chamber, surgical-chthonic convergence
 * - forboc.github.io: Static Sea of All Noise, slipgates, inner/outer firmament
 * - qvht.github.io: Qvht daemon place, chromatic-steel, Chthonica
 */

// --- QUADAR.MD CANON ---

/** The fallen dimension; once pinnacle of ancient gnosis and forbidden sciences. */
export const LORE_UMBRALYN = "Umbralyn";

/** The chthonic force watching and waiting; steady voices guiding the chronicler. */
export const LORE_GOETIAN_CHTHONICA = "Goetéian Chthonica";

/** Qua'dar Tower (Migdal Kudar) — central hub, beating heart of Umbralyn's circuitry. */
export const LORE_QUADAR_TOWER = "Qua'dar Tower";
export const LORE_MIGDAL_KUDAR = "Migdal Kudar";

/** The Quadrangle — central hub area, focal point of the plot; Merchant dwells here. */
export const LORE_QUADRANGLE = "Quadrangle";

/** The protagonist: interloper, ranger, nomadic chronicler, starweaver. */
export const LORE_KAMENAL = "Kamenal";

/** The Astral Empire — future web of the ancestors. */
export const LORE_ASTRAL_EMPIRE = "Astral Empire";

/** Ethereal Towerlands — high places, vineyards of the alien tower. */
export const LORE_ETHEREAL_TOWERLANDS = "Ethereal Towerlands";

/** Watery northern expanse echoing with alien wails. */
export const LORE_ABYSSAL_MURK = "Abyssal Murk";

/** Recurring temporal phrase from the canon. */
export const LORE_CHURNING_PHRASE =
  "the churning of ages and eons past and yet to come";

/** Rift-laden Realm, the Many in the world of the disaffected. */
export const LORE_RIFT_REALM = "Rift-laden Realm";
export const LORE_THE_MANY = "the Many";

/** Wares the Merchant offers: tomes, spells, rations, food, booze, gear, weapons, upgrades. */
export const LORE_WARES = [
  "tomes",
  "spell books",
  "spells",
  "rations",
  "food",
  "booze",
  "gear",
  "weapons",
  "items",
  "upgrades",
  "other supplies",
] as const;

/** Chants and mantras from the canon. */
export const LORE_CHANTS = [
  "Be our vengeance, avenge us.",
  "Stop faking your pulse, we are already dead.",
  "There is no time, only churning.",
  "We are the embodiment of the division that forges wholeness.",
  "Praise be.",
] as const;

/** Place names and realm concepts. */
export const LORE_PLACES = {
  /** quadar: central monolith, beating heart of Umbralyn. */
  QUADAR_TOWER: "Qua'dar Tower",
  QUADRANGLE: "Quadrangle",
  /** quadar: fallen dimension, Astral Empire. */
  UMBRALYN: "Umbralyn",
  /** quadar: chthonic force, steady voices. */
  GOETIAN_CHTHONICA: "Goetéian Chthonica",
  ETHEREAL_TOWERLANDS: "Ethereal Towerlands",
  ABYSSAL_MURK: "Abyssal Murk",
  /** Forboc: the decaying land gripped by static. */
  STATIC_SEA_OF_ALL_NOISE: "Static Sea of All Noise",
  /** Forboc: teleports, timevoids, mystical conduits. */
  SLIPGATES: "slipgates",
  /** Qvht: the clandestine daemon place. */
  QVHT: "Qvht",
  /** Qvht / Echoes: the Chthonica's domain. */
  CHTHONICA: "Chthonica",
  /** The precipice between subterranean and shadowlands. */
  PRECIPICE_OF_SHADOWLANDS: "Precipice of the Shadowlands",
  /** Qvht: chromatic-steel structures. */
  CHROMATIC_STEEL_QUANTUM_FIELD: "Chromatic-Steel Quantum Field",
  /** Qvht: algorithmic laboratories. */
  ALGORITHMIC_LABORATORIES: "Algorithmic Laboratories",
  /** Qvht: twilight alchemy haven. */
  TWILIGHT_ALCHEMY_HAVEN: "Twilight Alchemy Haven",
  /** Qvht: infernal cryptic abyss. */
  ABYSS_OF_INFERNAL_LORE: "Abyss of Infernal Lore",
  /** Echoes: the Void Maw. */
  VOID_MAW: "Void Maw",
  /** quadar: Rune Temples, Runic houses. */
  RUNE_TEMPLES: "Rune Temples",
  /** quadar: Crumbling Ruined Structures. */
  CRUMBLING_RUINS: "Crumbling Ruins",
  /** quadar: Dimensional Nexus, gateway. */
  DIMENSIONAL_NEXUS: "Dimensional Nexus",
  /** quadar: Cavernous Abyss, Kevarnis deep. */
  CAVERNOUS_ABYSS: "Cavernous Abyss",
  /** quadar: Ether, Ethereal Divide. */
  ETHER: "Ether",
  /** GoeteianChthonica.md: operating theater where incision pierces reality. */
  STERILE_CHAMBER: "The Sterile Chamber",
} as const;

/** GoeteianChthonica.md — The Sterile Chamber (Archives I & II). */
export const LORE_STERILE_CHAMBER = [
  "The sterile chamber, bathed in an eerie half-light, revealed an operating table inscribed with ancient sigils, pulsating with a silent power.",
  "As the scalpel met skin, it wasn't mere tissue that yielded but a veil between worlds, allowing whispers of the abyss to seep through.",
  "From the fissure, ethereal specters born of forgotten eras emerged, their anguished faces reflecting horrors unknown to man.",
  "With cold precision, one navigates through layers not of flesh, but of time and space, each layer revealing deeper abysses and shadows of torment.",
  "The mournful cries of trapped spirits reverberate, a chilling reminder of the price of treading where mankind was never meant to tread.",
  "Through the operating theater's overhead lights, one could glimpse entities, ageless and vast, scrutinizing with eyes that had seen the birth and death of stars.",
  "Each methodical step taken on the inscribed floor resonated with energies that transcended human understanding.",
  "The boundary between empirical science and the esoteric grew porous, as every incision beckoned spirits and energies from epochs untold.",
  "As the final suture was placed, sealing not just an incision but also a portal, the very cosmos seemed to hold its breath.",
  "The silence that ensued bore the heaviness of aeons, a stillness not of resolution but of truths too vast and terrifying for the human psyche to comprehend.",
  "Instruments, though modern, bear an uncanny resonance, as if they're conduits channeling insights from both the known and the chthonic.",
  "The lines differentiating medical expertise and ancient esoteric practices blur, with every action invoking energies spanning the gamut of human history and beyond.",
] as const;

/** Biome-like realms from the lore (for atmosphere and vignettes). */
export const LORE_REALMS = [
  "Shub Necrotics of Forgotten Places",
  "Echoes of the Enigmatic Realm",
  "Whispering Shadows of the Otherworld",
  "Chthonic Depths",
  "Cavernous Whispers",
  "Ethereal Seas of the Mind",
  "Chromatic-Steel Fungi",
  "Twilight Alchemy Haven",
  "Abyss of Infernal Lore",
  "Dark Alley Labyrinths",
  "Forgotten Scriptural Bastions",
  "Algorithmic Laboratories",
] as const;

/** quadar.md environments — all terrain types from the TTRPG design. */
export const LORE_QUADAR_ENVIRONMENTS = [
  "Ethereal Marshlands and Abyssal Murk",
  "Toxic Wastes and Desolate Places",
  "Haunted Chapels",
  "Military Facilities and Installations",
  "The Tower (Migdal Kudar)",
  "Fortresses and Strongholds of Eldritch",
  "Dungeons",
  "Temples (Rune Temples, Runic Houses)",
  "Crumbling Ruins",
  "Narrow Paths",
  "Raised Platforms",
  "Ether (Ethereal Divide)",
  "Other Underground Areas (Crypts of Goetia)",
  "Abyssal Pits",
  "Mud Slides",
  "Glades",
  "Portals (Vortex, the Field)",
  "Dimensional Nexus",
  "Outerworldly Realms",
] as const;

/** Atmospheric prose excerpts for flavor. */
export const LORE_ATMOSPHERE = [
  "We emerge as living embodiment of inner all, in a primordial future juxtaposed against the outer all static macrocosm.",
  "Here twilight dances with shadows. We arise as fusion of unity and multiplicity.",
  "Navigating the depths of forbidden knowledge and dark tomes, our essence resonates with the very forces that remain concealed beneath the surface.",
  "Born from the outer all static, these beings threaten to disrupt the balance of existence itself.",
  "We step into a decaying land gripped by the enigmatic Static Sea of All Noise.",
  "Whispers of the countless other guide us, driving us deeper into the heart of the unknown—even fear itself.",
  "We traverse the landscapes where shadows dance to the rhythm of echoes.",
  "The upper firmament and lower firmament are the mind and the heart.",
  "When we sleep it is like when a plant receives light—we receive energy from the abyss or the void maw or the ethos.",
  "In the noir and lamp lit heart of the metropolis, where the ordinary meets the arcane, lies the clandestine daemon place.",
  "Shadows dance in the glow of lights and flames, and the very fabric of experience seems to burn and blur and bleed.",
  "The journey commences in the subterranean labyrinths, where echoes of forgotten whispers reverberate through ancient tunnels.",
  "Luminescent fungi, pulsating with an otherworldly glow, illuminate the path through subterranean passages.",
  "The seas are not made of water but of undulating thoughts and emotions. Waves of imagination lap against the shores of consciousness.",
  "Within Qvht, the structures rise like colossal fungi of chromatic-steel, their towering forms resembling organic growth in cyberspace.",
  "The air within this cybernetic domain is charged with the hum of servers, a symphony of electric energy.",
  "Conjured flames lick obsidian pillars that mark the entrance to the deepest realms of the imagination.",
  "The labyrinthine corridors twisted and turned, leading deeper into the heart of the Underworld.",
  "In the interplanar multidimensional charred reeking gigantic slugging catacombing byways, we trail the hushed edges of banished monolithic skyscraping infrastructures.",
  "Each relic we uncover is a piece of the confusion, a mechanical skeletal key in deciphering the astral languages and chthonic ritualistic arrangements.",
  "We are silent screams. We are the other.",
  "Yet living on in other reaches, Goetéian Chthonica watches and waits.",
  "Guided by the lingering echoes, driven by the steady voices of Goetéian Chthonica.",
  "The murmurs of Umbralyn linger in the shadows.",
  "In the shadowy expanse known as Qua'dar, the echoes of a once-glorious machine rip and howl through eons of despair.",
  "As the scalpel met skin, it wasn't mere tissue that yielded but a veil between worlds, allowing whispers of the abyss to seep through.",
  "Through the operating theater's overhead lights, one could glimpse entities, ageless and vast, scrutinizing with eyes that had seen the birth and death of stars.",
  "The boundary between empirical science and the esoteric grew porous, as every incision beckoned spirits and energies from epochs untold.",
] as const;

/** Echoes of the Enigmatic Realm — verse. */
export const LORE_ECHOES_VERSE = [
  "In twilight's realm where shadows dance, we step into a mystic trance.",
  "A fusion born of dark and light, a journey through the endless night.",
  "Arcane whispers, rituals deep, in hidden depths our souls shall sweep.",
  "From abyssal depths to heavens high, our path is traced across the sky.",
  "The static sea, a cosmic rhyme, a symphony of space and time.",
  "So join us here, where shadows play, in this realm we find our way.",
  "Through words and visions we shall roam, embracing darkness as our home.",
] as const;

/** Tags / themes from Echoes of the Abyssal Maw. */
export const LORE_ABYSSAL_TAGS = [
  "VoidMaw",
  "CyberNoir",
  "TriumphantDeath",
  "ForbiddenLove",
  "RitualSacrifice",
  "MartyrsBlood",
  "AbyssalEchoes",
] as const;

/** Short vignette-ready themes derived from the lore. */
export const LORE_VIGNETTE_THEMES = [
  "Static Sea of All Noise",
  "Echoes of the Enigmatic Realm",
  "Shub Necrotics of Forgotten Places",
  "Whispering Shadows of the Otherworld",
  "Descent of the Nameless One",
  "Echoes of the Abyssal Maw",
  "Chromatic-Steel Quantum Field",
  "Chthonic Depths",
  "Twilight Alchemy Haven",
  "Abyss of Infernal Lore",
  "Inner Firmament",
  "Outer All Static",
  "Slipgate Suspension",
  "The Void Maw",
  "Sacrificing Chambers",
  "Forgotten Scriptural Bastions",
  // quadar.md
  "Goetéian Chthonica Watches",
  "Umbralyn Fallen",
  "Migdal Kudar",
  "Rift-laden Realm",
  "The Quadrangle",
  "Cavernous Abyss",
  "Dimensional Nexus",
  "Ethereal Towerlands",
  "Abyssal Murk",
  // GoeteianChthonica.md
  "The Sterile Chamber",
  "Chthonic Revelation",
  "Incision Between Worlds",
] as const;
