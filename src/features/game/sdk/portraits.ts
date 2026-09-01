/**
 * Portrait Mapping — provides image URLs for AI agents based on persona or type.
 */
export const PORTRAIT_MAP: Record<string, string> = {
    'player': 'https://api.dicebear.com/7.x/adventurer/svg?seed=player&backgroundColor=050505',
    'npc': 'https://api.dicebear.com/7.x/bottts/svg?seed=enemy&backgroundColor=1a1a1a',
    'servitor': 'https://api.dicebear.com/7.x/identicon/svg?seed=servitor&backgroundColor=0a0a0a',
    'Hostile Entity': 'https://api.dicebear.com/7.x/bottts/svg?seed=monster&backgroundColor=330000',
    'Loyal Servitor': 'https://api.dicebear.com/7.x/identicon/svg?seed=ghost&backgroundColor=003366',
    'Vale Wayfinder': 'https://api.dicebear.com/7.x/adventurer/svg?seed=hero&backgroundColor=0a0a0a',
};

export function getPortraitForAgent(type: string, persona?: string): string {
    if (persona) {
        const classPortrait = getClassPortraitUrl(persona);
        if (classPortrait) return classPortrait;
        const vendorPortrait = getVendorPortraitUrl(persona);
        if (vendorPortrait) return vendorPortrait;
        if (PORTRAIT_MAP[persona]) return PORTRAIT_MAP[persona];
    }
    return PORTRAIT_MAP[type] || PORTRAIT_MAP['npc'];
}

const CHARACTER_PROFILE_ASSET_PATH = '/assets/character_profile/';

/** Hand-illustrated portrait filenames for classes with real character art. Classes without an entry have no portrait. */
const CLASS_PORTRAIT_OVERRIDES: Record<string, string> = {
    Wayfinder: 'courier_fairy_thumbnail.png',
    Bridgekeeper: 'gnome_borrowkeeper_thumbnail.png',
    Thornwarden: 'troll_bridgeholds_thumbnail.png',
    'Ironbark Sentinel': 'bridgekeeper_thumbnail.png',
    'Mist Drifter': 'brook_nymph_thumbnail.png',
    'Windguard Scout': 'stormwing_scout_thumbnail.png',
    'Glow Sentry': 'mossforged_tender_thumbnail.png',
    'Fog Wanderer': 'moonpetal_whisperer_thumbnail.png',
    'Thunderoak Elder': 'canopy_giant_thumbnail.png',
    Hearthkeeper: 'kettle_spark_thumbnail.png',
    Tanglevine: 'rootsong_caller_thumbnail.png',
    'Silkspinner Scout': 'spindle_weaver_thumbnail.png',
    'Dew Weaver': 'lantern_dryad_thumbnail.png',
    'Wayfinder Scout': 'courier_fairy_thumbnail.png',
    'Hearthkeeper Tender': 'kettle_spark_thumbnail.png',
    Rootwalker: 'rootwalker_thumbnail.png',
    'Bramble Colossus': 'bramble_colossus_thumbnail.png',
    'Mosshorn Charger': 'mosshorn_charger_thumbnail.png',
    'Petalwing Herald': 'petalwing_herald_thumbnail.png',
    'The Briarking': 'the_briarking_thumbnail.png',
};

/** Higher-resolution portrait filenames for classes with real character art, for larger display contexts (e.g. HUD identity badge). */
const CLASS_FULL_PORTRAIT_OVERRIDES: Record<string, string> = {
    Wayfinder: 'courier_fairy_full.png',
    Bridgekeeper: 'gnome_borrowkeeper_full.png',
    Thornwarden: 'troll_bridgeholds_full.png',
    'Ironbark Sentinel': 'bridgekeeper_full.png',
    'Mist Drifter': 'brook_nymph_full.png',
    'Windguard Scout': 'stormwing_scout_full.png',
    'Glow Sentry': 'mossforged_tender_full.png',
    'Fog Wanderer': 'moonpetal_whisperer_full.png',
    'Thunderoak Elder': 'canopy_giant_full.png',
    Hearthkeeper: 'kettle_spark_full.png',
    Tanglevine: 'rootsong_caller_full.png',
    'Silkspinner Scout': 'spindle_weaver_full.png',
    'Dew Weaver': 'lantern_dryad_full.png',
    'Wayfinder Scout': 'courier_fairy_full.png',
    'Hearthkeeper Tender': 'kettle_spark_full.png',
};

/** Thumbnail portrait for a playable class, or undefined when no real art exists for it. */
export function getClassPortraitUrl(classId: string): string | undefined {
    const fileName = CLASS_PORTRAIT_OVERRIDES[classId];
    return fileName ? CHARACTER_PROFILE_ASSET_PATH + fileName : undefined;
}

/** Full-resolution portrait for a playable class, or undefined when no real art exists for it. */
export function getClassFullPortraitUrl(classId: string): string | undefined {
    const fileName = CLASS_FULL_PORTRAIT_OVERRIDES[classId] ?? CLASS_PORTRAIT_OVERRIDES[classId];
    return fileName ? CHARACTER_PROFILE_ASSET_PATH + fileName : undefined;
}

export const AUTOPLAY_WATCHER_PORTRAIT_URL = CHARACTER_PROFILE_ASSET_PATH + 'watcher_thumbnail.png';

const VENDOR_PROFILE_ASSET_PATH = '/assets/vendor_profile/';

export const ORACLE_PORTRAIT_URL = VENDOR_PROFILE_ASSET_PATH + 'oracle_thumbnail.png';

const VENDOR_PORTRAIT_OVERRIDES: Record<string, string> = {
    'Kettle Smith': 'kettle_smith_thumbnail.png',
    'Tea Alchemist': 'tea_alchemist_thumbnail.png',
    'Curio Forager': 'curio_forager_thumbnail.png',
    'Bridge Marshal': 'bridge_marshal_thumbnail.png',
    'Lantern Peddler': 'lantern_peddler_thumbnail.png',
    'Moss Caravaner': 'moss_caravaner_thumbnail.png',
    'Tinker Trader': 'tinker_trader_thumbnail.png',
    'Rootsong Reader': 'rootsong_reader_thumbnail.png',
    'Warrior': 'warrior_thumbnail.png',
    'Scout': 'scout_thumbnail.png',
    'Mystic': 'mystic_thumbnail.png',
};

export function getVendorPortraitUrl(persona: string): string | undefined {
    const fileName = VENDOR_PORTRAIT_OVERRIDES[persona];
    return fileName ? VENDOR_PROFILE_ASSET_PATH + fileName : undefined;
}
