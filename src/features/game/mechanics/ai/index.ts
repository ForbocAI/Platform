/**
 * AI Module — shared behavior system for all agents.
 *
 * Architecture alignment:
 *   Forboc:   client/src/features/mechanics/orchestrators/systems/bots/
 *   Platform: src/features/game/mechanics/ai/
 *
 * SDK integration: The CortexDirective type and Node 0 in the behavior tree
 * are the insertion points for the ForbocAI SDK.
 */

export { computeAwareness } from './awareness';
export { runBehaviorTree, AUTOPLAY_CONFIG, NPC_RANGER_CONFIG, SERVITOR_CONFIG } from './behaviorTree';
export type { AgentConfig, AgentAction, AgentCapability, AgentTraits, AwarenessResult, CortexDirective } from './types';
