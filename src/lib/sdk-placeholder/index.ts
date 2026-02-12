
import { Cortex } from './cortex';
import { Bridge } from './bridge';
import { Agent } from './agent';
import { Memory } from './memory';

// The unified SDK Interface
export const SDK = {
    Cortex,
    Bridge,
    Agent,
    Memory
};

// Mock Cortex Directive pipeline (SDK integration point)
export { getSDKDirective, getAutoplayConfig, getTickInterval } from './cortexDirective';
export type { AutoFocusMode, AutoSpeedMode, AutoplayURLConfig } from './cortexDirective';
