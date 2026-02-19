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
        "h-6 sm:h-7 px-1.5 sm:px-2 border transition-all duration-300 flex items-center justify-center gap-1 font-bold tracking-wider uppercase leading-tight group w-auto shrink-0 touch-manipulation",
        variant === "default" && "border-palette-border bg-palette-bg-mid text-palette-muted-light hover:bg-palette-panel hover:border-palette-muted",
        variant === "danger" && "border-palette-border-dim/50 bg-palette-border-dim/20 text-palette-accent-mid hover:bg-palette-border-dim/40 hover:border-palette-accent-mid",
        variant === "magic" && "border-palette-accent-soft/50 bg-palette-accent-soft/20 text-palette-accent-mid hover:bg-palette-accent-soft/40 hover:border-palette-accent-mid",
        variant === "bright" && "border-palette-accent-bright/50 bg-palette-accent-bright/10 text-palette-accent-bright hover:bg-palette-accent-bright/20 hover:border-palette-accent-bright",
        className
      )}
    >
      {icon}
      {children != null && (
        <span className={cn(
          "group-hover:translate-x-1 transition-transform",
          !showLabel && "hidden sm:inline"
        )}>
          {children}
        </span>
      )}
    </button>
  );
}
