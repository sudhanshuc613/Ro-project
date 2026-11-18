/**
 * LocalMapSection — Google Maps embed + NAP block (homepage ke sabse neeche).
 *
 * ──────────────────────────────────────────────────────────────────────────
 *  KYUN BANAYA (18 Nov 2026)
 * ──────────────────────────────────────────────────────────────────────────
 *  Owner ne roservicecentrepatna.in dekha — unke footer me Google Map laga hai
 *  aur wo "ro service centre patna" par #1 hai. Owner ko laga map hi wajah hai.
 *
 *  Maine naapa — map wajah NAHI hai:
 *    • unka iframe `!2sPatna, Bihar` par center hai, zoom !1d115133 (~115 KM).
 *      Yaani POORA SHEHAR ka naksha, unki dukaan ka pin hai hi nahi.
 *    • Whitespark 2026 survey (47 expert, 187 factor): apni location ka
 *      embedded map = map-pack me 125/187, local-organic me 91/187.
 *      Sheher/service-area ka map 187 factor ki list me HAI HI NAHI.
 *    • Wo #1 isliye hain kyunki unka DOMAIN hi keyword hai
 *      (roservicecentrepatna.in = "ro service centre patna").
 *
 *  To phir ye block kyun? Kyunki ASLI pin wala map ek chhota, naapa hua
 *  fayda deta hai:
 *    • SearchPilot ka 2025 split-test: asli business pin wala map HATANE par
 *      organic sessions ~7% GIRE. Matlab rakhne ka thoda fayda hai.
 *    • NAP (Name-Address-Phone) ek jagah, Google ke liye saaf.
 *    • Customer ko bharosa + ek tap me directions.
 *
 *  Isliye yahan unse ULTA kiya hai: sheher ka nahi, APNI DUKAAN ka pin.
 *
 * ──────────────────────────────────────────────────────────────────────────
 *  SPEED — ye block page dheema NAHI karta
 * ──────────────────────────────────────────────────────────────────────────
 *  Ek Google Maps embed ~745 KB aur ~68 request laata hai. Isliye:
 *    • `loading="lazy"` — iframe tabhi load hota hai jab user scroll karke
 *      paas aaye. Homepage ke sabse neeche hai, to pehli screen par iska
 *      ZERO asar hai (LCP/CLS dono safe).
 *    • fixed height + aspect box → layout shift (CLS) 0.
 *    • `referrerPolicy` + `title` diye hain (a11y + privacy).
 *
 *  API key ki zaroorat NAHI — `output=embed` wala public URL use kiya hai.
 *  (Maps JavaScript API hota to key + billing chahiye hota.)
 *
 * ──────────────────────────────────────────────────────────────────────────
 *  SEO ka asli kaam text karta hai, map nahi
 * ──────────────────────────────────────────────────────────────────────────
 *  Usi survey me "Geographic (City/Neighborhood) Keyword Relevance of Content"
 *  local-organic me 2/187 hai — map se 89 position UPAR. Isliye map ke saath
 *  address/phone/hours SAAF TEXT me likhe hain (iframe ke andar nahi), taki
 *  Googlebot unhe padh sake.
 *
 *  ⚠️ Address/phone/hours sab CONTACT constant se aate hain — hardcode nahi.
 *     Isse GBP ke saath mismatch ka khatra khatam. Ek jagah badlo, sab badlega.
 */

import { CONTACT, BRAND, SERVICE } from '@/lib/constants';

/** Address ko ek line me jodta hai — schema aur map query dono ke liye ek hi source. */
function fullAddressLine(): string {
  const a = CONTACT.address;
  const parts = CONTACT.showStreetAddress
    ? [a.street, a.locality, a.city, a.state, a.pincode]
    : [a.locality, a.city, a.state, a.pincode];
  return parts.filter(Boolean).join(', ');
}

/**
 * Map ka URL.
 *
 * Naam + poora address query me bhejte hain taki Google ise humari ASLI
 * Business Profile listing se match kare (sirf lat/lng bhejne par wo ek
 * gumnaam pin dikhata hai, listing nahi).
 */
function mapEmbedSrc(): string {
  const q = `${BRAND.name} RO Service Centre, ${fullAddressLine()}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
}

/** "Directions" button — user ke Maps app me kholta hai. */
function directionsHref(): string {
  const q = `${BRAND.name} RO Service Centre, ${fullAddressLine()}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

export default function LocalMapSection() {
  const a = CONTACT.address;
  const addressLine = fullAddressLine();

  /** Dono number ek saath — jaise baaki site par dikhte hain. */
  const phones: ReadonlyArray<{ num: string; tel: string }> = [
    { num: CONTACT.primaryPhone, tel: CONTACT.primaryTel },
    { num: CONTACT.secondaryPhone, tel: CONTACT.secondaryTel },
  ];

  return (
    <section
      aria-labelledby="local-map-heading"
      className="border-t border-navy-100 bg-navy-50/40 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="local-map-heading"
          className="font-display text-2xl font-bold text-navy-800 sm:text-3xl"
        >
          Hamara Patna Service Centre — Location &amp; Directions
        </h2>
        <p className="mt-2 max-w-3xl text-navy-600">
          Aqua Perl RO Service Centre {a.locality}, {a.city} me hai. Patna ke kisi
          bhi area me technician bhejte hain — visit charge ₹{SERVICE.visitCharge} fixed.
          Neeche naksha par hamari exact location hai.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          {/* ── NAP block — ye TEXT hai, Googlebot ise padhta hai ── */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <h3 className="font-display text-lg font-bold text-navy-800">
              {BRAND.name} RO Service Centre
            </h3>

            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-navy-700">Address</dt>
                <dd className="mt-1 not-italic text-navy-600">
                  <address className="not-italic">{addressLine}</address>
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-navy-700">Phone</dt>
                <dd className="mt-1 space-y-1">
                  {phones.map((p) => (
                    <div key={p.num}>
                      <a
                        href={p.tel}
                        className="font-semibold text-aqua-700 underline-offset-2 hover:underline"
                      >
                        {p.num}
                      </a>
                    </div>
                  ))}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-navy-700">Open</dt>
                <dd className="mt-1 text-navy-600">{CONTACT.hours}</dd>
              </div>

              <div>
                <dt className="font-semibold text-navy-700">Service area</dt>
                <dd className="mt-1 text-navy-600">
                  Poora Patna — Kankarbagh, Boring Road, Rajendra Nagar, Patliputra,
                  Danapur, Khagaul, Phulwari Sharif, Digha aur baaki sab.
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={directionsHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-aqua-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-aqua-700"
              >
                Google Maps par directions
              </a>
              <a
                href={CONTACT.primaryTel}
                className="inline-flex items-center gap-2 rounded-xl border border-aqua-600 px-4 py-2.5 text-sm font-semibold text-aqua-700 transition hover:bg-aqua-50"
              >
                Call {CONTACT.primaryPhone}
              </a>
            </div>
          </div>

          {/* ── Naksha. lazy = pehli screen par zero cost ── */}
          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
            <iframe
              src={mapEmbedSrc()}
              title={`${BRAND.name} RO Service Centre, ${a.locality}, ${a.city} — Google Map`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-[320px] w-full border-0 sm:h-[420px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
