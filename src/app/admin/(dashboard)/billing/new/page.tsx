/**
 * /admin/billing/new — naya bill.
 *
 * Bill number server pe suggest hota hai (table me jo sabse bada number hai
 * +1). Owner chahe to badal sakta hai — field khula hai.
 */
import Link from 'next/link';
import { billingSetupStatus, suggestBillNumber } from '@/server/services/billing.service';
import { DEFAULT_TEMPLATE_BY_TYPE, getTemplate } from '@/lib/billing/warranty-templates';
import { toInputDate } from '@/lib/billing/compute';
import BillForm from '@/components/admin/BillForm';
import { emptyItem, type BillFormInitial } from '@/lib/billing/bill-form-types';
import BillingSetupCard from '@/components/admin/BillingSetupCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Naya Bill' };

export default async function NewBillPage({ searchParams }: { searchParams?: { phone?: string; name?: string; type?: string } }) {
  const setup = await billingSetupStatus();
  if (!setup.ready) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-navy-700">Naya Bill</h1>
        <BillingSetupCard missing={setup.missing} />
      </div>
    );
  }

  const billNumber = await suggestBillNumber();
  const today = toInputDate(new Date());
  const type = searchParams?.type && ['SALE', 'SERVICE', 'AMC', 'INSTALLATION', 'OTHER'].includes(searchParams.type)
    ? searchParams.type
    : 'SALE';
  const tpl = getTemplate(DEFAULT_TEMPLATE_BY_TYPE[type]);

  const initial: BillFormInitial = {
    billNumber,
    type,
    status: 'PAID',
    customerName: searchParams?.name ?? '',
    customerPhone: searchParams?.phone ?? '',
    customerAltPhone: '',
    customerAddress: '',
    customerGstin: '',
    clientArea: '',
    clientPincode: '',
    issueDate: today,
    dueDate: '',
    items: [emptyItem()],
    discountAmount: '0',
    taxRate: '0',
    taxMode: 'NONE',
    roundToRupee: true,
    amountPaid: '0',
    paymentMode: 'CASH',
    paymentNote: '',
    warrantyTemplate: tpl?.key ?? '',
    terms: tpl ? [...tpl.terms] : [],
    showStamp: true,
    stampText: 'APPROVED / PAID',
    showSign: true,
    footerNote: '',
    shareEnabled: true,
    internalNote: '',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-700">Naya Bill</h1>
          <p className="mt-0.5 text-sm text-muted">
            Bill number <strong>{billNumber}</strong> suggest kiya gaya hai — chahein to badal lein.
          </p>
        </div>
        <Link href="/admin/billing" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          ← Wapas
        </Link>
      </div>

      <BillForm initial={initial} mode="create" />
    </div>
  );
}
