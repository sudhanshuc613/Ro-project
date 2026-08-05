'use client';

/**
 * Inline star-rating form.
 *
 * Collapsed to a row of stars until one is clicked — asking for a title and
 * a paragraph up front is what makes most review prompts get ignored. One
 * tap commits the customer, then the text fields appear.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const HINTS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent'];

export default function ReviewForm({
  productId,
  orderId,
  productName,
}: {
  productId: string;
  orderId: string;
  productName: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (rating < 1) return;
    setSaving(true);
    try {
      const res = await fetch('/api/account/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, orderId, rating, title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? 'Could not submit review');
        return;
      }
      toast.success('Thanks! Your review is in — it appears once approved.');
      start(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  const shown = hover || rating;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${n} out of 5 for ${productName}`}
            className={`text-2xl leading-none transition-transform hover:scale-110 ${
              n <= shown ? 'text-gold-500' : 'text-navy-200'
            }`}
          >
            ★
          </button>
        ))}
        {shown > 0 && (
          <span className="ml-2 text-sm font-semibold text-navy-600">{HINTS[shown]}</span>
        )}
      </div>

      {rating > 0 && (
        <div className="mt-3 space-y-2.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 160))}
            placeholder="Sum it up in a few words"
            className="w-full rounded-xl border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-aqua-500 focus:ring-2 focus:ring-aqua-200"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 2000))}
            rows={3}
            placeholder="How is the water taste? Was installation smooth? Anything other buyers should know?"
            className="w-full rounded-xl border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-aqua-500 focus:ring-2 focus:ring-aqua-200"
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={saving || pending}
              className="rounded-xl bg-cta-orange px-5 py-2.5 text-sm font-bold text-white shadow-cta transition hover:bg-cta-orangeDark disabled:opacity-60"
            >
              {saving ? 'Submitting…' : 'Submit review'}
            </button>
            <button
              onClick={() => {
                setRating(0);
                setTitle('');
                setBody('');
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
