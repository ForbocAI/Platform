"use client";

import { ShoppingBag, Package, X } from "lucide-react";
import type { Merchant, Item } from "@/lib/quadar/types";
import { usePlayButtonSound } from "@/features/audio";

export function TradePanel({
  merchant,
  playerInventory,
  playerSpirit,
  playerBlood,
  onBuy,
  onSell,
  onClose,
}: {
  merchant: Merchant;
  playerInventory: Item[];
  playerSpirit: number;
  playerBlood: number;
  onBuy: (itemId: string) => void;
  onSell: (itemId: string) => void;
  onClose: () => void;
}) {
  const playSound = usePlayButtonSound();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-palette-bg-dark/90"
      data-testid="trade-panel"
    >
      <div className="vengeance-border bg-palette-bg-mid border-2 border-palette-accent-cyan/50 p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-palette-accent-cyan uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag className="app-icon" /> {merchant.name}
          </h3>
          <button
            type="button"
            onClick={() => {
              playSound();
              onClose();
            }}
            data-testid="trade-panel-close"
            aria-label="Close trade"
            className="p-1 border border-palette-border text-palette-muted hover:text-palette-accent-red transition-colors"
          >
            <X className="app-icon" />
          </button>
        </div>
        <p className="text-palette-muted-light text-sm italic mb-4">{merchant.description}</p>

        <div className="flex gap-4 mb-4 text-sm">
          <span className="text-palette-accent-cyan font-bold">Spirit: {playerSpirit}</span>
          <span className="text-palette-accent-red font-bold">Blood: {playerBlood}</span>
        </div>

        <section className="mb-4">
          <h4 className="text-palette-accent-cyan/80 font-bold uppercase tracking-wider text-xs mb-2">
            Wares
          </h4>
          {merchant.wares.length === 0 ? (
            <p className="text-palette-muted text-sm">No wares left.</p>
          ) : (
            <ul className="space-y-1">
              {merchant.wares.map((item) => {
                const spiritCost = item.value ?? 0;
                const bloodCost = item.bloodPrice ?? 0;
                const canAfford = playerSpirit >= spiritCost && playerBlood >= bloodCost;
                const costLabel = bloodCost > 0
                  ? `${spiritCost} spirit, ${bloodCost} blood`
                  : `${spiritCost} spirit`;
                return (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-palette-bg-dark border border-palette-border"
                >
                  <div>
                    <span className="font-bold text-palette-white">{item.name}</span>
                    <span className="block text-xs text-palette-muted-light">{item.description}</span>
                    <span className="block text-xs text-palette-accent-cyan/80">{costLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSound();
                      onBuy(item.id);
                    }}
                    disabled={!canAfford}
                    data-testid={`trade-buy-${item.id}`}
                    aria-label={`Buy ${item.name}`}
                    className="px-2 py-1 bg-palette-accent-cyan/20 border border-palette-accent-cyan/50 text-palette-accent-cyan text-xs uppercase hover:bg-palette-accent-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-palette-accent-cyan/20"
                  >
                    Buy
                  </button>
                </li>
              ); })}
            </ul>
          )}
        </section>

        <section>
          <h4 className="text-palette-accent-cyan/80 font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-1">
            <Package className="app-icon" /> Your inventory
          </h4>
          {playerInventory.length === 0 ? (
            <p className="text-palette-muted text-sm">Nothing to sell.</p>
          ) : (
            <ul className="space-y-1">
              {playerInventory.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-palette-bg-dark border border-palette-border"
                >
                  <div>
                    <span className="font-bold text-palette-white">{item.name}</span>
                    <span className="block text-xs text-palette-muted-light">{item.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSound();
                      onSell(item.id);
                    }}
                    data-testid={`trade-sell-${item.id}`}
                    aria-label={`Sell ${item.name}`}
                    className="px-2 py-1 bg-palette-accent-red/20 border border-palette-accent-red/50 text-palette-accent-red text-xs uppercase hover:bg-palette-accent-red/30"
                  >
                    Sell
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
