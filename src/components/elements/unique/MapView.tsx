import { Map as MapIcon, Compass } from "lucide-react";
import type { Room } from "@/lib/quadar/types";

export function MapView({ room }: { room: Room }) {
  const exits = [
    { dir: "N", label: "North", open: !!room.exits.North },
    { dir: "S", label: "South", open: !!room.exits.South },
    { dir: "E", label: "East", open: !!room.exits.East },
    { dir: "W", label: "West", open: !!room.exits.West },
  ];

  return (
    <section className="flex-1 min-h-0 vengeance-border bg-zinc-900/10 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] bg-size-[20px_20px]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-zinc-950/80 pointer-events-none" />
      <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden p-2 sm:p-3 lg:p-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2 sm:gap-3 lg:gap-4 min-h-full justify-center py-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-cyan-500 shrink-0">
            <MapIcon size={16} className="sm:size-5 lg:size-6" />
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold tracking-widest uppercase">Sector Map</span>
          </div>
          <div className="w-full border border-cyan-900/50 bg-zinc-950/80 p-3 sm:p-4 lg:p-5 flex flex-col items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-[7px] sm:text-[8px] text-cyan-500/80 tracking-widest uppercase">You are here</span>
            <h2 className="text-xs sm:text-sm lg:text-lg font-black text-white tracking-widest uppercase text-center leading-tight break-words">
              {room.title}
            </h2>
            <span className="text-[8px] sm:text-[9px] text-zinc-500 italic">{room.biome}</span>
            {room.hazards.length > 0 && (
              <span className="text-[8px] sm:text-[9px] text-red-500 uppercase">Hazard: {room.hazards.join(", ")}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-zinc-500 shrink-0">
            <Compass size={12} className="sm:size-3.5" />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider">Exits</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full max-w-[10rem] sm:max-w-[12rem] shrink-0">
            {exits.map(({ dir, label, open }) => (
              <div
                key={dir}
                className={`min-h-[2.5rem] sm:min-h-[2.75rem] flex items-center justify-center rounded border text-center text-[10px] sm:text-xs font-bold uppercase touch-manipulation ${
                  open
                    ? "border-cyan-900/50 bg-cyan-950/20 text-cyan-400"
                    : "border-zinc-800 bg-zinc-950/50 text-zinc-600"
                }`}
                title={open ? `${label} — open` : `${label} — blocked`}
              >
                {dir}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
