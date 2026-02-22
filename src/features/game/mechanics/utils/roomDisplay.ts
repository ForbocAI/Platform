import type { Area } from "../../types";

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

export const getAreaExitsDisplay = (area: Area): ExitDisplay[] =>
  EXITS_CONFIG.map(({ dir, label }) => ({
    dir,
    label,
    open: !!area.exits[label],
  }));
