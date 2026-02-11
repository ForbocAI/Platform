import { Shield, Sword, Gem, Package } from "lucide-react";
import type { Player, Item, EquipmentSlot } from "@/features/game/types";
import { Modal, GameButton } from "@/components/elements/generic";

interface InventoryPanelProps {
    player: Player;
    onEquip: (itemId: string, slot: EquipmentSlot) => void;
    onUnequip: (slot: EquipmentSlot) => void;
    onUse: (itemId: string) => void;
    onSacrifice: (itemId: string) => void;
    onClose: () => void;
}

export function InventoryPanel({ player, onEquip, onUnequip, onUse, onSacrifice, onClose }: InventoryPanelProps) {
    const renderItemBonus = (item: Item) => {
        if (!item.bonus) return null;
        return (
            <span className="text-xs text-palette-accent-cyan ml-2">
                {Object.entries(item.bonus).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(", ")}
            </span>
        );
    };

    const renderEquippedItem = (slot: EquipmentSlot, icon: React.ReactNode, label: string) => {
        const item = player.equipment?.[slot];
        return (
            <div className="flex items-center justify-between p-2 bg-palette-bg-mid/30 border border-palette-border rounded">
                <div className="flex items-center gap-2">
                    {icon}
                    <div className="flex flex-col">
                        <span className="text-xs text-palette-muted uppercase">{label}</span>
                        <span className={`text-sm ${item ? 'text-palette-white' : 'text-palette-muted/50'}`}>
                            {item ? item.name : "Empty"}
                        </span>
                    </div>
                </div>
                {item && (
                    <div className="flex items-center gap-2">
                        {renderItemBonus(item)}
                        <GameButton
                            variant="danger"
                            onClick={() => onUnequip(slot)}
                            data-testid={`inventory-unequip-${slot}`}
                        >
                            Unequip
                        </GameButton>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            title="Inventory & Equipment"
            titleIcon={<Package className="w-5 h-5 text-palette-accent-gold" />}
            onClose={onClose}
            maxWidth="2xl"
            data-testid="inventory-panel"
        >
            <div className="space-y-6">

                    {/* Equipment */}
                    <div className="space-y-2">
                        <h3 className="text-xs uppercase text-palette-muted-light font-bold">Equipment</h3>
                        <div className="space-y-2">
                            {renderEquippedItem("mainHand", <Sword className="w-4 h-4 text-palette-accent-warm" />, "Main Hand")}
                            {renderEquippedItem("armor", <Shield className="w-4 h-4 text-palette-accent-gold" />, "Armor")}
                            {renderEquippedItem("relic", <Gem className="w-4 h-4 text-palette-accent-magic" />, "Relic")}
                        </div>
                    </div>

                    {/* Inventory Bag */}
                    <div>
                        <h3 className="text-xs uppercase text-palette-muted-light font-bold mb-2">Backpack ({player.inventory.length} items)</h3>
                        {player.inventory.length === 0 ? (
                            <div className="text-palette-muted italic text-sm p-4 text-center border border-dashed border-palette-border rounded">Empty</div>
                        ) : (
                            <div className="grid gap-2">
                                {player.inventory.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-2 bg-palette-bg-mid/10 border border-palette-border hover:bg-palette-bg-mid/20 transition-colors rounded">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-palette-white font-medium truncate">{item.name}</span>
                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-palette-bg-dark border border-palette-border text-palette-muted">
                                                    {item.type}
                                                </span>
                                            </div>
                                            <span className="text-xs text-palette-muted truncate">{item.description}</span>
                                            {renderItemBonus(item)}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2 flex-wrap">
                                            {item.type === "weapon" && (
                                                <GameButton onClick={() => onEquip(item.id, "mainHand")} data-testid={`inventory-equip-${item.id}`}>Equip</GameButton>
                                            )}
                                            {item.type === "armor" && (
                                                <GameButton onClick={() => onEquip(item.id, "armor")} data-testid={`inventory-equip-${item.id}`}>Equip</GameButton>
                                            )}
                                            {item.type === "relic" && (
                                                <GameButton onClick={() => onEquip(item.id, "relic")} data-testid={`inventory-equip-${item.id}`}>Equip</GameButton>
                                            )}
                                            {item.type === "consumable" && (
                                                <GameButton variant="magic" onClick={() => onUse(item.id)} data-testid={`inventory-use-${item.id}`}>Use</GameButton>
                                            )}
                                            {item.type === "contract" && (
                                                <GameButton variant="magic" onClick={() => onUse(item.id)} data-testid={`inventory-use-${item.id}`}>Sign</GameButton>
                                            )}
                                            {item.cost?.spirit && item.cost.spirit > 0 && (
                                                <GameButton variant="magic" onClick={() => onSacrifice(item.id)} data-testid={`inventory-sacrifice-${item.id}`}>
                                                    Sacrifice ({Math.max(1, Math.floor(item.cost.spirit / 2))})
                                                </GameButton>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
            </div>
        </Modal>
    );
}
