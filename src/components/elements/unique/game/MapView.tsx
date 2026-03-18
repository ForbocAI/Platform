import type { Area } from "@/features/game/types";
import type { AreaCoordinates } from "@/features/game/store/gameSlice";
import { Map as MapIcon } from "lucide-react";

export interface ExploredMapViewProps {
  /** All areas visited this session; map grows through play. */
  exploredAreas: Record<string, Area>;
  /** Grid position per area (start at 0,0). */
  areaCoordinates: Record<string, AreaCoordinates>;
  /** Current area id to highlight "You are here". */
  currentAreaId: string | null;
}

const CELL_W = 7;
const CELL_H = 4;

function getGridBounds(areaCoordinates: Record<string, AreaCoordinates>) {
  const entries = Object.entries(areaCoordinates);
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
  exploredAreas,
  areaCoordinates,
  currentAreaId,
}: ExploredMapViewProps) {
  const bounds = getGridBounds(areaCoordinates);
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  const areaByCoord = Object.entries(areaCoordinates).reduce(
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
      <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(248,231,181,0.12),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(146,180,125,0.08),transparent_24%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-palette-bg-dark/75 pointer-events-none" />
      <div className="flex-1 min-h-0 w-full overflow-auto p-1.5 sm:p-2 scrollbar-thin scrollbar-thumb-palette-border scrollbar-track-transparent">
        <div className="flex items-center gap-1.5 text-palette-accent-mid shrink-0 mb-2">
          <MapIcon className="app-icon" />
          <span className="font-bold tracking-[0.2em] uppercase leading-tight">
            Trail Map
          </span>
        </div>
        {width <= 0 || height <= 0 ? (
          <p className="text-palette-muted-light text-sm">
            No paths are charted yet. Wander a little to reveal the vale.
          </p>
        ) : (
          <div
            className="inline-grid gap-1 rounded-[22px] bg-palette-border/20 border border-palette-border/35 p-1"
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
              const areaId = areaByCoord[`${x},${y}`];
              const area = areaId ? exploredAreas[areaId] : null;
              const isCurrent = areaId === currentAreaId;
              return (
                <div
                  key={`${x},${y}`}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 text-center min-w-0 ${area
                    ? isCurrent
                      ? "bg-palette-accent-mid/20 border border-palette-accent-mid/60 rounded-2xl text-palette-accent-bright"
                      : "bg-palette-bg-dark/78 text-palette-muted-light border border-palette-border/35 rounded-2xl"
                    : "bg-palette-bg-dark/35 border border-palette-border/18 rounded-2xl"
                    }`}
                >
                  {area ? (
                    <>
                      {isCurrent && (
                        <span className="text-[0.6rem] uppercase text-palette-accent-mid font-bold mb-0.5">
                          Your lantern
                        </span>
                      )}
                      <span className="font-bold uppercase leading-tight text-xs wrap-break-word line-clamp-2">
                        {area.title}
                      </span>
                      <span className="text-[0.65rem] text-palette-muted-light italic mt-0.5">
                        {area.regionalType}
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
