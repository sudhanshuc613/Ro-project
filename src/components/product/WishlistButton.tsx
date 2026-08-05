'use client';

/**
 * Heart toggle.
 *
 * Optimistic: the heart fills the instant it is tapped and rolls back if the
 * request fails. On a 3G connection in Patna a 600 ms round-trip before any
 * visual response feels broken, and the user taps again — creating a
 * double-toggle that silently undoes itself.
 *
 * Guests get sent to login with a callback back to the same product rather
 * than a dead-end error.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function WishlistButton({
  productId,
  productSlug,
  className = '',
  showLabel = false,
}: {
  productId: string;
  productSlug?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // One fetch per mount for logged-in users; the endpoint returns just ids.
  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    fetch('/api/account/wishlist')
      .then((r) => r.json())
      .then((d: { items?: string[] }) => {
        if (!cancelled) setSaved(Boolean(d.items?.includes(productId)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, productId]);

  async function toggle(e: React.MouseEvent) {
    // Card wraps this in a <Link>; without these the whole card navigates.
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      const back = productSlug ? `/products/${productSlug}` : '/products';
      router.push(`/login?callbackUrl=${encodeURIComponent(back)}`);
      return;
    }

    const next = !saved;
    setSaved(next); // optimistic
    setBusy(true);
    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, toggle: true }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSaved(Boolean(data.saved));
      toast.success(data.saved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch {
      setSaved(!next); // roll back
      toast.error('Could not update wishlist');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={
        className ||
        `inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
          saved
            ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
            : 'bg-white text-navy-600 ring-1 ring-navy-200 hover:text-red-500'
        } disabled:opacity-60`
      }
    >
      <svg
        className={`h-5 w-5 transition-transform ${saved ? 'scale-110' : ''}`}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.4 4.4 13a4.6 4.6 0 0 1 6.5-6.5l1.1 1.1 1.1-1.1A4.6 4.6 0 1 1 19.6 13L12 20.4Z"
        />
      </svg>
      {showLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}
