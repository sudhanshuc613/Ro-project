'use client';

/**
 * CountUp — animates a number from 0 to its target when it scrolls into view.
 *
 * Why it earns its place: a static "2,400+" is read as decoration. A number
 * that visibly climbs is read as a fact, because the motion draws the eye and
 * holds it for the ~1.2s it takes to finish. It is the cheapest way to make
 * genuine numbers feel as substantial as they actually are.
 *
 * Implementation notes:
 *  • IntersectionObserver so it only runs when seen, and only once.
 *  • requestAnimationFrame with an ease-out curve — linear counting looks
 *    mechanical; ease-out feels like it is settling into place.
 *  • Respects prefers-reduced-motion by jumping straight to the final value.
 *  • Renders the final value in the DOM immediately for crawlers and for
 *    users with JS disabled, so nothing is hidden behind animation.
 */
import { useEffect, useRef, useState } from 'react';

export default function CountUp({
  to,
  suffix = '',
  decimals = 0,
  duration = 1200,
  className = '',
}: {
  to: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // leave the final value in place

    setValue(0); // only drop to zero once we know we will animate

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          // easeOutExpo — fast start, gentle settle
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setValue(to * eased);
          if (p < 1) requestAnimationFrame(tick);
          else setValue(to);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const shown = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString('en-IN');

  return (
    <span ref={ref} className={className}>
      {shown}
      {suffix}
    </span>
  );
}
