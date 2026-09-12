/**
 * JSON-LD structured data builders — the engine behind Aqua Perl's DUAL SEO.
 *
 *  GLOBAL e-commerce  → Product + Offer + AggregateRating + BreadcrumbList
 *  LOCAL Patna service → LocalBusiness/HVACBusiness + Service + GeoCircle + FAQPage
 *
 * Rendered via <script type="application/ld+json"> in each page's Server Component.
 */
import { BRAND, CONTACT, SERVICE, GBP, SOCIAL, GBP_RATING_TEXT } from '@/lib/constants';

type Json = Record<string, unknown>;

/* ── ORGANIZATION (root layout, every page) ───────────────────────────────── */
export function organizationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BRAND.url}/#organization`,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: BRAND.url,
    logo: { '@type': 'ImageObject', url: `${BRAND.url}${BRAND.logo}`, width: 512, height: 512 },
    description:
      'Aqua Perl sells RO water purifiers, commercial RO plants and genuine spare parts across India, and provides expert RO repair & installation service in Patna, Bihar.',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: `+91${CONTACT.primaryPhone}`,
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      },
      {
        '@type': 'ContactPoint',
        telephone: `+91${CONTACT.secondaryPhone}`,
        contactType: 'technical support',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      },
    ],
    // sameAs sirf tab bharna jab profile SACH MEIN maujood ho. Dead link
    // dena trust todta hai — Google follow karta hai aur 404 milta hai.
    // Facebook/Instagram page ban jaaye to yahan URL daal dena.
    ...(SOCIAL.length ? { sameAs: SOCIAL } : {}),
  };
}

/* ── LOCAL BUSINESS (homepage + every Patna service page) ─────────────────── */
export function localBusinessSchema(area?: {
  name: string; pincodes: string[]; lat?: number; lng?: number;
  /** Canonical path of the page carrying this markup, e.g. areaPath(slug). */
  path?: string;
}): Json {
  const label = area ? `${BRAND.name} — RO Service in ${area.name}, Patna` : `${BRAND.name} RO Service Patna`;
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HVACBusiness'],
    '@id': `${BRAND.url}/#localbusiness${area ? `-${area.name.toLowerCase().replace(/\s+/g, '-')}` : ''}`,
    name: label,
    image: `${BRAND.url}/banners/service-tech.png`,
    /* Must be a URL that actually resolves. This previously built
       /ro-service-{name}-patna by hand — a route shape that was abandoned
       during the Sep 2026 URL migration — so LocalBusiness.url pointed at a
       404 on all 55 area pages. Now it takes the caller's real path. */
    url: area?.path ? `${BRAND.url}${area.path}` : `${BRAND.url}/service-patna`,
    telephone: `+91${CONTACT.primaryPhone}`,
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Card, Net Banking',
    // Service Area Business: Google Business Profile pe address chhupa hai,
    // isliye schema mein bhi streetAddress nahi bhejte. GBP aur website ka
    // address alag hona local ranking ka seedha nuksan hai.
    address: {
      '@type': 'PostalAddress',
      ...(CONTACT.showStreetAddress ? { streetAddress: CONTACT.address.street } : {}),
      addressLocality: area?.name ?? CONTACT.address.locality,
      addressRegion: CONTACT.address.state,
      postalCode: area?.pincodes?.[0] ?? CONTACT.address.pincode,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: area?.lat ?? CONTACT.geo.lat,
      longitude: area?.lng ?? CONTACT.geo.lng,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: CONTACT.geo.lat, longitude: CONTACT.geo.lng },
      geoRadius: '25000', // 25 km — Patna metro
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      opens: '08:00', closes: '21:00',
    }],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'RO Services in Patna',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'RO Repair Service' },
          price: SERVICE.visitCharge, priceCurrency: 'INR',
          description: `Visit charge only ₹${SERVICE.visitCharge} in Patna` },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'RO Installation' }, priceCurrency: 'INR' },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Filter & Membrane Replacement' }, priceCurrency: 'INR' },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Annual Maintenance Contract (AMC)' }, priceCurrency: 'INR' },
      ],
    },
    // ⚠️ Ye Google Business Profile ke ASLI numbers hain (src/lib/constants.ts → GBP).
    // Inflate kiya to "spammy structured markup" ka manual action lag sakta hai
    // aur saare rich results band ho jaate hain. GBP pe count badle to wahin badlo.
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: GBP_RATING_TEXT,
      reviewCount: String(GBP.reviewCount),
      bestRating: '5',
    },
  };
}

/* ── PRODUCT (PDP — global e-commerce SEO) ────────────────────────────────── */
export function productSchema(p: {
  name: string; slug: string; sku: string; description: string; brand?: string;
  images: string[]; price: number; mrp: number; inStock: boolean;
  ratingAvg?: number; ratingCount?: number; warrantyMonths?: number;
  /** GTIN/EAN barcode when the admin has entered one — Google's own data shows
   *  products with a correct GTIN earn ~20% more clicks in Shopping. */
  gtin?: string;
  /** Full Google product-taxonomy path improves Shopping classification. */
  category?: string;
}): Json {
  const gtinKey = p.gtin
    ? { [`gtin${p.gtin.length === 8 || p.gtin.length === 12 || p.gtin.length === 13 || p.gtin.length === 14 ? p.gtin.length : ''}`]: p.gtin }
    : {};
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BRAND.url}/products/${p.slug}/#product`,
    name: p.name,
    sku: p.sku,
    mpn: p.sku,
    ...gtinKey,
    ...(p.category ? { category: p.category } : {}),
    description: p.description,
    image: p.images.map((i) => (i.startsWith('http') ? i : `${BRAND.url}${i}`)),
    brand: { '@type': 'Brand', name: p.brand ?? BRAND.name },
    offers: {
      '@type': 'Offer',
      url: `${BRAND.url}/products/${p.slug}`,
      priceCurrency: 'INR',
      price: p.price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10),
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BRAND.name },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'INR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    ...(p.ratingCount && p.ratingCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.ratingAvg, reviewCount: p.ratingCount, bestRating: '5' } }
      : {}),
    ...(p.warrantyMonths
      ? { warranty: { '@type': 'WarrantyPromise', durationOfWarranty: { '@type': 'QuantitativeValue', value: p.warrantyMonths, unitCode: 'MON' } } }
      : {}),
  };
}

/* ── ITEM LIST (category & listing pages) ─────────────────────────────────── */
/**
 * ItemList tells Google that a page is a curated set of products rather than
 * one long article. It is on Microsoft's own AEO/GEO schema shortlist
 * (LocalBusiness, Product, AggregateRating, Review, Brand, ItemList, FAQ)
 * because AI answer engines lean on it to enumerate options.
 *
 * Category and listing pages on this site previously shipped only a
 * BreadcrumbList, so nothing told a crawler what was actually being sold.
 */
export function itemListSchema(
  items: { name: string; url: string; image?: string; price?: number; inStock?: boolean }[],
  listName: string,
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: it.name,
        url: it.url.startsWith('http') ? it.url : `${BRAND.url}${it.url}`,
        ...(it.image
          ? { image: it.image.startsWith('http') ? it.image : `${BRAND.url}${it.image}` }
          : {}),
        ...(it.price
          ? {
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                price: it.price.toFixed(2),
                availability: it.inStock === false
                  ? 'https://schema.org/OutOfStock'
                  : 'https://schema.org/InStock',
              },
            }
          : {}),
      },
    })),
  };
}

/**
 * ItemList of SERVICES rather than products.
 *
 * itemListSchema() above emits `@type: Product` for each entry, which is
 * correct for a catalogue page and wrong for a list of jobs — a Product with
 * no price, no availability and no SKU is a weaker signal than a Service with
 * a provider and an area served. Google's structured-data guidance treats the
 * two as distinct, so the service hub uses this one.
 */
export function serviceListSchema(
  items: { name: string; url: string; description?: string; priceFrom?: number }[],
  listName: string,
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: it.name,
        url: it.url.startsWith('http') ? it.url : `${BRAND.url}${it.url}`,
        ...(it.description ? { description: it.description } : {}),
        provider: {
          '@type': 'LocalBusiness',
          name: BRAND.legalName,
          telephone: `+91${CONTACT.primaryPhone}`,
        },
        areaServed: { '@type': 'City', name: 'Patna' },
        ...(it.priceFrom
          ? {
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                price: String(it.priceFrom),
                availability: 'https://schema.org/InStock',
              },
            }
          : {}),
      },
    })),
  };
}

/* ── BREADCRUMBS ──────────────────────────────────────────────────────────── */
export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name,
      item: it.url.startsWith('http') ? it.url : `${BRAND.url}${it.url}`,
    })),
  };
}

/* ── FAQ (rich snippet — huge CTR win for "RO service in Patna") ──────────── */
export function faqSchema(faqs: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/* ── WEBSITE + SITELINKS SEARCHBOX ────────────────────────────────────────── */
export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BRAND.url}/#website`,
    url: BRAND.url,
    name: BRAND.name,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BRAND.url}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Helper for embedding in JSX: <script {...jsonLd(schema)} /> */
export const jsonLd = (data: Json | Json[]) => ({
  type: 'application/ld+json',
  dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
});

/* ── REVIEW SCHEMA ────────────────────────────────────────────────────────
   Microsoft's published AEO/GEO framework lists Review and AggregateRating
   among the schema types AI engines read when deciding which local business
   to name. We already ship AggregateRating; individual Review objects were
   missing, so the testimonials on the homepage were invisible to machines.

   SOCi's 2026 Local Visibility Index found ChatGPT recommends only 1.2% of
   local businesses and Perplexity 7.4%, against 35.9% for Google's local
   3-pack — the gap is largely explained by data the engines cannot read.

   ⚠️ Only ever pass REAL reviews here. Fabricated review markup is a
   structured-data violation and costs every rich result on the domain.
   ────────────────────────────────────────────────────────────────────── */
export function reviewSchema(
  reviews: readonly { body: string; name: string; place: string; stars: number }[],
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BRAND.url}/#reviews`,
    name: BRAND.name,
    image: `${BRAND.url}${BRAND.logoPng}`,
    telephone: `+91${CONTACT.primaryPhone}`,
    address: {
      '@type': 'PostalAddress',
      ...(CONTACT.showStreetAddress ? { streetAddress: CONTACT.address.street } : {}),
      addressLocality: CONTACT.address.locality,
      addressRegion: CONTACT.address.state,
      postalCode: CONTACT.address.pincode,
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: GBP_RATING_TEXT,
      reviewCount: String(GBP.reviewCount),
      bestRating: '5',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: String(r.stars), bestRating: '5' },
      author: { '@type': 'Person', name: r.name },
      reviewBody: r.body,
      itemReviewed: { '@type': 'LocalBusiness', name: BRAND.name },
    })),
  };
}

/* ── ARTICLE + AUTHOR (E-E-A-T) ───────────────────────────────────────────── */
/**
 * Article schema with a named Person author.
 *
 * Why this matters, measured 3 Sep 2026: the competitor ranking #1 for
 * "ro repair patna" ships both Article and Person schema. We shipped neither.
 *
 * Person schema is the machine-readable form of "a real, named expert with
 * stated credentials wrote this". Google weights that heavily under E-E-A-T,
 * and drinking water is a YMYL topic — it affects health — where the bar for
 * demonstrated expertise is at its highest.
 *
 * `knowsAbout` and `hasCredential` are the properties that carry the actual
 * expertise claim; an author byline without them is just a name.
 */
export function articleSchema(a: {
  title: string;
  description: string;
  slug: string;
  published: string;
  updated: string;
  author: { name: string; slug: string; role: string; bio: string; credentials: string[] };
  keywords?: string[];
}): Json {
  const url = `${BRAND.url}/blog/${a.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}/#article`,
    headline: a.title,
    description: a.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: 'en-IN',
    ...(a.keywords?.length ? { keywords: a.keywords.join(', ') } : {}),
    author: {
      '@type': 'Person',
      '@id': `${BRAND.url}/about/${a.author.slug}/#person`,
      name: a.author.name,
      jobTitle: a.author.role,
      description: a.author.bio,
      url: `${BRAND.url}/about/${a.author.slug}`,
      worksFor: { '@type': 'Organization', name: BRAND.legalName, url: BRAND.url },
      knowsAbout: [
        'RO water purifier repair',
        'Reverse osmosis membrane replacement',
        'Water TDS measurement',
        'Commercial RO plant installation',
        'Water quality in Patna, Bihar',
      ],
      hasCredential: a.author.credentials.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Professional experience',
        name: c,
      })),
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND.legalName,
      url: BRAND.url,
      logo: { '@type': 'ImageObject', url: `${BRAND.url}${BRAND.logoPng}` },
    },
    image: [`${BRAND.url}${BRAND.ogImage}`],
  };
}

/** Standalone Person schema for the author page. */
export function personSchema(a: {
  name: string; slug: string; role: string; bio: string;
  credentials: string[]; yearsExperience: number;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BRAND.url}/about/${a.slug}/#person`,
    name: a.name,
    jobTitle: a.role,
    description: a.bio,
    url: `${BRAND.url}/about/${a.slug}`,
    telephone: `+91${CONTACT.primaryPhone}`,
    worksFor: {
      '@type': 'LocalBusiness',
      name: BRAND.legalName,
      url: BRAND.url,
      telephone: `+91${CONTACT.primaryPhone}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: CONTACT.address.locality,
        addressRegion: CONTACT.address.state,
        postalCode: CONTACT.address.pincode,
        addressCountry: 'IN',
      },
    },
    knowsAbout: [
      'RO water purifier repair', 'Reverse osmosis membrane replacement',
      'Water TDS measurement', 'UV and UF water purification',
      'Commercial RO plant installation', 'Water quality in Patna, Bihar',
    ],
    hasCredential: a.credentials.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional experience',
      name: c,
    })),
    workLocation: { '@type': 'Place', name: 'Patna, Bihar, India' },
  };
}

/**
 * HowTo schema — eligible for the step-by-step rich result and heavily used
 * by AI answer engines, which quote procedural content more readily than prose.
 */
export function howToSchema(h: {
  name: string;
  description: string;
  totalTime: string;
  steps: { name: string; text: string }[];
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: h.name,
    description: h.description,
    totalTime: h.totalTime,
    step: h.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
