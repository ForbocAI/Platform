"use client";

import { useState, useEffect } from "react";

/**
 * Runes & Sigils — style-guide §1
 * Unicode Elder Futhark: ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ
 * Rendered only after mount to avoid hydration mismatch (font/fallback can differ server vs client).
 */

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function RuneSigil({ className = "" }: { className?: string }) {
  const mounted = useMounted();
  return (
    <span
      className={`font-runic text-[var(--color-rune-ink)] opacity-60 select-none ${className}`}
      aria-hidden
    >
      {mounted ? "ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ" : "\u00A0"}
    </span>
  );
}

export function TopRunes() {
  const mounted = useMounted();
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {mounted ? "ᚠ·ᚠᚠᛁ·ᚲᚾᛁᛏᛁ·ᛗᚷᛈᛁᛊᛏᛁ" : "\u00A0"}
      </p>
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {mounted ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : "\u00A0"}
      </p>
    </div>
  );
}

export function BottomRunes() {
  const mounted = useMounted();
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {mounted ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : "\u00A0"}
      </p>
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {mounted ? "ᛊᚢᛁᚲ·ᚲᛁᛃᛏᛃ·ᛏᛏᛊᛁᚢ·ᛊᛗᛟᚹ" : "\u00A0"}
      </p>
    </div>
  );
}
