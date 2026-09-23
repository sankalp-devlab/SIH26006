import { useNavigate } from 'react-router-dom';
import {
  X,
  Ship,
  MapPin,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import { VoyageTimeline } from './VoyageTimeline';
import type { VoyageRecord } from '../../../types/voyage';

interface VoyageDetailDrawerProps {
  voyage: VoyageRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onLocateEvent?: (lat: number, lng: number, label: string) => void;
}

export function VoyageDetailDrawer({
  voyage,
  isOpen,
  onClose,
  onLocateEvent,
}: VoyageDetailDrawerProps) {
  const navigate = useNavigate();

  if (!isOpen || !voyage) return null;

  const isLaden = voyage.current_leg_type === 'laden';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          height: '100%',
          background: 'var(--color-bg-surface)',
          borderLeft: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1001,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand-accent)', fontWeight: 700 }}>
                Voyage Lifecycle Intelligence
              </span>
              <span
                className="badge"
                style={{
                  background: isLaden ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  color: isLaden ? '#10b981' : '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {isLaden ? 'Laden Leg' : 'Ballast Leg'}
              </span>
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {voyage.voyage_number}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <Ship size={14} />
              <strong style={{ color: 'var(--color-text-primary)' }}>{voyage.vessel_name}</strong>
              <span>&middot;</span>
              <span style={{ fontFamily: 'monospace' }}>{voyage.imo_number}</span>
              <span>&middot;</span>
              <span>{voyage.vessel_type}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: '6px' }}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Corridor Origin -> Destination Banner */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#10b981', fontWeight: 700 }}>
                  Origin Port
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {voyage.origin_port.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {voyage.origin_port.country}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Dep: {voyage.departure_date}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-brand-accent)', fontWeight: 600 }}>
                  {voyage.distance_total_nm.toLocaleString()} NM
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0' }}>
                  <div style={{ width: '40px', height: '2px', background: 'var(--color-border-subtle)' }} />
                  <ArrowRight size={14} color="var(--color-brand-accent)" />
                  <div style={{ width: '40px', height: '2px', background: 'var(--color-border-subtle)' }} />
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {voyage.distance_to_go_nm.toLocaleString()} NM to go
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700 }}>
                  Destination Port
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {voyage.destination_port.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {voyage.destination_port.country}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                  ETA: {voyage.eta_date}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Speed</span>
              <strong style={{ fontSize: '1rem', fontFamily: 'monospace' }}>{voyage.current_speed_knots.toFixed(1)} kn</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Draft</span>
              <strong style={{ fontSize: '1rem', fontFamily: 'monospace' }}>{voyage.current_draft_m} m</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Cargo MT</span>
              <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                {voyage.cargo_manifest.quantity_mt > 0 ? voyage.cargo_manifest.quantity_mt.toLocaleString() : '0'}
              </strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Status</span>
              <StatusBadge status={voyage.status} />
            </div>
          </div>

          {/* Commercial & Fixture Particulars */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Shield size={16} color="var(--color-brand-accent)" />
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Commercial & Fixture Particulars</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Commercial Operator</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{voyage.operator}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Charterer</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{voyage.charterer}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Cargo Commodity</span>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{voyage.cargo_manifest.commodity}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Stowage & Hazard</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {voyage.cargo_manifest.stowage_factor > 0 ? `SF ${voyage.cargo_manifest.stowage_factor}` : 'N/A'} &middot; {voyage.cargo_manifest.hazard_class || 'General Dry'}
                </span>
              </div>
            </div>
          </div>

          {/* Lifecycle Stepper Timeline */}
          <VoyageTimeline voyage={voyage} onLocateEvent={onLocateEvent} />

          {/* Navigation Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => navigate(`/map?vessel=${voyage.vessel_id}`)}
            >
              <MapPin size={14} />
              <span>Track Vessel on Live Map</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => navigate(`/vessels/${voyage.vessel_id}`)}
            >
              <Ship size={14} />
              <span>Open Vessel Registry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
