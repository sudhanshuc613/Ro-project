/**
 * POST /api/service-requests   — public endpoint powering the Patna booking form
 * GET  /api/service-requests   — admin/staff listing (filtered, paginated)
 *
 * Flow on POST:
 *   validate → rate-limit by IP+phone → generate ticket → persist →
 *   upsert CRM user → auto-assign technician (best-fit) →
 *   WhatsApp to customer + both admin numbers → return ticket instantly.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { getOtpSettings } from '@/lib/settings';
import { consumeVerification, isPhoneVerified } from '@/server/services/otp.service';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/db/redis';
import { sendWhatsApp } from '@/lib/integrations/whatsapp';
import { generateTicketNumber } from '@/lib/utils/format';
import { autoAssignTechnician } from '@/server/services/service.service';
import { CONTACT, SERVICE } from '@/lib/constants';

const serviceRequestSchema = z.object({
  customerName:     z.string().trim().min(2).max(120),
  customerPhone:    z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  /** Proof-of-phone token from /api/auth/otp, when verification is enabled. */
  verificationToken: z.string().trim().max(80).optional(),
  altPhone:         z.string().regex(/^[6-9]\d{9}$/).optional().or(z.literal('')),
  customerEmail:    z.string().email().optional().or(z.literal('')),
  addressLine:      z.string().trim().min(10).max(320),
  landmark:         z.string().max(160).optional().or(z.literal('')),
  area:             z.string().max(120).optional().or(z.literal('')),
  pincode:          z.string().regex(/^\d{6}$/),
  serviceType:      z.enum(['REPAIR','INSTALLATION','AMC_VISIT','FILTER_CHANGE','WATER_TEST','UNINSTALL_SHIFT']).default('REPAIR'),
  machineBrand:     z.string().max(80).optional().or(z.literal('')),
  machineModel:     z.string().max(120).optional().or(z.literal('')),
  issueCategory:    z.string().max(80).optional().or(z.literal('')),
  issueDescription: z.string().trim().min(10).max(2000),
  preferredDate:    z.string().optional().or(z.literal('')),
  preferredSlot:    z.string().max(24).optional().or(z.literal('')),
  source:           z.string().default('WEBSITE_FORM'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = serviceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Please check the form fields.', errors: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const data = parsed.data;

    // ── Abuse protection: 3 requests / 10 min per phone+IP ──
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const allowed = await rateLimit(`svc:${data.customerPhone}:${ip}`, 3, 600);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: `Too many requests. Please call us at ${CONTACT.primaryPhone}.` },
        { status: 429 },
      );
    }

    /* ── Phone verification ──────────────────────────────────────────────
       A fake booking costs a real technician trip — fuel, an hour, and a slot
       another customer could have had. Booking needs no account, so this is
       the only check standing between the business and that loss.

       Enforced server-side: hiding the form field client-side would stop
       nobody who can open devtools. */
    const otpCfg = await getOtpSettings();
    let phoneWasVerified = false;

    if (otpCfg.requireForService && otpCfg.channel !== 'DEV') {
      const known = otpCfg.skipIfAlreadyVerified && (await isPhoneVerified(data.customerPhone));

      if (!known) {
        const ok = data.verificationToken
          ? await consumeVerification(data.verificationToken, data.customerPhone, 'SERVICE_BOOKING')
          : false;

        if (!ok) {
          return NextResponse.json(
            {
              success: false,
              needsVerification: true,
              message: 'Please verify your mobile number so our technician reaches the right person.',
            },
            { status: 428 }, // Precondition Required
          );
        }
        phoneWasVerified = true;
      } else {
        phoneWasVerified = true; // already-known number
      }
    }

    // ── Serviceability (soft gate: we still capture out-of-area leads) ──
    const pin = await prisma.pincode.findUnique({ where: { pincode: data.pincode } });
    const visitCharge = pin?.visitCharge ?? SERVICE.visitCharge;

    const ticketNumber = await generateTicketNumber('SRV');

    // ── CRM upsert: every service lead becomes a customer record ──
    const user = await prisma.user.upsert({
      where:  { phone: data.customerPhone },
      update: {
        fullName: data.customerName,
        totalServices: { increment: 1 },
        // Verification may have completed before this user row existed (a
        // first-time guest). Stamp it now so we never re-ask this number.
        ...(phoneWasVerified ? { phoneVerifiedAt: new Date() } : {}),
      },
      create: {
        phone: data.customerPhone,
        fullName: data.customerName,
        email: data.customerEmail || null,
        role: 'CUSTOMER',
        acquisitionSource: data.source,
        totalServices: 1,
        ...(phoneWasVerified ? { phoneVerifiedAt: new Date() } : {}),
      },
    });

    const request = await prisma.serviceRequest.create({
      data: {
        ticketNumber,
        userId: user.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        altPhone: data.altPhone || null,
        customerEmail: data.customerEmail || null,
        addressLine: data.addressLine,
        landmark: data.landmark || null,
        area: data.area || null,
        city: pin?.city ?? 'Patna',
        state: pin?.state ?? 'Bihar',
        pincode: data.pincode,
        serviceType: data.serviceType,
        machineBrand: data.machineBrand || null,
        machineModel: data.machineModel || null,
        issueCategory: data.issueCategory || null,
        issueDescription: data.issueDescription,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        preferredSlot: data.preferredSlot || null,
        visitCharge,
        status: 'NEW',
        priority: data.issueCategory === 'NO_WATER' ? 'HIGH' : 'NORMAL',
        source: data.source,
      },
    });

    await prisma.serviceStatusHistory.create({
      data: { requestId: request.id, toStatus: 'NEW', note: `Created via ${data.source}` },
    });

    // ── Best-fit technician auto-assignment (non-blocking) ──
    void autoAssignTechnician(request.id, data.pincode).catch(console.error);

    // ── Notifications (non-blocking; failures never break the UX) ──
    void Promise.allSettled([
      sendWhatsApp({
        to: `91${data.customerPhone}`,
        template: 'service_request_received',
        variables: [data.customerName, ticketNumber, String(visitCharge), CONTACT.primaryPhone],
        relatedType: 'SERVICE_REQUEST',
        relatedId: request.id,
      }),
      ...[CONTACT.primaryPhone, CONTACT.secondaryPhone].map((admin) =>
        sendWhatsApp({
          to: `91${admin}`,
          template: 'admin_new_service_alert',
          variables: [
            ticketNumber, data.customerName, data.customerPhone,
            `${data.addressLine}, ${data.pincode}`, data.issueDescription.slice(0, 120),
          ],
          relatedType: 'SERVICE_REQUEST',
          relatedId: request.id,
        }),
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        ticketNumber,
        message: 'Service request received. Our team will call you within 30 minutes.',
        visitCharge,
        serviceable: pin?.isServiceAvailable ?? false,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[service-requests:POST]', err);
    return NextResponse.json(
      { success: false, message: `Something went wrong. Please call ${CONTACT.primaryPhone}.` },
      { status: 500 },
    );
  }
}

/* ── Admin listing ──────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page') ?? 1));
  const limit = Math.min(100, Number(sp.get('limit') ?? 20));
  const status = sp.get('status');
  const technicianId = sp.get('technicianId');
  const search = sp.get('q');

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(technicianId ? { assignedTechnicianId: technicianId } : {}),
    ...(search
      ? {
          OR: [
            { ticketNumber:  { contains: search, mode: 'insensitive' as const } },
            { customerName:  { contains: search, mode: 'insensitive' as const } },
            { customerPhone: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.serviceRequest.findMany({
      where,
      include: { assignedTechnician: { select: { id: true, fullName: true, phone: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.serviceRequest.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}
