import { cn } from "@/features/core/utils";

export function ForbocBrandMark({ className, spin = false, iconClassName, textClassName }: { className?: string; spin?: boolean; iconClassName?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <span
        aria-hidden
        className={cn(iconClassName ?? "w-9 h-9", "shrink-0", spin ? "animate-lantern-spin" : "animate-ambient-breathe")}
        style={{
          WebkitMaskImage: "url(/logo.png)",
          maskImage: "url(/logo.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          backgroundColor: "var(--accent-bright)",
        }}
      />
      <span className={cn("font-display uppercase tracking-[0.35em] text-palette-accent-bright", textClassName ?? "text-xl")}>
        Forboc AI
      </span>
    </div>
  );
}
