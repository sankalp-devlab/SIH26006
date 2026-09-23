import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Globe
} from 'lucide-react';
import type { MarketDemandMetrics } from '../../../../types/market-insights';

interface MarketDemandTabProps {
  demand?: MarketDemandMetrics;
}

export const MarketDemandTab: React.FC<MarketDemandTabProps> = ({ demand }) => {
  const navigate = useNavigate();

  if (!demand) {
    return (
      <div className="mi-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--ol-text-muted, #7189A3)' }}>
        Cargo demand metrics currently unavailable.
      </div>
    );
  }

  const renderDemandTrendChart = () => {
    const data = demand.historical_trend;
    if (data.length < 2) return null;

    const width = 640;
    const height = 200;
    const padX = 44;
    const padY = 25;

    const maxDemand = Math.max(...data.map(d => d.demand_mt));
    const minDemand = Math.min(...data.map(d => d.demand_mt * 0.95));

    const stepX = (width - padX * 2) / (data.length - 1);
    const points = data.map((d, i) => {
      const norm = (d.demand_mt - minDemand) / (maxDemand - minDemand || 1);
      return {
        x: padX + i * stepX,
        y: height - padY - norm * (height - padY * 2),
        demand: d.demand_mt,
        date: d.date
      };
    });

    const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const area = `${path} L ${points[points.length - 1].x},${height - padY} L ${points[0].x},${height - padY} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px', userSelect: 'none' }}>
        <defs>
          <linearGradient id="miDemandAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#miDemandAreaGrad)" />
        <path d={path} fill="none" stroke="#10B981" strokeWidth="2" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#10B981" stroke="#091A2A" strokeWidth="1.5" />
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
      {/* KPI Cards */}
      <div className="mi-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 0 }}>
        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Total Cargo Demand</span>
            <div className="mi-kpi-icon-wrap"><Package size={16} /></div>
          </div>
          <div className="mi-kpi-metric" style={{ color: '#10B981' }}>
            {(demand.total_cargo_demand_mt / 1000000).toFixed(1)}M
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ol-text-muted, #7189A3)', marginLeft: '4px' }}>MT</span>
          </div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-delta up">+{demand.demand_change_pct}% over period</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Reported Fixtures</span>
            <div className="mi-kpi-icon-wrap"><FileText size={16} /></div>
          </div>
          <div className="mi-kpi-metric">{demand.reported_fixtures_count}</div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-subtext">{demand.active_cargo_openings} active charter openings</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Ton-Mile Demand</span>
            <div className="mi-kpi-icon-wrap"><Globe size={16} /></div>
          </div>
          <div className="mi-kpi-metric" style={{ color: 'var(--ol-cyan, #22D3EE)' }}>
            {demand.ton_mile_demand_billion_nm}B
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ol-text-muted, #7189A3)', marginLeft: '4px' }}>Ton-NM</span>
          </div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-subtext">Long-haul Atlantic/Pacific routing</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Cross-Module Workflows</span>
            <div className="mi-kpi-icon-wrap"><Layers size={16} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <button
              onClick={() => navigate('/cargo')}
              className="mi-btn mi-btn-secondary"
              style={{ flex: 1, height: '32px', fontSize: '11px', justifyContent: 'center' }}
            >
              <Package size={12} color="#10B981" />
              <span>Cargo List</span>
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="mi-btn mi-btn-secondary"
              style={{ flex: 1, height: '32px', fontSize: '11px', justifyContent: 'center' }}
            >
              <FileText size={12} color="#22D3EE" />
              <span>Fixtures</span>
            </button>
          </div>
          <div className="mi-kpi-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <span className="mi-kpi-subtext">Integrated freight allocation</span>
          </div>
        </div>
      </div>

      {/* Demand Curve & Commodity Distribution */}
      <div className="mi-overview-grid">
        {/* Left: Demand Volume Trend */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <TrendingUp size={16} color="#10B981" />
                Seaborne Cargo Demand Progression
              </h3>
              <p className="mi-card-subtitle">
                Aggregate commercial inquiry volume across origin export hubs
              </p>
            </div>
            <span className="mi-badge mi-badge-green" style={{ fontSize: '11px' }}>
              <ArrowUpRight size={13} /> +{demand.demand_change_pct}% Momentum
            </span>
          </div>

          {renderDemandTrendChart()}
        </div>

        {/* Right: Commodity Mix */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <Layers size={16} color="#22D3EE" />
                Commodity Share Breakdown
              </h3>
              <p className="mi-card-subtitle">
                Volume allocation by principal cargo classification
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {demand.commodity_breakdown.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--ol-surface-secondary, #0B1D2E)',
                  border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.14))',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>{item.commodity}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#10B981', fontWeight: 700 }}>
                    {(item.volume_mt / 1000000).toFixed(1)}M MT
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--ol-surface-elevated, #0F2437)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.share_pct}%`,
                      backgroundColor: '#10B981',
                      borderRadius: '9999px'
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #7189A3)', textAlign: 'right' }}>
                  {item.share_pct}% Market Share
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Origin Basin Demand Table */}
      <div className="mi-card">
        <div className="mi-card-header">
          <h3 className="mi-card-title">
            <Globe size={16} color="#10B981" />
            Export Load Basin Commercial Activity
          </h3>
        </div>

        <div className="mi-table-container">
          <table className="mi-table">
            <thead>
              <tr>
                <th>Export Basin</th>
                <th className="mi-table-num">Inquiry Volume</th>
                <th className="mi-table-num">Reported Fixtures</th>
                <th className="mi-table-num">Action</th>
              </tr>
            </thead>
            <tbody>
              {demand.origin_basin_demand.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{b.basin}</td>
                  <td className="mi-table-num" style={{ color: '#10B981', fontWeight: 700 }}>
                    {(b.volume_mt / 1000000).toFixed(1)}M MT
                  </td>
                  <td className="mi-table-num" style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    {b.fixture_count} fixtures
                  </td>
                  <td className="mi-table-num">
                    <button
                      onClick={() => navigate('/cargo')}
                      className="mi-btn mi-btn-secondary"
                      style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                    >
                      <span>Inquire</span>
                      <ExternalLink size={10} color="#22D3EE" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

