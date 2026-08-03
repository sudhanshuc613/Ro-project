'use client';

import { useState } from 'react';

export default function FaqAccordion({
  faqs,
  title = 'Frequently Asked Questions',
}: {
  faqs: { q: string; a: string }[];
  title?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-navy-50 py-14 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-9 text-center font-display text-3xl font-extrabold text-navy-700">{title}</h2>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl border border-navy-100 bg-white">
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-navy-700 transition hover:bg-navy-50"
                  >
                    {f.q}
                    <span
                      className={`shrink-0 text-xl leading-none text-aqua-500 transition-transform ${isOpen ? 'rotate-45' : ''}`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
