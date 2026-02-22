// Barrel re-export — engine.ts is now split across entities/
// All original import paths continue to work.

// Entity modules
export { initializePlayer } from "./entities/player";
export { generateRandomVendor, generateMarketplace, generateWares } from "./entities/vendor";
export { generateArea, generateAreaWithOptions, generateStartArea } from "./entities/area";
export type { GenerateAreaOptions, GenerateStartAreaOptions } from "./entities/area";

// Generation (passthrough)
export type { AreaGenContext } from './mechanics/systems/generation';
export { getNPCLoot } from './mechanics/systems/generation/loot';
export { generateRandomAgentNPC } from './mechanics/systems/generation';

// Inquiry (passthrough)
export { simulateInquiryResponse } from "./inquiry";
