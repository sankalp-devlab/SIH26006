import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Zap, Radio, Anchor, Navigation2, Activity, TrendingUp, Ship } from 'lucide-react';
import { DataAnnotation } from './DataAnnotation';

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export function HeroSection({ onOpenDemo }: HeroSectionProps) {
  return (
    <section className="oceanlens-hero" aria-label="Hero Introduction">
      {/* Background Vessel Scene: Container ship is the primary visual anchor */}
      <div
        className="hero-background-vessel"
        role="img"
        aria-label="Container ship underway at sea loaded with cargo"
      />

      {/* Atmospheric overlays: subtle left gradient for text contrast; clear view of ship on right */}
      <div className="hero-gradient-overlay-left" aria-hidden="true" />
      <div className="hero-gradient-overlay-bottom" aria-hidden="true" />
      <div className="hero-gradient-overlay-top" aria-hidden="true" />

      {/* Two-Layer Composition Container */}
      <div className="hero-container">
        {/* Left-Aligned Foreground Content Block */}
        <div className="hero-left-content">
          {/* Subtle Institutional Badge */}
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            <span className="hero-eyebrow-text">Maritime Intelligence Platform</span>
          </div>

          {/* Main Headline - Editorial Hierarchy, High Contrast, Solid Typography */}
          <h1 className="hero-heading">
            <span className="heading-primary">Global Oil &amp; Shipping</span>
            <span className="heading-accent">Intelligence, Connected.</span>
          </h1>

          {/* Authoritative Supporting Copy */}
          <p className="hero-description">
            Unify real-time AIS vessel telemetry, commodity flow tracking, freight rate
            benchmarks, and maritime corridor intelligence into a single decision platform
            engineered for charterers, energy traders, and fleet operators.
          </p>

          {/* Action Row */}
          <div className="hero-cta-group">
            <Link to="/dashboard" className="hero-primary-cta" id="hero-explore-platform-btn">
              <span>Explore Platform</span>
              <ArrowRight size={16} className="cta-arrow" aria-hidden="true" />
            </Link>

            <button
              type="button"
              className="hero-secondary-cta"
              onClick={onOpenDemo}
              id="hero-watch-demo-btn"
              aria-label="Open OceanLens interactive platform demo"
            >
              <div className="play-icon-badge" aria-hidden="true">
                <Play size={12} fill="currentColor" />
              </div>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Credibility Indicator Row */}
          <div className="hero-credibility-row" aria-label="Key Platform Metrics">
            <div className="credibility-item">
              <Radio size={14} className="credibility-icon" aria-hidden="true" />
              <span>50,000+ Vessels Live</span>
            </div>
            <span className="credibility-divider" aria-hidden="true">/</span>
            <div className="credibility-item">
              <Zap size={14} className="credibility-icon" aria-hidden="true" />
              <span>Sub-second Latency</span>
            </div>
            <span className="credibility-divider" aria-hidden="true">/</span>
            <div className="credibility-item">
              <Shield size={14} className="credibility-icon" aria-hidden="true" />
              <span>Enterprise Grade</span>
            </div>
          </div>
        </div>

        {/* Right Stage: Interactive Maritime Annotations with Pointer & Connector Lines */}
        {/* Connected directly to specific zones on the container vessel & maritime environment */}
        <div className="hero-visual-stage" aria-label="Live Telemetry Overlay">
          {/* Node 1: GLOBAL FLEET (Top Left - Forward Container Stack) */}
          <div className="annotation-node node-global-fleet">
            <DataAnnotation
              label="GLOBAL FLEET"
              value="54,298"
              change="+4.2%"
              changeType="positive"
              subtext="Class-A Satellite Telemetry"
              icon={Navigation2}
            />
            <div className="pointer-system pointer-down-right" aria-hidden="true">
              <svg className="connector-svg" width="85" height="70" viewBox="0 0 85 70" fill="none">
                <path d="M 5 5 L 42 42 L 78 62" className="connector-path-base" />
                <path d="M 5 5 L 42 42 L 78 62" className="connector-path-highlight" />
              </svg>
              <div className="pointer-beacon" style={{ left: '78px', top: '62px' }}>
                <div className="beacon-ring" />
                <div className="beacon-ring ring-delay" />
                <div className="beacon-dot" />
              </div>
            </div>
          </div>

          {/* Node 2: CRUDE SPOT (Top Right - Aft Vessel Manifold) */}
          <div className="annotation-node node-crude-spot">
            <DataAnnotation
              label="CRUDE SPOT"
              value="$82.46 / bbl"
              change="+1.8% today"
              changeType="positive"
              subtext="VLCC AG – China (TD3C)"
              icon={TrendingUp}
            />
            <div className="pointer-system pointer-down-left" aria-hidden="true">
              <svg className="connector-svg" width="85" height="70" viewBox="0 0 85 70" fill="none">
                <path d="M 80 5 L 42 42 L 8 62" className="connector-path-base" />
                <path d="M 80 5 L 42 42 L 8 62" className="connector-path-highlight" />
              </svg>
              <div className="pointer-beacon" style={{ left: '8px', top: '62px' }}>
                <div className="beacon-ring" />
                <div className="beacon-ring ring-delay" />
                <div className="beacon-dot" />
              </div>
            </div>
          </div>

          {/* Node 3: LIVE AIS FEED (Center - Superstructure Bridge & Radar Mast) */}
          <div className="annotation-node node-ais-feed">
            <DataAnnotation
              label="LIVE AIS FEED"
              value="Vessel Underway"
              change="98.4% Confidence"
              changeType="info"
              subtext="Superstructure Radar Telemetry"
              icon={Activity}
            />
            <div className="pointer-system pointer-straight-right" aria-hidden="true">
              <svg className="connector-svg" width="95" height="28" viewBox="0 0 95 28" fill="none">
                <path d="M 5 14 L 55 14 L 88 14" className="connector-path-base" />
                <path d="M 5 14 L 55 14 L 88 14" className="connector-path-highlight" />
              </svg>
              <div className="pointer-beacon" style={{ left: '88px', top: '14px' }}>
                <div className="beacon-ring" />
                <div className="beacon-ring ring-delay" />
                <div className="beacon-dot" />
              </div>
            </div>
          </div>

          {/* Node 4: CHOKEPOINT TRANSIT (Lower Left - Foaming Bow Cutwater Wake) */}
          <div className="annotation-node node-chokepoint">
            <DataAnnotation
              label="CHOKEPOINT TRANSIT"
              value="14.2 kn"
              change="Normal Flow"
              changeType="info"
              subtext="Strait of Malacca Corridor"
              icon={Anchor}
            />
            <div className="pointer-system pointer-up-right" aria-hidden="true">
              <svg className="connector-svg" width="85" height="70" viewBox="0 0 85 70" fill="none">
                <path d="M 5 65 L 42 30 L 78 8" className="connector-path-base" />
                <path d="M 5 65 L 42 30 L 78 8" className="connector-path-highlight" />
              </svg>
              <div className="pointer-beacon" style={{ left: '78px', top: '8px' }}>
                <div className="beacon-ring" />
                <div className="beacon-ring ring-delay" />
                <div className="beacon-dot" />
              </div>
            </div>
          </div>

          {/* Node 5: FLEET UTILIZATION (Lower Right - Foaming Stern Propeller Wash) */}
          <div className="annotation-node node-utilization">
            <DataAnnotation
              label="FLEET UTILIZATION"
              value="91.8%"
              change="+3.4%"
              changeType="positive"
              subtext="Commercial Tanker Capacity"
              icon={Ship}
            />
            <div className="pointer-system pointer-up-left" aria-hidden="true">
              <svg className="connector-svg" width="85" height="70" viewBox="0 0 85 70" fill="none">
                <path d="M 80 65 L 42 30 L 8 8" className="connector-path-base" />
                <path d="M 80 65 L 42 30 L 8 8" className="connector-path-highlight" />
              </svg>
              <div className="pointer-beacon" style={{ left: '8px', top: '8px' }}>
                <div className="beacon-ring" />
                <div className="beacon-ring ring-delay" />
                <div className="beacon-dot" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
