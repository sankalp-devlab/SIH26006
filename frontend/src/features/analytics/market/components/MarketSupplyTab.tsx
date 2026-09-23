import React from 'react';
import {
  Ship,
  Compass,
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import type {
  MarketSupplyMetrics,
  MarketVesselAvailabilityMetrics
} from '../../../../types/market-insights';

interface MarketSupplyTabProps {
  supply?: MarketSupplyMetrics;
  availability?: MarketVesselAvailabilityMetrics;
  onOpenComparison?: (type: 'vessel_class', a: string, b: string) => void;
}

export const MarketSupplyTab: React.FC<MarketSupplyTabProps> = ({
  supply,
  availability,
  onOpenComparison: _onOpenComparison
}) => {
  if (!supply) {
    return (
      <div className="mi-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--ol-text-muted, #7189A3)' }}>
        Fleet supply metrics currently unavailable.
      </div>
    );
  }

  const renderSupplyProgressionChart = () => {
    const data = supply.historical_trend;
    if (data.length < 2) return null;

    const width = 640;
    const height = 200;
    const padX = 44;
    const padY = 25;

    const maxDwt = Math.max(...data.map(d => d.total_dwt));
    const minDwt = Math.min(...data.map(d => d.total_dwt * 0.95));

    const stepX = (width - padX * 2) / (data.length - 1);
    const points = data.map((d, i) => {
      const norm = (d.total_dwt - minDwt) / (maxDwt - minDwt || 1);
      return {
        x: padX + i * stepX,
        y: height - padY - norm * (height - padY * 2),
        dwt: d.total_dwt,
        date: d.date
      };
    });

    const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const area = `${path} L ${points[points.length - 1].x},${height - padY} L ${points[0].x},${height - padY} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px', userSelect: 'none' }}>
        <defs>
          <linearGradient id="supplyAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#supplyAreaGrad)" />
        <path d={path} fill="none" stroke="#22D3EE" strokeWidth="2" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#22D3EE" stroke="#091A2A" strokeWidth="1.5" />
        ))}

        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="10px"
            fontFamily="var(--font-mono, monospace)"
          >
            {p.date.slice(5)}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Top Supply Metrics Cards */}
      <div className="mi-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 0 }}>
        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Total Tracked Fleet</span>
            <div className="mi-kpi-icon-wrap"><Ship size={16} /></div>
          </div>
          <div className="mi-kpi-metric">{supply.total_fleet_vessels.toLocaleString()}</div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-subtext">{Math.round(supply.total_fleet_dwt / 1000000)}M MT Total Capacity</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Active Commercial Fleet</span>
            <div className="mi-kpi-icon-wrap"><Ship size={16} /></div>
          </div>
          <div className="mi-kpi-metric" style={{ color: 'var(--ol-cyan, #22D3EE)' }}>
            {supply.operating_vessels.toLocaleString()}
          </div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-delta up">{supply.fleet_utilization_pct}% Commercial Utilization</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Prompt Open Tonnage</span>
            <div className="mi-kpi-icon-wrap"><Ship size={16} /></div>
          </div>
          <div className="mi-kpi-metric" style={{ color: '#10B981' }}>
            {supply.available_open_vessels.toLocaleString()}
          </div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-subtext">+{supply.open_next_10d} open in next 10 days</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Tonnage at Anchor / Queue</span>
            <div className="mi-kpi-icon-wrap"><Ship size={16} /></div>
          </div>
          <div className="mi-kpi-metric" style={{ color: '#F59E0B' }}>
            {supply.waiting_anchorage_vessels.toLocaleString()}
          </div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-subtext">{Math.round(supply.waiting_anchorage_dwt / 1000000)}M MT idle in anchorage</span>
          </div>
        </div>
      </div>

      {/* Main Supply Progression & Availability Breakdown */}
      <div className="mi-overview-grid">
        {/* Left: Supply Capacity Trend */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <Ship size={16} color="#22D3EE" />
                Fleet Deadweight Capacity Progression
              </h3>
              <p className="mi-card-subtitle">
                Observed active commercial fleet size across monitored market sectors
              </p>
            </div>
            <span className="mi-badge mi-badge-green" style={{ fontSize: '11px' }}>
              <ArrowUpRight size={13} /> +{supply.supply_change_pct}% Growth
            </span>
          </div>

          {renderSupplyProgressionChart()}
        </div>

        {/* Right: Operational State Breakdown */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <Compass size={16} color="#10B981" />
                Operational Tonnage Status
              </h3>
              <p className="mi-card-subtitle">
                Breakdown of fleet by current commercial deployment
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>Laden / Carrying Cargo</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {supply.laden_vessels.toLocaleString()} ({Math.round((supply.laden_vessels / supply.total_fleet_vessels) * 100)}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--ol-surface-elevated, #0F2437)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#10B981', height: '100%', borderRadius: '9999px', width: `${(supply.laden_vessels / supply.total_fleet_vessels) * 100}%` }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>Ballast / Repositioning</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {supply.ballast_vessels.toLocaleString()} ({Math.round((supply.ballast_vessels / supply.total_fleet_vessels) * 100)}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--ol-surface-elevated, #0F2437)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#22D3EE', height: '100%', borderRadius: '9999px', width: `${(supply.ballast_vessels / supply.total_fleet_vessels) * 100}%` }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>Anchorage / Waiting Queue</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {supply.waiting_anchorage_vessels.toLocaleString()} ({Math.round((supply.waiting_anchorage_vessels / supply.total_fleet_vessels) * 100)}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--ol-surface-elevated, #0F2437)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#F59E0B', height: '100%', borderRadius: '9999px', width: `${(supply.waiting_anchorage_vessels / supply.total_fleet_vessels) * 100}%` }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>Prompt Open (0–5 Days)</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {availability?.open_prompt ?? 312}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--ol-surface-elevated, #0F2437)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#8B5CF6', height: '100%', borderRadius: '9999px', width: '12%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Supply Distribution Table */}
      <div className="mi-card">
        <div className="mi-card-header">
          <h3 className="mi-card-title">
            <MapPin size={16} color="#22D3EE" />
            Ocean Basin & Regional Supply Distribution
          </h3>
        </div>

        <div className="mi-table-container">
          <table className="mi-table">
            <thead>
              <tr>
                <th>Region</th>
                <th className="mi-table-num">Vessel Count</th>
                <th className="mi-table-num">Deadweight (DWT)</th>
                <th className="mi-table-num">Share %</th>
                <th className="mi-table-num">Ballasting</th>
                <th className="mi-table-num">Anchorage Queue</th>
              </tr>
            </thead>
            <tbody>
              {supply.regional_distribution.map((reg) => (
                <tr key={reg.region_id}>
                  <td style={{ fontWeight: 600 }}>{reg.region_name}</td>
                  <td className="mi-table-num">{reg.vessel_count.toLocaleString()}</td>
                  <td className="mi-table-num">{Math.round(reg.dwt / 1000000)}M MT</td>
                  <td className="mi-table-num" style={{ color: 'var(--ol-cyan, #22D3EE)', fontWeight: 700 }}>{reg.share_pct}%</td>
                  <td className="mi-table-num" style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>{reg.ballast_count.toLocaleString()}</td>
                  <td className="mi-table-num" style={{ color: '#F59E0B', fontWeight: 700 }}>{reg.waiting_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

