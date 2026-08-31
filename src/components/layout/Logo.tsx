import Link from "next/link";

/**
 * Логотип — единственное место, где используется акцентный шрифт Playfair.
 * Контраст засечного начертания с гротеском интерфейса даёт ощущение
 * продуманности без дополнительной графики.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-baseline gap-0.5 font-display text-ink transition-opacity hover:opacity-80"
      aria-label="Bailanysta, на главную"
    >
      <span className="text-[26px] leading-none tracking-[-0.01em]">B</span>
      {!compact && <span className="text-[22px] leading-none tracking-[-0.01em]">ailanysta</span>}
      <span className="text-accent" aria-hidden="true">
        .
      </span>
    </Link>
  );
}
