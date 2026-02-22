"use client";

import { ShoppingBag, Coins } from "lucide-react";
import type { AgentPlayer, Vendor, Item } from "@/features/game/types";
import { useAppDispatch } from "@/features/core/store";
import { tradeBuy, tradeSell } from "@/features/game/store/gameSlice";
import { playButtonSound } from "@/features/audio";
import { Modal, GameButton } from "@/components/elements/generic";

interface TradePanelProps {
  player: AgentPlayer;
  vendor: Vendor;
  onClose: () => void;
}

export function TradePanel({ player, vendor, onClose }: TradePanelProps) {
  const dispatch = useAppDispatch();

  const handleBuy = (item: Item) => {
    dispatch(playButtonSound());
    dispatch(tradeBuy({ merchantId: vendor.id, itemId: item.id }));
  };

  const handleSell = (item: Item) => {
    dispatch(playButtonSound());
    dispatch(tradeSell({ itemId: item.id }));
  };

  const canAfford = (cost: { primary?: number; secondary?: number } = {}) => {
    const primary = cost.primary ?? 0;
    const secondary = cost.secondary ?? 0;
    return (player.inventory.spirit ?? 0) >= primary && (player.inventory.blood ?? 0) >= secondary;
  };

  const getSellValue = (item: Item) => {
    const primary = item.cost?.primary ?? 10;
    return Math.floor(primary / 2);
  };

  return (
    <Modal
      title={`${vendor.name} — Trade`}
      titleIcon={<ShoppingBag className="w-5 h-5" />}
      onClose={onClose}
      maxWidth="4xl"
      data-testid="trade-panel"
    >
      <div className="flex flex-col md:flex-row gap-4 min-h-0">
        <div className="md:w-1/2 flex flex-col min-h-0">
          <h3 className="text-sm font-bold uppercase tracking-widest text-palette-accent mb-2 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Wares
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-palette-border min-h-0">
            {vendor.wares.map((item) => (
              <div key={item.id} className="p-2 border border-palette-border/50 bg-palette-bg-mid/20 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-palette-white">{item.name}</span>
                  <div className="text-right text-xs">
                    <div className="text-palette-accent-mid">{item.cost?.primary ?? 0} Primary</div>
                    {item.cost?.secondary ? <div className="text-palette-accent-mid">{item.cost.secondary} Secondary</div> : null}
                  </div>
                </div>
                <p className="text-xs text-palette-text-muted italic">{item.description}</p>
                {item.bonus && (
                  <p className="text-xs text-palette-accent-soft">
                    {Object.entries(item.bonus).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </p>
                )}
                <GameButton
                  variant="magic"
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford(item.cost)}
                  className="mt-1 w-full"
                  data-testid={`trade-buy-${item.id}`}
                >
                  Buy
                </GameButton>
              </div>
            ))}
            {vendor.wares.length === 0 && <p className="text-palette-text-muted italic">No wares available.</p>}
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-palette-border pt-4 md:pt-0 md:pl-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-palette-accent mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" /> Your Inventory
          </h3>
          <div className="mb-2 text-sm flex gap-4">
            <div className="flex items-center gap-1 text-palette-accent-mid font-bold">
              <span>Primary:</span> {player.inventory.spirit ?? 0}
            </div>
            <div className="flex items-center gap-1 text-palette-accent-mid font-bold">
              <span>Secondary:</span> {player.inventory.blood ?? 0}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-palette-border min-h-0">
            {(player.inventory.items as Item[]).map((item) => (
              <div key={item.id} className="p-2 border border-palette-border/50 bg-palette-bg-mid/20 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-palette-white">{item.name}</span>
                  <span className="text-xs text-palette-accent-mid">Sell: {getSellValue(item)} Primary</span>
                </div>
                <p className="text-xs text-palette-text-muted italic">{item.description}</p>
                <GameButton
                  onClick={() => handleSell(item)}
                  className="mt-1 w-full border-palette-accent-bright/50 text-palette-accent-bright hover:bg-palette-accent-bright/10"
                  data-testid={`trade-sell-${item.id}`}
                >
                  Sell
                </GameButton>
              </div>
            ))}
            {player.inventory.items.length === 0 && <p className="text-palette-text-muted italic">Inventory empty.</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
