"use client";

import { useAppSelector } from "@/features/core/store";
import { selectClientHydrated } from "@/features/core/ui/slice/uiSlice";

/**
 * Runes & Sigils — style-guide §1
 * Unicode Elder Futhark: ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ
 * Rendered only after client hydration to avoid mismatch (font/fallback can differ server vs client).
 */

export function RuneSigil({ className = "" }: { className?: string }) {
  const hydrated = useAppSelector(selectClientHydrated);
  return (
    <span
      className={`font-runic text-[var(--color-rune-ink)] opacity-60 select-none ${className}`}
      aria-hidden
    >
      {hydrated ? "ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ" : "\u00A0"}
    </span>
  );
}

export function TopRunes() {
  const hydrated = useAppSelector(selectClientHydrated);
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᚠ·ᚠᚠᛁ·ᚲᚾᛁᛏᛁ·ᛗᚷᛈᛁᛊᛏᛁ" : "\u00A0"}
      </p>
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : "\u00A0"}
      </p>
    </div>
  );
}

export function BottomRunes() {
  const hydrated = useAppSelector(selectClientHydrated);
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : "\u00A0"}
      </p>
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {hydrated ? "ᛊᚢᛁᚲ·ᚲᛁᛃᛏᛃ·ᛏᛏᛊᛁᚢ·ᛊᛗᛟᚹ" : "\u00A0"}
      </p>
    </div>
  );
}
