import { X, Anchor, Ship, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Port } from '../../../types/port';

interface PortDetailDrawerProps {
  port: Port | null;
  onClose: () => void;
}

export function PortDetailDrawer({ port, onClose }: PortDetailDrawerProps) {
  if (!port) return null;

  return (
    <div className="cc-drawer-overlay" onClick={onClose}>
      <div className="cc-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cc-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <Anchor size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {port.name}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {port.country || 'Global Hub'} &middot; UN/LOCODE: <code>{port.unlocode || 'N/A'}</code>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="cc-drawer-body">
          {/* Key Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <div className="cc-panel" style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>
                Vessel Calls (30D)
              </div>
              <div className="cc-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                1,420
              </div>
              <span className="cc-badge cc-badge-positive" style={{ marginTop: '2px' }}>
                +4.8% YoY
              </span>
            </div>

            <div className="cc-panel" style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>
                Cargo Handled
              </div>
              <div className="cc-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                54.2 MT
              </div>
              <span className="cc-badge cc-badge-cyan" style={{ marginTop: '2px' }}>
                Crude & Containers
              </span>
            </div>

            <div className="cc-panel" style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>
                Avg Anchorage Wait
              </div>
              <div className="cc-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
                18.4 hrs
              </div>
              <span style={{ fontSize: '0.625rem', color: '#64748b' }}>Median turnaround</span>
            </div>

            <div className="cc-panel" style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>
                Congestion Index
              </div>
              <div className="cc-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
                Normal (34%)
              </div>
              <span style={{ fontSize: '0.625rem', color: '#34d399' }}>Optimal throughput</span>
            </div>
          </div>

          {/* Operational Specifications */}
          <div className="cc-panel" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Harbor Specifications
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '3px' }}>
                <span style={{ color: '#64748b' }}>Coordinates:</span>
                <span className="cc-mono" style={{ color: '#cbd5e1' }}>
                  {port.latitude?.toFixed(4)}°, {port.longitude?.toFixed(4)}°
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '3px' }}>
                <span style={{ color: '#64748b' }}>Harbor Type:</span>
                <span style={{ color: '#cbd5e1' }}>{port.port_type || 'Coastal Natural'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '3px' }}>
                <span style={{ color: '#64748b' }}>Harbor Size:</span>
                <span style={{ color: '#cbd5e1' }}>{port.harbor_size || 'Very Large'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Max Channel Depth:</span>
                <span className="cc-mono" style={{ color: '#38bdf8' }}>18.5 m</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="cc-panel" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Recent Vessel Movements
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.71875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Ship size={12} color="#34d399" />
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>EVER GIVEN (20,000 TEU)</span>
                </div>
                <span className="cc-mono" style={{ color: '#34d399', fontSize: '0.65rem' }}>BERTHED</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Ship size={12} color="#fbbf24" />
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>TI OCEANIA (VLCC)</span>
                </div>
                <span className="cc-mono" style={{ color: '#fbbf24', fontSize: '0.65rem' }}>ANCHORED</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Ship size={12} color="#38bdf8" />
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>BERGE BULK (Capesize)</span>
                </div>
                <span className="cc-mono" style={{ color: '#38bdf8', fontSize: '0.65rem' }}>DEPARTED</span>
              </div>
            </div>
          </div>

          {/* Link to Full Seaport Analytics */}
          <Link
            to="/ports"
            className="cc-btn-action"
            style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
          >
            <span>Open Port Intelligence Terminal</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
