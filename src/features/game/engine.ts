// Barrel re-export — engine.ts is now split across entities/
// All original import paths continue to work.

// Entity modules
export { initializePlayer } from "./entities/player";
export { generateRandomMerchant, generateMarketplace, generateWares } from "./entities/merchant";
export { generateRoom, generateRoomWithOptions, generateStartRoom } from "./entities/room";
export type { GenerateRoomOptions, GenerateStartRoomOptions } from "./entities/room";

// Generation (passthrough)
export type { RoomGenContext } from "./generation";
export { getEnemyLoot } from "./generation/loot";
export { generateRandomEnemy } from "./generation";

// Oracle (passthrough)
export { consultOracle } from "./oracle";
