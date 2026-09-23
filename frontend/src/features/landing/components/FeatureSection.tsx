import {
  Ship,
  TrendingUp,
  BarChart3,
  Compass,
  Leaf,
  FileSpreadsheet,
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export function FeatureSection() {
  const features = [
    {
      title: 'Vessel Intelligence',
      category: 'AIS Telemetry',
      desc: 'Track live vessel positions, navigation status, drafts, speeds, and laden/ballast states with high-frequency terrestrial and satellite feeds.',
      dataTag: '54,298 Vessels · 250ms Ticks',
      href: '/vessels',
      icon: Ship,
    },
    {
      title: 'Market Intelligence',
      category: 'Commodities & Freight',
      desc: 'Monitor global crude, refined product flows, FFA paper curves, and spot tanker TCE benchmarks across major commercial trade routes.',
      dataTag: 'Brent $82.46 · VLCC TD3C',
      href: '/market-prices',
      icon: TrendingUp,
    },
    {
      title: 'Fleet Analytics',
      category: 'Supply Modeling',
      desc: 'Evaluate commercial fleet deployment, ton-mile demand metrics, vessel age distribution, and charter status across all major ship segments.',
      dataTag: '91.8% Active Utilization',
      href: '/fleets',
      icon: BarChart3,
    },
    {
      title: 'Corridor & Route Intelligence',
      category: 'Navigation Logistics',
      desc: 'Analyze optimal maritime corridors, weather routing, canal transit queues, and chokepoint detour implications in real time.',
      dataTag: 'Suez · Panama · Malacca',
      href: '/routes',
      icon: Compass,
    },
    {
      title: 'Carbon & Emissions (CII / EEXI)',
      category: 'Environmental Compliance',
      desc: 'Calculate voyage-by-voyage carbon intensity indicators (IMO CII A–E), monitor EEXI compliance, and track EU ETS maritime exposure.',
      dataTag: 'IMO CII & EU ETS Tracker',
      href: '/emissions',
      icon: Leaf,
    },
    {
      title: 'Voyage Calculator & Fixtures',
      category: 'Commercial Ops',
      desc: 'Simulate laytime, calculate bunker consumption, evaluate nautical distances between 3,000+ seaports, and log active fixture contracts.',
      dataTag: '3,000+ Ports · Laytime Engine',
      href: '/voyage-calculator',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <section id="features" className="oceanlens-features-section" aria-labelledby="features-heading">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-block">
          <span className="section-eyebrow">Enterprise Decision Suite</span>
          <h2 id="features-heading" className="section-title">
            End-to-End Maritime Capabilities
          </h2>
          <p className="section-subtitle">
            Engineered for charterers, energy traders, fleet operators, and analysts requiring uncompromising precision across global maritime corridors.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="feature-cards-grid">
          {features.map((feat) => (
            <FeatureCard
              key={feat.title}
              title={feat.title}
              category={feat.category}
              desc={feat.desc}
              dataTag={feat.dataTag}
              href={feat.href}
              icon={feat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
