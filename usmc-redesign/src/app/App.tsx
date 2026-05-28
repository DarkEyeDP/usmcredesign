import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Header } from '@/app/components/layout/Header';
import { Navigation } from '@/app/components/layout/Navigation';
import { StatusBar } from '@/app/components/layout/StatusBar';
import { MobileBottomNav } from '@/app/components/layout/MobileBottomNav';
import { HomePage } from '@/app/pages/HomePage';
import { EducationPage } from '@/app/pages/EducationPage';
import { PrivacyPolicyPage } from '@/app/pages/PrivacyPolicyPage';
import { SiteMapPage } from '@/app/pages/SiteMapPage';
import { StayMarinePage } from '@/app/pages/StayMarinePage';
import { MARADMINPage } from '@/app/features/maradmin/MARADMINPage';
import { LateralMovePage } from '@/app/features/latmove';
import { LatMoveErrorBoundary } from '@/app/features/latmove/components/LatMoveErrorBoundary';
import { PayBenefitsPage } from '@/app/features/pay/PayBenefitsPage';
import { BasicPayPage } from '@/app/features/pay/BasicPayPage';
import { BonusesPage } from '@/app/features/pay/BonusesPage';
import { BAHCalculatorPage } from '@/app/features/pay/BAHCalculatorPage';
import { TuitionAssistancePage } from '@/app/features/education/TuitionAssistancePage';
import { NewsPage } from '@/app/features/news';
import { ReadingListPage } from '@/app/features/reading/ReadingListPage';
import { isFullscreenCapablePath } from './routeUtils';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Exit fullscreen automatically when navigating away from fullscreen-capable pages.
  useEffect(() => {
    if (!isFullscreenCapablePath(location.pathname)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFullscreen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Don't reset scroll when navigating between MARADMIN messages — the page
    // stays put and only the detail panel changes.
    if (location.pathname.startsWith('/messages/')) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white">
      {!isFullscreen && (
        <div className="print-hide">
          <Header
            isLoggedIn={isLoggedIn}
            onToggleLogin={() => setIsLoggedIn(l => !l)}
            isExpanded={isSidebarExpanded}
            isMobile={isMobile}
          />
        </div>
      )}
      {!isFullscreen && (
        <div className="print-hide">
          <Navigation
            isLoggedIn={isLoggedIn}
            isExpanded={isSidebarExpanded}
            onToggleExpanded={() => setIsSidebarExpanded(expanded => !expanded)}
          />
        </div>
      )}
      <motion.div
        className="flex flex-col min-h-screen"
        initial={false}
        animate={{ marginLeft: isMobile || isFullscreen ? 0 : (isSidebarExpanded ? 192 : 80) }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex-1 pb-[72px] md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage isFullscreen={isFullscreen} onToggleFullscreen={() => setIsFullscreen(f => !f)} />} />
            <Route path="/messages" element={
              <MARADMINPage
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(f => !f)}
              />
            } />
            <Route path="/messages/:messageNumber" element={
              <MARADMINPage
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(f => !f)}
              />
            } />
            <Route path="/pay-benefits/basic-pay" element={<BasicPayPage />} />
            <Route path="/pay-benefits/bah" element={<BAHCalculatorPage />} />
            <Route path="/pay-benefits/bonuses" element={<BonusesPage />} />
            <Route path="/pay-benefits" element={<PayBenefitsPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/education/tuition-assistance" element={<TuitionAssistancePage />} />
            <Route path="/reading-list" element={<ReadingListPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/sitemap" element={<SiteMapPage />} />
            <Route path="/lateral-move" element={
              <LatMoveErrorBoundary>
                <LateralMovePage
                  isLoggedIn={isLoggedIn}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(f => !f)}
                />
              </LatMoveErrorBoundary>
            } />
            <Route path="/stay-marine" element={<StayMarinePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="*" element={<HomePage isFullscreen={isFullscreen} onToggleFullscreen={() => setIsFullscreen(f => !f)} />} />
          </Routes>
        </div>
        {!isFullscreen && <div className="print-hide"><StatusBar /></div>}
      </motion.div>
      {!isFullscreen && <MobileBottomNav isLoggedIn={isLoggedIn} />}
    </div>
  );
}
