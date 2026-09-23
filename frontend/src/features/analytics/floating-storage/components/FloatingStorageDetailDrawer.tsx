import { useNavigate } from 'react-router-dom';
import {
  X,
  Ship,
  Droplets,
  Clock,
  MapPin,
  ExternalLink,
  Shield,
} from 'lucide-react';
import type { FloatingStorageObservationRecord } from '../../../../types/floating-storage';

interface FloatingStorageDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: FloatingStorageObservationRecord | null;
}

export function FloatingStorageDetailDrawer({
  isOpen,
  onClose,
  vessel,
}: FloatingStorageDetailDrawerProps) {
  const navigate = useNavigate();

  if (!isOpen || !vessel) return null;

  const statusLabel =
    vessel.storageStatus === 'confirmed_storage'
      ? 'Confirmed Floating Storage'
      : vessel.storageStatus === 'drifting_laden'
      ? 'Drifting Laden (Pending STS)'
      : 'Long-term Holding (Strategic)';

  const statusBadgeStyle =
    vessel.storageStatus === 'confirmed_storage'
      ? {
          color: 'var(--ol-amber, #F59E0B)',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
        }
      : vessel.storageStatus === 'drifting_laden'
      ? {
          color: 'var(--ol-cyan, #22D3EE)',
          backgroundColor: 'rgba(34, 211, 238, 0.12)',
          border: '1px solid rgba(34, 211, 238, 0.35)',
        }
      : {
          color: '#C084FC',
          backgroundColor: 'rgba(192, 132, 252, 0.12)',
          border: '1px solid rgba(192, 132, 252, 0.35)',
        };

  return (
    <div
      className="fs-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="fs-drawer-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="fs-drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  ...statusBadgeStyle,
                }}
              >
                {statusLabel}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)', fontFamily: 'var(--font-mono, monospace)' }}>
                {vessel.dataState.toUpperCase()} AIS
              </span>
            </div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--ol-text-primary, #F1F5F9)',
                margin: '0 0 4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Ship size={18} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              {vessel.vesselName}
            </h2>
            <p style={{ fontSize: '11.5px', color: 'var(--ol-text-secondary, #94A3B8)', margin: 0 }}>
              IMO {vessel.imoNumber} • {vessel.vesselClass} • Flag: {vessel.flag}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="fs-drawer-close-btn"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="fs-drawer-body">
          {/* 1. Stationary Telemetry Banner */}
          <div className="fs-drawer-section">
            <div className="fs-drawer-section-title" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Clock size={14} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
                <span>Stationary Surveillance</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ol-amber, #F59E0B)', fontFamily: 'var(--font-mono, monospace)' }}>
                {vessel.stationaryDays} Days Stationary
              </span>
            </div>
            <div className="fs-drawer-grid-2col">
              <div className="fs-drawer-stat-item">
                <span className="fs-drawer-label">Stationary Since:</span>
                <div className="fs-drawer-value">
                  {new Date(vessel.stationarySince).toUTCString().slice(5, 22)}
                </div>
              </div>
              <div className="fs-drawer-stat-item">
                <span className="fs-drawer-label">Last AIS Fix:</span>
                <div className="fs-drawer-value">
                  {new Date(vessel.observedAt).toUTCString().slice(5, 22)}
                </div>
              </div>
              <div className="fs-drawer-stat-item">
                <span className="fs-drawer-label">Current Speed (SOG):</span>
                <div className="fs-drawer-value" style={{ color: 'var(--ol-emerald, #10B981)' }}>
                  {vessel.speedKnots.toFixed(1)} knots (Stationary)
                </div>
              </div>
              <div className="fs-drawer-stat-item">
                <span className="fs-drawer-label">Laden Draft:</span>
                <div className="fs-drawer-value">
                  {vessel.draftMeters.toFixed(1)} meters
                </div>
              </div>
            </div>
          </div>

          {/* 2. Cargo & Valuation Specs */}
          <div className="fs-drawer-section">
            <div className="fs-drawer-section-title">
              <Droplets size={14} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <span>Immobilized Cargo &amp; Valuation</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Cargo Type:</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                  {vessel.cargoType}
                </span>
              </div>
              {vessel.crudeGrade && (
                <div className="fs-drawer-row">
                  <span className="fs-drawer-label">Crude Benchmark Grade:</span>
                  <span style={{ fontWeight: 700, color: 'var(--ol-amber, #F59E0B)' }}>
                    {vessel.crudeGrade}
                  </span>
                </div>
              )}
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Stored Barrels:</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #22D3EE)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {vessel.volumeBbl.toLocaleString()} bbl
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Metric Weight:</span>
                <span style={{ fontWeight: 600, color: 'var(--ol-text-secondary, #94A3B8)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {vessel.volumeMt.toLocaleString()} MT
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Capacity Utilization:</span>
                <span style={{ fontWeight: 700, color: '#C084FC' }}>
                  {vessel.capacityUtilizationPct}%
                </span>
              </div>
              <div
                className="fs-drawer-row"
                style={{
                  paddingTop: '8px',
                  marginTop: '4px',
                  borderTop: '1px solid rgba(100, 190, 240, 0.12)',
                }}
              >
                <span className="fs-drawer-label">Est. Cargo Value:</span>
                <span
                  style={{
                    fontWeight: 800,
                    color: 'var(--ol-emerald, #10B981)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  ${(vessel.estimatedCargoValueUsd / 1_000_000).toFixed(2)}M USD
                </span>
              </div>
            </div>
          </div>

          {/* 3. Geographic Hub & Anchorage Coordinates */}
          <div className="fs-drawer-section">
            <div className="fs-drawer-section-title">
              <MapPin size={14} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              <span>Geographic Deployment &amp; Hub</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Offshore Hub:</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                  {vessel.region}
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Anchorage Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                  {vessel.anchorageName}
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Territorial Waters:</span>
                <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  {vessel.country}
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">WGS84 Coordinates:</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)', fontSize: '11.5px' }}>
                  {vessel.latitude.toFixed(4)}° N, {vessel.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>

          {/* 4. Commercial Ownership & Charterer */}
          <div className="fs-drawer-section">
            <div className="fs-drawer-section-title">
              <Shield size={14} style={{ color: '#C084FC' }} />
              <span>Commercial Ownership &amp; Operator</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Registered Owner:</span>
                <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                  {vessel.ownerName}
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Commercial Operator:</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-amber, #F59E0B)' }}>
                  {vessel.operatorName}
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Deadweight (DWT):</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  {vessel.dwt.toLocaleString()} MT
                </span>
              </div>
              <div className="fs-drawer-row">
                <span className="fs-drawer-label">Year Built:</span>
                <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  {vessel.yearBuilt} ({new Date().getFullYear() - vessel.yearBuilt} yrs old)
                </span>
              </div>
            </div>
          </div>

          {/* 5. Cross-Module Deep Links (Eliminating White Buttons!) */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ol-text-secondary, #94A3B8)',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                marginBottom: '10px',
              }}
            >
              <ExternalLink size={14} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              <span>Cross-Module Intelligence Integrations</span>
            </div>
            <div className="fs-modules-grid">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/vessels?search=${encodeURIComponent(vessel.imoNumber)}`);
                }}
                className="fs-module-card"
              >
                <div className="fs-module-header">
                  <span className="fs-module-title">Vessels Tracker</span>
                  <ExternalLink size={12} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
                </div>
                <div className="fs-module-desc">Live voyage &amp; AIS track</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/waypoints');
                }}
                className="fs-module-card"
              >
                <div className="fs-module-header">
                  <span className="fs-module-title">Waypoints &amp; Canals</span>
                  <ExternalLink size={12} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
                </div>
                <div className="fs-module-desc">34 maritime chokepoints</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/fleets?search=${encodeURIComponent(vessel.ownerName)}`);
                }}
                className="fs-module-card"
              >
                <div className="fs-module-header">
                  <span className="fs-module-title">Fleet Analytics</span>
                  <ExternalLink size={12} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
                </div>
                <div className="fs-module-desc">Owner &amp; fleet benchmarking</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/flows?commodity=${encodeURIComponent(vessel.cargoType)}`);
                }}
                className="fs-module-card"
              >
                <div className="fs-module-header">
                  <span className="fs-module-title">Commodity Flows</span>
                  <ExternalLink size={12} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
                </div>
                <div className="fs-module-desc">Global trade flow matrices</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

