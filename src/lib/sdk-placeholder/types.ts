/**
 * SDK Protocol Types (mirrors sdk/src/core/index.ts)
 */

export interface Observation {
    type: 'event' | 'state' | 'request';
    timestamp: number;
    agentId?: string;
    content: string;
    data?: Record<string, unknown>;
    context?: Record<string, unknown>;
}

export interface Directive {
    type: 'system-prompt' | 'action-constraints' | 'behavior-rules' | 'thought';
    content: string;
    constraints?: Record<string, unknown>;
    priority?: 'high' | 'normal' | 'low';
    expiresAt?: number;
}

export interface SDKAgentAction {
    type: string;
    target?: string;
    payload?: Record<string, unknown>;
    reason?: string;
    confidence?: number;
}

export type AutoFocusMode = 'combat' | 'explore' | 'trade' | 'heal' | 'oracle' | 'loot' | 'baseCamp' | 'full';
export type AutoSpeedMode = 'fast' | 'normal' | 'slow';

export interface AutoplayURLConfig {
    focus: AutoFocusMode;
    speed: AutoSpeedMode;
    autoStart: boolean;
}
