/**
 * Portrait Mapping — provides image URLs for AI agents based on persona or type.
 */
export const PORTRAIT_MAP: Record<string, string> = {
    'player': 'https://api.dicebear.com/7.x/adventurer/svg?seed=player&backgroundColor=050505',
    'npc': 'https://api.dicebear.com/7.x/bottts/svg?seed=enemy&backgroundColor=1a1a1a',
    'servitor': 'https://api.dicebear.com/7.x/identicon/svg?seed=servitor&backgroundColor=0a0a0a',
    'Hostile Entity': 'https://api.dicebear.com/7.x/bottts/svg?seed=monster&backgroundColor=330000',
    'Loyal Servitor': 'https://api.dicebear.com/7.x/identicon/svg?seed=ghost&backgroundColor=003366',
    'Qua\'dar Adventurer': 'https://api.dicebear.com/7.x/adventurer/svg?seed=hero&backgroundColor=0a0a0a',
};

export function getPortraitForAgent(type: string, persona?: string): string {
    if (persona && PORTRAIT_MAP[persona]) return PORTRAIT_MAP[persona];
    return PORTRAIT_MAP[type] || PORTRAIT_MAP['npc'];
}
