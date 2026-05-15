import { cn } from "@/features/core/utils";

export function GameButton({
  children,
  onClick,
  variant = "default",
  icon,
  className,
  showLabel = false,
  ...rest
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger" | "magic" | "bright";
  icon?: React.ReactNode;
  showLabel?: boolean;
} & React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      onClick={onClick}
      type="button"
      {...rest}
      className={cn(
        "h-6 sm:h-7 px-1.5 sm:px-2 border rounded-full transition-all duration-300 flex items-center justify-center gap-1 font-bold tracking-[0.16em] uppercase leading-tight group w-auto shrink-0 touch-manipulation shadow-[0_8px_20px_rgba(0,0,0,0.14)] backdrop-blur-sm disabled:shadow-none",
        variant === "default" && "border-palette-border/70 bg-palette-bg-light/55 text-palette-muted-light hover:bg-palette-bg-panel/70 hover:border-palette-border-light hover:text-palette-white",
        variant === "danger" && "border-palette-accent-dim/50 bg-palette-accent-dim/18 text-palette-accent-bright hover:bg-palette-accent-dim/28 hover:border-palette-accent hover:text-palette-white",
        variant === "magic" && "border-palette-accent-soft/55 bg-palette-accent-soft/18 text-palette-accent-bright hover:bg-palette-accent-soft/26 hover:border-palette-accent-soft hover:text-palette-white",
        variant === "bright" && "border-palette-accent-bright/55 bg-palette-accent-bright/12 text-palette-accent-bright hover:bg-palette-accent-bright/20 hover:border-palette-accent-bright hover:text-palette-white",
        className
      )}
    >
      {icon}
      {children != null && (
        <span className={cn(
          "group-hover:translate-y-[-1px] transition-transform",
          !showLabel && "hidden sm:inline"
        )}>
          {children}
        </span>
      )}
    </button>
  );
}
