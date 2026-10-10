/**
 * GET  /api/admin/site-images   — abhi ka override map padho
 * PUT  /api/admin/site-images   — ek slot ki image/alt save karo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KYUN (10 Oct 2026)
 * ──────────────────
 * Owner ko har banner aur photo admin se badalni thi, bina deploy ke.
 * Ye route `site_settings` table ke `siteImages` key me ek map rakhta hai:
 *
 *     { "homeHero": { "url": "/api/media/abc", "alt": "..." }, ... }
 *
 * Save hote hi `revalidateTag('settings')` chalta hai, to storefront agle
 * request me hi nayi image dikhane lagta hai.
 *
 * 🔴 SURAKSHA
 * ───────────
 *   • sirf ADMIN / SUPER_ADMIN (wahi guard jo /api/admin/settings par hai)
 *   • slot key sirf IMAGE_SLOTS se — koi apni marzi ki key nahi daal sakta
 *   • URL sirf apni site ka ho sakta hai (/ se shuru) ya hamara media route.
 *     Bahar ka URL block hai — warna koi admin galti se competitor ka ya
 *     tracking-pixel wala URL daal deta aur wo har page par load hota.
 *   • alt text 200 char tak, HTML tag strip
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';
import { IMAGE_SLOTS, type SiteImageMap } from '@/lib/seo/site-images';

const ALLOWED_KEYS = IMAGE_SLOTS.map((s) => s.key);

const guard = (role?: string) => role === 'ADMIN' || role === 'SUPER_ADMIN';

/** Sirf same-origin path. Bahar ka host kabhi nahi. */
const safeUrl = z
  .string()
  .trim()
  .min(1, 'Image chuniye')
  .max(500)
  .refine((v) => v.startsWith('/'), 'Sirf is site ki image chalegi (path "/" se shuru hona chahiye)')
  .refine((v) => !v.startsWith('//'), 'Bahar ka URL allowed nahi')
  .refine((v) => !/[<>"']/.test(v), 'URL me ye characters nahi ho sakte');

const bodySchema = z.object({
  key: z.string().refine((k) => ALLOWED_KEYS.includes(k), 'Unknown image slot'),
  url: safeUrl,
  alt: z
    .string()
    .trim()
    .max(200, 'Alt text 200 character se chhota rakhiye')
    .transform((v) => v.replace(/<[^>]*>/g, '')),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const row = await prisma.siteSetting.findUnique({ where: { key: 'siteImages' } });
  return NextResponse.json({ overrides: (row?.value as unknown as SiteImageMap) ?? {} });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { key, url, alt } = parsed.data;

  const row = await prisma.siteSetting.findUnique({ where: { key: 'siteImages' } });
  const current = ((row?.value as unknown as SiteImageMap) ?? {}) as SiteImageMap;
  const before = current[key];
  const next: SiteImageMap = { ...current, [key]: { url, alt } };

  await prisma.siteSetting.upsert({
    where: { key: 'siteImages' },
    update: { value: next as never },
    create: { key: 'siteImages', value: next as never, description: 'Admin-editable banners and photos' },
  });

  revalidateTag('settings');

  await logAudit({
    actorId: session!.user.id,
    action: `siteImages.${key}.update`,
    entityType: 'SITE_SETTING',
    beforeData: before ?? null,
    afterData: { url, alt },
  }).catch(() => {});

  return NextResponse.json({ ok: true, key, url, alt });
}

/** DELETE — ek slot ko wapas code ke default par le aao */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const key = new URL(req.url).searchParams.get('key') ?? '';
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ message: 'Unknown image slot' }, { status: 400 });
  }
  const row = await prisma.siteSetting.findUnique({ where: { key: 'siteImages' } });
  const current = ((row?.value as unknown as SiteImageMap) ?? {}) as SiteImageMap;
  delete current[key];
  await prisma.siteSetting.upsert({
    where: { key: 'siteImages' },
    update: { value: current as never },
    create: { key: 'siteImages', value: {} as never, description: 'Admin-editable banners and photos' },
  });
  revalidateTag('settings');
  return NextResponse.json({ ok: true, key, reset: true });
}
