import { TopRunes } from "@/components/elements/unique";

export function LoadingOverlay({
  message = "INITIALIZING...",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="h-screen w-screen bg-palette-bg-dark text-palette-accent-red flex flex-col items-center justify-center gap-2 leading-relaxed">
      <TopRunes />
      <span className={onRetry ? "" : "animate-pulse"}>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-2 py-1 border border-palette-border-red/50 bg-palette-border-red/20 text-palette-accent-red hover:bg-palette-border-red/40 transition-colors uppercase tracking-wider font-bold leading-tight"
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
