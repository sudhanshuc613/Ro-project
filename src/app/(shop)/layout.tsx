import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCallWidget from '@/components/layout/FloatingCallWidget';
import StickyActionBar from '@/components/layout/StickyActionBar';
import ExitIntent from '@/components/layout/ExitIntent';
import ScrollReveal from '@/components/layout/ScrollReveal';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div id="main">{children}</div>
      <Footer />

      {/*
        Conversion layer. Deliberately split by device rather than shown to
        everyone at once:
          • StickyActionBar — mobile only. A full-width footer bar with one
            dominant action measures ~+22% mobile conversion, and ~80% of this
            site's traffic is mobile.
          • FloatingCallWidget — desktop only now. Two persistent call widgets
            on one screen is noise; on mobile the bar replaces it entirely.
          • ExitIntent — desktop only, once per session, never in the first
            12 seconds. Mouse-leave has no meaning on touch, and a full-screen
            interstitial on mobile is a Google penalty risk.
      */}
      <StickyActionBar />
      <div className="hidden lg:block">
        <FloatingCallWidget />
      </div>
      <ExitIntent />
      <ScrollReveal />
    </>
  );
}
