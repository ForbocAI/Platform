"use client";

import { ShoppingBag, Coins } from "lucide-react";
import type { Player, Merchant, Item } from "@/features/game/types";
import { useAppDispatch } from "@/features/core/store";
import { tradeBuy, tradeSell } from "@/features/game/slice/gameSlice";
import { usePlayButtonSound } from "@/features/audio";
import { Modal, GameButton } from "@/components/elements/generic";

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
    <Modal
      title={`${merchant.name} — Trade`}
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
            {merchant.wares.length === 0 && <p className="text-palette-text-muted italic">No wares available.</p>}
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-palette-border pt-4 md:pt-0 md:pl-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-palette-accent mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" /> Your Inventory
          </h3>
          <div className="mb-2 text-sm flex gap-4">
            <div className="flex items-center gap-1 text-palette-accent-cyan font-bold">
              <span>Spirit:</span> {player.spirit ?? 0}
            </div>
            <div className="flex items-center gap-1 text-palette-accent-red font-bold">
              <span>Blood:</span> {player.blood ?? 0}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-palette-border min-h-0">
            {player.inventory.map((item) => (
              <div key={item.id} className="p-2 border border-palette-border/50 bg-palette-bg-mid/20 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-palette-white">{item.name}</span>
                  <span className="text-xs text-palette-accent-cyan">Sell: {getSellValue(item)} Spirit</span>
                </div>
                <p className="text-xs text-palette-text-muted italic">{item.description}</p>
                <GameButton
                  onClick={() => handleSell(item)}
                  className="mt-1 w-full border-palette-accent-gold/50 text-palette-accent-gold hover:bg-palette-accent-gold/10"
                  data-testid={`trade-sell-${item.id}`}
                >
                  Sell
                </GameButton>
              </div>
            ))}
            {player.inventory.length === 0 && <p className="text-palette-text-muted italic">Inventory empty.</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
