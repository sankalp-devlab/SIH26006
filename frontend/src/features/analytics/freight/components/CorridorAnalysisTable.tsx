/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Corridor Analysis & Benchmark Matrix Table
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import type { FreightRateBenchmark } from '../../../../types/freight-analytics';

interface CorridorAnalysisTableProps {
  rates: FreightRateBenchmark[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  onOpenComparison: (type: 'route', a: string, b: string) => void;
}

export const CorridorAnalysisTable: React.FC<CorridorAnalysisTableProps> = ({
  rates,
  selectedRouteCode,
  onSelectRoute,
  onOpenComparison,
}) => {
  const navigate = useNavigate();

  // Render SVG Sparkline
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const coords = points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#20C98A' : '#FF4D55';

    return (
      <svg width={width} height={height} style={{ overflow: 'visible', display: 'inline-block' }}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="freight-corridor-section">
      <div className="freight-panel-header">
        <div>
          <div className="freight-panel-title">
            <Layers size={17} style={{ color: 'var(--freight-cyan)' }} />
            <span>Corridor Intelligence & Benchmark Matrix</span>
          </div>
          <p className="freight-panel-desc">
            Physical benchmark rates, regional fixtures, and 30-day volatility across Baltic standard corridors
          </p>
        </div>

        <span style={{ fontSize: '12px', color: 'var(--freight-text-muted)' }}>
          {rates.length} active corridors monitored
        </span>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="freight-table-wrap">
        <table className="freight-table">
          <thead>
            <tr>
              <th>Corridor / Route</th>
              <th>Segment</th>
              <th>Vessel Class</th>
              <th>Benchmark Rate</th>
              <th>1D Movement</th>
              <th>30D Trend</th>
              <th>52W Range</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => {
              const isSelected = rate.route_code === selectedRouteCode;
              const is1dUp = rate.change_1d_pct >= 0;
              const is30dUp = rate.change_30d_pct >= 0;

              return (
                <tr
                  key={rate.id || rate.route_code}
                  className={`interactive-row ${isSelected ? 'selected-row' : ''}`}
                  onClick={() => onSelectRoute(rate.route_code)}
                  title="Click to view detailed chart above"
                >
                  {/* Route & Corridor Name */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="freight-route-code">{rate.route_code}</span>
                        <span style={{ fontWeight: 600, color: 'var(--freight-text)' }}>
                          {rate.origin_port} → {rate.destination_port}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--freight-text-muted)' }}>
                        {rate.commodity} • {rate.distance_nm.toLocaleString()} NM
                      </span>
                    </div>
                  </td>

                  {/* Market Segment */}
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor:
                          rate.segment === 'dry_bulk'
                            ? 'rgba(0, 217, 255, 0.12)'
                            : rate.segment === 'tanker'
                            ? 'rgba(255, 176, 32, 0.12)'
                            : 'rgba(139, 92, 255, 0.12)',
                        color:
                          rate.segment === 'dry_bulk'
                            ? 'var(--freight-cyan)'
                            : rate.segment === 'tanker'
                            ? 'var(--freight-amber)'
                            : 'var(--freight-violet)',
                        border: '1px solid rgba(100, 190, 240, 0.2)',
                      }}
                    >
                      {rate.segment.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Vessel Class */}
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--freight-text)' }}>
                      {rate.vessel_class}
                    </span>
                  </td>

                  {/* Benchmark Rate */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--freight-text)' }}>
                        ${rate.rate_value.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--freight-text-muted)' }}>
                        {rate.rate_basis === 'per_day_tce' ? '$/day TCE' : rate.rate_basis === 'worldscale' ? 'WS' : '$/MT'}
                      </span>
                    </div>
                  </td>

                  {/* 1D Change */}
                  <td>
                    <span
                      className={`freight-kpi-badge ${is1dUp ? 'positive' : 'negative'}`}
                    >
                      {is1dUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      <span>{is1dUp ? '+' : ''}{rate.change_1d_pct}%</span>
                    </span>
                  </td>

                  {/* 30D Trend Sparkline */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderSparkline(rate.sparkline_30d, is30dUp)}
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: is30dUp ? 'var(--freight-green)' : 'var(--freight-red)',
                        }}
                      >
                        {is30dUp ? '+' : ''}{rate.change_30d_pct}%
                      </span>
                    </div>
                  </td>

                  {/* 52-Week Range */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--freight-text-muted)' }}>
                        <span>L: ${rate.low_52w.toFixed(1)}</span>
                        <span>H: ${rate.high_52w.toFixed(1)}</span>
                      </div>
                      <div
                        style={{
                          width: '90px',
                          height: '4px',
                          borderRadius: '2px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            height: '100%',
                            left: '0',
                            width: `${Math.min(100, Math.max(10, ((rate.rate_value - rate.low_52w) / (rate.high_52w - rate.low_52w || 1)) * 100))}%`,
                            backgroundColor: 'var(--freight-cyan)',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Quick Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectRoute(rate.route_code)}
                        className="freight-action-btn"
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                        title="Focus on chart"
                      >
                        <span>Focus</span>
                        <ArrowRight size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenComparison('route', selectedRouteCode, rate.route_code)}
                        className="freight-action-btn"
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                        title="Compare with active corridor"
                      >
                        <span>Compare</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/voyage-calculator')}
                        className="freight-action-btn"
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px', color: 'var(--freight-cyan)' }}
                        title="Calculate voyage P&L for this corridor"
                      >
                        <Calculator size={12} />
                        <span>Calc</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
