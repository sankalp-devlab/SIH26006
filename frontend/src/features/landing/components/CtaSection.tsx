import { Link } from 'react-router-dom';
import { ArrowRight, Play, Compass } from 'lucide-react';

interface CtaSectionProps {
  onOpenDemo: () => void;
}

export function CtaSection({ onOpenDemo }: CtaSectionProps) {
  return (
    <section className="oceanlens-cta-section" aria-labelledby="cta-heading">
      <div className="section-container">
        <div className="cta-panel-card">
          <div className="cta-content-wrap">
            <div className="cta-brand-badge">
              <Compass size={16} strokeWidth={2.4} aria-hidden="true" />
              <span>OceanLens Platform</span>
            </div>

            <h2 id="cta-heading" className="cta-title">
              Ready to Accelerate Your Maritime &amp; Commodity Intelligence?
            </h2>

            <p className="cta-description">
              Access real-time vessel tracking, comprehensive market spreads, and corridor analytics. Built for professionals managing global supply risk.
            </p>

            <div className="cta-buttons-group">
              <Link to="/dashboard" className="hero-primary-cta" id="cta-launch-btn">
                <span>Launch Platform</span>
                <ArrowRight size={16} className="cta-arrow" aria-hidden="true" />
              </Link>

              <button
                type="button"
                className="hero-secondary-cta"
                onClick={onOpenDemo}
                id="cta-demo-btn"
                aria-label="Open OceanLens platform interactive demo"
              >
                <div className="play-icon-badge" aria-hidden="true">
                  <Play size={12} fill="currentColor" />
                </div>
                <span>Watch Interactive Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
