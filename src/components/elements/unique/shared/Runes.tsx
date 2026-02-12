"use client";

import { useAppSelector } from "@/features/core/store";
import { selectClientHydrated } from "@/features/core/ui/slice/uiSlice";

const PLACEHOLDER = "\u00A0";

export function RuneSigil({ className = "" }: { className?: string }) {
  const hydrated = useAppSelector(selectClientHydrated);
  return (
    <span
      className={`font-runic text-[var(--color-rune-ink)] opacity-60 select-none ${className}`}
      aria-hidden
    >
      {hydrated ? "ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ" : PLACEHOLDER}
    </span>
  );
}

export function TopRunes() {
  const hydrated = useAppSelector(selectClientHydrated);
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᚠ·ᚠᚠᛁ·ᚲᚾᛁᛏᛁ·ᛗᚷᛈᛁᛊᛏᛁ" : PLACEHOLDER}
      </p>
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : PLACEHOLDER}
      </p>
    </div>
  );
}

export function BottomRunes() {
  const hydrated = useAppSelector(selectClientHydrated);
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : PLACEHOLDER}
      </p>
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᛊᚢᛁᚲ·ᚲᛁᛃᛏᛃ·ᛏᛏᛊᛁᚢ·ᛊᛗᛟᚹ" : PLACEHOLDER}
      </p>
    </div>
  );
}
