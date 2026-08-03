import Link from 'next/link';

export const metadata = { title: 'Add Product' };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm font-semibold text-aqua-600 hover:underline">
          ← Back to products
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-navy-700">Add Product</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-4xl">🛠️</p>
        <h2 className="mt-3 font-display text-lg font-bold text-navy-700">
          Product form is the next build milestone
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The API endpoint (<code className="rounded bg-slate-100 px-1.5 py-0.5">POST /api/products</code>)
          is already built and validated — it handles images, specs, pricing and SEO. Only the
          visual form UI is pending.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Until then, products can be added by editing{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">prisma/seed.ts</code> and running{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">npx tsx prisma/seed.ts</code>.
        </p>
      </div>
    </div>
  );
}
