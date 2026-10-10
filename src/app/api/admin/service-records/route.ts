/**
 * MACHINE RECORD + AMC + AMC VISIT — ek hi endpoint.
 *
 *   POST   ?kind=unit   | amc | visit      → naya
 *   PUT    ?kind=unit   | amc  &id=…       → badlo
 *   DELETE ?kind=unit   | amc | visit &id= → mitao
 *
 * Teen alag route files banane ke bajaye ek rakha gaya hai kyunki teenon ka
 * guard, audit aur error-shape bilkul ek jaisa hai. Teen files me wahi code
 * teen baar hota, aur kal guard badalna pada to ek jagah bhoolne ka risk.
 *
 * Warranty end date aur next service due SERVER pe nikalte hain — form se
 * aaye hue in fields ko padha hi nahi jaata. Warna koi 2019 me lagi machine
 * ki warranty 2030 tak likhwa sakta tha.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth';
import { unitSchema, amcSchema, amcVisitSchema } from '@/lib/billing/schema';
import { createUnitRow, createAmcRow, unitDerived } from '@/server/services/billing.service';
import { money, addDays, atMidnight } from '@/lib/billing/compute';
import { logAudit } from '@/server/services/audit.service';

const staffOk = (r?: string) => r === 'STAFF' || r === 'ADMIN' || r === 'SUPER_ADMIN';
const adminOk = (r?: string) => r === 'ADMIN' || r === 'SUPER_ADMIN';

export const dynamic = 'force-dynamic';

const bad = (message: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ message, ...extra }, { status });

export async function POST(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!staffOk(s?.user?.role)) return bad('Unauthorized', 401);

  const kind = new URL(req.url).searchParams.get('kind');
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return bad('Data nahi mila', 422);

  if (kind === 'unit') {
    const clientId = String((body as Record<string, unknown>).clientId ?? '');
    if (!clientId) return bad('Grahak chuna nahi gaya', 422);
    const parsed = unitSchema.safeParse(body);
    if (!parsed.success) return bad('Form me kuch galat hai', 422, { errors: parsed.error.flatten() });

    const row = await prisma.$transaction((tx) =>
      createUnitRow(tx, clientId, (body as Record<string, string>).billId || null, parsed.data),
    );
    await logAudit({ actorId: s!.user.id, action: 'unit.create', entityType: 'INSTALLED_UNIT', entityId: row.id, afterData: { brand: row.brand } }).catch(() => {});
    return NextResponse.json({ ok: true, unit: row }, { status: 201 });
  }

  if (kind === 'amc') {
    const clientId = String((body as Record<string, unknown>).clientId ?? '');
    if (!clientId) return bad('Grahak chuna nahi gaya', 422);
    const parsed = amcSchema.safeParse(body);
    if (!parsed.success) return bad('Form me kuch galat hai', 422, { errors: parsed.error.flatten() });
    if (parsed.data.endsOn <= parsed.data.startsOn) return bad('End date start date ke baad honi chahiye', 422);

    const row = await prisma.$transaction((tx) =>
      createAmcRow(tx, clientId, (body as Record<string, string>).billId || null, parsed.data),
    );
    await logAudit({ actorId: s!.user.id, action: 'amc.create', entityType: 'AMC_RECORD', entityId: row.id, afterData: { plan: row.planName } }).catch(() => {});
    return NextResponse.json({ ok: true, amc: row }, { status: 201 });
  }

  if (kind === 'visit') {
    const parsed = amcVisitSchema.safeParse(body);
    if (!parsed.success) return bad('Form me kuch galat hai', 422, { errors: parsed.error.flatten() });
    const d = parsed.data;

    const contract = await prisma.amcRecord.findUnique({ where: { id: d.contractId } });
    if (!contract) return bad('AMC record nahi mila', 404);

    const visitDate = new Date(`${d.visitDate}T00:00:00`);
    const visit = await prisma.$transaction(async (tx) => {
      const v = await tx.amcVisit.create({
        data: {
          contractId: d.contractId,
          visitDate,
          visitType: d.visitType,
          technicianName: d.technicianName || null,
          workDone: d.workDone || null,
          partsReplaced: d.partsReplaced || null,
          extraCharge: money(d.extraCharge),
          inletTds: d.inletTds ?? null,
          outletTds: d.outletTds ?? null,
        },
      });

      // Visit count aur agli due date dobara nikaalo — gin ke, badha ke nahi.
      const used = await tx.amcVisit.count({ where: { contractId: d.contractId } });
      const spanDays = Math.max(
        Math.round((contract.endsOn.getTime() - contract.startsOn.getTime()) / 86400000),
        1,
      );
      const gap = contract.visitsIncluded > 0 ? Math.max(Math.round(spanDays / contract.visitsIncluded), 15) : 0;
      const nextDue = gap > 0 ? addDays(visitDate, gap) : null;

      await tx.amcRecord.update({
        where: { id: d.contractId },
        data: {
          visitsUsed: used,
          lastVisitOn: visitDate,
          nextServiceDue: nextDue && nextDue <= contract.endsOn ? nextDue : null,
        },
      });
      return v;
    });

    await logAudit({ actorId: s!.user.id, action: 'amc.visit', entityType: 'AMC_VISIT', entityId: visit.id }).catch(() => {});
    return NextResponse.json({ ok: true, visit }, { status: 201 });
  }

  return bad('kind galat hai (unit | amc | visit)', 400);
}

export async function PUT(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!staffOk(s?.user?.role)) return bad('Unauthorized', 401);

  const sp = new URL(req.url).searchParams;
  const kind = sp.get('kind');
  const id = sp.get('id') ?? '';
  if (!id) return bad('id chahiye', 400);

  const body = await req.json().catch(() => null);
  if (!body) return bad('Data nahi mila', 422);

  if (kind === 'unit') {
    const parsed = unitSchema.safeParse(body);
    if (!parsed.success) return bad('Form me kuch galat hai', 422, { errors: parsed.error.flatten() });
    const d = parsed.data;
    const derived = unitDerived({
      installedOn: d.installedOn,
      partsWarrantyMonths: d.partsWarrantyMonths,
      serviceWarrantyMonths: d.serviceWarrantyMonths,
      serviceIntervalDays: d.serviceIntervalDays,
      lastServiceOn: d.lastServiceOn || null,
    });

    const unit = await prisma.installedUnit.update({
      where: { id },
      data: {
        brand: d.brand,
        model: d.model || null,
        serialNumber: d.serialNumber || null,
        capacity: d.capacity || null,
        machineKind: d.machineKind,
        installedOn: new Date(`${d.installedOn}T00:00:00`),
        partsWarrantyMonths: d.partsWarrantyMonths,
        serviceWarrantyMonths: d.serviceWarrantyMonths,
        partsWarrantyEndsOn: derived.partsWarrantyEndsOn,
        serviceWarrantyEndsOn: derived.serviceWarrantyEndsOn,
        freeServicesTotal: d.freeServicesTotal,
        freeServicesUsed: Math.min(d.freeServicesUsed, d.freeServicesTotal),
        serviceIntervalDays: d.serviceIntervalDays,
        lastServiceOn: d.lastServiceOn ? new Date(`${d.lastServiceOn}T00:00:00`) : null,
        nextServiceDue: derived.nextServiceDue,
        inletTds: d.inletTds ?? null,
        outletTds: d.outletTds ?? null,
        status: d.status,
        notes: d.notes || null,
      },
    });
    await logAudit({ actorId: s!.user.id, action: 'unit.update', entityType: 'INSTALLED_UNIT', entityId: id }).catch(() => {});
    return NextResponse.json({ ok: true, unit });
  }

  if (kind === 'amc') {
    const parsed = amcSchema.safeParse(body);
    if (!parsed.success) return bad('Form me kuch galat hai', 422, { errors: parsed.error.flatten() });
    const d = parsed.data;
    if (d.endsOn <= d.startsOn) return bad('End date start date ke baad honi chahiye', 422);

    const startsOn = new Date(`${d.startsOn}T00:00:00`);
    const endsOn = new Date(`${d.endsOn}T00:00:00`);
    const spanDays = Math.max(Math.round((endsOn.getTime() - startsOn.getTime()) / 86400000), 1);
    const gap = d.visitsIncluded > 0 ? Math.max(Math.round(spanDays / d.visitsIncluded), 15) : 0;
    const base = d.lastVisitOn ? new Date(`${d.lastVisitOn}T00:00:00`) : startsOn;
    const nextDue = gap > 0 ? addDays(base, gap) : null;

    // Expiry ke baad status khud EXPIRED — har list me manually set nahi karna padta.
    const autoStatus = d.status === 'CANCELLED' ? 'CANCELLED' : endsOn < atMidnight(new Date()) ? 'EXPIRED' : d.status;

    const amc = await prisma.amcRecord.update({
      where: { id },
      data: {
        contractNumber: d.contractNumber || undefined,
        planName: d.planName,
        machineBrand: d.machineBrand || null,
        machineModel: d.machineModel || null,
        price: money(d.price),
        startsOn,
        endsOn,
        visitsIncluded: d.visitsIncluded,
        visitsUsed: Math.min(d.visitsUsed, d.visitsIncluded),
        lastVisitOn: d.lastVisitOn ? new Date(`${d.lastVisitOn}T00:00:00`) : null,
        nextServiceDue: nextDue && nextDue <= endsOn ? nextDue : null,
        coversFilters: d.coversFilters,
        coversMembrane: d.coversMembrane,
        status: autoStatus,
        notes: d.notes || null,
      },
    });
    await logAudit({ actorId: s!.user.id, action: 'amc.update', entityType: 'AMC_RECORD', entityId: id }).catch(() => {});
    return NextResponse.json({ ok: true, amc });
  }

  return bad('kind galat hai (unit | amc)', 400);
}

export async function DELETE(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!adminOk(s?.user?.role)) return bad('Mitane ka adhikar sirf admin ko hai', 403);

  const sp = new URL(req.url).searchParams;
  const kind = sp.get('kind');
  const id = sp.get('id') ?? '';
  if (!id) return bad('id chahiye', 400);

  if (kind === 'unit') {
    await prisma.installedUnit.delete({ where: { id } });
  } else if (kind === 'amc') {
    await prisma.amcRecord.delete({ where: { id } });
  } else if (kind === 'visit') {
    const v = await prisma.amcVisit.findUnique({ where: { id } });
    if (!v) return bad('Visit nahi mila', 404);
    await prisma.$transaction(async (tx) => {
      await tx.amcVisit.delete({ where: { id } });
      const used = await tx.amcVisit.count({ where: { contractId: v.contractId } });
      const last = await tx.amcVisit.findFirst({ where: { contractId: v.contractId }, orderBy: { visitDate: 'desc' } });
      await tx.amcRecord.update({
        where: { id: v.contractId },
        data: { visitsUsed: used, lastVisitOn: last?.visitDate ?? null },
      });
    });
  } else {
    return bad('kind galat hai (unit | amc | visit)', 400);
  }

  await logAudit({ actorId: s!.user.id, action: `${kind}.delete`, entityType: 'BILLING', entityId: id }).catch(() => {});
  return NextResponse.json({ ok: true });
}
