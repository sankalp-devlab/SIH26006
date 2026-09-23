/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Multi-Entity Market & Route Comparison Modal
 */

import React from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import type {
  MarketComparisonResult,
  MarketRoute
} from '../../../../types/market-insights';

interface MarketComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison?: MarketComparisonResult;
  comparisonType: 'route' | 'market' | 'vessel_class';
  targetA: string;
  targetB: string;
  routes: MarketRoute[];
  onTypeChange: (type: 'route' | 'market' | 'vessel_class') => void;
  onTargetAChange: (target: string) => void;
  onTargetBChange: (target: string) => void;
}

export const MarketComparisonModal: React.FC<MarketComparisonModalProps> = ({
  isOpen,
  onClose,
  comparison,
  comparisonType,
  targetA,
  targetB,
  routes,
  onTypeChange,
  onTargetAChange,
  onTargetBChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="mi-modal-backdrop" onClick={onClose}>
      <div className="mi-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="mi-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="mi-kpi-icon-wrap" style={{ width: '36px', height: '36px' }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F1F5F9' }}>
                Multi-Entity Commercial Comparison
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Side-by-side analytical benchmarking across routes, vessel classes, or market sectors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mi-btn mi-btn-secondary"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Entity Selectors Bar */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#071524',
          borderBottom: '1px solid rgba(100, 190, 240, 0.14)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Comparison Type */}
          <div className="mi-time-range-group">
            {(['route', 'vessel_class', 'market'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={`mi-time-pill ${comparisonType === t ? 'active' : ''}`}
              >
                {t === 'route' ? 'Routes' : t === 'vessel_class' ? 'Vessel Classes' : 'Market Sectors'}
              </button>
            ))}
          </div>

          {/* Select Target A & B */}
          {comparisonType === 'route' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
              <div className="mi-select-wrapper" style={{ flex: 1 }}>
                <select
                  value={targetA}
                  onChange={(e) => onTargetAChange(e.target.value)}
                  className="mi-select"
                  style={{ width: '100%', minWidth: '180px' }}
                >
                  {routes.map((r) => (
                    <option key={r.route_code} value={r.route_code}>
                      {r.route_code}: {r.route_name.split('(')[0]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="mi-select-chevron" />
              </div>

              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7189A3', textTransform: 'uppercase' }}>vs</span>

              <div className="mi-select-wrapper" style={{ flex: 1 }}>
                <select
                  value={targetB}
                  onChange={(e) => onTargetBChange(e.target.value)}
                  className="mi-select"
                  style={{ width: '100%', minWidth: '180px' }}
                >
                  {routes.map((r) => (
                    <option key={r.route_code} value={r.route_code}>
                      {r.route_code}: {r.route_name.split('(')[0]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="mi-select-chevron" />
              </div>
            </div>
          ) : comparisonType === 'vessel_class' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
              <div className="mi-select-wrapper" style={{ flex: 1 }}>
                <select
                  value={targetA}
                  onChange={(e) => onTargetAChange(e.target.value)}
                  className="mi-select"
                  style={{ width: '100%', minWidth: '160px' }}
                >
                  <option value="Capesize">Capesize</option>
                  <option value="Panamax">Panamax</option>
                  <option value="Supramax">Supramax</option>
                  <option value="VLCC">VLCC</option>
                  <option value="Aframax">Aframax</option>
                  <option value="MR">MR</option>
                </select>
                <ChevronDown size={14} className="mi-select-chevron" />
              </div>

              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7189A3', textTransform: 'uppercase' }}>vs</span>

              <div className="mi-select-wrapper" style={{ flex: 1 }}>
                <select
                  value={targetB}
                  onChange={(e) => onTargetBChange(e.target.value)}
                  className="mi-select"
                  style={{ width: '100%', minWidth: '160px' }}
                >
                  <option value="Panamax">Panamax</option>
                  <option value="Capesize">Capesize</option>
                  <option value="Supramax">Supramax</option>
                  <option value="VLCC">VLCC</option>
                  <option value="Aframax">Aframax</option>
                  <option value="MR">MR</option>
                </select>
                <ChevronDown size={14} className="mi-select-chevron" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#F1F5F9', fontWeight: 600 }}>
              <span className="mi-badge mi-badge-cyan">Dry Bulk Market</span>
              <span style={{ color: '#7189A3', textTransform: 'uppercase', fontSize: '11px' }}>vs</span>
              <span className="mi-badge mi-badge-green">Tanker Market</span>
            </div>
          )}
        </div>

        {/* Comparison Table Body */}
        <div className="mi-modal-body">
          {comparison ? (
            <>
              {/* Entity Titles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px 16px', backgroundColor: '#071524', border: '1px solid rgba(100, 190, 240, 0.16)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7189A3', fontWeight: 700, letterSpacing: '0.06em' }}>
                    Entity A
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#22D3EE', marginTop: '2px' }}>
                    {comparison.entity_a_label}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', backgroundColor: '#071524', border: '1px solid rgba(100, 190, 240, 0.16)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7189A3', fontWeight: 700, letterSpacing: '0.06em' }}>
                    Entity B
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                    {comparison.entity_b_label}
                  </div>
                </div>
              </div>

              {/* Metrics Table */}
              <div className="mi-table-container">
                <table className="mi-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th style={{ textAlign: 'right' }}>Entity A</th>
                      <th style={{ textAlign: 'right' }}>Entity B</th>
                      <th style={{ textAlign: 'right' }}>Variance (Delta)</th>
                      <th style={{ textAlign: 'right' }}>Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.metrics.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#F1F5F9' }}>{m.label}</td>
                        <td className="mi-table-num" style={{ fontWeight: 700, color: '#22D3EE' }}>
                          {m.value_a.toLocaleString()} {m.unit}
                        </td>
                        <td className="mi-table-num" style={{ fontWeight: 700, color: '#10B981' }}>
                          {m.value_b.toLocaleString()} {m.unit}
                        </td>
                        <td className="mi-table-num" style={{
                          fontWeight: 700,
                          color: m.delta >= 0 ? '#F1F5F9' : '#94A3B8'
                        }}>
                          {m.delta >= 0 ? '+' : ''}{m.delta.toLocaleString()} {m.unit} ({m.delta_pct >= 0 ? '+' : ''}{m.delta_pct}%)
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`mi-badge ${
                            m.advantage === 'entity_a'
                              ? 'mi-badge-cyan'
                              : m.advantage === 'entity_b'
                              ? 'mi-badge-green'
                              : 'mi-badge-slate'
                          }`}>
                            {m.advantage === 'entity_a' ? 'Entity A' : m.advantage === 'entity_b' ? 'Entity B' : 'Neutral'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Analytical Insights Commentary */}
              <div style={{ padding: '16px 18px', backgroundColor: '#071524', border: '1px solid rgba(100, 190, 240, 0.14)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#F1F5F9', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  <ShieldCheck size={16} style={{ color: '#22D3EE' }} />
                  Commercial Insights & Analytical Commentary
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94A3B8', lineHeight: 1.6 }}>
                  {comparison.analytical_commentary.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#7189A3', fontSize: '13px' }}>
              Loading comparison data...
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mi-modal-footer">
          <button
            onClick={onClose}
            className="mi-btn mi-btn-secondary"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

