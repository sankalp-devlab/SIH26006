import { ShieldCheck, Satellite, Zap, Code2, Check } from 'lucide-react';

export function TrustSection() {
  const trustPillars = [
    {
      icon: Satellite,
      title: 'Multi-Constellation AIS Fusion',
      desc: 'Blends low-Earth orbit (LEO) satellite feeds with a distributed network of terrestrial coastal receiver stations to guarantee continuous vessel tracking across oceanic dead zones.',
      badge: 'Dual-Band Ingestion',
    },
    {
      icon: Zap,
      title: 'Sub-Second Event Processing',
      desc: 'Streaming event architecture delivers ship coordinates, speed changes, and course anomalies to user workstations within 800 milliseconds of vessel antenna transmission.',
      badge: '<800ms Stream Latency',
    },
    {
      icon: ShieldCheck,
      title: 'SOC 2 Type II & Zero-Trust',
      desc: 'Enterprise security standards including end-to-end TLS 1.3 encryption, SOC 2 Type II compliance, granular RBAC, and zero-trust perimeter controls for corporate trading desks.',
      badge: 'SOC 2 Type II Certified',
    },
    {
      icon: Code2,
      title: 'Enterprise REST & WebSocket APIs',
      desc: 'Standardized JSON and gRPC endpoints for direct integration with trade surveillance desks, commodity ERPs (SAP/Oracle), vessel management systems, and proprietary quant models.',
      badge: 'API & Webhooks Ready',
    },
  ];

  return (
    <section id="enterprise-trust" className="oceanlens-trust-section" aria-labelledby="trust-heading">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-block">
          <span className="section-eyebrow">Enterprise Reliability</span>
          <h2 id="trust-heading" className="section-title">
            Engineered for Mission-Critical Maritime Decisions
          </h2>
          <p className="section-subtitle">
            Trusted by commercial operators, energy traders, and intelligence analysts who cannot afford latency, blind spots, or unverified data.
          </p>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="trust-pillars-grid">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="trust-pillar-card">
                <div className="pillar-header">
                  <div className="pillar-icon-wrap" aria-hidden="true">
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <span className="pillar-badge">{pillar.badge}</span>
                </div>

                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Verification & Compliance Assurance Banner */}
        <div className="trust-assurance-bar" role="region" aria-label="System Reliability Status">
          <div className="assurance-item">
            <Check size={16} className="assurance-check" aria-hidden="true" />
            <span><strong>99.98%</strong> Operational Telemetry SLA</span>
          </div>
          <div className="assurance-divider" aria-hidden="true">/</div>
          <div className="assurance-item">
            <Check size={16} className="assurance-check" aria-hidden="true" />
            <span><strong>120M+</strong> AIS Signals Processed Daily</span>
          </div>
          <div className="assurance-divider" aria-hidden="true">/</div>
          <div className="assurance-item">
            <Check size={16} className="assurance-check" aria-hidden="true" />
            <span><strong>IMO / ECA</strong> Carbon Compliance Standard</span>
          </div>
          <div className="assurance-divider" aria-hidden="true">/</div>
          <div className="assurance-item">
            <Check size={16} className="assurance-check" aria-hidden="true" />
            <span><strong>AES-256</strong> Encrypted Storage</span>
          </div>
        </div>
      </div>
    </section>
  );
}
