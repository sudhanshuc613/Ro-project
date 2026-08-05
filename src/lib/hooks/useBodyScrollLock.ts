'use client';

import { useEffect } from 'react';

/**
 * Jab koi mobile drawer/modal khula ho tab page ka scroll band kar deta hai.
 *
 * Kyun zaroori hai:
 * Mobile pe drawer khol ke scroll karo to peeche ka page scroll ho jaata tha,
 * jisse homepage ka content drawer ke saath beech screen pe aa jaata tha.
 * `overflow: hidden` akela iOS Safari pe kaam nahi karta — isliye
 * position:fixed + top offset ka tarika use kiya hai, aur band hote hi
 * user ko wapas usi scroll position pe le jaate hain.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const body = document.body;

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

/** Escape key dabane pe drawer band karne ke liye. */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onEscape]);
}
