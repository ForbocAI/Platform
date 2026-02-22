import { createAsyncThunk } from '@reduxjs/toolkit';
import { GameState } from '../../store/types';
import { sdkService } from '@/features/game/sdk/cortexService';
import { toObservation, toCortexDirective } from '@/features/game/sdk/mappers';
import { addLog, setAgentPondering, clearAgentPondering } from '@/features/game/store/gameSlice';
import { computeAwareness } from '@/features/game/mechanics/systems/ai/awareness';
import { runBehaviorTree, AUTOPLAY_CONFIG } from '@/features/game/mechanics/systems/ai/behaviorTree';
import { getPortraitForAgent } from '@/features/game/sdk/portraits';

/**
 * Generic Agent Tick Thunk.
 * 
 * Executes the 7-step Neuro-Symbolic Protocol for any agent.
 */
export const runAgentTick = createAsyncThunk(
    'game/runAgentTick',
    async (arg: { agentId: string; type: 'npc' | 'companion' | 'player'; persona?: string; soulId?: string }, { getState, dispatch }): Promise<{ agentId: string; nextTickAt: number } | undefined> => {
        const rootState = getState() as { game: GameState };
        const { agentId, type, persona, soulId } = arg;

        // 1. OBSERVE
        const awareness = computeAwareness(rootState.game);

        // 2. SDK DECISION
        let instruction = 'IDLE';
        let reason = 'Default ambient behavior';

        try {
            const agentPersona = persona || (type === 'npc' ? 'Neutral Entity' : 'Loyal Companion');

            // Rehydrate from Soul if Arweave data item ID provided, otherwise get/create standard agent
            const agent = soulId
                ? await sdkService.rehydrateAgent(soulId)
                : await sdkService.getAgent(agentId, agentPersona);

            // 3. SDK DECISION
            dispatch(setAgentPondering(agentId));

            // Map state to agent-specific observation
            const observation = toObservation(rootState.game);

            const response = await agent.process(observation.content, rootState.game as unknown as Record<string, unknown>);

            dispatch(clearAgentPondering(agentId));

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
            dispatch(clearAgentPondering(agentId));
        }

        // 3. ACTUATE
        console.log(`Agency: Agent [${agentId}] intends to [${instruction}] because [${reason}]`);

        // 4. SCHEDULE
        const delay = 5000 + Math.random() * 5000;
        return { agentId, nextTickAt: Date.now() + delay };
    }
);
