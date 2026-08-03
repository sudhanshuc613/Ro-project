import Link from 'next/link';

export default function ReviewSummary({
  average,
  count,
  href = '#reviews',
}: {
  average: number;
  count: number;
  href?: string;
}) {
  if (!count) return <span className="text-sm text-muted">No reviews yet</span>;

  return (
    <Link href={href} className="flex items-center gap-2 hover:underline">
      <span className="flex items-center gap-1 rounded bg-cta-green px-2 py-0.5 text-sm font-bold text-white">
        {average.toFixed(1)} ★
      </span>
      <span className="text-sm text-muted">
        {count.toLocaleString('en-IN')} rating{count === 1 ? '' : 's'}
      </span>
    </Link>
  );
}
