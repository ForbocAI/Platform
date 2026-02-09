"use client";

import { X, ShoppingBag, Coins } from "lucide-react";
import type { Player, Merchant, Item } from "@/lib/quadar/types";
import { useAppDispatch } from "@/features/core/store";
import { tradeBuy, tradeSell } from "@/features/game/slice/gameSlice";
import { usePlayButtonSound } from "@/features/audio";

interface TradePanelProps {
  player: Player;
  merchant: Merchant;
  onClose: () => void;
}

export function TradePanel({ player, merchant, onClose }: TradePanelProps) {
  const dispatch = useAppDispatch();
  const playSound = usePlayButtonSound();

  const handleBuy = (item: Item) => {
    playSound();
    dispatch(tradeBuy({ merchantId: merchant.id, itemId: item.id }));
  };

  const handleSell = (item: Item) => {
    playSound();
    dispatch(tradeSell({ itemId: item.id }));
  };

  const canAfford = (cost: { spirit?: number; blood?: number } = {}) => {
    const spirit = cost.spirit ?? 0;
    const blood = cost.blood ?? 0;
    return (player.spirit ?? 0) >= spirit && (player.blood ?? 0) >= blood;
  };

  const getSellValue = (item: Item) => {
    const spirit = item.cost?.spirit ?? 10;
    return Math.floor(spirit / 2);
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-palette-bg border border-palette-border shadow-2xl p-4 z-50 flex flex-col md:flex-row gap-4 max-h-[90vh]" data-testid="trade-panel">
      <div className="md:w-1/2 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4 border-b border-palette-border pb-2">
          <h2 className="text-palette-accent font-bold uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> {merchant.name} (Wares)
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-palette-border">
          {merchant.wares.map((item) => (
            <div key={item.id} className="p-2 border border-palette-border/50 bg-palette-bg-mid/20 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-palette-white">{item.name}</span>
                <div className="text-right text-xs">
                  <div className="text-palette-accent-cyan">{item.cost?.spirit ?? 0} Spirit</div>
                  {item.cost?.blood ? <div className="text-palette-accent-red">{item.cost.blood} Blood</div> : null}
                </div>
              </div>
              <p className="text-xs text-palette-text-muted italic">{item.description}</p>
              {item.bonus && (
                <p className="text-xs text-palette-accent-magic">
                  {Object.entries(item.bonus).map(([k, v]) => `${k}: ${v}`).join(", ")}
                </p>
              )}
              <button
                onClick={() => handleBuy(item)}
                disabled={!canAfford(item.cost)}
                className="mt-1 w-full py-1 text-xs uppercase border border-palette-accent-cyan/50 text-palette-accent-cyan hover:bg-palette-accent-cyan/10 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid={`trade-buy-${item.id}`}
              >
                Buy
              </button>
            </div>
          ))}
          {merchant.wares.length === 0 && <p className="text-palette-text-muted italic">No wares available.</p>}
        </div>
      </div>

      <div className="md:w-1/2 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-palette-border pt-4 md:pt-0 md:pl-4">
        <div className="flex justify-between items-center mb-4 border-b border-palette-border pb-2">
          <h2 className="text-palette-accent font-bold uppercase tracking-widest flex items-center gap-2">
            <Coins className="w-5 h-5" /> Your Inventory
          </h2>
          <button onClick={onClose} className="text-palette-text-muted hover:text-palette-white" aria-label="Close trade" data-testid="trade-panel-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-2 text-sm flex gap-4">
          <div className="flex items-center gap-1 text-palette-accent-cyan font-bold">
            <span>Spirit:</span> {player.spirit ?? 0}
          </div>
          <div className="flex items-center gap-1 text-palette-accent-red font-bold">
            <span>Blood:</span> {player.blood ?? 0}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-palette-border">
          {player.inventory.map((item) => (
            <div key={item.id} className="p-2 border border-palette-border/50 bg-palette-bg-mid/20 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-palette-white">{item.name}</span>
                <span className="text-xs text-palette-accent-cyan">Sell: {getSellValue(item)} Spirit</span>
              </div>
              <p className="text-xs text-palette-text-muted italic">{item.description}</p>
              <button
                onClick={() => handleSell(item)}
                className="mt-1 w-full py-1 text-xs uppercase border border-palette-accent-gold/50 text-palette-accent-gold hover:bg-palette-accent-gold/10"
                data-testid={`trade-sell-${item.id}`}
              >
                Sell
              </button>
            </div>
          ))}
          {player.inventory.length === 0 && <p className="text-palette-text-muted italic">Inventory empty.</p>}
        </div>
      </div>
    </div>
  );
}
