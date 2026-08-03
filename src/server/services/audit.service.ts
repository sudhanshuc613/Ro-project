/**
 * Audit trail — every admin mutation is recorded.
 * Required for accountability once you have staff accounts touching pricing,
 * stock, and order status.
 */
import { prisma } from '@/lib/db/prisma';
import { headers } from 'next/headers';

interface AuditArgs {
  actorId?: string | null;
  action: string;            // 'product.create' | 'order.status_change' | 'seo.update'
  entityType: string;        // 'PRODUCT' | 'ORDER' | 'SERVICE_REQUEST'
  entityId?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
}

/** Never throws — an audit failure must not roll back the business action. */
export async function logAudit({
  actorId,
  action,
  entityType,
  entityId,
  beforeData,
  afterData,
}: AuditArgs): Promise<void> {
  try {
    let ip: string | undefined;
    let userAgent: string | undefined;
    try {
      const h = headers();
      ip = h.get('x-forwarded-for')?.split(',')[0]?.trim();
      userAgent = h.get('user-agent') ?? undefined;
    } catch {
      /* called outside a request context (cron) */
    }

    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        entityType,
        entityId: entityId ?? null,
        beforeData: sanitize(beforeData) as never,
        afterData: sanitize(afterData) as never,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[audit] failed to write log', err);
  }
}

/** Strip secrets and huge blobs before persisting. */
const REDACT = ['passwordHash', 'password', 'gatewaySignature', 'accessToken', 'otp'];

function sanitize(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data ?? null;
  const clone = JSON.parse(JSON.stringify(data, (key, value) =>
    REDACT.includes(key) ? '[REDACTED]' : value,
  ));
  const str = JSON.stringify(clone);
  return str.length > 20000 ? { _truncated: true, preview: str.slice(0, 2000) } : clone;
}

export async function getAuditTrail(entityType: string, entityId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: { actor: { select: { fullName: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
