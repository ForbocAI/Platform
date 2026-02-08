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
    <div className="flex items-center gap-2 lg:gap-3 bg-zinc-950 border border-zinc-800 px-2 lg:px-3 py-1 lg:py-2 min-w-15 lg:min-w-20">
      <div className="opacity-80 scale-75 lg:scale-100">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[6px] lg:text-[8px] text-zinc-500 uppercase font-bold">{label}</span>
        <span className="text-xs lg:text-sm font-bold text-zinc-200 leading-none">{value}</span>
      </div>
    </div>
  );
}
