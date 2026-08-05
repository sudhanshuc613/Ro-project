import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatINR, discountPercent } from '@/lib/utils/format';
import { SectionHeader, EmptyState } from '@/components/account/ui';
import WishlistActions from '@/components/account/WishlistActions';

export const metadata: Metadata = {
  title: 'My Wishlist',
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  const items = await prisma.wishlist.findMany({
    where: { userId: session!.user.id },
    orderBy: { addedAt: 'desc' },
    include: {
      product: {
        select: {
          id: true, slug: true, name: true, sellingPrice: true, mrp: true,
          stockQuantity: true, status: true, ratingAvg: true, ratingCount: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
        },
      },
    },
  });

  if (items.length === 0) {
    return (
      <div>
        <SectionHeader title="My Wishlist" />
        <EmptyState
          icon="🤍"
          title="Nothing saved yet"
          body="Tap the heart on any product to keep it here for later."
          ctaLabel="Browse products"
          ctaHref="/products"
        />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="My Wishlist"
        subtitle={`${items.length} item${items.length === 1 ? '' : 's'} saved`}
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ product: p, addedAt }) => {
          const off = discountPercent(Number(p.mrp), Number(p.sellingPrice));
          const outOfStock = p.stockQuantity <= 0 || p.status !== 'ACTIVE';
          const img = p.images[0];

          return (
            <li key={p.id} className="card-hover flex flex-col overflow-hidden">
              <Link href={`/products/${p.slug}`} className="relative block aspect-square bg-sand-100">
                {img ? (
                  <Image
                    src={img.url}
                    alt={img.altText || p.name}
                    fill
                    sizes="(max-width:640px) 50vw, 280px"
                    className="object-contain p-4"
                    unoptimized={img.url.startsWith('/api/media')}
                  />
                ) : (
                  <span className="grid h-full place-items-center text-4xl">💧</span>
                )}
                {off > 0 && (
                  <span className="absolute left-3 top-3 rounded-md bg-cta-green px-2 py-0.5 text-[11px] font-bold text-white">
                    {off}% OFF
                  </span>
                )}
                {outOfStock && (
                  <span className="absolute inset-0 grid place-items-center bg-white/75">
                    <span className="rounded-lg bg-navy-700 px-3 py-1.5 text-xs font-bold text-white">
                      Out of stock
                    </span>
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link href={`/products/${p.slug}`} className="line-clamp-2 text-sm font-semibold text-navy-700 hover:text-aqua-600">
                  {p.name}
                </Link>

                {p.ratingCount > 0 && (
                  <p className="mt-1 text-xs text-muted">
                    <span className="font-bold text-gold-600">{Number(p.ratingAvg).toFixed(1)}★</span>{' '}
                    ({p.ratingCount})
                  </p>
                )}

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="tnum font-display text-lg font-extrabold text-navy-700">
                    {formatINR(Number(p.sellingPrice))}
                  </span>
                  {off > 0 && (
                    <span className="tnum text-sm text-muted line-through">{formatINR(Number(p.mrp))}</span>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-muted">
                  Saved {new Date(addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>

                <div className="mt-auto pt-3">
                  <WishlistActions
                    productId={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={Number(p.sellingPrice)}
                    mrp={Number(p.mrp)}
                    image={img?.url ?? null}
                    disabled={outOfStock}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
