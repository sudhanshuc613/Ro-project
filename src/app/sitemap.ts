import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';
import { BRAND } from '@/lib/constants';
import { SERVICE_AREAS, SERVICED_BRANDS } from '@/lib/seo/patna-service-data';
import { getPosts, AUTHOR } from '@/lib/seo/blog-data';
import { areaPath } from '@/lib/seo/area-url';
import { SERVICE_INTENTS } from '@/lib/seo/service-intent-data';
import { SYMPTOMS } from '@/lib/seo/symptom-data';
import {
  contentDate,
  intentDate,
  BRAND_NOTICE_DATE,
  SYMPTOM_PAGES_DATE,
  AREA_PAGES_DATE,
  BRAND_PAGES_DATE,
  AUTHOR_PAGE_DATE,
} from '@/lib/seo/content-dates';

/* 🔴 25 Oct 2026 — 3600 se 60.
   Owner ne product add kiya aur wo sitemap me ghanto nahi aaya.
   Wajah: `revalidatePath('/sitemap.xml')` Next.js ke METADATA ROUTE
   (app/sitemap.ts) par kaam KARTA HI NAHI. Maine dono tarike naape —
   `revalidatePath('/sitemap.xml')` aur `revalidatePath('/sitemap.xml','page')`
   — 25 second tak sitemap 143 URL par hi atka raha, naya product nahi aaya.
   Matlab product API se sitemap ko turant refresh karna sambhav nahi hai;
   sirf ISR hi ise naya banata hai, aur wo 1 GHANTA tha.

   Isliye window 60 second kar di. Naya product 1 minute me sitemap me aa
   jayega. Kharcha bhi bandha hua hai — ek minute me chahe 1000 request aayein,
   DB query sirf EK BAAR chalti hai (2 chhoti query: product slug/updatedAt
   aur category). force-dynamic nahi kiya, kyunki tab HAR request par DB
   query hoti aur bot traffic seedha DB par padta. */
/* 🔴 4 Nov 2026 — YE 60 HI REHEGA. Badalne ki koshish ki thi, WAPAS KI.
 *
 * Baaki 5 route ka timer badhaya gaya (Vercel CPU 90%). Sitemap bhi 900
 * karne ki koshish ki, par `verify-product-visibility` ne turant pakad liya:
 *
 *     FAIL  /sitemap.xml  ->  90s me bhi NAHI 🔴
 *
 * Wajah: sitemap Next.js ka METADATA ROUTE hai. Code pehle se
 * `revalidatePath('/sitemap.xml')` call karta hai (products API me), par
 * wo is route par kaam nahi karta — ye pehle naap kar likha gaya tha aur
 * aaj dobara sabit hua. Yaani is EK route par 60-second timer hi
 * ikloata tarika hai jisse naya product jaldi sitemap me aata hai.
 *
 * Bachat ka hisaab, taaki aage koi dobara ye koshish na kare:
 *     sitemap 60 -> 900   bachata  40,320 regen/mahina
 *     baaki 5 route        bachate 103,360 regen/mahina
 * Yaani 103,360 (65%) bina kisi nuksan ke mil rahe hain. Baaki 40,320 ke
 * liye naya product sitemap me 15 minute late jaata — wo sauda theek nahi.
 *
 * 🔴 Gate ko dheela MAT karna. Agar kabhi Next.js metadata route par
 *    revalidatePath support kar de, tab ye 900 ho sakta hai — pehle
 *    verify-product-visibility chala kar sabit karna.
 */
export const revalidate = 60;

/** Policy page banne ki date — content badle to ye bhi badlo. */
const POLICY_DATE = new Date('2026-10-25T00:00:00.000Z');
/* 🔴 6 Nov 2026 — /privacy-policy me naya hissa juda: "Google ke tag —
   analytics aur ads". Content badla hai to lastmod bhi badalna hai, warna
   Google ko purani date dikhegi aur wo dobara crawl karne ki jaldi nahi
   karega. Baaki teen policy page waise ke waise hain, isliye unki date
   JAAN BOOJH KAR nahi chhedi — jhoothi date bhi utni hi buri hai.
   Ye galti main 2 Nov aur 3 Nov ko do baar kar chuka hoon. */
const PRIVACY_DATE = new Date('2026-11-06T00:00:00.000Z');
/** Terms + About Us banne ki date (2 Nov 2026). */
const TRUST_PAGE_DATE = new Date('2026-11-02T00:00:00.000Z');

/**
 * ── 19 Sep 2026: lastmod ab SACH bolta hai ────────────────────────────────
 * Pehle har URL pe `lastModified: new Date()` tha. `revalidate = 3600` ke
 * saath iska matlab: har ghante 133 URLs ka lastmod badal jata tha, chahe
 * content mahino se same ho. Google aisa lastmod PURI SITE ke liye ignore
 * kar deta hai ("consistently and verifiably accurate" hona chahiye) —
 * yaani jab hum sach me kuch update karte the, wo signal Google tak
 * pahunchta hi nahi tha.
 *
 * Ab har page apni asli content-change date bhejta hai (src/lib/seo/
 * content-dates.ts). Jiski date pata nahi, wo lastmod bhejta hi nahi —
 * field chhod dena jhooth bolne se behtar hai.
 *
 * `priority` aur `changeFrequency` Google officially IGNORE karta hai, par
 * ye valid fields hain aur Bing/Yandex padh sakte hain — isliye chhode gaye
 * hain. Inko hatana alag decision hai, is fix ka hissa nahi.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BRAND.url}/`, lastModified: contentDate('/'), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BRAND.url}/service-patna`, lastModified: contentDate('/service-patna'), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BRAND.url}/service-patna/brand`, lastModified: contentDate('/service-patna/brand'), changeFrequency: 'weekly', priority: 0.85 },
    /* Service-intent hub — the third axis alongside place and brand. */
    { url: `${BRAND.url}/ro-services-patna`, lastModified: contentDate('/ro-services-patna'), changeFrequency: 'weekly', priority: 0.9 },
    /* Answer hub — QAPage + speakable spans for retrieval engines. The live
       robots.txt allows OAI-SearchBot, PerplexityBot and Bingbot, so this is
       the page they can actually quote from. */
    { url: `${BRAND.url}/ro-service-patna-faq`, lastModified: contentDate('/ro-service-patna-faq'), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BRAND.url}/products`, lastModified: contentDate('/products'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BRAND.url}/amc-plans`, lastModified: contentDate('/amc-plans'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BRAND.url}/contact`, lastModified: contentDate('/contact'), changeFrequency: 'yearly', priority: 0.5 },
    /* 🔴 25 Oct 2026 — 4 asli policy page. Pehle footer ke ye chaaron link
       /contact par jaate the (145 page x 4 = 580 andaruni link ek galat
       anchor ke saath). Ab inke apne URL hain, isliye sitemap me bhi. */
    { url: `${BRAND.url}/shipping-policy`, lastModified: POLICY_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BRAND.url}/returns-refunds`, lastModified: POLICY_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BRAND.url}/warranty-terms`, lastModified: POLICY_DATE, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BRAND.url}/privacy-policy`, lastModified: PRIVACY_DATE, changeFrequency: 'yearly', priority: 0.3 },
    /* 🔴 2 Nov 2026 — Google Ads "Unacceptable business practices" suspension
       ke baad do aur page. Google ka reviewer sabse pehle yahi dhoondhta hai:
       hum kaun hain (about-us) aur shartein kya hain (terms). */
    { url: `${BRAND.url}/terms`, lastModified: TRUST_PAGE_DATE, changeFrequency: 'yearly', priority: 0.4 },
    /* 🔴 /about-us BRAND_DISCLAIMER render karta hai, aur wo 3 Nov ko
       bilingual hua. /terms usko render nahi karta, isliye wo 2 Nov par hi
       hai. Dono ko ek hi date dena ek ke liye jhooth hota. */
    { url: `${BRAND.url}/about-us`, lastModified: BRAND_NOTICE_DATE, changeFrequency: 'yearly', priority: 0.5 },
    /* Customer-care / helpline hub — added 9 Oct 2026. Keyword audit: poori
       TRUST category me exact-phrase coverage 0/8 thi. Autocomplete harvest
       (8 Oct) me "customer care number" cluster = 117 queries, aur Patna ka
       koi competitor is par nahi hai. rocareindia.com ke paas 804 aise URLs
       hain — matlab cluster asli hai. */
    { url: `${BRAND.url}/ro-customer-care-patna`, lastModified: contentDate('/ro-customer-care-patna'), changeFrequency: 'weekly', priority: 0.9 },
    /* Symptom-query hub. Measured 16 Sep 2026: the Hinglish problem queries
       ("ro me pani nahi aa raha hai") have ZERO websites in the top 5 — only
       YouTube and Facebook. High priority because it is the only part of the
       site with no web competition at all. */
    { url: `${BRAND.url}/ro-problem-checker`, lastModified: contentDate('/ro-problem-checker'), changeFrequency: 'weekly', priority: 0.9 },
  ];

  /* One page per symptom. National reach — these queries carry no city. */
  const symptomPages: MetadataRoute.Sitemap = SYMPTOMS.map((s) => ({
    url: `${BRAND.url}/ro-problem/${s.slug}`,
    lastModified: SYMPTOM_PAGES_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.88,
  }));

  // Local SEO pages — high priority, they drive the service business
  const areaPages: MetadataRoute.Sitemap = SERVICE_AREAS.map((a) => ({
    url: `${BRAND.url}${areaPath(a.slug)}`,
    lastModified: AREA_PAGES_DATE,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  /* Blog + author. These carry the Article and Person schema that the
     top-ranking competitor had and we did not, so they need to be crawled.
     Blog posts already carry a real `updated` date in blog-data.ts — that is
     exactly the kind of honest lastmod Google will actually use. */
  const blogPages: MetadataRoute.Sitemap = [
    { url: `${BRAND.url}/blog`, lastModified: contentDate('/blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BRAND.url}/about/${AUTHOR.slug}`, lastModified: AUTHOR_PAGE_DATE, changeFrequency: 'monthly', priority: 0.6 },
    ...getPosts().map((p) => ({
      url: `${BRAND.url}/blog/${p.slug}`,
      lastModified: new Date(p.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];

  /* Service-intent pages — the JOB axis. High priority because they target
     transactional queries ("ro installation charges in patna") that convert
     harder than informational ones. */
  /* 🔴 3 Nov 2026 — ab har intent apni date bhejta hai (intentDate).
     Naya /ro-service-centre-patna 3 Nov ka hai; baaki 7 abhi bhi 27 Oct ke.
     Sab ko ek hi nayi date dena lastmod me jhooth hota. */
  const intentPages: MetadataRoute.Sitemap = SERVICE_INTENTS.map((s) => ({
    url: `${BRAND.url}${s.path}`,
    lastModified: intentDate(s.slug),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const brandPages: MetadataRoute.Sitemap = SERVICED_BRANDS.map((b) => ({
    url: `${BRAND.url}/service-patna/brand/${b.slug}`,
    lastModified: BRAND_PAGES_DATE,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Catalog — wrapped so a DB outage never breaks the sitemap.
  // These already used real per-row updatedAt, which is correct — kept as is.
  let productPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { slug: true, updatedAt: true },
        take: 5000,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    productPages = products.map((p) => ({
      url: `${BRAND.url}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    categoryPages = categories.map((c) => ({
      url: `${BRAND.url}/category/${c.slug}`,
      /* 🔴 3 Nov 2026 — category page ab BrandNoticeCompact render karta hai.
         DB ka `updatedAt` us badlav ko nahi jaanta (wo 3 Aug par atka hai),
         par page ka content sach me badla hai. Isliye dono me se JO BAAD KA
         ho wahi bheja jaata hai — na kam bolna, na zyada. */
      lastModified: c.updatedAt > BRAND_NOTICE_DATE ? c.updatedAt : BRAND_NOTICE_DATE,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
  } catch (err) {
    console.error('[sitemap] catalog fetch failed', err);
  }

  return [
    ...staticPages, ...symptomPages, ...intentPages, ...areaPages, ...brandPages,
    ...blogPages, ...categoryPages, ...productPages,
  ];
}
