export type AutoFocusMode = 'combat' | 'explore' | 'trade' | 'heal' | 'oracle' | 'loot' | 'baseCamp' | 'full';
export type AutoSpeedMode = 'fast' | 'normal' | 'slow';

export interface AutoplayURLConfig {
    focus: AutoFocusMode;
    speed: AutoSpeedMode;
    autoStart: boolean;
}

export function getAutoplayConfig(): AutoplayURLConfig {
    if (typeof window === 'undefined') {
        return { focus: 'full', speed: 'normal', autoStart: false };
    }

    const params = new URLSearchParams(window.location.search);
    return {
        focus: (params.get('autoFocus') as AutoFocusMode) || 'full',
        speed: (params.get('autoSpeed') as AutoSpeedMode) || 'normal',
        autoStart: params.get('autoStart') === '1',
    };
}

export function getTickInterval(speed: AutoSpeedMode): number {
    switch (speed) {
        case 'fast': return 1000;
        case 'slow': return 5000;
        default: return 2500;
    }
}

export function getNextAutoplayDelayMs(currentDelay: number, speed: AutoSpeedMode): number {
    const base = getTickInterval(speed);
    // Add jitter if needed, or just return base
    return base;
}
