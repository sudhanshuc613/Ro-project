'use client';

/**
 * useRevealOnScroll — fades sections up as they enter the viewport.
 *
 * Why a hook and not a library: Framer Motion is ~40KB gzipped for what is
 * ultimately one IntersectionObserver and one CSS keyframe. On a site whose
 * competitive advantage is a 0.23s load time, that trade is not worth making.
 *
 * Behaviour:
 *  • Elements carrying .reveal start at opacity 0.
 *  • When 12% of the element is visible, .reveal-in is added and the CSS
 *    animation runs once. The observer then stops watching that element.
 *  • prefers-reduced-motion short-circuits everything and reveals immediately,
 *    so no content is ever trapped behind an animation that will not run.
 *  • Runs on a MutationObserver too, so client-rendered content added after
 *    mount still gets picked up.
 */
import { useEffect } from 'react';

export function useRevealOnScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('reveal-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('reveal-in');
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    const observeAll = () => {
      document
        .querySelectorAll('.reveal:not(.reveal-in)')
        .forEach((el) => io.observe(el));
    };

    observeAll();

    // Catch anything rendered after hydration (carousels, lazy sections).
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [enabled]);
}

/** Drop-in component version for use inside a server-rendered page. */
export function RevealProvider() {
  useRevealOnScroll(true);
  return null;
}
