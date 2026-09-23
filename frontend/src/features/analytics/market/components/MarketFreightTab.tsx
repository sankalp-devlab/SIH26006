/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Freight Benchmark Rates & Corridor Intelligence Tab
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Sliders,
  Anchor,
  Clock
} from 'lucide-react';
import type {
  MarketRoute,
  RouteFreightDetails,
  MarketHistoricalObservation
} from '../../../../types/market-insights';

interface MarketFreightTabProps {
  routes: (MarketRoute & { freight: RouteFreightDetails })[];
  selectedRoute: (MarketRoute & { freight: RouteFreightDetails }) | null;
  onSelectRoute: (code: string) => void;
  onOpenComparison: (type: 'route', a: string, b: string) => void;
}

export const MarketFreightTab: React.FC<MarketFreightTabProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  onOpenComparison
}) => {
  const navigate = useNavigate();

  const active = selectedRoute || routes[0];
  if (!active) {
    return (
      <div className="mi-card" style={{ padding: '36px 24px', textAlign: 'center', color: '#94A3B8' }}>
        Select a route corridor to view freight analytics.
      </div>
    );
  }

  const freight = active.freight;

  const renderFreightTrajectoryChart = () => {
    const series = freight.historical_series;
    if (!series || series.length < 2) return null;

    const width = 720;
    const height = 220;
    const padLeft = 60;
    const padRight = 30;
    const padTop = 20;
    const padBottom = 35;

    const rates = series.map((s: MarketHistoricalObservation) => s.rate);
    const maxRate = Math.max(...rates) * 1.05;
    const minRate = Math.min(...rates) * 0.95;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const stepX = chartW / (series.length - 1);
    const points = series.map((s: MarketHistoricalObservation, i: number) => {
      const norm = (s.rate - minRate) / (maxRate - minRate || 1);
      return {
        x: padLeft + i * stepX,
        y: padTop + chartH - norm * chartH,
        rate: s.rate,
        date: s.date
      };
    });

    const path = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
    const area = `${path} L ${points[points.length - 1].x.toFixed(1)},${(padTop + chartH).toFixed(1)} L ${points[0].x.toFixed(1)},${(padTop + chartH).toFixed(1)} Z`;

    const yTicks = [minRate, (minRate + maxRate) / 2, maxRate];

    return (
      <div style={{ width: '100%', overflowX: 'auto', background: '#071524', borderRadius: '8px', padding: '12px 8px', border: '1px solid rgba(100, 190, 240, 0.12)' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', minWidth: '540px' }}>
          <defs>
            <linearGradient id="freightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis ticks */}
          {yTicks.map((val, idx) => {
            const norm = (val - minRate) / (maxRate - minRate || 1);
            const y = padTop + chartH - norm * chartH;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(100, 190, 240, 0.12)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  ${Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area and Line */}
          <path d={area} fill="url(#freightAreaGrad)" />
          <path d={path} fill="none" stroke="#F59E0B" strokeWidth="2.5" />

          {/* Dots and Tooltip Circles */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#F59E0B" stroke="#091A2A" strokeWidth="2" />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, i) => {
            const showLabel = i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1;
            if (!showLabel) return null;
            return (
              <text
                key={i}
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="11"
                fontFamily="monospace"
              >
                {p.date}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const range = freight.high_52w - freight.low_52w || 1;
  const posPct = Math.max(0, Math.min(100, ((freight.current_rate - freight.low_52w) / range) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Active Corridor Deep-Dive Card */}
      <div className="mi-card">
        <div className="mi-freight-spotlight">
          <div style={{ flex: '1 1 400px', minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="mi-badge mi-badge-cyan" style={{ fontSize: '11px', padding: '3px 9px', fontFamily: 'monospace' }}>
                {active.route_code}
              </span>
              <span className="mi-badge mi-badge-slate" style={{ textTransform: 'capitalize' }}>
                {active.sector} • {active.vessel_class}
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Last Fixture: {freight.last_fixture_date}
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
              {active.route_name}
            </h2>

            <div style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <span>Commodity: <strong style={{ color: '#F1F5F9' }}>{active.commodity}</strong></span>
              <span>Corridor: <strong style={{ color: '#F1F5F9' }}>{active.origin_port} → {active.destination_port}</strong></span>
              <span>Distance: <strong style={{ color: '#22D3EE', fontFamily: 'monospace' }}>{active.distance_nm.toLocaleString()} NM</strong></span>
            </div>
          </div>

          {/* Benchmark Assessment Block */}
          <div className="mi-spot-assessment-box">
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7189A3', fontWeight: 700 }}>
                Spot Assessment
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'monospace', lineHeight: 1.15, marginTop: '2px' }}>
                ${freight.current_rate.toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                {freight.benchmark_unit}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid rgba(100, 190, 240, 0.16)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: freight.change_1d_pct >= 0 ? '#10B981' : '#F43F5E'
              }}>
                {freight.change_1d_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {freight.change_1d_pct >= 0 ? `+${freight.change_1d_pct}%` : `${freight.change_1d_pct}%`} 1D
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: freight.change_30d_pct >= 0 ? '#10B981' : '#F43F5E'
              }}>
                {freight.change_30d_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {freight.change_30d_pct >= 0 ? `+${freight.change_30d_pct}%` : `${freight.change_30d_pct}%`} 30D
              </div>
            </div>
          </div>
        </div>

        {/* 52-Week Range */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(100, 190, 240, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
            <span>52W Low: <strong style={{ color: '#F1F5F9', fontFamily: 'monospace' }}>${freight.low_52w.toLocaleString()}</strong></span>
            <span style={{ fontWeight: 600, color: '#CBD5E1' }}>52-Week Benchmark Assessment Range</span>
            <span>52W High: <strong style={{ color: '#F1F5F9', fontFamily: 'monospace' }}>${freight.high_52w.toLocaleString()}</strong></span>
          </div>
          <div className="mi-range-track">
            <div className="mi-range-fill" style={{ width: `${posPct}%` }} />
          </div>
        </div>

        {/* Actions Bar */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(100, 190, 240, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onOpenComparison('route', active.route_code, active.related_routes[0] || 'C3')}
              className="mi-btn mi-btn-secondary"
            >
              <Sliders size={14} style={{ color: '#22D3EE' }} />
              Compare vs {active.related_routes[0] || 'Benchmark'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => navigate('/voyage-calculator')}
              className="mi-btn"
              style={{
                backgroundColor: '#10B981',
                color: '#04131D',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Calculator size={14} />
              Calculate Voyage TCE
            </button>
          </div>
        </div>
      </div>

      {/* Historical Freight Trajectory */}
      <div className="mi-card">
        <div className="mi-card-header">
          <div>
            <h3 className="mi-card-title">
              <TrendingUp size={16} style={{ color: '#F59E0B' }} />
              {active.route_code} Historical Freight Trend & Volatility
            </h3>
            <p className="mi-card-subtitle">
              30-day continuous index tracking with 30D volatility index at {freight.volatility_30d_pct}%
            </p>
          </div>
        </div>

        {renderFreightTrajectoryChart()}
      </div>

      {/* All Benchmark Corridors Table */}
      <div className="mi-card">
        <div className="mi-card-header">
          <div>
            <h3 className="mi-card-title">
              <DollarSign size={16} style={{ color: '#F59E0B' }} />
              All Monitored Benchmark Corridors Matrix
            </h3>
            <p className="mi-card-subtitle">
              Click any corridor to select and update active trajectory
            </p>
          </div>
          <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>
            {routes.length} Corridors
          </span>
        </div>

        <div className="mi-table-container">
          <table className="mi-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Route / Trade Lane</th>
                <th>Cargo</th>
                <th>Vessel Class</th>
                <th style={{ textAlign: 'right' }}>Distance</th>
                <th style={{ textAlign: 'right' }}>Rate</th>
                <th>Unit</th>
                <th style={{ textAlign: 'right' }}>1D %</th>
                <th style={{ textAlign: 'right' }}>30D %</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const isSelected = r.route_code === active.route_code;
                return (
                  <tr
                    key={r.route_code}
                    onClick={() => onSelectRoute(r.route_code)}
                    className={isSelected ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 700, color: '#22D3EE', fontFamily: 'monospace' }}>
                      {r.route_code}
                    </td>
                    <td style={{ fontWeight: 600, color: '#F1F5F9' }}>
                      {r.route_name.split('(')[0]}
                    </td>
                    <td style={{ color: '#CBD5E1' }}>{r.commodity}</td>
                    <td style={{ color: '#CBD5E1' }}>{r.vessel_class}</td>
                    <td className="mi-table-num" style={{ color: '#94A3B8' }}>
                      {r.distance_nm.toLocaleString()} NM
                    </td>
                    <td className="mi-table-num" style={{ fontWeight: 700, color: '#F1F5F9' }}>
                      ${r.freight.current_rate.toLocaleString()}
                    </td>
                    <td style={{ color: '#94A3B8', fontSize: '11px' }}>{r.benchmark_unit}</td>
                    <td className="mi-table-num" style={{
                      fontWeight: 700,
                      color: r.freight.change_1d_pct >= 0 ? '#10B981' : '#F43F5E'
                    }}>
                      {r.freight.change_1d_pct >= 0 ? `+${r.freight.change_1d_pct}%` : `${r.freight.change_1d_pct}%`}
                    </td>
                    <td className="mi-table-num" style={{
                      fontWeight: 700,
                      color: r.freight.change_30d_pct >= 0 ? '#10B981' : '#F43F5E'
                    }}>
                      {r.freight.change_30d_pct >= 0 ? `+${r.freight.change_30d_pct}%` : `${r.freight.change_30d_pct}%`}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/voyage-calculator');
                        }}
                        className="mi-btn mi-btn-secondary"
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                        title="Calculate TCE"
                      >
                        <Calculator size={13} style={{ color: '#10B981' }} />
                        <span>TCE</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

