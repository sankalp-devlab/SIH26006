import { GitCommit } from 'lucide-react';

export function TradeFreightCorrelation() {

  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <GitCommit size={13} color="#38bdf8" />
          <span>TRADE vs FREIGHT</span>
        </div>
        <span className="cc-badge cc-badge-cyan cc-mono">MODEL CORR: +0.88</span>
      </div>

      <div className="cc-panel-body" style={{ padding: '0.6rem 0.75rem' }}>
        {/* Dual Axis Mini Visual */}
        <div style={{ position: 'relative', width: '100%', height: '80px' }}>
          <svg viewBox="0 0 240 80" className="cc-correlation-chart">
            <line x1="10" y1="70" x2="230" y2="70" stroke="rgba(255,255,255,0.08)" />
            <line x1="10" y1="40" x2="230" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,2" />

            {/* Trade Volume Area / Path */}
            <path
              d="M10,65 L60,60 L115,54 L170,42 L225,28"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Freight Rate Path */}
            <path
              d="M10,68 L60,63 L115,50 L170,30 L225,12"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4,3"
            />

            {/* End Dots */}
            <circle cx="225" cy="28" r="3.5" fill="#38bdf8" />
            <circle cx="225" cy="12" r="3.5" fill="#fbbf24" />
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
            <span style={{ width: '8px', height: '2px', background: '#38bdf8' }} />
            <span>Volume Index</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
            <span style={{ width: '8px', height: '2px', background: '#fbbf24' }} />
            <span>Freight Index</span>
          </div>
        </div>

        {/* Analytical Insight */}
        <div className="cc-correlation-note">
          &ldquo;Econometric baseline model: Demonstrates historical positive correlation between seaborne transport demand and spot freight market volatility.&rdquo;
        </div>

        <div style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '0.35rem', textAlign: 'right' }}>
          * Econometric baseline model. Live correlation feeds require active fixture stream.
        </div>
      </div>
    </div>
  );
}
