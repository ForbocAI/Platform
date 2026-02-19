import { Hammer, Package } from "lucide-react";
import type { AgentPlayer, CraftingFormula } from "@/features/game/types";
import { Modal, GameButton } from "@/components/elements/generic";
import { useAppDispatch } from "@/features/core/store";
import { craftItem } from "@/features/game/slice/gameSlice";

interface CraftingPanelProps {
    player: AgentPlayer;
    onClose: () => void;
}

export function CraftingPanel({ player, onClose }: CraftingPanelProps) {
    const dispatch = useAppDispatch();

    const handleCraft = (formulaId: string) => {
        dispatch(craftItem({ formulaId }));
    };

    const canCraft = (formula: CraftingFormula) => {
        return formula.ingredients.every((ing) => {
            const count = player.inventory.filter((i) => i.name === ing.name).length;
            return count >= ing.quantity;
        });
    };

    return (
        <Modal
            title="Crafting Station"
            titleIcon={<Hammer className="w-5 h-5 text-palette-accent-bright" />}
            onClose={onClose}
            maxWidth="2xl"
            data-testid="crafting-panel"
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-xs uppercase text-palette-muted-light font-bold">Available Blueprints</h3>
                    {player.blueprints.length === 0 ? (
                        <div className="text-palette-muted italic text-sm p-4 text-center border border-dashed border-palette-border rounded">
                            No blueprints known.
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {player.blueprints.map((formula) => {
                                const craftable = canCraft(formula);
                                return (
                                    <div key={formula.id} className="p-3 bg-palette-bg-mid/10 border border-palette-border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-palette-white font-bold">{formula.produces.name}</span>
                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-palette-bg-dark border border-palette-border text-palette-muted">
                                                    {formula.produces.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-palette-muted mb-2">{formula.produces.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {formula.ingredients.map((ing, idx) => {
                                                    const count = player.inventory.filter((i) => i.name === ing.name).length;
                                                    const hasEnough = count >= ing.quantity;
                                                    return (
                                                        <span key={idx} className={`text-xs px-1.5 py-0.5 rounded border ${hasEnough ? "bg-palette-accent-green/10 border-palette-accent-green/30 text-palette-accent-green" : "bg-palette-accent-mid/10 border-palette-accent-mid/30 text-palette-accent-mid"}`}>
                                                            {ing.name}: {count}/{ing.quantity}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <GameButton
                                            variant="bright"
                                            disabled={!craftable}
                                            onClick={() => handleCraft(formula.id)}
                                            className="w-full sm:w-auto self-end sm:self-center"
                                            data-testid={`craft-button-${formula.id}`}
                                        >
                                            Craft
                                        </GameButton>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
