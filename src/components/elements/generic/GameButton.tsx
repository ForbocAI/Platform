import { cn } from "@/lib/utils";

export function GameButton({
  children,
  onClick,
  variant = "default",
  icon,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "magic";
  icon?: React.ReactNode;
} & React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      onClick={onClick}
      type="button"
      {...rest}
      className={cn(
        "h-6 sm:h-7 px-1.5 sm:px-2 border transition-all duration-300 flex items-center justify-center gap-1 font-bold tracking-wider uppercase leading-tight group w-full lg:w-auto touch-manipulation",
        variant === "default" && "border-palette-border bg-palette-bg-mid text-palette-muted-light hover:bg-palette-panel hover:border-palette-muted",
        variant === "danger" && "border-palette-border-red/50 bg-palette-border-red/20 text-palette-accent-red hover:bg-palette-border-red/40 hover:border-palette-accent-red",
        variant === "magic" && "border-palette-accent-magic/50 bg-palette-accent-magic/20 text-palette-accent-cyan hover:bg-palette-accent-magic/40 hover:border-palette-accent-cyan"
      )}
    >
      {icon}
      <span className="inline group-hover:translate-x-1 transition-transform">{children}</span>
    </button>
  );
}
