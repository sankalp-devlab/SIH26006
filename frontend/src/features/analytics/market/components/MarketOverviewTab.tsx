import React from 'react';
import {
  TrendingUp,
  Ship,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import type {
  MarketRoute,
  RouteFreightDetails,
  MarketSupplyMetrics,
  MarketDemandMetrics,
  MarketCongestionMetrics
} from '../../../../types/market-insights';

interface MarketOverviewTabProps {
  routes: (MarketRoute & { freight: RouteFreightDetails })[];
  supply?: MarketSupplyMetrics;
  demand?: MarketDemandMetrics;
  congestion?: MarketCongestionMetrics;
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  onOpenComparison: (type: 'route' | 'market' | 'vessel_class', a: string, b: string) => void;
}

export const MarketOverviewTab: React.FC<MarketOverviewTabProps> = ({
  routes,
  supply,
  demand,
  congestion: _congestion,
  selectedRouteCode,
  onSelectRoute,
  onOpenComparison
}) => {
  // Key dry and tanker benchmark corridors for quick overview
  const featuredRoutes = routes.slice(0, 6);

  // SVG Chart: Supply vs Demand Progression
  const supplyTrend = supply?.historical_trend || [];
  const demandTrend = demand?.historical_trend || [];

  const renderSupplyDemandChart = () => {
    const width = 640;
    const height = 220;
    const padX = 44;
    const padY = 30;

    if (supplyTrend.length < 2 || demandTrend.length < 2) {
      return (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ol-text-muted, #7189A3)', fontSize: '12px' }}>
          Insufficient historical observations to plot progression.
        </div>
      );
    }

    // Normalized index (0-100)
    const minSupply = Math.min(...supplyTrend.map(s => s.total_dwt));
    const maxSupply = Math.max(...supplyTrend.map(s => s.total_dwt)) || 1;
    const minDemand = Math.min(...demandTrend.map(d => d.demand_mt));
    const maxDemand = Math.max(...demandTrend.map(d => d.demand_mt)) || 1;

    const scaleSupply = (val: number) => {
      const norm = (val - minSupply) / (maxSupply - minSupply || 1);
      return height - padY - norm * (height - padY * 2);
    };

    const scaleDemand = (val: number) => {
      const norm = (val - minDemand) / (maxDemand - minDemand || 1);
      return height - padY - norm * (height - padY * 2);
    };

    const stepX = (width - padX * 2) / (supplyTrend.length - 1);

    const supplyPoints = supplyTrend.map((s, idx) => ({
      x: padX + idx * stepX,
      y: scaleSupply(s.total_dwt),
      dwt: s.total_dwt,
      date: s.date
    }));

    const demandPoints = demandTrend.map((d, idx) => ({
      x: padX + idx * stepX,
      y: scaleDemand(d.demand_mt),
      demand: d.demand_mt,
      date: d.date
    }));

    const supplyPath = `M ${supplyPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const demandPath = `M ${demandPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '220px', userSelect: 'none', overflow: 'visible' }}>
          <defs>
            <linearGradient id="miSupplyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="miDemandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((factor) => {
            const y = padY + factor * (height - padY * 2);
            return (
              <line
                key={factor}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="rgba(100, 190, 240, 0.12)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Supply Curve */}
          <path d={supplyPath} fill="none" stroke="#22D3EE" strokeWidth="2.5" />
          {supplyPoints.map((p, i) => (
            <circle key={`s-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#22D3EE" stroke="#091A2A" strokeWidth="1.5" />
          ))}

          {/* Demand Curve */}
          <path d={demandPath} fill="none" stroke="#10B981" strokeWidth="2.5" />
          {demandPoints.map((p, i) => (
            <circle key={`d-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#10B981" stroke="#091A2A" strokeWidth="1.5" />
          ))}

          {/* X Axis Labels */}
          {supplyPoints.map((p, i) => (
            <text
              key={`label-${i}`}
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--ol-text-secondary, #94A3B8)', marginTop: '8px', padding: '0 4px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#22D3EE', borderRadius: '2px' }} />
              <span>Fleet Supply Capacity (DWT)</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#10B981', borderRadius: '2px' }} />
              <span>Cargo Demand Volume (MT)</span>
            </span>
          </div>
          <span style={{ color: 'var(--ol-text-muted, #7189A3)', fontFamily: 'var(--font-mono, monospace)', fontSize: '10.5px' }}>
            Baltic Exchange & AIS Telemetry
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 2-Column Analytics Overview Grid */}
      <div className="mi-overview-grid">
        {/* Left 7/12: Supply vs Demand Dynamics */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <TrendingUp size={16} color="#10B981" />
                Macro Supply vs Demand Dynamics
              </h3>
              <p className="mi-card-subtitle">
                Relative trajectory of available commercial deadweight tonnage vs cargo booking velocity
              </p>
            </div>
            <button
              onClick={() => onOpenComparison('market', 'Dry Bulk', 'Tanker')}
              className="mi-btn mi-btn-secondary"
              style={{ height: '32px', fontSize: '11.5px', padding: '0 10px' }}
            >
              <Sliders size={12} color="#22D3EE" />
              <span>Compare Markets</span>
            </button>
          </div>

          {renderSupplyDemandChart()}
        </div>

        {/* Right 5/12: Commercial Fundamentals & Fleet Deployment */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <Ship size={16} color="#22D3EE" />
                Fleet Deployment & Regional Spread
              </h3>
              <p className="mi-card-subtitle">
                Global commercial positioning across ocean basins
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {supply?.regional_distribution.map((reg) => (
              <div
                key={reg.region_id}
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
                  <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>{reg.region_name}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-cyan, #22D3EE)', fontWeight: 700 }}>
                    {reg.vessel_count.toLocaleString()} vessels
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--ol-surface-elevated, #0F2437)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${reg.share_pct}%`,
                      background: 'linear-gradient(90deg, #22D3EE, #10B981)',
                      borderRadius: '9999px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  <span>{reg.share_pct}% Global Fleet Share</span>
                  <span style={{ color: '#F59E0B', fontWeight: 500 }}>{reg.waiting_count} waiting at anchor</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Corridors Grid */}
      <div className="mi-card">
        <div className="mi-card-header">
          <div>
            <h3 className="mi-card-title">
              <DollarSign size={16} color="#F59E0B" />
              Primary Benchmark Shipping Corridors
            </h3>
            <p className="mi-card-subtitle">
              High-volume dry bulk and wet tanker corridors defining global seaborne trade
            </p>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--ol-text-muted, #7189A3)', fontFamily: 'var(--font-mono, monospace)' }}>
            {routes.length} Corridors Active
          </span>
        </div>

        <div className="mi-corridors-grid">
          {featuredRoutes.map((route) => {
            const isSelected = route.route_code === selectedRouteCode;
            return (
              <div
                key={route.route_code}
                onClick={() => onSelectRoute(route.route_code)}
                className={`mi-corridor-card ${isSelected ? 'selected' : ''}`}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="mi-badge mi-badge-cyan" style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
                      {route.route_code}
                    </span>
                    <span className="mi-badge mi-badge-slate" style={{ textTransform: 'capitalize' }}>
                      {route.sector} • {route.vessel_class}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {route.route_name.split('(')[0]}
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    {route.origin_port} → {route.destination_port}
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(100, 190, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
                      ${route.freight.current_rate.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--ol-text-muted, #7189A3)' }}>
                      {route.benchmark_unit}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: route.freight.change_1d_pct >= 0 ? '#10B981' : '#F43F5E'
                      }}
                    >
                      {route.freight.change_1d_pct >= 0 ? '+' : ''}{route.freight.change_1d_pct}% 1D
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoute(route.route_code);
                      }}
                      className="mi-btn mi-btn-secondary"
                      style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center' }}
                      title="Open Route Detail"
                    >
                      <ArrowRight size={13} color="#22D3EE" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

