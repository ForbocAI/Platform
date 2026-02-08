import { cn } from "@/lib/utils";

export function NavButton({
  dir,
  onClick,
  active,
}: {
  dir: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      disabled={!active}
      onClick={onClick}
      className={cn(
        "w-full h-full border transition-all duration-300 flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded-sm touch-manipulation",
        active
          ? "border-cyan-900/50 bg-cyan-950/20 text-cyan-500 active:bg-cyan-500 active:text-zinc-950 lg:hover:bg-cyan-500 lg:hover:text-zinc-950 lg:hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          : "border-zinc-900/50 bg-zinc-950/50 text-zinc-800 cursor-not-allowed"
      )}
    >
      {dir}
    </button>
  );
}
