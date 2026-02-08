/**
 * Runes & Sigils — style-guide §1
 * Unicode Elder Futhark: ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ
 */

export function RuneSigil({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-runic text-[var(--color-rune-ink)] opacity-60 select-none ${className}`}
      aria-hidden
    >
      ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ
    </span>
  );
}

export function TopRunes() {
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        ᚠ·ᚠᚠᛁ·ᚲᚾᛁᛏᛁ·ᛗᚷᛈᛁᛊᛏᛁ
      </p>
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ
      </p>
    </div>
  );
}

export function BottomRunes() {
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.12em] text-[var(--color-rune-ink)]">
        ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ
      </p>
      <p className="font-bold tracking-[0.15em] text-[var(--color-rune-ink)]">
        ᛊᚢᛁᚲ·ᚲᛁᛃᛏᛃ·ᛏᛏᛊᛁᚢ·ᛊᛗᛟᚹ
      </p>
    </div>
  );
}
