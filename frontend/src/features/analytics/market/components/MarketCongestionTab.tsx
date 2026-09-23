/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Port & Chokepoint Congestion Analytics Tab
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  Building2
} from 'lucide-react';
import type { MarketCongestionMetrics } from '../../../../types/market-insights';

interface MarketCongestionTabProps {
  congestion?: MarketCongestionMetrics;
}

export const MarketCongestionTab: React.FC<MarketCongestionTabProps> = ({ congestion }) => {
  const navigate = useNavigate();

  if (!congestion) {
    return (
      <div className="mi-card" style={{ padding: '36px 24px', textAlign: 'center', color: '#94A3B8' }}>
        Port congestion metrics currently unavailable.
      </div>
    );
  }

  const renderCongestionProgressionChart = () => {
    const data = congestion.historical_trend;
    if (data.length < 2) return null;

    const width = 700;
    const height = 220;
    const padLeft = 50;
    const padRight = 30;
    const padTop = 20;
    const padBottom = 35;

    const maxWait = Math.max(...data.map(d => d.avg_waiting_hours)) * 1.1;
    const minWait = Math.min(...data.map(d => d.avg_waiting_hours)) * 0.9;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const stepX = chartW / (data.length - 1);
    const points = data.map((d, i) => {
      const norm = (d.avg_waiting_hours - minWait) / (maxWait - minWait || 1);
      return {
        x: padLeft + i * stepX,
        y: padTop + chartH - norm * chartH,
        hours: d.avg_waiting_hours,
        date: d.date
      };
    });

    const path = `M ${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
    const area = `${path} L ${points[points.length - 1].x.toFixed(1)},${(padTop + chartH).toFixed(1)} L ${points[0].x.toFixed(1)},${(padTop + chartH).toFixed(1)} Z`;

    const yTicks = [minWait, (minWait + maxWait) / 2, maxWait];

    return (
      <div style={{ width: '100%', overflowX: 'auto', background: '#071524', borderRadius: '8px', padding: '12px 8px', border: '1px solid rgba(100, 190, 240, 0.12)' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', minWidth: '520px' }}>
          <defs>
            <linearGradient id="congestionAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis */}
          {yTicks.map((val, idx) => {
            const norm = (val - minWait) / (maxWait - minWait || 1);
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
                  {val.toFixed(1)}h
                </text>
              </g>
            );
          })}

          <path d={area} fill="url(#congestionAreaGrad)" />
          <path d={path} fill="none" stroke="#F43F5E" strokeWidth="2.5" />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#F43F5E" stroke="#091A2A" strokeWidth="2" />
            </g>
          ))}

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

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="mi-badge mi-badge-red">CRITICAL</span>;
      case 'HIGH':
        return <span className="mi-badge mi-badge-amber">HIGH</span>;
      case 'MODERATE':
        return <span className="mi-badge mi-badge-cyan">MODERATE</span>;
      default:
        return <span className="mi-badge mi-badge-green">LOW</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* KPI Row (4 cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Global Congestion Index</span>
            <div className="mi-kpi-icon-wrap" style={{ color: '#F43F5E', borderColor: 'rgba(244, 63, 94, 0.25)', backgroundColor: 'rgba(244, 63, 94, 0.1)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="mi-kpi-metric" style={{ color: '#F43F5E' }}>
            {congestion.global_congestion_index_pct}%
          </div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-delta up" style={{ color: '#F43F5E', backgroundColor: 'rgba(244, 63, 94, 0.12)' }}>
              +{congestion.congestion_change_pct}%
            </span>
            <span className="mi-kpi-subtext">30D index expansion</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Avg Anchorage Turnaround</span>
            <div className="mi-kpi-icon-wrap">
              <Anchor size={16} />
            </div>
          </div>
          <div className="mi-kpi-metric">
            {congestion.avg_waiting_time_hours}h
          </div>
          <div className="mi-kpi-bottom">
            <span className="mi-kpi-delta up" style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
              +{congestion.waiting_time_change_hours}h
            </span>
            <span className="mi-kpi-subtext">vs prior week</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Vessels in Queue</span>
            <div className="mi-kpi-icon-wrap" style={{ color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.25)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Anchor size={16} />
            </div>
          </div>
          <div className="mi-kpi-metric" style={{ color: '#F59E0B' }}>
            {congestion.waiting_vessels_count.toLocaleString()}
          </div>
          <div className="mi-kpi-bottom">
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Active AIS anchored positions</span>
          </div>
        </div>

        <div className="mi-kpi-card" style={{ justifyContent: 'space-between' }}>
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Port Intelligence Hub</span>
            <div className="mi-kpi-icon-wrap">
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
            Direct access to Module 13 berth lineups & queue times
          </div>
          <button
            onClick={() => navigate('/ports')}
            className="mi-btn mi-btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
          >
            <Building2 size={13} style={{ color: '#22D3EE' }} />
            <span>Open Port Insights</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Congestion Progression & Critical Chokepoint Alerts */}
      <div className="mi-congestion-split">
        {/* Left 7/12: Waiting Time Progression */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <Clock size={16} style={{ color: '#F43F5E' }} />
                Anchorage Turnaround Delay Progression (Hours)
              </h3>
              <p className="mi-card-subtitle">
                Observed waiting times across premier discharge gateways
              </p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F43F5E', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>
              <ArrowUpRight size={14} /> +{congestion.waiting_time_change_hours}h Trend
            </span>
          </div>

          {renderCongestionProgressionChart()}
        </div>

        {/* Right 5/12: Chokepoint & Canal Delays */}
        <div className="mi-card">
          <div className="mi-card-header">
            <div>
              <h3 className="mi-card-title">
                <ShieldAlert size={16} style={{ color: '#F59E0B' }} />
                Strategic Canal & Chokepoint Delays
              </h3>
              <p className="mi-card-subtitle">
                Navigational routing friction and passage queues
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#0B1D2E', border: '1px solid rgba(100, 190, 240, 0.14)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, color: '#F1F5F9' }}>
                <span>Bab-el-Mandeb & Red Sea</span>
                <span style={{ color: '#F43F5E', fontWeight: 700, fontFamily: 'monospace' }}>+14.2 days</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4 }}>
                Cape of Good Hope rerouting adds ~3,400 NM on Asia-Europe voyages.
              </p>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#0B1D2E', border: '1px solid rgba(100, 190, 240, 0.14)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, color: '#F1F5F9' }}>
                <span>Panama Canal Draft Restrictions</span>
                <span style={{ color: '#F59E0B', fontWeight: 700, fontFamily: 'monospace' }}>+6.8 days</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4 }}>
                Gatun Lake reservoir preservation slots constrain Neopanamax draft.
              </p>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#0B1D2E', border: '1px solid rgba(100, 190, 240, 0.14)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, color: '#F1F5F9' }}>
                <span>Malacca Strait Bunker Congestion</span>
                <span style={{ color: '#22D3EE', fontWeight: 700, fontFamily: 'monospace' }}>+1.5 days</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4 }}>
                Singapore OPL anchorage density and barge delivery scheduling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Congested Gateways Table */}
      <div className="mi-card">
        <div className="mi-card-header">
          <div>
            <h3 className="mi-card-title">
              <Anchor size={16} style={{ color: '#F43F5E' }} />
              Primary Congested Port Clusters & Lineup Turnaround
            </h3>
            <p className="mi-card-subtitle">
              Live AIS queue metrics, turnaround bottlenecks, and gateway severity
            </p>
          </div>
        </div>

        <div className="mi-table-container">
          <table className="mi-table">
            <thead>
              <tr>
                <th>Port / Terminal Node</th>
                <th style={{ textAlign: 'right' }}>Waiting Vessels</th>
                <th style={{ textAlign: 'right' }}>Avg Turnaround Delay</th>
                <th style={{ textAlign: 'right' }}>Congestion Severity</th>
                <th style={{ textAlign: 'right' }}>Port Insights</th>
              </tr>
            </thead>
            <tbody>
              {congestion.key_congested_ports.map((port, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#F1F5F9' }}>{port.port_name}</td>
                  <td className="mi-table-num" style={{ fontWeight: 700, color: '#F59E0B' }}>
                    {port.waiting_vessels} vessels
                  </td>
                  <td className="mi-table-num" style={{ color: '#CBD5E1' }}>
                    {port.avg_delay_hours}h
                  </td>
                  <td style={{ textAlign: 'right' }}>{getSeverityBadge(port.congestion_level)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => navigate('/ports')}
                      className="mi-btn mi-btn-secondary"
                      style={{ height: '28px', padding: '0 8px', fontSize: '11px', display: 'inline-flex' }}
                    >
                      <span>Analyze</span>
                      <ExternalLink size={10} />
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

