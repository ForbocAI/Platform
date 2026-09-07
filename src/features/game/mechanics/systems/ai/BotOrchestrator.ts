import { AppDispatch, RootState } from '@/features/core/store';
import { runAutoplayTick, runAgentTick } from '@/features/game/mechanics/orchestrators';
import { setAutoplaySchedule, setAgentSchedule } from '@/features/core/ui/slice/uiSlice';

/**
 * BotOrchestrator — Centralized AI management service.
 * 
 * Replaces simple setIntervals with a deterministic tick cycle
 * that can manage multiple agents (Player, NPCs, Companions).
 * Refactored to a functional factory to align with FP mandate.
 */
export interface BotRegistration {
    id: string;
    type: 'player' | 'npc' | 'companion';
}

export const createBotOrchestrator = () => {
    let dispatch: AppDispatch | null = null;
    let stateGetter: (() => RootState) | null = null;
    const registeredBots: Set<string> = new Set();

    const init = (d: AppDispatch, sg: () => RootState) => {
        dispatch = d;
        stateGetter = sg;
        console.log('BotOrchestrator: System Initialized.');
    };

    const register = (id: string) => {
        registeredBots.add(id);
        console.log(`BotOrchestrator: Registered Agent [${id}]`);
    };

    const orchestratePlayer = (state: RootState) => {
        if (state.ui.autoplayNextTickAt == null) return;

        if (Date.now() >= state.ui.autoplayNextTickAt) {
            // Step 1: Clear the schedule to prevent double-ticks
            dispatch!(setAutoplaySchedule({ nextTickAt: null }));

            // Step 2: Trigger the 7-step protocol thunk
            dispatch!(runAutoplayTick());
        }
    };

    const checkAndTickAgent = (
        state: RootState,
        agentId: string,
        type: 'npc' | 'companion',
        persona?: string,
        soulId?: string,
        lore?: { role: string; description: string }
    ) => {
        const nextTickAt = state.ui.agentTickSchedule[agentId];

        // If no schedule exists, initialize it with a small random offset to stagger starts
        if (nextTickAt === undefined) {
            const initialDelay = 1000 + Math.random() * 3000;
            dispatch!(setAgentSchedule({ agentId, nextTickAt: Date.now() + initialDelay }));
            return;
        }

        if (nextTickAt !== null && Date.now() >= nextTickAt) {
            // Step 1: Clear schedule
            dispatch!(setAgentSchedule({ agentId, nextTickAt: null }));

            // Step 2: Dispatch generic agent tick
            dispatch!(runAgentTick({ agentId, type, persona, soulId, lore }));
        }
    };

    const orchestrateNPCs = (state: RootState) => {
        const npcs = state.game.currentArea?.npcs || [];
        for (const npc of npcs) {
            checkAndTickAgent(state, npc.id, 'npc', npc.name, npc.soulId);
        }
    };

    const orchestrateCompanions = (state: RootState) => {
        const companions = state.game.player?.companions || [];
        for (const companion of companions) {
            const lore = companion.role && companion.description
                ? { role: companion.role, description: companion.description }
                : undefined;
            checkAndTickAgent(state, companion.id, 'companion', companion.name, companion.soulId, lore);
        }
    };

    const update = () => {
        if (!dispatch || !stateGetter) return;
        const state = stateGetter();

        // 1. Player Autoplay Orchestration
        // 2. NPC / Companion Orchestration
        if (state.ui.autoPlay) {
            orchestratePlayer(state);
            orchestrateNPCs(state);
            orchestrateCompanions(state);
        }
    };

    return {
        init,
        register,
        update
    };
};

export const botOrchestrator = createBotOrchestrator();
