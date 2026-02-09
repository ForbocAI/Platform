export function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-palette-bg-dark border border-palette-border px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-8 sm:min-w-9">
      <div className="opacity-80">{icon}</div>
      <div className="flex flex-col gap-px">
        <span className="text-palette-muted uppercase font-bold leading-tight">{label}</span>
        <span className="hidden sm:inline font-bold text-palette-foreground leading-tight">{value}</span>
      </div>
    </div>
  );
}
