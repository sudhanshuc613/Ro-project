/**
 * RANK SERVICE — live competitor and ranking intelligence for the admin panel.
 * ────────────────────────────────────────────────────────────────────────────
 * What this answers, on demand, from the admin dashboard:
 *   • Where does rokadoctor.in rank right now for the keywords that matter?
 *   • Who is above us, and what did they change?
 *   • Which competitors are running ads on our keywords?
 *   • What should I do next to move up — ranked by impact?
 *
 * How it works, and its honest limits:
 *   • Results come from the DuckDuckGo HTML endpoint. It is free, needs no API
 *     key, and returns an unpersonalised result set. It is NOT Google, so
 *     treat positions as a directional signal, not gospel. Google's own SERP
 *     is personalised by location and history and cannot be scraped reliably
 *     or legally at scale.
 *   • Ad detection is best-effort. DuckDuckGo surfaces far fewer ads than
 *     Google, so "no ads detected" does not prove a competitor is not paying.
 *     What IS reliable here is the competitor page audit — word count, schema
 *     count, title, internal links — because that reads their live HTML.
 *
 * History is stored in `site_settings` under a single JSON key, so this needs
 * no schema migration and cannot break an existing table.
 */
import { prisma } from '@/lib/db/prisma';
import { BRAND } from '@/lib/constants';

const HISTORY_KEY = 'rank_history';
const OWN_DOMAIN = 'rokadoctor.in';

/** Keywords that actually drive this business, grouped by intent. */
export const TRACKED_KEYWORDS = [
  // Core service — these pay the bills
  { q: 'ro service in patna', group: 'Core service', weight: 10 },
  { q: 'ro repair patna', group: 'Core service', weight: 10 },
  { q: 'water purifier repair patna', group: 'Core service', weight: 9 },
  { q: 'ro service centre patna', group: 'Core service', weight: 8 },
  { q: 'ro installation patna', group: 'Core service', weight: 7 },
  { q: 'water purifier service patna', group: 'Core service', weight: 8 },
  // Area — proximity is ~55% of local ranking, so these matter individually
  { q: 'ro service kankarbagh', group: 'Area', weight: 6 },
  { q: 'ro service boring road patna', group: 'Area', weight: 6 },
  { q: 'ro repair rajendra nagar patna', group: 'Area', weight: 5 },
  { q: 'ro service danapur', group: 'Area', weight: 5 },
  { q: 'ro service patliputra colony', group: 'Area', weight: 5 },
  // Brand + city
  { q: 'kent ro service patna', group: 'Brand', weight: 7 },
  { q: 'aquaguard service patna', group: 'Brand', weight: 7 },
  { q: 'pureit service centre patna', group: 'Brand', weight: 5 },
  { q: 'livpure service patna', group: 'Brand', weight: 4 },
  // Commercial — highest ticket value per lead
  { q: 'commercial ro plant patna', group: 'Commercial', weight: 6 },
  { q: 'ro plant installation patna', group: 'Commercial', weight: 5 },
  // Pan-India e-commerce
  { q: 'ro spare parts online', group: 'E-commerce', weight: 5 },
  { q: 'ro membrane price india', group: 'E-commerce', weight: 4 },
  { q: 'ro booster pump price', group: 'E-commerce', weight: 4 },
  { q: 'buy ro water purifier online', group: 'E-commerce', weight: 3 },
] as const;

/** Known local competitors, measured earlier in this project. */
export const KNOWN_COMPETITORS = [
  'roservicecentrepatna.in',
  'patnaaquacare.com',
  'roservicecenterpatna.com',
  'rosaleandservices.com',
  'rocareindia.com',
  'roserviceinpatna.com',
  'roservicebihar.com',
  'urbancompany.com',
  'justdial.com',
  'indiamart.com',
  'sulekha.com',
] as const;

export interface SerpRow { position: number; domain: string; url: string; title: string }
export interface KeywordResult {
  keyword: string;
  group: string;
  weight: number;
  ourPosition: number | null;
  previousPosition?: number | null;
  results: SerpRow[];
  adsDetected: string[];
  checkedAt: string;
  error?: string;
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36';

function domainOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

/** Query the DuckDuckGo HTML endpoint and parse the organic results. */
async function fetchSerp(keyword: string): Promise<{ rows: SerpRow[]; ads: string[]; error?: string }> {
  try {
    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      body: new URLSearchParams({ q: keyword, kl: 'in-en' }).toString(),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
    });

    if (!res.ok) return { rows: [], ads: [], error: `HTTP ${res.status}` };
    const html = await res.text();

    /*
     * DuckDuckGo answers a rate-limited request with HTTP 202 and a body that
     * contains no results, rather than an error status. If we did not detect
     * that, every keyword would silently report "not ranked" and the trend
     * chart would show a rank collapse that never happened.
     */
    if (res.status === 202 || html.length < 2000 || /anomaly|unusual traffic|captcha/i.test(html)) {
      return {
        rows: [],
        ads: [],
        error: 'BLOCKED: search engine ne rate-limit kar diya — thodi der baad try karo',
      };
    }

    const rows: SerpRow[] = [];
    const seen = new Set<string>();

    // DuckDuckGo wraps every outbound link in /l/?uddg=<encoded>
    const linkRe = /uddg=([^&"']+)[^>]*>(.*?)<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html)) !== null && rows.length < 15) {
      let url: string;
      try {
        url = decodeURIComponent(m[1]);
      } catch {
        continue;
      }
      const d = domainOf(url);
      if (!d || seen.has(d)) continue;
      if (d.includes('duckduckgo.com')) continue;
      seen.add(d);
      const title = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
      rows.push({ position: rows.length + 1, domain: d, url, title });
    }

    // Ad blocks on the HTML endpoint carry a `badge--ad` class.
    const ads: string[] = [];
    const adRe = /badge--ad[\s\S]{0,900}?uddg=([^&"']+)/g;
    let a: RegExpExecArray | null;
    while ((a = adRe.exec(html)) !== null) {
      try {
        const d = domainOf(decodeURIComponent(a[1]));
        if (d && !ads.includes(d)) ads.push(d);
      } catch { /* ignore */ }
    }

    return { rows, ads };
  } catch (err) {
    return { rows: [], ads: [], error: (err as Error).message };
  }
}

/* ── Stored history ───────────────────────────────────────────────────────── */
interface HistoryEntry { date: string; positions: Record<string, number | null> }

async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: HISTORY_KEY } });
    const val = row?.value as unknown;
    return Array.isArray(val) ? (val as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeHistory(entries: HistoryEntry[]): Promise<void> {
  try {
    // Keep the last 60 runs — enough for a trend, small enough for one JSON row.
    const trimmed = entries.slice(-60);
    await prisma.siteSetting.upsert({
      where: { key: HISTORY_KEY },
      update: { value: trimmed as never },
      create: {
        key: HISTORY_KEY,
        value: trimmed as never,
        description: 'Keyword rank history captured by the admin Competitor Watch tool',
      },
    });
  } catch (err) {
    console.error('[rank.service] history write failed', err);
  }
}

/** Run a rank check across selected keyword groups. */
export async function runRankCheck(groups?: string[]): Promise<{
  results: KeywordResult[];
  summary: {
    checked: number; ranked: number; top3: number; top10: number;
    notRanked: number; avgPosition: number | null;
    /** How many keywords came back rate-limited rather than genuinely unranked. */
    blocked: number;
    /** False when too much of the run was blocked to trust the numbers. */
    usable: boolean;
  };
}> {
  const list = groups?.length
    ? TRACKED_KEYWORDS.filter((k) => groups.includes(k.group))
    : TRACKED_KEYWORDS;

  const history = await readHistory();
  const last = history.at(-1)?.positions ?? {};
  const results: KeywordResult[] = [];

  // Sequential with a small delay — hammering the endpoint gets us blocked,
  // and a blocked scrape returns empty results that look like a rank crash.
  for (const kw of list) {
    const { rows, ads, error } = await fetchSerp(kw.q);
    const hit = rows.find((r) => r.domain.includes(OWN_DOMAIN));
    results.push({
      keyword: kw.q,
      group: kw.group,
      weight: kw.weight,
      ourPosition: hit?.position ?? null,
      previousPosition: last[kw.q] ?? null,
      results: rows.slice(0, 10),
      adsDetected: ads,
      checkedAt: new Date().toISOString(),
      error,
    });
    await new Promise((r) => setTimeout(r, 900));
  }

  /*
   * A blocked scrape returns zero results for every keyword, which looks
   * exactly like "we lost every ranking overnight". Recording that would
   * poison the trend chart permanently, so we only write history when the run
   * actually produced data — and we tell the admin plainly when it did not.
   */
  const withData = results.filter((r) => r.results.length > 0).length;
  const blocked = results.filter((r) => r.error?.startsWith('BLOCKED')).length;
  const usable = withData >= Math.max(1, Math.floor(results.length * 0.5));

  if (usable) {
    const positions: Record<string, number | null> = {};
    for (const r of results) positions[r.keyword] = r.ourPosition;
    await writeHistory([...history, { date: new Date().toISOString(), positions }]);
  }

  const ranked = results.filter((r) => r.ourPosition !== null);
  return {
    results,
    summary: {
      checked: results.length,
      ranked: ranked.length,
      top3: ranked.filter((r) => (r.ourPosition ?? 99) <= 3).length,
      top10: ranked.filter((r) => (r.ourPosition ?? 99) <= 10).length,
      notRanked: results.length - ranked.length,
      avgPosition: ranked.length
        ? Math.round((ranked.reduce((s, r) => s + (r.ourPosition ?? 0), 0) / ranked.length) * 10) / 10
        : null,
      blocked,
      usable,
    },
  };
}

/* ── Competitor page audit ────────────────────────────────────────────────── */
export interface CompetitorAudit {
  domain: string;
  url: string;
  reachable: boolean;
  httpStatus?: number;
  title?: string;
  titleLength?: number;
  metaDescription?: string;
  h1?: string;
  wordCount?: number;
  schemaTypes: string[];
  schemaCount: number;
  internalLinks?: number;
  hasPhone: boolean;
  hasWhatsApp: boolean;
  loadMs?: number;
  error?: string;
}

/** Fetch a competitor's page and measure what they actually ship. */
export async function auditCompetitor(domain: string, path = '/'): Promise<CompetitorAudit> {
  const url = domain.startsWith('http') ? domain : `https://${domain}${path}`;
  const started = Date.now();

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-IN,en;q=0.9' },
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
      redirect: 'follow',
    });
    const loadMs = Date.now() - started;

    if (!res.ok) {
      return {
        domain: domainOf(url), url, reachable: false, httpStatus: res.status,
        schemaTypes: [], schemaCount: 0, hasPhone: false, hasWhatsApp: false, loadMs,
      };
    }

    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim();
    const desc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1];
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();

    const schemaTypes = [
      ...new Set(
        [...html.matchAll(/"@type"\s*:\s*"([A-Za-z]+)"/g)].map((x) => x[1]),
      ),
    ];
    const schemaCount = (html.match(/"@type"\s*:/g) ?? []).length;

    const host = domainOf(url);
    const internalLinks = [...html.matchAll(/href=["']([^"']+)["']/g)].filter((x) => {
      const h = x[1];
      return h.startsWith('/') || h.includes(host);
    }).length;

    return {
      domain: host,
      url,
      reachable: true,
      httpStatus: res.status,
      title,
      titleLength: title?.length,
      metaDescription: desc?.slice(0, 200),
      h1: h1 || '(empty)',
      wordCount: text.split(' ').filter(Boolean).length,
      schemaTypes,
      schemaCount,
      internalLinks,
      hasPhone: /tel:\+?\d{6,}/i.test(html),
      hasWhatsApp: /wa\.me|api\.whatsapp\.com/i.test(html),
      loadMs,
    };
  } catch (err) {
    return {
      domain: domainOf(url), url, reachable: false,
      schemaTypes: [], schemaCount: 0, hasPhone: false, hasWhatsApp: false,
      error: (err as Error).message,
    };
  }
}

/* ── Recommendations ──────────────────────────────────────────────────────── */
export interface Recommendation {
  priority: 'critical' | 'high' | 'medium';
  title: string;
  why: string;
  action: string;
  effort: 'ek shaam' | 'kuch din' | 'lagataar';
}

/**
 * Turn measurements into an ordered to-do list.
 * Everything here is derived from the run, not a static checklist.
 */
export function buildRecommendations(
  results: KeywordResult[],
  ourAudit?: CompetitorAudit,
  competitorAudits: CompetitorAudit[] = [],
): Recommendation[] {
  const recs: Recommendation[] = [];

  /*
   * If the run was mostly blocked, every "not ranked" is a false alarm.
   * Advising action on fake data is worse than advising nothing.
   */
  const usableResults = results.filter((r) => r.results.length > 0);
  if (usableResults.length < Math.max(1, Math.floor(results.length * 0.5))) {
    return [{
      priority: 'critical',
      title: 'Ye check bharosemand nahi — search engine ne block kar diya',
      why: `${results.length} me se sirf ${usableResults.length} keyword ka data mila. Baaki rate-limit ho gaye. "Nahi mile" ka matlab yahan ranking girna NAHI hai.`,
      action: '10-15 minute ruk ke dobara chalao, ya ek waqt me sirf ek keyword group chunno.',
      effort: 'ek shaam',
    }];
  }

  /* 1. Keywords where we are absent but competitors rank */
  const missing = results
    .filter((r) => r.ourPosition === null && r.results.length > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  for (const m of missing) {
    const top = m.results[0]?.domain ?? 'competitor';
    recs.push({
      priority: m.weight >= 8 ? 'critical' : 'high',
      title: `"${m.keyword}" pe hum kahin nahi hain`,
      why: `Is search me top 10 me hamara naam nahi aata. Abhi #1 pe ${top} hai. Ye ${m.group.toLowerCase()} keyword hai, weight ${m.weight}/10.`,
      action:
        m.group === 'Area'
          ? `Us area ka page kholo, ussi area ka landmark, pincode aur TDS likho. Phir Search Console → URL Inspection → Request indexing.`
          : m.group === 'E-commerce'
            ? `Category page pe is keyword ko heading aur buying guide me natural tarike se daalo.`
            : `Ek dedicated page banao jisme ye exact phrase H1 aur pehle paragraph me ho.`,
      effort: 'kuch din',
    });
  }

  /* 2. Keywords where we are close to the top — cheapest wins */
  const nearMiss = results
    .filter((r) => r.ourPosition !== null && r.ourPosition > 3 && r.ourPosition <= 8)
    .sort((a, b) => (a.ourPosition ?? 99) - (b.ourPosition ?? 99));

  for (const n of nearMiss.slice(0, 3)) {
    const above = n.results.filter((r) => r.position < (n.ourPosition ?? 99)).map((r) => r.domain);
    recs.push({
      priority: 'high',
      title: `"${n.keyword}" pe hum #${n.ourPosition} hain — top 3 paas hai`,
      why: `Upar sirf ${above.length} site hain: ${above.slice(0, 3).join(', ')}. Position 4-8 se 1-3 me aana sabse sasta jump hai, kyunki page pehle se rank kar raha hai.`,
      action: `Us page pe is exact phrase ko H1 aur pehle 100 shabdon me daalo, 2-3 internal link us page pe bhejo, aur 2 nayi FAQ add karo.`,
      effort: 'ek shaam',
    });
  }

  /* 3. Position lost since the last run */
  const dropped = results.filter(
    (r) =>
      r.ourPosition !== null &&
      r.previousPosition != null &&
      r.ourPosition > r.previousPosition + 1,
  );
  for (const d of dropped.slice(0, 3)) {
    recs.push({
      priority: 'critical',
      title: `"${d.keyword}" gir gaya: #${d.previousPosition} → #${d.ourPosition}`,
      why: `Pichhli check se ${(d.ourPosition ?? 0) - (d.previousPosition ?? 0)} position neeche. Ya to competitor ne kuch kiya, ya hamare page pe kuch toota.`,
      action: `Us page ko kholo, dekho 200 OK deta hai ya nahi, title/description theek hai ya nahi. Phir upar wale competitor ko Competitor Audit me daal ke dekho unhone kya badla.`,
      effort: 'ek shaam',
    });
  }

  /* 4. Ads spotted on our keywords */
  const withAds = results.filter((r) => r.adsDetected.length > 0);
  if (withAds.length > 0) {
    const advertisers = [...new Set(withAds.flatMap((r) => r.adsDetected))];
    recs.push({
      priority: 'medium',
      title: `${advertisers.length} competitor hamare keywords pe ad chala rahe hain`,
      why: `Ad dikhe: ${advertisers.slice(0, 4).join(', ')}. Yaad rakho — paid ads sirf 19% clicks lete hain. Map Pack 44% aur organic 29% leta hai, aur wahan paisa nahi chalta.`,
      action: `Unke ad se ladne mat jao. GBP aur reviews pe kaam karo — wo 73% wala hissa hai jahan paisa kaam nahi aata.`,
      effort: 'lagataar',
    });
  }

  /* 5. Content gap against the strongest competitor */
  if (ourAudit?.wordCount && competitorAudits.length > 0) {
    const stronger = competitorAudits
      .filter((c) => c.reachable && (c.wordCount ?? 0) > (ourAudit.wordCount ?? 0))
      .sort((a, b) => (b.wordCount ?? 0) - (a.wordCount ?? 0));

    if (stronger.length > 0) {
      const top = stronger[0];
      recs.push({
        priority: 'medium',
        title: `${top.domain} ke page pe ${top.wordCount} shabd hain, hamare pe ${ourAudit.wordCount}`,
        why: `Content depth ranking factor hai. Farak ${(top.wordCount ?? 0) - (ourAudit.wordCount ?? 0)} shabd ka hai.`,
        action: `Andha-dhundh shabd mat bharo. 2-3 asli sawal jodo jo customer phone pe poochta hai — wahi content Google ko sabse pasand aata hai.`,
        effort: 'kuch din',
      });
    }

    const betterSchema = competitorAudits.filter(
      (c) => c.reachable && c.schemaCount > (ourAudit.schemaCount ?? 0),
    );
    if (betterSchema.length > 0) {
      recs.push({
        priority: 'medium',
        title: `${betterSchema[0].domain} ke paas ${betterSchema[0].schemaCount} schema blocks hain, hamare ${ourAudit.schemaCount}`,
        why: `Schema se rich results milte hain — star rating, FAQ, price. Wo SERP me jagah ghereta hai aur CTR badhata hai.`,
        action: `Dekho unke paas kaunsa type hai jo hamare paas nahi: ${betterSchema[0].schemaTypes.filter((t) => !(ourAudit.schemaTypes ?? []).includes(t)).slice(0, 5).join(', ') || '—'}`,
        effort: 'kuch din',
      });
    }
  }

  /* 6. Always-on reminder of where local ranking actually comes from */
  const top3Count = results.filter((r) => (r.ourPosition ?? 99) <= 3).length;
  if (top3Count < results.length / 2) {
    recs.push({
      priority: 'high',
      title: 'Website ka kaam ho chuka — ab GBP aur reviews hi bacha hai',
      why: `Local ranking me website ka hissa sirf 19% hai. GBP 32% aur reviews 20% hain — aur home services me reviews ka weight 36% tak jaata hai. Ye dono website se nahi, tere haath se hote hain.`,
      action: `Har kaam ke turant baad WhatsApp pe Google review link bhejo. Har review ka 24 ghante me jawab do. Hafte me 6 asli photo GBP pe daalo.`,
      effort: 'lagataar',
    });
  }

  const order = { critical: 0, high: 1, medium: 2 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
}

/** Trend data for the dashboard chart. */
export async function getRankHistory(): Promise<HistoryEntry[]> {
  return readHistory();
}

export const OUR_DOMAIN = OWN_DOMAIN;
export const OUR_URL = BRAND.url;
