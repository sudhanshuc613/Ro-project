import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCallWidget from '@/components/layout/FloatingCallWidget';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div id="main">{children}</div>
      <Footer />
      <FloatingCallWidget />
    </>
  );
}
