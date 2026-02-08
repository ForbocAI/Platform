export function LoadingOverlay({
  message = "INITIALIZING...",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="h-screen w-screen bg-black text-red-500 font-mono flex flex-col items-center justify-center gap-4 text-xs lg:text-base">
      <span className={onRetry ? "" : "animate-pulse"}>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 border border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40 transition-colors uppercase tracking-wider font-bold"
        >
          Retry
        </button>
      )}
    </div>
  );
}
