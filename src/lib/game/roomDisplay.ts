import type { Room } from "./types";

export interface ExitDisplay {
  dir: string;
  label: string;
  open: boolean;
}

const EXITS_CONFIG = [
  { dir: "N", label: "North" as const },
  { dir: "S", label: "South" as const },
  { dir: "E", label: "East" as const },
  { dir: "W", label: "West" as const },
] as const;

export const getRoomExitsDisplay = (room: Room): ExitDisplay[] =>
  EXITS_CONFIG.map(({ dir, label }) => ({
    dir,
    label,
    open: !!room.exits[label],
  }));
