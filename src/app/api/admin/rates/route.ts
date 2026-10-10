/**
 * GET / PUT / DELETE  /api/admin/rates
 * ═══════════════════════════════════════════════════════════════════════════
 * Spare parts ka rate admin se badalne ke liye. `site_settings` ke `rateCard`
 * key me save hota hai, aur revalidateTag('settings') se turant live —
 * koi deploy nahi.
 *
 * KYUN: kal motor ka rate ₹900–₹1,600 se ₹1,000–₹2,800 karna pada aur usme
 * ek poora deploy laga. Market ka rate mahine me badalta hai; deploy mahine
 * me nahi hona chahiye.
 *
 * Suraksha: sirf ADMIN/SUPER_ADMIN · part ka naam sirf RATE_KEYS se ·
 * from/to dono positive aur to >= from — warna 422.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';
import { RATE_KEYS, type RateMap } from '@/lib/seo/rate-overrides';

const guard = (r?: string) => r === 'ADMIN' || r === 'SUPER_ADMIN';


const schema = z
  .object({
    part: z.string().refine((p) => RATE_KEYS.includes(p), 'Unknown part'),
    from: z.coerce.number().int().positive('Rate 0 se bada hona chahiye').max(500000),
    to: z.coerce.number().int().positive('Rate 0 se bada hona chahiye').max(500000),
  })
  .refine((v) => v.to >= v.from, {
    message: 'Upar wala rate neeche wale se kam nahi ho sakta',
    path: ['to'],
  });

async function readMap(): Promise<RateMap> {
  const row = await prisma.siteSetting.findUnique({ where: { key: 'rateCard' } });
  return ((row?.value as unknown as RateMap) ?? {}) as RateMap;
}

/**
 * 🔴🔴 11 Oct 2026 — YAHAN EK KHATARNAAK GALTI HUI THI, PADH LENA
 *
 * Maine pehle socha ki `revalidateTag('settings')` kaafi nahi hai aur
 * `revalidatePath('/', 'layout')` jod diya. Test suite ne turant pakda:
 *
 *     /ro-service-in-patna   404
 *     /ro-repair-patna       404
 *     /ro-amc-patna          404     ... saare 6 intent pages mar gaye
 *
 * WAJAH: `src/app/(shop)/[intent]/page.tsx` me `dynamicParams = false` hai
 * (jaan-boojh ke — taaki /koi-bhi-ulta-slug par page na bane). Jab
 * `revalidatePath('/', 'layout')` poore site ka route cache uda deta hai, to
 * un pages ka prerender bhi ud jaata hai — aur `dynamicParams = false` ki
 * wajah se Next unhe DOBARA bana hi nahi sakta. Natija: 404, aur naya deploy
 * kiye bina wapas nahi aate.
 *
 * Matlab: owner banner badalta, aur usi second Google Ads ka landing page
 * (jahan uska paisa lagta hai) 404 ho jaata.
 *
 * ISLIYE SIRF `revalidateTag('settings')`. Yeh tag `getSiteImages()` /
 * `getRateCard()` ke `unstable_cache` par laga hai, aur Next in tags ko
 * route cache tak le jaata hai — yaani jo page ye data padhte hain unka HTML
 * bhi dobara ban jaata hai, bina kisi doosre page ko chhue.
 *
 * NIYAM: is project me `revalidatePath('/', 'layout')` kabhi mat likhna.
 */
function purgeSettingsCache() {
  revalidateTag('settings');
}

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ overrides: await readMap() });
}

export async function PUT(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { part, from, to } = parsed.data;
  const current = await readMap();
  const before = current[part];
  const next: RateMap = { ...current, [part]: { from, to } };

  await prisma.siteSetting.upsert({
    where: { key: 'rateCard' },
    update: { value: next as never },
    create: { key: 'rateCard', value: next as never, description: 'Admin-editable spare part rates' },
  });
  purgeSettingsCache();
  await logAudit({
    actorId: s!.user.id,
    action: 'rateCard.update',
    entityType: 'SITE_SETTING',
    beforeData: before ?? null,
    afterData: { part, from, to },
  }).catch(() => {});

  return NextResponse.json({ ok: true, part, from, to });
}

export async function DELETE(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!guard(s?.user?.role)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const part = new URL(req.url).searchParams.get('part') ?? '';
  if (!RATE_KEYS.includes(part)) return NextResponse.json({ message: 'Unknown part' }, { status: 400 });
  const current = await readMap();
  delete current[part];
  await prisma.siteSetting.upsert({
    where: { key: 'rateCard' },
    update: { value: current as never },
    create: { key: 'rateCard', value: {} as never, description: 'Admin-editable spare part rates' },
  });
  purgeSettingsCache();
  return NextResponse.json({ ok: true, part, reset: true });
}
