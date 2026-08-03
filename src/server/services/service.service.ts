/**
 * Service-request business logic — the Patna operations engine.
 * Technician assignment, status transitions, and completion billing.
 */
import { prisma } from '@/lib/db/prisma';
import { sendWhatsApp } from '@/lib/integrations/whatsapp';
import { CONTACT } from '@/lib/constants';

/**
 * Best-fit technician auto-assignment.
 *
 * Scoring, highest wins:
 *   +50  covers this exact pincode
 *   +25  currently available
 *   +15  rating >= 4.5
 *   -10  per active job (load balancing)
 *
 * Runs fire-and-forget after a booking so the customer's response is instant.
 * If nobody scores, the ticket stays NEW for manual dispatch — never silently drops.
 */
export async function autoAssignTechnician(requestId: string, pincode: string) {
  const technicians = await prisma.technician.findMany({
    where: { isActive: true },
    select: {
      id: true,
      fullName: true,
      phone: true,
      servicePincodes: true,
      isAvailable: true,
      activeJobs: true,
      maxDailyJobs: true,
      ratingAvg: true,
    },
  });

  const eligible = technicians
    .filter((t) => t.activeJobs < t.maxDailyJobs)
    .map((t) => {
      let score = 0;
      if (t.servicePincodes.includes(pincode)) score += 50;
      if (t.isAvailable) score += 25;
      if (Number(t.ratingAvg) >= 4.5) score += 15;
      score -= t.activeJobs * 10;
      return { ...t, score };
    })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = eligible[0];
  if (!best) return null;

  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedTechnicianId: best.id,
        assignedAt: new Date(),
        status: 'ASSIGNED',
      },
    });

    await tx.technician.update({
      where: { id: best.id },
      data: { activeJobs: { increment: 1 } },
    });

    await tx.serviceStatusHistory.create({
      data: {
        requestId,
        fromStatus: 'NEW',
        toStatus: 'ASSIGNED',
        note: `Auto-assigned to ${best.fullName} (score ${best.score})`,
      },
    });

    return updated;
  });

  // Notify customer and technician
  void Promise.allSettled([
    sendWhatsApp({
      to: `91${request.customerPhone}`,
      template: 'service_technician_assigned',
      variables: [
        request.customerName.split(' ')[0],
        request.ticketNumber,
        best.fullName,
        best.phone,
        request.preferredSlot ?? 'today',
      ],
      relatedType: 'SERVICE_REQUEST',
      relatedId: requestId,
    }),
    sendWhatsApp({
      to: `91${best.phone}`,
      template: 'technician_job_assigned',
      variables: [
        best.fullName.split(' ')[0],
        request.ticketNumber,
        request.customerName,
        request.customerPhone,
        `${request.addressLine}, ${request.pincode}`,
      ],
      relatedType: 'SERVICE_REQUEST',
      relatedId: requestId,
    }),
  ]);

  return { technicianId: best.id, technicianName: best.fullName };
}

/** Manual reassignment from the admin Kanban board. */
export async function assignTechnician(requestId: string, technicianId: string, actorId: string) {
  const current = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: { status: true, assignedTechnicianId: true, ticketNumber: true, customerName: true, customerPhone: true, preferredSlot: true },
  });
  if (!current) throw new Error('Service request not found');

  const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
  if (!technician) throw new Error('Technician not found');

  await prisma.$transaction(async (tx) => {
    // Release the previous technician's slot
    if (current.assignedTechnicianId && current.assignedTechnicianId !== technicianId) {
      await tx.technician.update({
        where: { id: current.assignedTechnicianId },
        data: { activeJobs: { decrement: 1 } },
      });
    }

    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { assignedTechnicianId: technicianId, assignedAt: new Date(), status: 'ASSIGNED' },
    });

    await tx.technician.update({
      where: { id: technicianId },
      data: { activeJobs: { increment: 1 } },
    });

    await tx.serviceStatusHistory.create({
      data: {
        requestId,
        fromStatus: current.status,
        toStatus: 'ASSIGNED',
        note: `Manually assigned to ${technician.fullName}`,
        changedBy: actorId,
      },
    });
  });

  void sendWhatsApp({
    to: `91${current.customerPhone}`,
    template: 'service_technician_assigned',
    variables: [
      current.customerName.split(' ')[0],
      current.ticketNumber,
      technician.fullName,
      technician.phone,
      current.preferredSlot ?? 'today',
    ],
    relatedType: 'SERVICE_REQUEST',
    relatedId: requestId,
  });

  return { ok: true };
}

/** Enforced state machine — prevents illegal jumps like NEW → COMPLETED. */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ['CONTACTED', 'SCHEDULED', 'ASSIGNED', 'CANCELLED', 'NO_RESPONSE'],
  CONTACTED: ['SCHEDULED', 'ASSIGNED', 'CANCELLED', 'NO_RESPONSE'],
  SCHEDULED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD_PARTS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD_PARTS', 'CANCELLED'],
  ON_HOLD_PARTS: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_RESPONSE: ['CONTACTED', 'CANCELLED'],
};

export async function updateServiceStatus(
  requestId: string,
  toStatus: string,
  actorId: string,
  opts: {
    note?: string;
    partsCharge?: number;
    labourCharge?: number;
    resolutionNote?: string;
    partsReplaced?: unknown;
  } = {},
) {
  const current = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!current) throw new Error('Service request not found');

  const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new Error(`Cannot move a ticket from ${current.status} to ${toStatus}`);
  }

  const isCompleting = toStatus === 'COMPLETED';
  const partsCharge = opts.partsCharge ?? Number(current.partsCharge);
  const labourCharge = opts.labourCharge ?? Number(current.labourCharge);
  const totalCharge = Number(current.visitCharge) + partsCharge + labourCharge;

  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: toStatus as never,
        ...(toStatus === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
        ...(isCompleting
          ? {
              completedAt: new Date(),
              partsCharge,
              labourCharge,
              totalCharge,
              resolutionNote: opts.resolutionNote,
              partsReplaced: opts.partsReplaced as never,
            }
          : {}),
      },
    });

    await tx.serviceStatusHistory.create({
      data: {
        requestId,
        fromStatus: current.status,
        toStatus: toStatus as never,
        note: opts.note,
        changedBy: actorId,
      },
    });

    // Free the technician and credit the completion
    if ((isCompleting || toStatus === 'CANCELLED') && current.assignedTechnicianId) {
      await tx.technician.update({
        where: { id: current.assignedTechnicianId },
        data: {
          activeJobs: { decrement: 1 },
          ...(isCompleting ? { jobsCompleted: { increment: 1 } } : {}),
        },
      });
    }

    return req;
  });

  if (isCompleting) {
    void sendWhatsApp({
      to: `91${current.customerPhone}`,
      template: 'service_completed',
      variables: [
        current.customerName.split(' ')[0],
        current.ticketNumber,
        `₹${totalCharge.toLocaleString('en-IN')}`,
        String(current.warrantyDays),
      ],
      relatedType: 'SERVICE_REQUEST',
      relatedId: requestId,
    });
  }

  return updated;
}

/** Kanban board data for /admin/service-requests. */
export async function getServiceBoard() {
  const columns = ['NEW', 'CONTACTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD_PARTS', 'COMPLETED'] as const;

  const requests = await prisma.serviceRequest.findMany({
    where: { status: { in: columns as unknown as never[] } },
    include: { assignedTechnician: { select: { id: true, fullName: true, phone: true } } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    take: 300,
  });

  return columns.map((status) => ({
    status,
    items: requests.filter((r) => r.status === status),
  }));
}

/** AMC contracts falling due — feeds the reminder cron. */
export async function getUpcomingAmcVisits(withinDays = 7) {
  return prisma.amcSubscription.findMany({
    where: {
      isActive: true,
      nextServiceDue: { lte: new Date(Date.now() + withinDays * 864e5) },
    },
    include: { user: { select: { fullName: true, phone: true } } },
    orderBy: { nextServiceDue: 'asc' },
  });
}
