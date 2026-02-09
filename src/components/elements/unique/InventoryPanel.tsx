
import { X, Shield, Sword, Gem, Package } from "lucide-react";
import type { Player, Item, EquipmentSlot } from "@/lib/quadar/types";
import { calculateEffectiveStats } from "@/lib/quadar/items";

interface InventoryPanelProps {
    player: Player;
    onEquip: (itemId: string, slot: EquipmentSlot) => void;
    onUnequip: (slot: EquipmentSlot) => void;
    onUse: (itemId: string) => void;
    onSacrifice: (itemId: string) => void;
    onClose: () => void;
}

export function InventoryPanel({ player, onEquip, onUnequip, onUse, onSacrifice, onClose }: InventoryPanelProps) {
    const stats = calculateEffectiveStats(player);

    const renderItemBonus = (item: Item) => {
        if (!item.bonus) return null;
        return (
            <span className="text-xs text-palette-accent-cyan ml-2">
                {Object.entries(item.bonus).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(", ")}
            </span>
        );
    };

    const renderEquippedItem = (slot: EquipmentSlot, icon: React.ReactNode, label: string) => {
        const item = player.equipment[slot];
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
                        <button
                            onClick={() => onUnequip(slot)}
                            className="text-xs px-2 py-1 border border-palette-border hover:bg-palette-accent-red/20 hover:text-palette-accent-red transition-colors"
                            data-testid={`inventory-unequip-${slot}`}
                        >
                            Unequip
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="absolute inset-0 z-50 bg-palette-bg-dark/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center" data-testid="inventory-panel">
            <div className="w-full max-w-2xl bg-palette-bg-dark border border-palette-border shadow-2xl flex flex-col max-h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-palette-border bg-palette-bg-mid/50">
                    <h2 className="text-lg font-bold text-palette-white tracking-widest uppercase flex items-center gap-2">
                        <Package className="w-5 h-5 text-palette-accent-gold" />
                        Inventory & Equipment
                    </h2>
                    <button onClick={onClose} className="p-1 hover:text-palette-accent-red transition-colors" data-testid="inventory-close" aria-label="Close Inventory">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Stats Summary */}
                    <div className="grid grid-cols-4 gap-2 text-center text-sm p-2 bg-palette-bg-mid/20 border border-palette-border/50 rounded">
                        <div>
                            <div className="text-palette-muted uppercase text-xs">STR</div>
                            <div className="text-palette-white font-bold">{stats.Str}</div>
                        </div>
                        <div>
                            <div className="text-palette-muted uppercase text-xs">AGI</div>
                            <div className="text-palette-white font-bold">{stats.Agi}</div>
                        </div>
                        <div>
                            <div className="text-palette-muted uppercase text-xs">ARC</div>
                            <div className="text-palette-white font-bold">{stats.Arcane}</div>
                        </div>
                        <div>
                            <div className="text-palette-muted uppercase text-xs">AC</div>
                            <div className="text-palette-white font-bold">{stats.ac}</div>
                        </div>
                    </div>

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
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {item.type === "weapon" && (
                                                <button onClick={() => onEquip(item.id, "mainHand")} className="text-xs px-2 py-1 border border-palette-border hover:bg-palette-accent-cyan/10 hover:text-palette-accent-cyan hover:border-palette-accent-cyan transition-colors uppercase tracking-wider" data-testid={`inventory-equip-${item.id}`}>Equip</button>
                                            )}
                                            {item.type === "armor" && (
                                                <button onClick={() => onEquip(item.id, "armor")} className="text-xs px-2 py-1 border border-palette-border hover:bg-palette-accent-cyan/10 hover:text-palette-accent-cyan hover:border-palette-accent-cyan transition-colors uppercase tracking-wider" data-testid={`inventory-equip-${item.id}`}>Equip</button>
                                            )}
                                            {item.type === "relic" && (
                                                <button onClick={() => onEquip(item.id, "relic")} className="text-xs px-2 py-1 border border-palette-border hover:bg-palette-accent-cyan/10 hover:text-palette-accent-cyan hover:border-palette-accent-cyan transition-colors uppercase tracking-wider" data-testid={`inventory-equip-${item.id}`}>Equip</button>
                                            )}
                                            {item.type === "consumable" && (
                                                <button onClick={() => onUse(item.id)} className="text-xs px-2 py-1 border border-palette-border text-palette-accent-cyan border-palette-accent-cyan/50 hover:bg-palette-accent-cyan/10 transition-colors uppercase tracking-wider" data-testid={`inventory-use-${item.id}`}>Use</button>
                                            )}
                                            {(item.value ?? 0) > 0 && (
                                                <button onClick={() => onSacrifice(item.id)} className="text-xs px-2 py-1 border border-palette-accent-red/50 text-palette-accent-red hover:bg-palette-accent-red/10 transition-colors uppercase tracking-wider" data-testid={`inventory-sacrifice-${item.id}`} title="Sacrifice for spirit">Sacrifice</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
