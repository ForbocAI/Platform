import { Activity, Skull, ShoppingBag } from "lucide-react";
import type { Room } from "@/lib/quadar/types";
import { RuneSigil } from "./Runes";

export function RoomViewport({
  room,
  onTradeMerchant,
}: {
  room: Room;
  onTradeMerchant?: (merchantId: string) => void;
}) {
  return (
    <section className="flex-1 min-h-0 vengeance-border bg-palette-bg-mid/10 flex flex-col items-center justify-center p-1.5 sm:p-3 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ff0000_1px,transparent_1px)] bg-size-[20px_20px]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-palette-bg-dark/80 pointer-events-none" />
      <div className="w-full max-w-2xl text-center z-10 relative overflow-y-auto max-h-full scrollbar-hide">
        <RuneSigil className="block mb-1.5 sm:mb-2" />
        <span className="text-palette-accent-red/50 tracking-[0.2em] uppercase mb-1 block leading-tight animate-holo-flicker">{room.biome}</span>
        <h2 className="font-black text-palette-white mb-1.5 sm:mb-2 tracking-widest uppercase contrast-125 drop-shadow-md leading-tight glitch-text" data-text={room.title}>
          {room.title}
        </h2>
        <div className="w-8 sm:w-12 h-px bg-palette-border-red mx-auto mb-1.5 sm:mb-2" />
        <p className="leading-relaxed text-palette-muted-light italic mb-2 sm:mb-3 max-w-xl mx-auto px-2">
          &quot;{room.description}&quot;
        </p>
        {room.hazards.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-1.5">
            <div className="p-1 sm:p-1.5 bg-palette-border-red/30 border border-palette-border-red/50 inline-flex items-center gap-1 animate-pulse">
              <Activity className="app-icon text-palette-accent-red" />
              <span className="text-palette-accent-red font-bold tracking-widest">HAZARD!</span>
            </div>
          </div>
        )}
        {room.allies && room.allies.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1">
            {room.allies.map((ally) => (
              <span
                key={ally.id}
                className="px-2 py-0.5 bg-palette-accent-cyan/20 border border-palette-accent-cyan/50 text-palette-accent-cyan text-xs uppercase"
              >
                {ally.name}
              </span>
            ))}
          </div>
        )}
        {room.merchants && room.merchants.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1">
            {room.merchants.map((merchant) => (
              <button
                key={merchant.id}
                type="button"
                onClick={() => onTradeMerchant?.(merchant.id)}
                data-testid={`trade-merchant-${merchant.id}`}
                aria-label={`Trade with ${merchant.name}`}
                className="px-2 py-0.5 bg-palette-accent-gold/20 border border-palette-accent-gold/50 text-palette-accent-gold text-xs uppercase hover:bg-palette-accent-gold/30 flex items-center gap-1"
              >
                <ShoppingBag className="app-icon" /> {merchant.name} — Trade
              </button>
            ))}
          </div>
        )}
        {room.enemies.length > 0 && (
          <div className="mt-2 sm:mt-3 grid grid-cols-1 gap-1 sm:gap-1.5 w-full">
            {room.enemies.map((enemy) => (
              <div key={enemy.id} className="p-1.5 sm:p-2 bg-palette-bg-dark/80 border border-palette-border-red/30 text-left flex justify-between items-center">
                <h3 className="text-palette-accent-red font-bold uppercase tracking-wider flex items-center gap-1">
                  <Skull className="app-icon" /> {enemy.name}
                </h3>
                <span className="font-bold text-palette-white">HP {enemy.hp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
