"use client";

import { cn } from "@/features/core/utils";
import { useAppDispatch } from "@/features/core/store";
import { playButtonSound } from "@/features/audio";

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
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      disabled={!active}
      onClick={() => {
        if (active) {
          dispatch(playButtonSound());
          onClick();
        }
      }}
      {...rest}
      className={cn(
        "size-full min-w-0 min-h-0 border transition-all duration-300 flex items-center justify-center font-bold rounded-2xl touch-manipulation leading-tight shadow-[0_8px_18px_rgba(0,0,0,0.16)]",
        active
          ? "border-palette-border-light/45 bg-palette-bg-light/55 text-palette-accent-bright active:bg-palette-accent-mid active:text-palette-bg-dark lg:hover:bg-palette-accent-mid/90 lg:hover:text-palette-bg-dark lg:hover:shadow-[0_0_16px_rgba(221,179,106,0.32)]"
          : "border-palette-border/40 bg-palette-bg-dark/60 text-palette-border-light/50 cursor-not-allowed"
      )}
    >
      {dir}
    </button>
  );
}
