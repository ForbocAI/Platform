"use client";

import { useState, useEffect } from "react";

/**
 * Runes & Sigils — style-guide §1
 * Unicode Elder Futhark: ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ
 * Rendered only after mount so server and first client render match (avoids hydration error).
 */

const PLACEHOLDER = "\u00A0";

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
      {mounted ? "ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ" : PLACEHOLDER}
    </span>
  );
}

export function TopRunes() {
  const mounted = useMounted();
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {mounted ? "ᚠ·ᚠᚠᛁ·ᚲᚾᛁᛏᛁ·ᛗᚷᛈᛁᛊᛏᛁ" : PLACEHOLDER}
      </p>
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {mounted ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : PLACEHOLDER}
      </p>
    </div>
  );
}

export function BottomRunes() {
  const mounted = useMounted();
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        {mounted ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : PLACEHOLDER}
      </p>
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        {mounted ? "ᛊᚢᛁᚲ·ᚲᛁᛃᛏᛃ·ᛏᛏᛊᛁᚢ·ᛊᛗᛟᚹ" : PLACEHOLDER}
      </p>
    </div>
  );
}
