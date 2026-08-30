import { createAsyncThunk } from '@reduxjs/toolkit';
import { askVendorCortex } from '@/features/game/sdk/forbocRuntime';
import { getPortraitForAgent } from '@/features/game/sdk/portraits';
import { addLog } from '../../store/gameSlice';

export const runVendorTick = createAsyncThunk(
    'game/runVendorTick',
    async (
        arg: { vendorId: string; name: string; description: string; specialty?: string; displayType?: string; actionSummary: string },
        { dispatch }
    ): Promise<void> => {
        const { vendorId, name, description, specialty, displayType, actionSummary } = arg;
        try {
            const response = await askVendorCortex(vendorId, name, description, specialty, actionSummary);
            if (response?.dialogue) {
                const portraitUrl = getPortraitForAgent('npc', displayType);
                dispatch(addLog({ message: `[${vendorId}] ${response.dialogue}`, type: 'dialogue', portraitUrl }));
            }
        } catch (e) {
            console.warn(`VendorAgency: Tick failed for vendor [${vendorId}]:`, e);
        }
    }
);
