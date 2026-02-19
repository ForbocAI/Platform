import { TopRunes } from "@/components/elements/unique";

export function LoadingOverlay({
  message = "INITIALIZING...",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="h-screen w-screen bg-palette-bg-dark text-palette-accent-mid flex flex-col items-center justify-center gap-2 leading-relaxed" suppressHydrationWarning>
      <TopRunes />
      <span className={onRetry ? "" : "animate-pulse"}>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-2 py-1 border border-palette-border-dim/50 bg-palette-border-dim/20 text-palette-accent-mid hover:bg-palette-border-dim/40 transition-colors uppercase tracking-wider font-bold leading-tight"
          data-testid="loading-retry"
          aria-label="Retry initialization"
          suppressHydrationWarning
        >
          Retry
        </button>
      )}
    </div>
  );
}
