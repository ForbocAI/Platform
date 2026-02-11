import type { Room } from "@/features/game/types";
import type { RoomCoordinates } from "@/features/game/slice/gameSlice";
import { Map as MapIcon } from "lucide-react";

export interface ExploredMapViewProps {
  /** All rooms visited this session; map grows through play. */
  exploredRooms: Record<string, Room>;
  /** Grid position per room (start at 0,0). */
  roomCoordinates: Record<string, RoomCoordinates>;
  /** Current room id to highlight "You are here". */
  currentRoomId: string | null;
}

const CELL_W = 7;
const CELL_H = 4;

function getGridBounds(roomCoordinates: Record<string, RoomCoordinates>) {
  const entries = Object.entries(roomCoordinates);
  if (entries.length === 0) return { minX: 0, maxX: -1, minY: 0, maxY: -1 };
  const xs = entries.map(([, c]) => c.x);
  const ys = entries.map(([, c]) => c.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/** Map of all areas explored so far; grows as the player moves. */
export function MapView({
  exploredRooms,
  roomCoordinates,
  currentRoomId,
}: ExploredMapViewProps) {
  const bounds = getGridBounds(roomCoordinates);
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  const roomByCoord = Object.entries(roomCoordinates).reduce(
    (acc, [id, c]) => {
      acc[`${c.x},${c.y}`] = id;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <section
      className="flex-1 min-h-0 vengeance-border bg-palette-bg-mid/10 flex flex-col relative overflow-hidden"
      data-testid="explored-map"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ff0000_1px,transparent_1px)] bg-size-[20px_20px]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-palette-bg-dark/80 pointer-events-none" />
      <div className="flex-1 min-h-0 w-full overflow-auto p-1.5 sm:p-2 scrollbar-thin scrollbar-thumb-palette-border scrollbar-track-transparent">
        <div className="flex items-center gap-1.5 text-palette-accent-cyan shrink-0 mb-2">
          <MapIcon className="app-icon" />
          <span className="font-bold tracking-widest uppercase leading-tight">
            Explored map
          </span>
        </div>
        {width <= 0 || height <= 0 ? (
          <p className="text-palette-muted text-sm uppercase">
            No areas explored yet. Move to reveal the map.
          </p>
        ) : (
          <div
            className="inline-grid gap-px bg-palette-border border border-palette-border"
            style={{
              gridTemplateColumns: `repeat(${width}, minmax(${CELL_W}rem, 1fr))`,
              gridTemplateRows: `repeat(${height}, minmax(${CELL_H}rem, 1fr))`,
            }}
          >
            {Array.from({ length: height * width }, (_, i) => {
              const dy = Math.floor(i / width);
              const dx = i % width;
              const x = bounds.minX + dx;
              const y = bounds.minY + dy;
              const roomId = roomByCoord[`${x},${y}`];
              const room = roomId ? exploredRooms[roomId] : null;
              const isCurrent = roomId === currentRoomId;
              return (
                <div
                  key={`${x},${y}`}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 text-center min-w-0 ${
                    room
                      ? isCurrent
                        ? "bg-palette-accent-cyan/20 border-2 border-palette-accent-cyan text-palette-accent-cyan"
                        : "bg-palette-bg-dark/80 text-palette-muted-light border border-palette-border"
                      : "bg-palette-bg-dark/40 border border-palette-border/50"
                  }`}
                >
                  {room ? (
                    <>
                      {isCurrent && (
                        <span className="text-[0.6rem] uppercase text-palette-accent-cyan font-bold mb-0.5">
                          You are here
                        </span>
                      )}
                      <span className="font-bold uppercase leading-tight text-xs break-words line-clamp-2">
                        {room.title}
                      </span>
                      <span className="text-[0.65rem] text-palette-muted italic mt-0.5">
                        {room.biome}
                      </span>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
