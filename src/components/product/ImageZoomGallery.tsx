'use client';

/**
 * ImageZoomGallery — Amazon/Flipkart-grade product imagery.
 *
 *  Desktop : hover → magnifier lens + side zoom panel (2x–3x)
 *  Mobile  : swipe carousel + tap → fullscreen pinch-zoom lightbox
 *  A11y    : arrow-key thumb navigation, alt text per image, Esc closes lightbox
 *  Perf    : first image priority, rest lazy; zoom layer only fetched on hover
 */
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface GalleryImage {
  url: string;
  zoomUrl: string;
  thumbUrl: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
  productName: string;
  discountPct?: number;
}

const ZOOM_FACTOR = 2.6;

export default function ImageZoomGallery({ images, productName, discountPct = 0 }: Props) {
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [lens, setLens] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const safe = images.length ? images : [{
    url: '/products/placeholder.png', zoomUrl: '/products/placeholder.png',
    thumbUrl: '/products/placeholder.png', alt: productName,
  }];
  const current = safe[active];

  const go = useCallback((i: number) => setActive(((i % safe.length) + safe.length) % safe.length), [safe.length]);

  /* Track cursor as a percentage of the stage → drives both lens + zoom panel */
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    setLens({
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    });
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') go(active + 1);
      if (e.key === 'ArrowLeft') go(active - 1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightbox, active, go]);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* ── Thumbnail rail ── */}
      <div
        className="flex gap-3 overflow-x-auto md:w-[76px] md:shrink-0 md:flex-col md:overflow-visible"
        role="tablist" aria-label={`${productName} images`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
          if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); go(active - 1); }
        }}
      >
        {safe.map((img, i) => (
          <button
            key={img.url + i}
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1} of ${safe.length}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={[
              'relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 bg-white transition',
              i === active ? 'border-aqua-500 ring-2 ring-aqua-100' : 'border-navy-50 hover:border-aqua-300',
            ].join(' ')}
          >
            <Image src={img.thumbUrl} alt="" fill sizes="72px" className="object-contain p-1.5" />
          </button>
        ))}
      </div>

      {/* ── Main stage ── */}
      <div className="relative flex-1">
        <div
          ref={stageRef}
          className="group relative aspect-square overflow-hidden rounded-2xl border border-navy-50 bg-white"
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={onMove}
          onClick={() => setLightbox(true)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 45) go(dx < 0 ? active + 1 : active - 1);
            touchX.current = null;
          }}
        >
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority={active === 0}
            sizes="(max-width:768px) 100vw, 560px"
            className="object-contain p-6 transition-transform duration-300 md:group-hover:scale-[1.02]"
          />

          {discountPct > 0 && (
            <span className="absolute left-4 top-4 rounded-lg bg-cta-green px-3 py-1.5 text-sm font-bold text-white shadow">
              {discountPct}% OFF
            </span>
          )}

          {/* Magnifier lens (desktop only) */}
          {zooming && (
            <span
              aria-hidden
              className="pointer-events-none absolute hidden rounded-lg border-2 border-aqua-400 bg-aqua-400/15 md:block"
              style={{
                width: `${100 / ZOOM_FACTOR}%`,
                height: `${100 / ZOOM_FACTOR}%`,
                left: `calc(${lens.x}% - ${50 / ZOOM_FACTOR}%)`,
                top: `calc(${lens.y}% - ${50 / ZOOM_FACTOR}%)`,
              }}
            />
          )}

          <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-navy-700/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <MagnifierIcon /> <span className="hidden md:inline">Hover to zoom</span><span className="md:hidden">Tap to zoom</span>
          </span>

          {safe.length > 1 && (
            <span className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-navy-700 md:hidden">
              {active + 1} / {safe.length}
            </span>
          )}
        </div>

        {/* Side zoom panel — mirrors the lens position at high resolution */}
        {zooming && (
          <div
            aria-hidden
            className="absolute left-[calc(100%+1.25rem)] top-0 z-30 hidden h-[420px] w-[420px] overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card-hover xl:block"
            style={{
              backgroundImage: `url(${current.zoomUrl})`,
              backgroundSize: `${ZOOM_FACTOR * 100}%`,
              backgroundPosition: `${lens.x}% ${lens.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </div>

      {/* ── Fullscreen lightbox ── */}
      {lightbox && (
        <div
          role="dialog" aria-modal="true" aria-label={`${productName} image viewer`}
          className="fixed inset-0 z-[70] flex flex-col bg-navy-900/95 backdrop-blur"
          onClick={() => setLightbox(false)}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <p className="line-clamp-1 pr-4 text-sm font-semibold">{productName}</p>
            <button onClick={() => setLightbox(false)} aria-label="Close viewer"
              className="rounded-full bg-white/10 p-2.5 transition hover:bg-white/25">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image src={current.zoomUrl} alt={current.alt} fill sizes="100vw" className="object-contain p-4" />

            {safe.length > 1 && (
              <>
                <button onClick={() => go(active - 1)} aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => go(active + 1)} aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center gap-2 p-4" onClick={(e) => e.stopPropagation()}>
            {safe.map((img, i) => (
              <button key={i} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}
                className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 bg-white ${i === active ? 'border-aqua-400' : 'border-transparent opacity-60'}`}>
                <Image src={img.thumbUrl} alt="" fill sizes="56px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MagnifierIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
    <path strokeLinecap="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM10.5 8v5M8 10.5h5" />
  </svg>
);
