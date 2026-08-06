import Image from 'next/image';
import { CONTACT } from '@/lib/constants';

/**
 * RealWork — proof section.
 *
 * Competitor sites use glossy stock photos of smiling models in white lab
 * coats. Nobody believes those. Showing the actual mess — a scaled membrane,
 * a TDS meter reading, a technician kneeling on a real kitchen floor — is
 * what makes a Patna customer think "yeh log sach mein kaam karte hain".
 *
 * NOTE FOR THE OWNER: replace these three files with photos from your own
 * jobs as soon as you can. Same filenames, same folder — nothing else to
 * change. Real photos of your own work will always outperform these.
 */
const SHOTS = [
  {
    src: '/service/technician-working.jpg',
    alt: 'Aqua Perl technician repairing an RO water purifier in a Patna home kitchen',
    title: 'We come to your kitchen',
    caption: 'Full toolkit and common spares on every visit — most repairs finish in one trip.',
  },
  {
    src: '/service/membrane-old-new.jpg',
    alt: 'Old scaled RO membrane compared with a new replacement membrane',
    title: 'We show you the old part',
    caption: 'You see exactly what was replaced and why. No part is changed without showing you first.',
  },
  {
    src: '/service/tds-testing.jpg',
    alt: 'TDS meter measuring water quality during an Aqua Perl service visit in Patna',
    title: 'Free TDS test, before and after',
    caption: 'We measure your water on arrival and again after service, so you can see the difference.',
  },
];

export default function RealWork() {
  return (
    <section className="bg-navy-50 py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-navy-700 md:text-3xl">
            This Is What Our Service Actually Looks Like
          </h2>
          <p className="mt-2 text-muted">
            No call-centre, no middleman. Our own technicians, at your door.
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {SHOTS.map((s) => (
            <figure key={s.src} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="relative aspect-[4/3]">
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="(max-width:768px) 100vw, 380px"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-5">
                <p className="font-display font-bold text-navy-700">{s.title}</p>
                <p className="mt-1.5 text-sm text-muted">{s.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Promise strip — addresses the real fear: hidden charges */}
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="font-display text-lg font-bold text-emerald-900">
            Our promise — in plain words
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Price told before work', d: 'Technician quotes the full cost first. You approve, then he starts.' },
              { t: 'Old part shown to you', d: 'Every replaced part is handed to you so you can see it was genuinely faulty.' },
              { t: 'Pay after, not before', d: 'No advance. Cash, UPI or card once the water is running.' },
              { t: '30-day warranty', d: 'Same problem returns within 30 days — we fix it free, no visit charge.' },
            ].map((p) => (
              <div key={p.t}>
                <p className="flex items-start gap-2 font-bold text-emerald-900">
                  <span className="text-cta-green">✓</span> {p.t}
                </p>
                <p className="mt-1 pl-6 text-sm text-emerald-800">{p.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={CONTACT.primaryTel}
              className="rounded-xl bg-cta-green px-6 py-3 font-bold text-white transition hover:bg-cta-greenDark"
            >
              📞 Call {CONTACT.primaryPhone}
            </a>
            <a
              href={CONTACT.whatsappLink('Hi, I need RO service in Patna.')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
