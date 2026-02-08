"use client";

import { cn } from "@/lib/utils";
import { usePlayButtonSound } from "@/features/audio";

export function NavButton({
  dir,
  onClick,
  active,
  ...rest
}: {
  dir: string;
  onClick: () => void;
  active: boolean;
} & React.ComponentPropsWithoutRef<"button">) {
  const playSound = usePlayButtonSound();
  return (
    <button
      type="button"
      disabled={!active}
      onClick={() => {
        if (active) {
          playSound();
          onClick();
        }
      }}
      {...rest}
      className={cn(
        "w-full h-full border transition-all duration-300 flex items-center justify-center font-bold rounded-sm touch-manipulation leading-tight",
        active
          ? "border-palette-accent-cyan/50 bg-palette-bg-dark/20 text-palette-accent-cyan active:bg-palette-accent-cyan active:text-palette-bg-dark lg:hover:bg-palette-accent-cyan lg:hover:text-palette-bg-dark lg:hover:shadow-[0_0_10px_rgba(127,191,255,0.5)]"
          : "border-palette-border/50 bg-palette-bg-dark/50 text-palette-border cursor-not-allowed"
      )}
    >
      {dir}
    </button>
  );
}
