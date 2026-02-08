import { Activity, Skull } from "lucide-react";
import type { Room } from "@/lib/quadar/types";

export function RoomViewport({ room }: { room: Room }) {
  return (
    <section className="flex-1 min-h-0 vengeance-border bg-zinc-900/10 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/80 pointer-events-none" />
      <div className="w-full max-w-2xl text-center z-10 relative overflow-y-auto max-h-full scrollbar-hide">
        <span className="text-[8px] lg:text-[10px] text-red-500/50 tracking-[0.5em] uppercase mb-1 block">{room.biome}</span>
        <h2 className="text-xl lg:text-4xl font-black text-white mb-2 lg:mb-6 tracking-widest uppercase contrast-125 drop-shadow-md">
          {room.title}
        </h2>
        <div className="w-16 lg:w-24 h-[1px] lg:h-[2px] bg-red-900 mx-auto mb-2 lg:mb-8" />
        <p className="text-xs lg:text-lg leading-relaxed text-zinc-400 font-serif italic mb-4 lg:mb-6">
          &quot;{room.description}&quot;
        </p>
        {room.hazards.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <div className="p-2 lg:p-4 bg-red-950/30 border border-red-900/50 inline-flex items-center gap-2 animate-pulse">
              <Activity size={14} className="text-red-500 lg:w-[18px] lg:h-[18px]" />
              <span className="text-red-500 font-bold text-[10px] lg:text-sm tracking-widest">HAZARD!</span>
            </div>
          </div>
        )}
        {room.enemies.length > 0 && (
          <div className="mt-6 lg:mt-12 grid grid-cols-1 gap-2 lg:gap-4 w-full">
            {room.enemies.map((enemy) => (
              <div key={enemy.id} className="p-3 lg:p-6 bg-zinc-950/80 border border-red-900/30 text-left flex justify-between items-center">
                <h3 className="text-red-500 font-bold text-sm lg:text-xl uppercase tracking-wider flex items-center gap-2">
                  <Skull size={14} className="lg:w-[18px] lg:h-[18px]" /> {enemy.name}
                </h3>
                <span className="text-sm lg:text-xl font-bold text-white">HP {enemy.hp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
