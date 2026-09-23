import { useState } from 'react';
import { Globe, Radio } from 'lucide-react';

type ActivityMode = 'VESSEL DENSITY' | 'TRADE DENSITY' | 'PORT ACTIVITY' | 'FREIGHT ACTIVITY';

export function GlobalActivityHeatmap() {
  const [activeMode, setActiveMode] = useState<ActivityMode>('VESSEL DENSITY');

  const modeDetails: Record<ActivityMode, { hotspots: string[]; peakDensity: string; index: string }> = {
    'VESSEL DENSITY': {
      hotspots: ['Malacca Strait (420 ships)', 'Singapore Anchorage (312 ships)', 'Gibraltar Strait (188 ships)'],
      peakDensity: '98.4%',
      index: 'High Saturation',
    },
    'TRADE DENSITY': {
      hotspots: ['Persian Gulf -> China (2.4 MT/d)', 'Pilbara -> Qingdao (1.8 MT/d)', 'US Gulf -> NWE (1.1 MT/d)'],
      peakDensity: '92.1%',
      index: 'Active Flow',
    },
    'PORT ACTIVITY': {
      hotspots: ['Shanghai Port (1,680 calls)', 'Singapore (1,420 calls)', 'Rotterdam (890 calls)'],
      peakDensity: '89.6%',
      index: 'Heavy Congestion',
    },
    'FREIGHT ACTIVITY': {
      hotspots: ['AG-East VLCC (+12%)', 'Baltic Aframax (+8%)', 'Transpacific Container (+4%)'],
      peakDensity: '84.2%',
      index: 'Bullish Volatility',
    },
  };

  const current = modeDetails[activeMode];

  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <Globe size={13} color="#38bdf8" />
          <span>GLOBAL ACTIVITY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.625rem', color: '#38bdf8' }}>
          <span className="cc-badge cc-badge-cyan cc-mono">ESTIMATED DENSITY</span>
        </div>
      </div>

      <div className="cc-panel-body" style={{ padding: '0.5rem 0.75rem' }}>
        {/* Mode Selector Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginBottom: '0.5rem' }}>
          {(['VESSEL DENSITY', 'TRADE DENSITY', 'PORT ACTIVITY', 'FREIGHT ACTIVITY'] as ActivityMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`cc-chart-btn ${activeMode === m ? 'active' : ''}`}
              onClick={() => setActiveMode(m)}
              style={{ fontSize: '0.6rem', textAlign: 'center', padding: '0.2rem 0.3rem' }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Hotspots Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            CORRIDOR HOTSPOTS ({current.index})
          </div>
          {current.hotspots.map((spot, i) => (
            <div
              key={spot}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.6875rem',
                background: 'rgba(4, 14, 27, 0.6)',
                padding: '0.25rem 0.4rem',
                borderRadius: '3px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: i === 0 ? '#ef4444' : i === 1 ? '#fbbf24' : '#38bdf8' }} />
              <span style={{ color: '#cbd5e1' }}>{spot}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '0.4rem', textAlign: 'right' }}>
          * Regional benchmark hotspot density estimates.
        </div>
      </div>
    </div>
  );
}
