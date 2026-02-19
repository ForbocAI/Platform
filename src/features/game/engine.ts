// Barrel re-export — engine.ts is now split across entities/
// All original import paths continue to work.

// Entity modules
export { initializePlayer } from "./entities/player";
export { generateRandomVendor, generateMarketplace, generateWares } from "./entities/vendor";
export { generateArea, generateAreaWithOptions, generateStartArea } from "./entities/area";
export type { GenerateAreaOptions, GenerateStartAreaOptions } from "./entities/area";

// Generation (passthrough)
export type { AreaGenContext } from "./generation";
export { getNPCLoot } from "./generation/loot";
export { generateRandomAgentNPC } from "./generation";

// Oracle (passthrough)
export { consultOracle } from "./oracle";
