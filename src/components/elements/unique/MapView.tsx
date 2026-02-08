import type { Room } from "@/lib/quadar/types";
import { getRoomExitsDisplay } from "@/lib/quadar/roomDisplay";
import { Map as MapIcon, Compass } from "lucide-react";

export function MapView({ room }: { room: Room }) {
  const exits = getRoomExitsDisplay(room);

  return (
    <section className="flex-1 min-h-0 vengeance-border bg-palette-bg-mid/10 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ff0000_1px,transparent_1px)] bg-size-[20px_20px]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-palette-bg-dark/80 pointer-events-none" />
      <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden p-1.5 sm:p-2 scrollbar-thin scrollbar-thumb-palette-border scrollbar-track-transparent">
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2 sm:gap-2.5 min-h-full justify-center py-2">
          <div className="flex items-center gap-1.5 text-palette-accent-cyan shrink-0">
            <MapIcon className="app-icon" />
            <span className="font-bold tracking-widest uppercase leading-tight">Sector Map</span>
          </div>
          <div className="w-full border border-palette-accent-cyan/50 bg-palette-bg-dark/80 p-2 sm:p-2.5 flex flex-col items-center gap-1 sm:gap-1.5 shrink-0">
            <span className="text-palette-accent-cyan/80 tracking-widest uppercase leading-tight">You are here</span>
            <h2 className="font-black text-palette-white tracking-widest uppercase text-center leading-tight break-words">
              {room.title}
            </h2>
            <span className="text-palette-muted italic leading-tight">{room.biome}</span>
            {room.hazards.length > 0 && (
              <span className="text-palette-accent-red uppercase leading-tight">Hazard: {room.hazards.join(", ")}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-palette-muted shrink-0">
            <Compass className="app-icon" />
            <span className="uppercase tracking-wider leading-tight">Exits</span>
          </div>
          <div className="grid grid-cols-2 gap-1 sm:gap-1.5 w-full max-w-[8rem] sm:max-w-[9rem] shrink-0">
            {exits.map(({ dir, label, open }) => (
              <div
                key={dir}
                className={`min-h-[1.75rem] sm:min-h-[2rem] flex items-center justify-center rounded border text-center font-bold uppercase touch-manipulation leading-tight ${
                  open
                    ? "border-palette-accent-cyan/50 bg-palette-bg-dark/20 text-palette-accent-cyan"
                    : "border-palette-border bg-palette-bg-dark/50 text-palette-muted-light"
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
