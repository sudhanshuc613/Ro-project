import Link from 'next/link';

/**
 * Category ke beech switch karne wali horizontal chip strip.
 *
 * Kyun: mobile par category page kholne ke baad doosri category tak
 * pahunchne ka koi rasta nahi tha — user ko back → menu → dobara chunna
 * padta tha. Ab ek swipe mein saari categories saamne hain.
 *
 * Scrollbar chhupa hai (`no-scrollbar`) taaki strip saaf dikhe, aur
 * `snap-x` se chip beech mein aake rukti hai — thumb se scroll karna
 * aasaan rehta hai.
 */
export default function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: { name: string; slug: string }[];
  activeSlug?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
      <Chip href="/products" label="All" active={!activeSlug} />
      {categories.map((c) => (
        <Chip
          key={c.slug}
          href={`/category/${c.slug}`}
          label={c.name}
          active={c.slug === activeSlug}
        />
      ))}
    </div>
  );
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-bold transition ${
        active
          ? 'border-navy-700 bg-navy-700 text-white'
          : 'border-navy-100 bg-white text-navy-700 active:scale-95 hover:border-aqua-300 hover:text-aqua-600'
      }`}
    >
      {label}
    </Link>
  );
}
