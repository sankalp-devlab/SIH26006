import {
  Anchor,
  Navigation,
  Clock,
  MapPin,
  Calendar,
  Compass,
  Layers,
} from 'lucide-react';
import type { VoyageRecord } from '../../../types/voyage';

interface VoyageTimelineProps {
  voyage: VoyageRecord;
  onLocateEvent?: (lat: number, lng: number, label: string) => void;
}

export function VoyageTimeline({ voyage, onLocateEvent }: VoyageTimelineProps) {
  const isLaden = voyage.current_leg_type === 'laden';

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '8px',
        padding: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} color="var(--color-brand-accent)" />
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Voyage Lifecycle & Timeline &middot; {voyage.voyage_number}
          </h3>
        </div>
        <span
          className="badge"
          style={{
            background: isLaden ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
            color: isLaden ? '#10b981' : '#38bdf8',
            border: `1px solid ${isLaden ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
            fontWeight: 600,
          }}
        >
          {isLaden ? 'Laden Voyage' : 'Ballast Repositioning'}
        </span>
      </div>

      {/* Stepper track */}
      <div style={{ position: 'relative', paddingLeft: '28px' }}>
        {/* Vertical line connecting nodes */}
        <div
          style={{
            position: 'absolute',
            left: '11px',
            top: '12px',
            bottom: '12px',
            width: '2px',
            background: 'var(--color-border-subtle)',
          }}
        />

        {/* 1. Origin Departure Event */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div
            style={{
              position: 'absolute',
              left: '-28px',
              top: '2px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)',
            }}
          >
            <Anchor size={13} />
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Origin &middot; Loading / Departure
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {voyage.origin_port.name} ({voyage.origin_port.country})
                </h4>
              </div>
              {onLocateEvent && (
                <button
                  type="button"
                  onClick={() => onLocateEvent(voyage.origin_port.latitude, voyage.origin_port.longitude, voyage.origin_port.name)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 6px', fontSize: '0.6875rem', height: 'auto' }}
                >
                  <MapPin size={12} /> Focus
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
              <span><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Dep: {voyage.departure_date}</span>
              <span>Cargo: <strong style={{ color: 'var(--color-text-secondary)' }}>{voyage.cargo_manifest.commodity}</strong></span>
              {voyage.cargo_manifest.quantity_mt > 0 && (
                <span>Tonnage: <strong style={{ color: 'var(--color-text-secondary)' }}>{voyage.cargo_manifest.quantity_mt.toLocaleString()} MT</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Ocean Transit Leg */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div
            style={{
              position: 'absolute',
              left: '-28px',
              top: '2px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--color-brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Navigation size={13} />
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--color-brand-accent)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Deep Sea Ocean Passage
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Corridor Seaway Transit ({voyage.distance_total_nm.toLocaleString()} NM Total)
                </h4>
              </div>
              <span className="badge badge-outline" style={{ fontSize: '11px' }}>
                {voyage.status === 'completed' ? 'Completed' : 'Underway'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '8px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Speed</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'monospace' }}>{voyage.current_speed_knots.toFixed(1)} knots</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Draft</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'monospace' }}>{voyage.current_draft_m} m</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Remaining</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'monospace' }}>{voyage.distance_to_go_nm.toLocaleString()} NM</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. STS Event (If any) */}
        {voyage.sts_events.length > 0 && voyage.sts_events.map((sts) => (
          <div key={sts.id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div
              style={{
                position: 'absolute',
                left: '-28px',
                top: '2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Layers size={13} />
            </div>

            <div style={{ background: 'rgba(236, 72, 153, 0.04)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '6px', padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#ec4899', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Ship-to-Ship (STS) Event
                  </span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {sts.location_name}
                  </h4>
                </div>
                {onLocateEvent && (
                  <button
                    type="button"
                    onClick={() => onLocateEvent(sts.latitude, sts.longitude, sts.location_name)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 6px', fontSize: '0.6875rem', height: 'auto', color: '#ec4899' }}
                  >
                    <MapPin size={12} /> Focus
                  </button>
                )}
              </div>

              <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Counterpart Vessel: <strong style={{ color: 'var(--color-text-primary)' }}>{sts.daughter_vessel_name}</strong> (IMO {sts.daughter_vessel_imo || '9518290'})
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                <span>Transfer: {sts.cargo_commodity}</span>
                <span>Qty: {sts.quantity_mt.toLocaleString()} MT</span>
                <span>Duration: {sts.duration_hours}h</span>
              </div>
            </div>
          </div>
        ))}

        {/* 4. Destination Arrival Event */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '-28px',
              top: '2px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: voyage.status === 'completed' ? '#10b981' : '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Anchor size={13} />
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Destination &middot; Discharging / Arrival
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {voyage.destination_port.name} ({voyage.destination_port.country})
                </h4>
              </div>
              {onLocateEvent && (
                <button
                  type="button"
                  onClick={() => onLocateEvent(voyage.destination_port.latitude, voyage.destination_port.longitude, voyage.destination_port.name)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 6px', fontSize: '0.6875rem', height: 'auto' }}
                >
                  <MapPin size={12} /> Focus
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
              <span>
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {voyage.status === 'completed' ? `Arr: ${voyage.completed_date}` : `ETA: ${voyage.eta_date}`}
              </span>
              <span>Operation: <strong style={{ color: 'var(--color-text-secondary)' }}>Discharging Cargo / Berth Ops</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
