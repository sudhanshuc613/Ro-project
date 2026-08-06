/**
 * My Reviews — written ones plus a "waiting to be reviewed" queue.
 *
 * The pending queue is the valuable half. Reviews on a young store are the
 * scarcest asset there is, and the highest-converting moment to ask is right
 * after delivery. Only DELIVERED items appear, so every review is genuine.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatDateIN } from '@/lib/utils/format';
import { SectionHeader, EmptyState, Badge } from '@/components/account/ui';
import ReviewForm from '@/components/account/ReviewForm';

export const metadata: Metadata = {
  title: 'My Reviews',
  robots: { index: false, follow: false },
};

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [reviews, pending] = await Promise.all([
    prisma.productReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            slug: true, name: true,
            images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
    }),
    prisma.orderItem.findMany({
      where: {
        order: { userId, status: 'DELIVERED' },
        productId: { not: null },
        product: { reviews: { none: { userId } } },
      },
      distinct: ['productId'],
      select: {
        id: true, productId: true, productName: true, productImageUrl: true,
        order: { select: { id: true, orderNumber: true, deliveredAt: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section>
          <SectionHeader
            title="Waiting for your review"
            subtitle="Only products you actually received show up here"
          />
          <ul className="space-y-4">
            {pending.map((it) => (
              <li key={it.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-sand-100">
                    {it.productImageUrl ? (
                      <Image
                        src={it.productImageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                        unoptimized={it.productImageUrl.startsWith('/api/media')}
                      />
                    ) : (
                      <span className="text-2xl">💧</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-700">{it.productName}</p>
                    <p className="text-xs text-muted">
                      {it.order.orderNumber}
                      {it.order.deliveredAt && ` · delivered ${formatDateIN(it.order.deliveredAt)}`}
                    </p>
                    <ReviewForm
                      productId={it.productId!}
                      orderId={it.order.id}
                      productName={it.productName}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHeader
          title="My Reviews"
          subtitle={reviews.length ? `${reviews.length} review${reviews.length === 1 ? '' : 's'} written` : undefined}
        />

        {reviews.length === 0 ? (
          <EmptyState
            icon="⭐"
            title="No reviews written yet"
            body="Once an order is delivered you can rate it here. Honest reviews help other Patna customers pick the right purifier."
            ctaLabel="Browse products"
            ctaHref="/products"
          />
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-sand-100">
                    {r.product.images[0] ? (
                      <Image
                        src={r.product.images[0].url}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain p-1.5"
                        unoptimized={r.product.images[0].url.startsWith('/api/media')}
                      />
                    ) : (
                      <span className="text-xl">💧</span>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/products/${r.product.slug}`} className="font-semibold text-navy-700 hover:text-aqua-600">
                        {r.product.name}
                      </Link>
                      {r.isVerified && <Badge tone="green">Verified purchase</Badge>}
                      {!r.isApproved && <Badge tone="amber">Awaiting approval</Badge>}
                    </div>

                    <p className="mt-1.5 text-gold-600">
                      {'★'.repeat(r.rating)}
                      <span className="text-navy-200">{'★'.repeat(5 - r.rating)}</span>
                      <span className="ml-2 text-xs text-muted">{formatDateIN(r.createdAt)}</span>
                    </p>

                    {r.title && <p className="mt-2 font-semibold text-navy-700">{r.title}</p>}
                    {r.body && <p className="mt-1 text-sm text-navy-600 text-pretty">{r.body}</p>}

                    {r.adminReply && (
                      <div className="mt-3 rounded-xl bg-aqua-50 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-aqua-700">
                          Aqua Perl replied
                        </p>
                        <p className="mt-0.5 text-sm text-aqua-900">{r.adminReply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
