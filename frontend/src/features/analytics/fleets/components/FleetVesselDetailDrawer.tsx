/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleet Vessel Detail Slide-out Drawer with Cross-Module Deep Links
 * Canonical Enterprise Design System Refactor
 */

import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Ship,
  Building2,
  Briefcase,
  MapPin,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { FleetVesselRecord } from '../../../../types/fleets';

interface FleetVesselDetailDrawerProps {
  vessel: FleetVesselRecord | null;
  onClose: () => void;
}

export const FleetVesselDetailDrawer: FC<FleetVesselDetailDrawerProps> = ({
  vessel,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!vessel) return null;

  const age = Math.max(0, 2026 - vessel.yearBuilt);

  return (
    <div className="fi-drawer-backdrop" onClick={onClose}>
      <div className="fi-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="fi-drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 211, 238, 0.12)', color: 'var(--ol-cyan, #22D3EE)', border: '1px solid rgba(34, 211, 238, 0.25)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                {vessel.vesselClass}
              </span>
              <span className={`fi-badge ${vessel.deployment.status === 'underway' ? 'fi-badge-underway' : 'fi-badge-anchored'}`}>
                {vessel.deployment.status}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em' }}>
              <Ship size={20} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <span>{vessel.name}</span>
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)', marginTop: '3px' }}>
              IMO: {vessel.imoNumber} • Flag Registry: <strong style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>{vessel.flag}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            className="fi-page-btn"
            style={{ width: '32px', height: '32px', padding: 0 }}
            title="Close Inspector"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="fi-drawer-body">
          {/* 1. Commercial Structure Separation */}
          <div className="fi-drawer-section">
            <div className="fi-drawer-section-title">
              <Building2 size={13} />
              <span>Commercial Structure</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'var(--ol-surface-elevated, #0F2437)', border: '1px solid rgba(100, 190, 240, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--ol-text-muted, #64748B)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Beneficial Asset Owner
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Building2 size={13} style={{ color: '#C084FC' }} />
                    {vessel.ownerName}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>{vessel.ownerCountry}</span>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'var(--ol-surface-elevated, #0F2437)', border: '1px solid rgba(100, 190, 240, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--ol-text-muted, #64748B)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Commercial Operator / Charterer
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #22D3EE)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Briefcase size={13} style={{ color: '#10B981' }} />
                    {vessel.operatorName}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>{vessel.operatorCountry}</span>
              </div>
            </div>
          </div>

          {/* 2. Technical & Environmental Specs */}
          <div className="fi-drawer-section">
            <div className="fi-drawer-section-title">
              <Layers size={13} />
              <span>Technical & Environmental Specifications</span>
            </div>

            <div className="fi-drawer-stat-grid">
              <div className="fi-drawer-stat-box">
                <span className="fi-drawer-stat-label">Deadweight</span>
                <span className="fi-drawer-stat-value">{vessel.dwt.toLocaleString()} DWT</span>
              </div>
              <div className="fi-drawer-stat-box">
                <span className="fi-drawer-stat-label">Gross Tonnage</span>
                <span className="fi-drawer-stat-value">{vessel.grossTonnage.toLocaleString()} GT</span>
              </div>
              <div className="fi-drawer-stat-box">
                <span className="fi-drawer-stat-label">Year Built / Age</span>
                <span className="fi-drawer-stat-value">{vessel.yearBuilt} ({age} yrs)</span>
              </div>
              <div className="fi-drawer-stat-box">
                <span className="fi-drawer-stat-label">CII Rating</span>
                <span className="fi-drawer-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`fi-cii-badge fi-cii-${vessel.ciiRating.toLowerCase()}`}>
                    {vessel.ciiRating}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ol-text-secondary, #94A3B8)' }}>Grade</span>
                </span>
              </div>
            </div>

            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(100, 190, 240, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Daily Fuel Consumption:</span>
                <span style={{ fontWeight: 600, color: '#F59E0B' }}>{vessel.dailyFuelConsumptionMt} MT / day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Primary Commodity:</span>
                <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>{vessel.primaryCommodity}</span>
              </div>
            </div>
          </div>

          {/* 3. Live Voyage & Deployment Coordinates */}
          <div className="fi-drawer-section">
            <div className="fi-drawer-section-title">
              <MapPin size={13} />
              <span>Live Deployment & Coordinates</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} style={{ color: 'var(--ol-cyan, #22D3EE)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontSize: '12.5px' }}>
                    {vessel.deployment.subArea}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
                    {vessel.deployment.region} ({vessel.deployment.country})
                  </div>
                </div>
              </div>

              <div className="fi-drawer-stat-grid">
                <div className="fi-drawer-stat-box">
                  <span className="fi-drawer-stat-label">Latitude</span>
                  <span className="fi-drawer-stat-value" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>
                    {vessel.deployment.latitude.toFixed(4)}° N
                  </span>
                </div>
                <div className="fi-drawer-stat-box">
                  <span className="fi-drawer-stat-label">Longitude</span>
                  <span className="fi-drawer-stat-value" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>
                    {vessel.deployment.longitude.toFixed(4)}° E
                  </span>
                </div>
                <div className="fi-drawer-stat-box">
                  <span className="fi-drawer-stat-label">Speed Over Ground</span>
                  <span className="fi-drawer-stat-value">{vessel.deployment.speedKnots} kts</span>
                </div>
                <div className="fi-drawer-stat-box">
                  <span className="fi-drawer-stat-label">Heading</span>
                  <span className="fi-drawer-stat-value">{vessel.deployment.heading}°</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Destination Port:</span>
                  <strong style={{ color: 'var(--ol-cyan, #22D3EE)' }}>{vessel.deployment.destinationPort}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Estimated Arrival (ETA):</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {vessel.deployment.eta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cross-Module Deep Links */}
          <div className="fi-drawer-section">
            <div className="fi-drawer-section-title">
              <Layers size={13} />
              <span>Cross-Module Intelligence Links</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => navigate(`/analytics/flows?vesselClass=${encodeURIComponent(vessel.vesselClass)}`)}
                className="fi-deep-link-btn"
              >
                <div>
                  <div className="fi-deep-link-title">Module 16: Trade Flows</div>
                  <div className="fi-deep-link-desc">Inspect {vessel.vesselClass} commodity flows</div>
                </div>
                <ArrowUpRight size={14} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
              </button>

              <button
                onClick={() => navigate(`/analytics/orderbook?vesselClass=${encodeURIComponent(vessel.vesselClass)}`)}
                className="fi-deep-link-btn"
              >
                <div>
                  <div className="fi-deep-link-title">Module 17: Orderbook & Deliveries</div>
                  <div className="fi-deep-link-desc">Newbuilding orders & fleet expansion for {vessel.vesselClass}</div>
                </div>
                <ArrowUpRight size={14} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
              </button>

              <button
                onClick={() => navigate('/analytics/waypoints')}
                className="fi-deep-link-btn"
              >
                <div>
                  <div className="fi-deep-link-title">Module 18: Waypoints & Chokepoints</div>
                  <div className="fi-deep-link-desc">Track 34 strategic maritime passages & canal congestion</div>
                </div>
                <ArrowUpRight size={14} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
              </button>

              <button
                onClick={() => navigate('/analytics/market')}
                className="fi-deep-link-btn"
              >
                <div>
                  <div className="fi-deep-link-title">Module 5: Market Insights & Freight Routes</div>
                  <div className="fi-deep-link-desc">Baltic route benchmarks & supply-demand signals</div>
                </div>
                <ArrowUpRight size={14} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
