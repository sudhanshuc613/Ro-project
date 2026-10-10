/**
 * /admin/warranty-amc — "aaj kisko phone karna hai" ki list.
 *
 * Yeh panel ka sabse paisa-kamaau page hai. Baaki har page tab kaam aata hai
 * jab grahak call kare. Yeh page khud bata deta hai ki kis grahak ko aaj
 * call karna chahiye aur kyun:
 *
 *   1. Service overdue      → abhi paisa de sakta hai
 *   2. Service 15 din me    → appointment pehle se book karo
 *   3. Warranty 30 din me   → AMC bechne ki sabse achhi window
 *   4. AMC 30 din me khatm  → renewal, sabse sasta business
 *
 * Har line pe phone aur WhatsApp ka button hai, aur WhatsApp ka message
 * pehle se likha aata hai — taaki kaam 2 second me ho, 2 minute me nahi.
 */
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { formatDateIN, formatINR } from '@/lib/utils/format';
import { CONTACT, SERVICE } from '@/lib/constants';
import { billingSetupStatus } from '@/server/services/billing.service';
import { addDays, atMidnight, daysBetween } from '@/lib/billing/compute';
import BillingSetupCard from '@/components/admin/BillingSetupCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Warranty & AMC' };

export default async function WarrantyAmcPage() {
  const setup = await billingSetupStatus();
  if (!setup.ready) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-navy-700">Warranty &amp; AMC</h1>
        <BillingSetupCard missing={setup.missing} />
      </div>
    );
  }

  const today = atMidnight(new Date());
  const in15 = addDays(today, 15);
  const in30 = addDays(today, 30);
  const in60 = addDays(today, 60);

  const [overdue, dueSoon, warrantyEnding, amcEnding, amcActive] = await Promise.all([
    prisma.installedUnit.findMany({
      where: { status: 'ACTIVE', nextServiceDue: { lt: today } },
      orderBy: { nextServiceDue: 'asc' },
      take: 100,
      include: { client: { select: { id: true, fullName: true, phone: true, area: true } } },
    }),
    prisma.installedUnit.findMany({
      where: { status: 'ACTIVE', nextServiceDue: { gte: today, lte: in15 } },
      orderBy: { nextServiceDue: 'asc' },
      take: 100,
      include: { client: { select: { id: true, fullName: true, phone: true, area: true } } },
    }),
    prisma.installedUnit.findMany({
      where: { status: 'ACTIVE', partsWarrantyEndsOn: { gte: today, lte: in60 } },
      orderBy: { partsWarrantyEndsOn: 'asc' },
      take: 100,
      include: { client: { select: { id: true, fullName: true, phone: true, area: true } } },
    }),
    prisma.amcRecord.findMany({
      where: { status: 'ACTIVE', endsOn: { gte: today, lte: in60 } },
      orderBy: { endsOn: 'asc' },
      take: 100,
      include: { client: { select: { id: true, fullName: true, phone: true, area: true } } },
    }),
    prisma.amcRecord.aggregate({
      where: { status: 'ACTIVE', endsOn: { gte: today } },
      _sum: { price: true },
      _count: { _all: true },
    }),
  ]);

  const wa = (phone: string, msg: string) => `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Warranty &amp; AMC</h1>
        <p className="mt-0.5 text-sm text-muted">
          Aaj kisko phone karna hai — upar se neeche. Har line pe wajah likhi hai.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Service overdue" value={String(overdue.length)} icon="🔴" tone="red" sub="Abhi call karo" />
        <Stat label="15 din me due" value={String(dueSoon.length)} icon="🟡" tone="orange" sub="Appointment le lo" />
        <Stat label="Warranty 60 din me khatm" value={String(warrantyEnding.length)} icon="🛡️" tone="aqua" sub="AMC bechne ka waqt" />
        <Stat
          label="Chalu AMC"
          value={String(amcActive._count._all)}
          icon="📋"
          tone="green"
          sub={`${formatINR(Number(amcActive._sum.price ?? 0))} ka saalana`}
        />
      </div>

      {/* 1. OVERDUE */}
      <Block
        title="1. Service nikal chuki hai — aaj call karo"
        why="Yeh log abhi paisa de sakte hain. RO ka paani kharab ho chuka hoga aur inhe pata hi nahi."
        empty="Ek bhi service overdue nahi. Shabash."
        count={overdue.length}
        tone="red"
      >
        {overdue.map((u) => {
          const late = Math.abs(daysBetween(today, u.nextServiceDue!));
          return (
            <Line
              key={u.id}
              clientId={u.client.id}
              name={u.client.fullName}
              phone={u.client.phone}
              area={u.client.area}
              main={`${u.brand} ${u.model ?? ''}`}
              detail={`Service ${formatDateIN(u.nextServiceDue!)} ko due thi — ${late} din late`}
              tone="red"
              waHref={wa(
                u.client.phone,
                `Namaste ${u.client.fullName} ji, Aqua Perl RO Service se. Aapke ${u.brand} RO ki service ${formatDateIN(u.nextServiceDue!)} ko due thi. Paani ka swaad ya speed badli ho to bata dijiye — hamara technician ${SERVICE.responseTime} me pahunch jayega. Visit charge sirf ₹${SERVICE.visitCharge}. — ${CONTACT.primaryPhone}`,
              )}
            />
          );
        })}
      </Block>

      {/* 2. DUE SOON */}
      <Block
        title="2. Agle 15 din me service due"
        why="Pehle se appointment le lo — warna grahak kisi aur ko bula lega."
        empty="Agle 15 din me koi service due nahi."
        count={dueSoon.length}
        tone="orange"
      >
        {dueSoon.map((u) => (
          <Line
            key={u.id}
            clientId={u.client.id}
            name={u.client.fullName}
            phone={u.client.phone}
            area={u.client.area}
            main={`${u.brand} ${u.model ?? ''}`}
            detail={`Service ${formatDateIN(u.nextServiceDue!)} ko due · ${daysBetween(today, u.nextServiceDue!)} din me`}
            tone="orange"
            waHref={wa(
              u.client.phone,
              `Namaste ${u.client.fullName} ji, Aqua Perl RO Service se. Aapke ${u.brand} RO ki agli service ${formatDateIN(u.nextServiceDue!)} ko due hai. Kaun sa din theek rahega? — ${CONTACT.primaryPhone}`,
            )}
          />
        ))}
      </Block>

      {/* 3. WARRANTY ENDING */}
      <Block
        title="3. Warranty 60 din me khatm — AMC bechne ka sabse achha mauka"
        why="Warranty khatm hote hi grahak sabse zyada chinta me hota hai. Isi waqt AMC sabse aasani se bikta hai."
        empty="Agle 60 din me kisi ki warranty khatm nahi ho rahi."
        count={warrantyEnding.length}
        tone="aqua"
      >
        {warrantyEnding.map((u) => (
          <Line
            key={u.id}
            clientId={u.client.id}
            name={u.client.fullName}
            phone={u.client.phone}
            area={u.client.area}
            main={`${u.brand} ${u.model ?? ''}`}
            detail={`Warranty ${formatDateIN(u.partsWarrantyEndsOn!)} tak · ${daysBetween(today, u.partsWarrantyEndsOn!)} din bache`}
            tone="aqua"
            waHref={wa(
              u.client.phone,
              `Namaste ${u.client.fullName} ji, Aqua Perl RO Service se. Aapke ${u.brand} RO ki warranty ${formatDateIN(u.partsWarrantyEndsOn!)} ko khatm ho rahi hai. Uske baad bhi machine ki dekhbhaal chalti rahe isliye hamare AMC plan dekh lijiye — saal bhar service free, visit charge bhi nahi. — ${CONTACT.primaryPhone}`,
            )}
          />
        ))}
      </Block>

      {/* 4. AMC ENDING */}
      <Block
        title="4. AMC 60 din me khatm — renewal"
        why="Renewal naya grahak laane se 5-7 guna sasta padta hai. Expiry se pehle call karo, baad me nahi."
        empty="Agle 60 din me koi AMC khatm nahi ho raha."
        count={amcEnding.length}
        tone="green"
      >
        {amcEnding.map((a) => (
          <Line
            key={a.id}
            clientId={a.client.id}
            name={a.client.fullName}
            phone={a.client.phone}
            area={a.client.area}
            main={`${a.planName} · ${formatINR(Number(a.price))}`}
            detail={`${formatDateIN(a.startsOn)} → ${formatDateIN(a.endsOn)} · ${daysBetween(today, a.endsOn)} din bache · ${a.visitsIncluded - a.visitsUsed} visit baaki`}
            tone="green"
            waHref={wa(
              a.client.phone,
              `Namaste ${a.client.fullName} ji, Aqua Perl RO Service se. Aapka AMC "${a.planName}" ${formatDateIN(a.endsOn)} ko khatm ho raha hai. Renew kar dein to service bina ruke chalti rahegi. — ${CONTACT.primaryPhone}`,
            )}
          />
        ))}
      </Block>

      <p className="text-xs text-slate-500">
        Yeh list machine aur AMC record se banti hai. Jitna record bharoge, utni hi list kaam ki hogi —
        isliye har bill ke saath &quot;Machine record banao&quot; tick zaroor karein.{' '}
        <Link href="/admin/clients" className="text-aqua-700 underline">Grahak record kholein</Link>
      </p>
    </div>
  );
}

function Block({
  title,
  why,
  empty,
  count,
  tone,
  children,
}: {
  title: string;
  why: string;
  empty: string;
  count: number;
  tone: string;
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    red: 'border-red-200',
    orange: 'border-amber-200',
    aqua: 'border-aqua-200',
    green: 'border-green-200',
  };
  return (
    <section className={`rounded-2xl border-2 bg-white p-5 ${tones[tone] ?? 'border-slate-200'}`}>
      <h2 className="font-display text-base font-bold text-navy-700">
        {title} <span className="ml-1 text-sm font-normal text-slate-500">({count})</span>
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">{why}</p>
      {count === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="mt-4 space-y-2">{children}</div>
      )}
    </section>
  );
}

function Line({
  clientId,
  name,
  phone,
  area,
  main,
  detail,
  tone,
  waHref,
}: {
  clientId: string;
  name: string;
  phone: string;
  area: string | null;
  main: string;
  detail: string;
  tone: string;
  waHref: string;
}) {
  const tones: Record<string, string> = {
    red: 'text-red-600',
    orange: 'text-amber-600',
    aqua: 'text-aqua-700',
    green: 'text-green-700',
  };
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
      <div className="min-w-[180px] flex-1">
        <Link href={`/admin/clients/${clientId}`} className="font-semibold text-navy-700 hover:text-aqua-600">
          {name}
        </Link>
        <p className="text-xs text-slate-500">
          {phone}
          {area ? ` · ${area}` : ''}
        </p>
      </div>
      <div className="min-w-[200px] flex-1">
        <p className="text-sm font-medium text-navy-700">{main}</p>
        <p className={`text-xs font-semibold ${tones[tone] ?? 'text-slate-500'}`}>{detail}</p>
      </div>
      <div className="flex gap-1.5">
        <a href={`tel:+91${phone}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
          📞 Call
        </a>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white">
          WhatsApp
        </a>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, icon, tone }: { label: string; value: string; sub?: string; icon: string; tone: string }) {
  const tones: Record<string, string> = {
    aqua: 'border-aqua-200 bg-aqua-50/60',
    red: 'border-red-200 bg-red-50/60',
    green: 'border-green-200 bg-green-50/60',
    orange: 'border-amber-200 bg-amber-50/60',
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] ?? 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className="text-lg leading-none">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-navy-700">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
