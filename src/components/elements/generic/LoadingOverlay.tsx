import { TopRunes } from "@/components/elements/unique";
import { ForbocBrandMark } from "./ForbocBrandMark";

export function LoadingOverlay({
  message = "Lanterns are waking...",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="relative h-screen w-screen bg-palette-bg-dark text-palette-accent-bright flex flex-col items-center justify-center gap-5 leading-relaxed overflow-hidden" suppressHydrationWarning>
      <div aria-hidden className="portrait-halo absolute w-72 h-72 pointer-events-none" />

      <ForbocBrandMark className="relative" iconClassName="w-16 h-16" textClassName="text-2xl" spin={!onRetry} />

      <div className="relative flex flex-col items-center gap-2">
        <TopRunes />
        <span className="font-runic text-palette-accent-mid tracking-[0.3em]">ᚠ ᚢ ᚦ ᚨ ᚱ</span>
      </div>

      <span className={onRetry ? "relative font-display text-base" : "relative font-display text-base animate-pulse"}>
        {message}
      </span>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="relative px-3 py-1.5 border border-palette-border-light/40 bg-palette-bg-light/50 text-palette-accent-bright hover:bg-palette-bg-light/70 hover:border-palette-border-light/60 transition-colors uppercase tracking-[0.18em] font-bold leading-tight rounded-full"
          data-testid="loading-retry"
          aria-label="Try again"
          suppressHydrationWarning
        >
          Try Again
        </button>
      )}
    </div>
  );
}
