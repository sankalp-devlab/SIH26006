import { TrendingUp, TrendingDown, Sparkles, AlertCircle } from 'lucide-react';

interface WhatsMovingItem {
  id: string;
  name: string;
  delta: string;
  desc: string;
  isPositive: boolean;
  sparkline: string;
  sparklineColor: string;
}

const MOVING_ITEMS: WhatsMovingItem[] = [
  {
    id: 'vlcc_td3c',
    name: 'VLCC TD3C (MEG->China)',
    delta: '+12.4%',
    desc: 'Crude flows strengthening',
    isPositive: true,
    sparkline: '0,13 8,12 16,9 24,10 32,6 40,4 48,1',
    sparklineColor: '#34d399',
  },
  {
    id: 'suezmax_td6',
    name: 'Suezmax TD6 (Black Sea)',
    delta: '+8.2%',
    desc: 'Tonnage tightening',
    isPositive: true,
    sparkline: '0,14 8,11 16,10 24,7 32,8 40,5 48,2',
    sparklineColor: '#34d399',
  },
  {
    id: 'mr_tc2',
    name: 'MR TC2 (Cont->USAC)',
    delta: '-5.1%',
    desc: 'Rate pressure & idle buildup',
    isPositive: false,
    sparkline: '0,3 8,5 16,4 24,8 32,9 40,12 48,15',
    sparklineColor: '#f87171',
  },
  {
    id: 'asia_port_act',
    name: 'Asia Port Activity',
    delta: '+9.7%',
    desc: 'Congestion rising in Ningbo',
    isPositive: true,
    sparkline: '0,12 8,10 16,11 24,7 32,5 40,6 48,2',
    sparklineColor: '#fbbf24',
  },
];

interface MarketIntelligencePanelProps {
  onSelectMovingItem?: (item: WhatsMovingItem) => void;
}

export function MarketIntelligencePanel({
  onSelectMovingItem,
}: MarketIntelligencePanelProps) {
  // SVG Circular Gauge calculation for 87%
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (0.87 * circumference);

  return (
    <div className="cc-intel-stack">
      {/* 1. Market Sentiment */}
      <div className="cc-panel" style={{ flex: '0 0 auto' }}>
        <div className="cc-panel-header">
          <div className="cc-panel-title">
            <Sparkles size={13} color="#38bdf8" />
            <span>MARKET INTELLIGENCE</span>
          </div>
          <span className="cc-badge cc-badge-cyan cc-mono">HEURISTIC MODEL</span>
        </div>

        <div className="cc-panel-body" style={{ padding: '0.5rem 0.75rem' }}>
          <div className="cc-sentiment-wrap">
            {/* Circular Gauge */}
            <div className="cc-sentiment-gauge">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="5"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="cc-sentiment-gauge-val cc-mono">
                <div className="cc-sentiment-pct">87%</div>
                <div className="cc-sentiment-label">MODEL</div>
              </div>
            </div>

            {/* Granular Signals */}
            <div className="cc-sentiment-signals">
              <div className="cc-signal-row">
                <span>MOMENTUM</span>
                <span className="cc-signal-state" style={{ color: '#34d399' }}>
                  ▲ Steady
                </span>
              </div>
              <div className="cc-signal-row">
                <span>FREIGHT</span>
                <span className="cc-signal-state" style={{ color: '#34d399' }}>
                  ▲ Benchmark
                </span>
              </div>
              <div className="cc-signal-row">
                <span>DEMAND</span>
                <span className="cc-signal-state" style={{ color: '#34d399' }}>
                  ▲ Healthy
                </span>
              </div>
              <div className="cc-signal-row">
                <span>SUPPLY</span>
                <span className="cc-signal-state" style={{ color: '#38bdf8' }}>
                  ● Balanced
                </span>
              </div>
              <div className="cc-signal-row" style={{ borderBottom: 'none' }}>
                <span>VOLATILITY</span>
                <span className="cc-signal-state" style={{ color: '#fbbf24' }}>
                  ● Moderate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. What's Moving */}
      <div className="cc-panel" style={{ flex: '1 1 auto', overflowY: 'auto' }}>
        <div className="cc-panel-header">
          <div className="cc-panel-title">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24' }} />
            <span>WHAT&apos;S MOVING</span>
          </div>
          <span style={{ fontSize: '0.625rem', color: '#64748b' }}>BENCHMARK CORRIDORS</span>
        </div>

        <div className="cc-panel-body" style={{ padding: '0.4rem 0.6rem' }}>
          <div className="cc-moving-list">
            {MOVING_ITEMS.map((item) => (
              <div
                key={item.id}
                className="cc-moving-item"
                onClick={() => onSelectMovingItem?.(item)}
              >
                <div className="cc-moving-info">
                  <span className="cc-moving-name">{item.name}</span>
                  <span className="cc-moving-sub">{item.desc}</span>
                </div>

                <div className="cc-moving-right">
                  <svg width="48" height="16" viewBox="0 0 48 16">
                    <path
                      d={`M${item.sparkline}`}
                      fill="none"
                      stroke={item.sparklineColor}
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span
                    className={`cc-badge ${
                      item.isPositive ? 'cc-badge-positive' : 'cc-badge-negative'
                    } cc-mono`}
                  >
                    {item.isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {item.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Today's Insight */}
      <div className="cc-panel" style={{ flex: '0 0 auto' }}>
        <div className="cc-panel-header">
          <div className="cc-panel-title">
            <AlertCircle size={13} color="#38bdf8" />
            <span>TODAY&apos;S INSIGHT</span>
          </div>
          <span className="cc-badge cc-badge-cyan cc-mono">SYNTHESIS</span>
        </div>

        <div className="cc-panel-body" style={{ padding: '0.5rem 0.75rem' }}>
          <p className="cc-insight-body">
            Fleet capacity allocation indicates consistent vessel availability across Middle East and Asian maritime corridors. External commercial market feeds remain unconfigured; metrics reflect heuristic baseline scenarios.
          </p>
          <div className="cc-insight-footer">
            <span>SOURCE: HEURISTIC MODEL</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>BASELINE SYNTHESIS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
