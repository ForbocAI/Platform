import { TopRunes } from "@/components/elements/unique";

export function LoadingOverlay({
  message = "Lanterns are waking...",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="h-screen w-screen bg-palette-bg-dark text-palette-accent-bright flex flex-col items-center justify-center gap-2 leading-relaxed" suppressHydrationWarning>
      <TopRunes />
      <span className="font-runic text-palette-accent-mid tracking-[0.3em]">ᚠ ᚢ ᚦ ᚨ ᚱ</span>
      <span className={onRetry ? "font-display" : "font-display animate-pulse"}>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-2 py-1 border border-palette-border-light/40 bg-palette-bg-light/50 text-palette-accent-bright hover:bg-palette-bg-light/70 transition-colors uppercase tracking-[0.18em] font-bold leading-tight rounded-full"
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
