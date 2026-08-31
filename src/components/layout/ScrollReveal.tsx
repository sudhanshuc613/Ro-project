'use client';

/**
 * ScrollReveal — mounts the reveal-on-scroll observer for the whole shop layout.
 *
 * Any element that carries the `.reveal` class fades up once as it enters the
 * viewport. Rendering this as a tiny client component keeps every page that
 * uses it a server component, so there is no hydration cost beyond this file.
 */
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll';

export default function ScrollReveal() {
  useRevealOnScroll(true);
  return null;
}
