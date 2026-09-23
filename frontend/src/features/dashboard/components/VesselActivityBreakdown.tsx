import { Ship, Radio } from 'lucide-react';
import type { Vessel } from '../../../types/vessel';
import type { TrackedVesselSummary } from '../../../types/tracking';

interface VesselActivityBreakdownProps {
  vessels?: Vessel[];
  trackedVessels?: TrackedVesselSummary[];
}

export function VesselActivityBreakdown({
  vessels = [],
  trackedVessels = [],
}: VesselActivityBreakdownProps) {
  const totalFleet = trackedVessels.length > 0 ? trackedVessels.length : (vessels.length > 0 ? vessels.length : 4);
  const liveCount = trackedVessels.filter((v) => v.tracking_status === 'LIVE').length;
  const recentCount = trackedVessels.filter((v) => v.tracking_status === 'RECENT').length;
  const staleCount = trackedVessels.filter((v) => v.tracking_status === 'STALE').length;
  const unavailCount = Math.max(0, totalFleet - (liveCount + recentCount + staleCount));

  const statusItems = [
    {
      label: 'LIVE AIS (< 2H)',
      count: liveCount,
      pct: totalFleet > 0 ? Math.round((liveCount / totalFleet) * 100) : 0,
      color: '#34d399',
    },
    {
      label: 'RECENT SIGNAL (< 24H)',
      count: recentCount,
      pct: totalFleet > 0 ? Math.round((recentCount / totalFleet) * 100) : 0,
      color: '#38bdf8',
    },
    {
      label: 'STALE SIGNAL (> 24H)',
      count: staleCount,
      pct: totalFleet > 0 ? Math.round((staleCount / totalFleet) * 100) : 0,
      color: '#fbbf24',
    },
    {
      label: 'DATA UNAVAILABLE',
      count: unavailCount,
      pct: totalFleet > 0 ? Math.round((unavailCount / totalFleet) * 100) : 0,
      color: '#64748b',
    },
  ];

  const registeredSegments = [
    { name: 'Handysize', capacity: '38.2K DWT', speed: '14.0 kn', count: 1, color: '#38bdf8' },
    { name: 'Supramax', capacity: '58.3K DWT', speed: '14.0 kn', count: 1, color: '#34d399' },
    { name: 'Panamax', capacity: '82.5K DWT', speed: '13.5 kn', count: 1, color: '#fbbf24' },
    { name: 'Capesize', capacity: '182K DWT', speed: '14.0 kn', count: 1, color: '#a855f7' },
  ];

  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <Ship size={13} color="#38bdf8" />
          <span>FLEET ACTIVITY &amp; TELEMETRY</span>
        </div>
        <span className="cc-badge cc-badge-cyan cc-mono">
          <Radio size={10} style={{ marginRight: '2px' }} />
          {totalFleet} REGISTERED
        </span>
      </div>

      <div className="cc-panel-body" style={{ padding: '0.6rem 0.75rem' }}>
        {/* Telemetry Status Distribution Progress Bars */}
        <div className="cc-activity-status-bars">
          {statusItems.map((item) => (
            <div key={item.label}>
              <div className="cc-status-bar-row">
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{item.label}</span>
                <span className="cc-mono" style={{ color: '#f8fafc', fontWeight: 700 }}>
                  {item.count}{' '}
                  <span style={{ color: '#64748b', fontSize: '0.6rem' }}>({item.pct}%)</span>
                </span>
              </div>
              <div className="cc-status-progress">
                <div
                  className="cc-status-progress-fill"
                  style={{ width: `${Math.max(item.pct, item.count > 0 ? 8 : 0)}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Registered Hull Classes */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '0.5rem',
            marginTop: '0.4rem',
          }}
        >
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '0.35rem',
              letterSpacing: '0.04em',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>REGISTERED HULL SPECIFICATIONS</span>
            <span style={{ color: '#38bdf8' }}>4 DRY BULK CLASSES</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            {registeredSegments.map((seg) => (
              <div
                key={seg.name}
                style={{
                  background: 'rgba(4, 14, 27, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '3px',
                  padding: '0.3rem 0.45rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.6875rem',
                  }}
                >
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{seg.name}</span>
                  <span className="cc-mono" style={{ color: seg.color, fontWeight: 700 }}>
                    {seg.capacity}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.6rem',
                    color: '#64748b',
                    marginTop: '2px',
                  }}
                >
                  <span className="cc-mono">{seg.speed}</span>
                  <span>DESIGN SPEED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
