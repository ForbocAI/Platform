import { cn } from "@/lib/utils";

export function GameButton({
  children,
  onClick,
  variant = "default",
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "magic";
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "h-10 lg:h-12 px-3 lg:px-6 border transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-bold tracking-wider uppercase group w-full lg:w-auto",
        variant === "default" && "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500",
        variant === "danger" && "border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40 hover:border-red-500",
        variant === "magic" && "border-purple-900/50 bg-purple-950/20 text-purple-400 hover:bg-purple-900/40 hover:border-purple-500"
      )}
    >
      {icon}
      <span className="hidden sm:inline group-hover:translate-x-1 transition-transform">{children}</span>
    </button>
  );
}
