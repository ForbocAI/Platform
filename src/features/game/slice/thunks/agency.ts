import { createAsyncThunk } from '@reduxjs/toolkit';
import { GameState } from '../types';
import { sdkService } from '@/lib/sdk/cortexService';
import { toObservation, toCortexDirective } from '@/lib/sdk/mappers';
import { addLog } from '@/features/game/slice/gameSlice';
import { computeAwareness } from '@/features/game/mechanics/ai/awareness';
import { runBehaviorTree, AUTOPLAY_CONFIG } from '@/features/game/mechanics/ai/behaviorTree';
import { getPortraitForAgent } from '@/lib/sdk/portraits';

/**
 * Generic Agent Tick Thunk.
 * 
 * Executes the 7-step Neuro-Symbolic Protocol for any agent.
 */
export const runAgentTick = createAsyncThunk(
    'game/runAgentTick',
    async (arg: { agentId: string; type: 'npc' | 'servitor' | 'player'; persona?: string }, { getState, dispatch }): Promise<{ agentId: string; nextTickAt: number } | undefined> => {
        const rootState = getState() as { game: GameState };
        const { agentId, type, persona } = arg;

        // 1. OBSERVE
        // For now, NPCs share the same awareness as the player's perspective,
        // but this should be refined to be agent-centric.
        const awareness = computeAwareness(rootState.game);

        // 2. SDK DECISION
        let instruction = 'IDLE';
        let reason = 'Default ambient behavior';

        try {
            const agentPersona = persona || (type === 'npc' ? 'Hostile Entity' : 'Loyal Servitor');
            const agent = sdkService.getAgent(agentId, agentPersona);

            // Map state to agent-specific observation
            const observation = toObservation(rootState.game);

            // ...
            const response = await agent.process(observation.content, rootState.game as any);

            if (response.dialogue) {
                const portraitUrl = getPortraitForAgent(type, agentPersona);
                dispatch(addLog({ message: `[${agentId}] ${response.dialogue}`, type: 'dialogue', portraitUrl }));
            }

            if (response.action) {
                instruction = response.action.type;
                reason = response.action.reason || reason;
            }
        } catch (e) {
            console.warn(`Agency: Tick failed for agent [${agentId}]:`, e);
        }

        // 3. ACTUATE
        // TODO: Implement NPC/Servitor specific actuation.
        // For now, we logging the intent.
        console.log(`Agency: Agent [${agentId}] intends to [${instruction}] because [${reason}]`);

        // 4. SCHEDULE
        // Return next tick (e.g. 5-10 seconds for NPCs)
        const delay = 5000 + Math.random() * 5000;
        return { agentId, nextTickAt: Date.now() + delay };
    }
);
