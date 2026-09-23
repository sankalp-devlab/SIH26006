import { Activity } from 'lucide-react';

interface EventItem {
  id: string;
  timeUtc: string;
  headline: string;
  segment: string;
  impact: string;
}

const MARKET_EVENTS: EventItem[] = [
  {
    id: '1',
    timeUtc: '10:42 UTC',
    headline: 'VLCC spot charter rates increased +4.2 WS.',
    segment: 'Crude Tankers',
    impact: 'Positive',
  },
  {
    id: '2',
    timeUtc: '09:31 UTC',
    headline: 'East Asia port congestion index rose to 89.6%.',
    segment: 'Container / Ports',
    impact: 'Congestion',
  },
  {
    id: '3',
    timeUtc: '08:52 UTC',
    headline: 'Atlantic LNG arbitrage widened into Asia.',
    segment: 'LNG Carriers',
    impact: 'Bullish',
  },
  {
    id: '4',
    timeUtc: '07:44 UTC',
    headline: 'Q4 FFA paper contracts pushed +3.8% higher.',
    segment: 'Dry Bulk Capesize',
    impact: 'Forward Bullish',
  },
];

export function MarketEventsTimeline() {
  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <Activity size={13} color="#38bdf8" />
          <span>MARKET EVENTS</span>
        </div>
        <span style={{ fontSize: '0.625rem', color: '#64748b' }}>UTC TIMELINE</span>
      </div>

      <div className="cc-panel-body" style={{ padding: '0.4rem 0.6rem', maxHeight: '180px', overflowY: 'auto' }}>
        <div className="cc-timeline-list">
          {MARKET_EVENTS.map((evt) => (
            <div key={evt.id} className="cc-timeline-item">
              <span className="cc-timeline-time">{evt.timeUtc}</span>
              <div className="cc-timeline-content">
                <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{evt.headline}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px', fontSize: '0.625rem' }}>
                  <span style={{ color: '#38bdf8' }}>{evt.segment}</span>
                  <span style={{ color: '#64748b' }}>&middot;</span>
                  <span style={{ color: '#34d399' }}>{evt.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
