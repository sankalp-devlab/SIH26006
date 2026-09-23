import React from 'react';
import {
  GitCompare,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import type { PriceComparisonSeries, SpotPriceRecord } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface PriceComparisonWorkspaceProps {
  comparisonMatrix: PriceComparisonSeries[];
  allSpots: SpotPriceRecord[];
  onAddRoute: (code: string) => void;
  onRemoveRoute: (code: string) => void;
  onClearAll: () => void;
  onSelectRoute: (code: string) => void;
}

export const PriceComparisonWorkspace: React.FC<PriceComparisonWorkspaceProps> = ({
  comparisonMatrix,
  allSpots,
  onAddRoute,
  onRemoveRoute,
  onClearAll,
  onSelectRoute,
}) => {
  const availableToAdd = allSpots.filter(
    (s) => !comparisonMatrix.some((comp) => comp.routeCode === s.routeCode)
  );

  interface MetricConfig {
    key: string;
    label: string;
    format: (val: unknown) => string;
  }

  const metrics: MetricConfig[] = [
    {
      key: 'currentSpotRateUsd',
      label: 'Current Spot TCE',
      format: (val: unknown) => formatFreightRate(Number(val) || 0),
    },
    {
      key: 'change7dPct',
      label: '7-Day Movement',
      format: (val: unknown) => {
        const n = Number(val) || 0;
        return `${n >= 0 ? '+' : ''}${n}%`;
      },
    },
    {
      key: 'change30dPct',
      label: '30-Day Movement',
      format: (val: unknown) => {
        const n = Number(val) || 0;
        return `${n >= 0 ? '+' : ''}${n}%`;
      },
    },
    {
      key: 'frontMonthFfaUsd',
      label: 'Front-Month FFA',
      format: (val: unknown) => formatFreightRate(Number(val) || 0),
    },
    {
      key: 'spreadUsd',
      label: 'Spot vs FFA Spread',
      format: (val: unknown) => {
        const n = Number(val) || 0;
        return `${n >= 0 ? '+' : ''}$${Math.round(n).toLocaleString()}`;
      },
    },
    {
      key: 'volatility30dPct',
      label: '30D Volatility',
      format: (val: unknown) => `${Number(val) || 0}%`,
    },
    {
      key: 'curveStructure',
      label: 'Forward Curve Structure',
      format: (val: unknown) => String(val ?? ''),
    },
  ];

  return (
    <div className="mp-card">
      {/* Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap" style={{ color: 'var(--ol-blue, #3B82F6)', background: 'rgba(59, 130, 246, 0.12)' }}>
            <GitCompare size={18} />
          </div>
          <div>
            <div className="mp-card-title">
              Multi-Corridor Comparison Workspace
            </div>
            <div className="mp-card-subtitle">
              Side-by-side evaluation of up to 5 maritime corridors, rates, spreads, and market volatility
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Add Dropdown */}
          {availableToAdd.length > 0 && comparisonMatrix.length < 5 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.16))', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>
              <Plus size={13} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onAddRoute(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                style={{ background: 'transparent', color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)', border: 'none', outline: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled style={{ background: '#091A2A', color: '#94A3B8' }}>
                  + Add Corridor to Compare
                </option>
                {availableToAdd.map((s) => (
                  <option key={s.routeCode} value={s.routeCode} style={{ background: '#091A2A', color: '#fff' }}>
                    {s.routeCode} • {s.vesselClass} ({formatFreightRate(s.rateTceUsdPerDay)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Button */}
          {comparisonMatrix.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="mp-btn mp-btn-secondary"
              style={{ padding: '5px 12px', fontSize: '11.5px', color: 'var(--ol-red, #F43F5E)' }}
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {comparisonMatrix.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--ol-text-muted, #64748B)' }}>
          <GitCompare size={32} style={{ margin: '0 auto 10px', color: 'var(--ol-text-muted, #64748B)', opacity: 0.6 }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ol-text-secondary, #94A3B8)' }}>No Corridors Selected</div>
          <div style={{ fontSize: '12px', color: 'var(--ol-text-muted, #64748B)', marginTop: '4px' }}>
            Add corridors using the dropdown above or check comparison boxes in the benchmark table.
          </div>
        </div>
      ) : (
        <div className="mp-table-container" style={{ marginTop: '4px' }}>
          <table className="mp-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Analytical Metric</th>
                {comparisonMatrix.map((comp) => (
                  <th key={comp.routeCode} style={{ textAlign: 'center', minWidth: '140px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => onSelectRoute(comp.routeCode)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--ol-cyan, #22D3EE)',
                          fontWeight: 700,
                          fontSize: '13px',
                          fontFamily: 'var(--font-mono, monospace)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title={`Focus ${comp.routeCode} in terminal`}
                      >
                        {comp.routeCode}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveRoute(comp.routeCode)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--ol-text-muted, #64748B)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Remove corridor"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ol-text-secondary, #94A3B8)', fontWeight: 400, marginTop: '2px' }}>
                      {comp.vesselClass}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.key}>
                  <td style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {m.label}
                  </td>
                  {comparisonMatrix.map((comp) => {
                    const raw = (comp as unknown as Record<string, unknown>)[m.key];
                    const isStructure = m.key === 'curveStructure';
                    return (
                      <td key={comp.routeCode} style={{ textAlign: 'center', fontFamily: 'var(--font-mono, monospace)' }}>
                        {isStructure ? (
                          <span
                            className={`mp-curve-badge ${
                              raw === 'Contango'
                                ? 'contango'
                                : raw === 'Backwardation'
                                ? 'backwardation'
                                : 'flat'
                            }`}
                          >
                            {String(raw)}
                          </span>
                        ) : (
                          <span style={{ fontWeight: 700, color: '#fff' }}>
                            {typeof raw === 'number'
                              ? m.format(raw)
                              : String(raw ?? 'N/A')}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
