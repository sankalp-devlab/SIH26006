import { useState } from 'react';
import './landing.css';

import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { FeatureSection } from './components/FeatureSection';
import { MarketDataPreview } from './components/MarketDataPreview';
import { FleetIntelligenceSection } from './components/FleetIntelligenceSection';
import { StatsSection } from './components/StatsSection';
import { TrustSection } from './components/TrustSection';
import { CtaSection } from './components/CtaSection';
import { LandingFooter } from './components/LandingFooter';
import { DemoModal } from './components/DemoModal';

export function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="oceanlens-landing">
      {/* 1. Global Navigation */}
      <LandingNavbar
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenSearch={() => setIsDemoOpen(true)}
      />

      {/* Main Content Flow */}
      <main id="main-content" tabIndex={-1}>
        {/* 2. Hero Section - Container Ship Visual Anchor + Data-Driven Annotations */}
        <HeroSection onOpenDemo={() => setIsDemoOpen(true)} />

        {/* 3. Core Maritime Capabilities */}
        <FeatureSection />

        {/* 4. Real-Time Market Intelligence & Pricing Spreads */}
        <MarketDataPreview />

        {/* 5. Global Fleet Distribution & Strategic Chokepoint Transits */}
        <FleetIntelligenceSection />

        {/* 6. Platform Scale & Telemetry Metrics */}
        <StatsSection />

        {/* 7. Institutional Reliability & Security Architecture */}
        <TrustSection />

        {/* 8. Final Call to Action */}
        <CtaSection onOpenDemo={() => setIsDemoOpen(true)} />
      </main>

      {/* 9. Enterprise Footer */}
      <LandingFooter />

      {/* 10. Interactive Platform Preview Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
