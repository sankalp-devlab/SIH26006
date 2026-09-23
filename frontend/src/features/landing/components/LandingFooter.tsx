import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="oceanlens-footer" role="contentinfo">
      <div className="section-container">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link
              to="/"
              className="navbar-brand-link"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="OceanLens Home"
            >
              <div className="navbar-logo-icon" aria-hidden="true">
                <Compass size={20} strokeWidth={2.2} />
              </div>
              <div className="navbar-brand-text">
                <span className="navbar-brand-name">OceanLens</span>
                <span className="navbar-brand-tagline">Maritime Intelligence</span>
              </div>
            </Link>

            <p className="footer-brand-desc">
              Global maritime decision platform unifying real-time AIS vessel telemetry,
              freight benchmarks, commodity flow analytics, and maritime corridor planning for commercial leaders.
            </p>

            {/* Live Operational Status Indicator */}
            <div className="footer-status-pill" role="status" aria-label="System operational status">
              <span className="status-live-dot" aria-hidden="true">●</span>
              <span>All Systems Operational</span>
              <span className="status-divider" aria-hidden="true">·</span>
              <span className="status-sub">250ms Telemetry Stream</span>
            </div>
          </div>

          {/* Column 1: Core Platform */}
          <div className="footer-links-col">
            <h3 className="footer-links-title">Platform Modules</h3>
            <ul className="footer-links-list">
              <li><Link to="/vessels">Vessel Tracking &amp; AIS</Link></li>
              <li><Link to="/market-prices">Market Prices &amp; FFA Curves</Link></li>
              <li><Link to="/flows">Oil &amp; Commodity Flows</Link></li>
              <li><Link to="/analytics">Analytics &amp; Forecasting</Link></li>
              <li><Link to="/reports">Executive Market Reports</Link></li>
              <li><Link to="/dashboard">Operations Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 2: Corridors & Logistics */}
          <div className="footer-links-col">
            <h3 className="footer-links-title">Corridors &amp; Routing</h3>
            <ul className="footer-links-list">
              <li><Link to="/ports">Global Seaport Registry</Link></li>
              <li><Link to="/routes">Route &amp; Chokepoint Intelligence</Link></li>
              <li><Link to="/voyage-calculator">Voyage &amp; Laytime Calculator</Link></li>
              <li><Link to="/distance-calculator">Nautical Distance Matrix</Link></li>
              <li><Link to="/fixtures">Fixtures &amp; Charters Log</Link></li>
              <li><Link to="/emissions">IMO CII &amp; Carbon Analytics</Link></li>
            </ul>
          </div>

          {/* Column 3: Enterprise Trust & Compliance */}
          <div className="footer-links-col">
            <h3 className="footer-links-title">Institutional Trust</h3>
            <div className="footer-trust-list">
              <div className="trust-badge-row">
                <ShieldCheck size={16} className="trust-icon success" aria-hidden="true" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="trust-badge-row">
                <Lock size={16} className="trust-icon accent" aria-hidden="true" />
                <span>Zero-Trust Architecture</span>
              </div>
              <div className="trust-badge-row">
                <CheckCircle2 size={16} className="trust-icon info" aria-hidden="true" />
                <span>IMO / ECA Standard Compliant</span>
              </div>
            </div>

            <div className="footer-api-callout">
              <span className="api-callout-text">
                High-throughput REST &amp; WebSocket APIs ready for enterprise ERP integration.
              </span>
              <Link to="/dashboard" className="api-callout-link">
                <span>API Documentation</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom-row">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} OceanLens Intelligence Inc. All rights reserved.
          </div>
          <div className="footer-bottom-meta">
            <span>Telemetry Stream: Class-A Verified</span>
            <span className="meta-sep" aria-hidden="true">·</span>
            <span>Security: Zero-Trust Perimeter</span>
            <span className="meta-sep" aria-hidden="true">·</span>
            <Link to="/dashboard" className="footer-console-link">
              Console Access &rarr;
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
