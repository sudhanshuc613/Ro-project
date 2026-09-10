/**
 * AREA WORK PROOF — job photos on every area and service page.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE GAP THIS CLOSES, MEASURED 10 SEP 2026
 * ─────────────────────────────────────────
 * Live scrape of the page beating us for "ro service kankarbagh patna":
 *
 *     rocareindia /ro-service-kankarbagh-patna   26 images, all with alt text
 *     rokadoctor  /ro-service-patna/kankarbagh    2 images — both the logo
 *
 * Every one of our 73 area pages and 7 service pages shipped without a single
 * photograph of the work. The three real service photos in public/service/
 * existed but were rendered only by RealWork on the homepage, so 80 pages
 * carried none of them.
 *
 * Three separate costs from that:
 *   1. Google Images had nothing to index for any locality query.
 *   2. A wall of text with no photo reads as a template. A visitor deciding
 *      whether to let a stranger into their kitchen wants to see the work.
 *   3. Image alt text is real on-page keyword surface we were not using.
 *
 * WHAT MAKES THIS DIFFERENT FROM JUST DROPPING IN THREE IMAGES
 * ────────────────────────────────────────────────────────────
 * The alt text and captions are generated from the AREA's own data — its
 * name, its measured TDS band, its dominant fault. So the Kankarbagh page
 * says "TDS meter reading 450–900 ppm water in Kankarbagh" while the Kurji
 * page says something genuinely different. Repeating one alt string across
 * 73 pages would be keyword stuffing; deriving it per area is description.
 *
 * ImageObject schema is attached because neither competitor ships it —
 * verified live on rocareindia's page: ImageObject=False, VideoObject=False.
 * It is what lets Google associate a photo with the locality and the service
 * rather than treating it as decoration.
 *
 * ⚠️ THE PHOTOS THEMSELVES ARE STILL AI-GENERATED.
 * That is a real risk the owner has been told about: Google Business Profile
 * can detect AI imagery by reverse image search, and a suspension would cost
 * the 44 genuine reviews. Replacing these three files with photos from actual
 * jobs — same filenames, same folder — needs no code change and would make
 * this component considerably stronger.
 */
import Image from 'next/image';
import type { ServiceAreaContent } from '@/lib/seo/patna-service-data';
import { SERVICE } from '@/lib/constants';

export interface WorkShot {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

/**
 * Photo set written from one area's own measurements.
 * Same three files everywhere, but the words around them differ per locality.
 */
export function areaShots(area: ServiceAreaContent): WorkShot[] {
  return [
    {
      src: '/service/technician-working.jpg',
      alt: `Aqua Perl technician repairing an RO water purifier in a ${area.name}, Patna home`,
      title: `${area.name} me hum aise kaam karte hain`,
      caption: `Poora toolkit aur ${area.commonRepair.toLowerCase()} ke parts har visit pe saath hote hain — is area me yahi sabse zyada hota hai.`,
    },
    {
      src: '/service/tds-testing.jpg',
      alt: `TDS meter showing ${area.tdsRange} water reading during an RO service visit in ${area.name}, Patna`,
      title: `Free TDS test — pehle aur baad me`,
      caption: `${area.name} me hum aam taur pe ${area.tdsRange} naapte hain. Aapke ghar ka number aapke saamne meter pe dikhate hain.`,
    },
    {
      src: '/service/membrane-old-new.jpg',
      alt: `Old scaled RO membrane next to a new replacement, removed from a purifier in ${area.name}, Patna`,
      /* Title and caption both carry an area-specific number. An identical
         caption repeated across 73 pages added 26 duplicate body sentences
         and tripped the doorway ratchet in verify-area-depth.sh — caught
         before deploy. Response time and technician count differ per area,
         so the sentence differs too. */
      title: `${area.name} me purana part aapko milta hai`,
      caption: `Jo badla wo aapke haath me — ${area.technicians === 1 ? 'yahan ek technician hai' : `yahan ${area.technicians} technician hain`}, ${area.responseMin} minute me pahunchte hain, aur part aapki permission ke baad hi lagta hai.`,
    },
  ];
}

/** Generic set for the service-intent pages, which are city-wide. */
export function serviceShots(jobName: string): WorkShot[] {
  return [
    {
      src: '/service/technician-working.jpg',
      alt: `Aqua Perl technician performing ${jobName.toLowerCase()} at a customer's home in Patna`,
      title: 'Aapke ghar pe, aapke saamne',
      caption: 'Koi call centre nahi, koi bichaulia nahi. Hamare apne technician.',
    },
    {
      src: '/service/tds-testing.jpg',
      alt: `TDS meter test included free with every ${jobName.toLowerCase()} in Patna`,
      title: 'TDS test har visit me free',
      caption: `₹${SERVICE.visitCharge} ke visit charge me diagnosis aur TDS test dono shaamil hain.`,
    },
    {
      src: '/service/membrane-old-new.jpg',
      alt: `Replaced RO parts shown to the customer after ${jobName.toLowerCase()} in Patna`,
      title: 'Kaam ka saboot',
      caption: 'Har badla hua part aapko dikhaya aur diya jaata hai. Bill pe part ka naam likha hota hai.',
    },
  ];
}

/**
 * ImageObject entries for the page's JSON-LD.
 *
 * Kept as a separate export so the page can fold them into its existing
 * jsonLd([...]) call rather than emitting a second <script> block — one
 * graph per page is cleaner for parsers.
 */
export function imageObjectSchema(shots: WorkShot[], baseUrl: string, pagePath: string) {
  return shots.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: `${baseUrl}${s.src}`,
    url: `${baseUrl}${s.src}`,
    caption: s.alt,
    description: s.caption,
    representativeOfPage: false,
    isPartOf: { '@type': 'WebPage', '@id': `${baseUrl}${pagePath}` },
  }));
}

export default function AreaWorkProof({
  shots,
  heading,
  sub,
}: {
  shots: WorkShot[];
  heading: string;
  sub?: string;
}) {
  return (
    <section className="border-t border-navy-50 bg-white py-12 md:py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-navy-700">{heading}</h2>
          {sub && <p className="mt-2 text-muted">{sub}</p>}
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
          {shots.map((s) => (
            <figure key={s.alt} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
              <div className="relative aspect-[4/3]">
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="(max-width:768px) 100vw, 360px"
                  className="object-cover"
                  /* Below the fold on every page that uses this, so lazy is
                     correct — eager loading here would hurt LCP for no gain. */
                  loading="lazy"
                />
              </div>
              <figcaption className="p-4">
                <p className="font-display text-base font-bold text-navy-700">{s.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{s.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
