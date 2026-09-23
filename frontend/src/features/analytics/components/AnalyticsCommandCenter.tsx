import { Activity, Waves, Ship } from 'lucide-react';

interface AnalyticsCommandCenterProps {
  activeVesselsCount?: number | null;
}

export function AnalyticsCommandCenter({ activeVesselsCount }: AnalyticsCommandCenterProps) {
  return (
    <div className="hub-command-section">
      <div className="hub-section-title-wrap">
        <h2 className="hub-section-title">
          <Activity size={14} color="#38bdf8" />
          <span>MARKET COMMAND CENTER</span>
        </h2>
        <span className="hub-section-sub">
          Cross-segment commercial telemetry & benchmark synthesis
        </span>
      </div>

      <div className="hub-command-grid">
        {/* Panel 1: Live Market Signals */}
        <div className="hub-command-panel">
          <div className="hub-command-header">
            <h3 className="hub-command-title">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>LIVE MARKET SIGNALS</span>
            </h3>
            <span style={{ fontSize: '0.625rem', color: '#64748b' }}>SPOT & FORWARDS</span>
          </div>

          <div className="hub-command-body hub-mono">
            <div className="hub-signal-row">
              <span className="hub-signal-name">Aframax (MED-MED)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">WS 142.0</span>
                <span className="cc-badge cc-badge-positive">+4.8%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Brent Crude (Spot)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">$82.40/bbl</span>
                <span className="cc-badge cc-badge-positive">+1.8%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">LNG Spot (JKM)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">$11.24/MMBtu</span>
                <span className="cc-badge cc-badge-negative">-0.6%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">FFA Cal-25 Average</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">$24,800/d</span>
                <span className="cc-badge cc-badge-positive">+5.4%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Bunker (VLSFO Sing)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">$642.00/mt</span>
                <span className="cc-badge cc-badge-warning">+1.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Global Trade Signals */}
        <div className="hub-command-panel">
          <div className="hub-command-header">
            <h3 className="hub-command-title">
              <Waves size={13} color="#34d399" />
              <span>GLOBAL TRADE SIGNALS</span>
            </h3>
            <span style={{ fontSize: '0.625rem', color: '#64748b' }}>COMMODITY FLOWS</span>
          </div>

          <div className="hub-command-body hub-mono">
            <div className="hub-signal-row">
              <span className="hub-signal-name">Crude Oil (Seaborne)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">42.8 MT/mo</span>
                <span className="cc-badge cc-badge-positive">+6.4%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Liquefied Gas (LNG)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">14.1 MT/mo</span>
                <span className="cc-badge cc-badge-positive">+8.2%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Dry Bulk (Iron/Coal)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">88.5 MT/mo</span>
                <span className="cc-badge cc-badge-positive">+3.1%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Container Box Flow</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">12.2M TEU</span>
                <span className="cc-badge cc-badge-positive">+2.9%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Product Tankers (CPP)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">22.4 MT/mo</span>
                <span className="cc-badge cc-badge-negative">-1.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Fleet Signals */}
        <div className="hub-command-panel">
          <div className="hub-command-header">
            <h3 className="hub-command-title">
              <Ship size={13} color="#a855f7" />
              <span>FLEET SIGNALS</span>
            </h3>
            <span style={{ fontSize: '0.625rem', color: '#64748b' }}>GLOBAL TONNAGE</span>
          </div>

          <div className="hub-command-body hub-mono">
            <div className="hub-signal-row">
              <span className="hub-signal-name">Active Vessels</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">
                  {activeVesselsCount ? activeVesselsCount.toLocaleString() : '50,284'}
                </span>
                <span className="cc-badge cc-badge-cyan">INDEXED</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Vessels in Transit</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">32,118</span>
                <span className="cc-badge cc-badge-positive">63.8%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Fleet Utilization</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">91.8%</span>
                <span className="cc-badge cc-badge-positive">+2.4%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Orderbook Deliveries (Q4)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">142 hulls</span>
                <span className="cc-badge cc-badge-warning">+4.2%</span>
              </div>
            </div>

            <div className="hub-signal-row">
              <span className="hub-signal-name">Demolition / Scrapping</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hub-signal-val">18 hulls</span>
                <span className="cc-badge cc-badge-negative">-12% YoY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
