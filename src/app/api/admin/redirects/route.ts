/**
 * Admin CRUD for URL redirects.
 *
 * GET    /api/admin/redirects  — list
 * POST   /api/admin/redirects  — create or update one
 * DELETE /api/admin/redirects  — remove one (?from=/old-path)
 *
 * Why this exists: the `redirects` table was in the schema from day one but
 * nothing read or wrote it. On 18 Aug 2026 four product slugs were renamed and
 * every old URL — already indexed by Google — started returning 404, throwing
 * away the ranking each had earned. Product renames now write a redirect
 * automatically, and this endpoint lets the admin add or fix one by hand.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/server/services/audit.service';

function guard(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/** Normalise to a leading-slash, no-trailing-slash, lowercase path. */
function normalisePath(p: string): string {
  let s = p.trim().toLowerCase();
  if (s.startsWith('http')) {
    try { s = new URL(s).pathname; } catch { /* keep as typed */ }
  }
  if (!s.startsWith('/')) s = `/${s}`;
  s = s.replace(/\/+$/, '');
  return s || '/';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  return NextResponse.json({ redirects });
}

const bodySchema = z.object({
  fromPath: z.string().min(2).max(300),
  toPath: z.string().min(1).max(300),
  statusCode: z.number().int().refine((n) => n === 301 || n === 302, '301 ya 302 hi ho sakta hai').default(301),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 422 },
    );
  }

  const fromPath = normalisePath(parsed.data.fromPath);
  const toPath = normalisePath(parsed.data.toPath);

  if (fromPath === toPath) {
    return NextResponse.json({ message: 'From aur To same nahi ho sakte — loop ban jayega' }, { status: 422 });
  }

  // Guard against a two-hop loop: A→B where B→A already exists.
  const reverse = await prisma.redirect.findUnique({ where: { fromPath: toPath } });
  if (reverse && normalisePath(reverse.toPath) === fromPath) {
    return NextResponse.json(
      { message: `Loop ban jayega: ${toPath} pehle se ${reverse.toPath} pe ja raha hai` },
      { status: 422 },
    );
  }

  const redirect = await prisma.redirect.upsert({
    where: { fromPath },
    update: { toPath, statusCode: parsed.data.statusCode },
    create: { fromPath, toPath, statusCode: parsed.data.statusCode },
  });

  await logAudit({
    actorId: session!.user.id,
    action: 'redirect.upsert',
    entityType: 'REDIRECT',
    entityId: redirect.id,
    afterData: redirect,
  });

  try { revalidatePath(fromPath); } catch { /* ISR catches up */ }

  return NextResponse.json({ success: true, redirect });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session?.user?.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const from = req.nextUrl.searchParams.get('from');
  if (!from) return NextResponse.json({ message: '?from= chahiye' }, { status: 400 });

  const fromPath = normalisePath(from);
  await prisma.redirect.deleteMany({ where: { fromPath } });

  await logAudit({
    actorId: session!.user.id,
    action: 'redirect.delete',
    entityType: 'REDIRECT',
    entityId: fromPath,
  });

  return NextResponse.json({ success: true });
}
