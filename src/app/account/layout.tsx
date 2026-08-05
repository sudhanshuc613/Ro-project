/**
 * Account shell — persistent sidebar + storefront chrome.
 *
 * Every /account/* page renders inside this, so:
 *  - the auth check happens ONCE here instead of in ten page files
 *  - badge counts are fetched once and shared
 *  - navigation state survives client-side route changes (sidebar does not
 *    unmount, so switching sections feels instant)
 *
 * Layout is the standard large-retailer split: fixed-width nav rail on the
 * left from lg up, horizontal scroller on mobile.
 */
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCallWidget from '@/components/layout/FloatingCallWidget';
import AccountNav from '@/components/account/AccountNav';
import AccountMobileNav from '@/components/account/AccountMobileNav';
import AccountHeader from '@/components/account/AccountHeader';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/account');

  const userId = session.user.id;

  const [user, services, machines, orders, wishlist, reviews, addresses, unread] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          fullName: true, phone: true, email: true, avatarUrl: true,
          createdAt: true, customerSegment: true, lifetimeValue: true,
        },
      }),
      prisma.serviceRequest.count({ where: { userId } }),
      prisma.customerMachine.count({ where: { userId, isActive: true } }),
      prisma.order.count({ where: { userId } }),
      prisma.wishlist.count({ where: { userId } }),
      prisma.productReview.count({ where: { userId } }),
      prisma.address.count({ where: { userId } }),
      prisma.notification.count({
        where: { userId, status: { in: ['QUEUED', 'SENT'] } },
      }),
    ]);

  if (!user) redirect('/login');

  const badges = { services, machines, orders, wishlist, reviews, addresses, unread: 0 };
  void unread; // notification "unread" needs a read receipt column; not faking a number

  return (
    <>
      <div className="no-print"><Navbar /></div>
      <div id="main" className="min-h-[60vh] bg-sand-100 pb-14">
        <div className="no-print">
        <AccountHeader
          fullName={user.fullName}
          phone={user.phone}
          email={user.email}
          memberSince={user.createdAt}
          segment={user.customerSegment}
        />
        </div>

        <div className="container mx-auto px-4">
          <div className="no-print"><AccountMobileNav badges={badges} /></div>

          <div className="gap-7 lg:grid lg:grid-cols-[268px,1fr]">
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-[136px]">
                <AccountNav badges={badges} />
              </div>
            </aside>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
      <div className="no-print"><Footer /></div>
      <div className="no-print"><FloatingCallWidget /></div>
    </>
  );
}
