import React from 'react';
import {
  Database,
  Calendar,
  Layers,
  Calculator,
  Compass,
  TrendingUp,
  ArrowLeftRight,
  Anchor,
  Leaf,
  Columns,
  Table as TableIcon,
  Check,
} from 'lucide-react';
import type {
  DataQueryConfig,
  EntitySchema,
  MaritimeDatasetEntity,
  TimeGranularity,
  AnalyticalTransform,
  AggregationFunction,
} from '../../../types/data-query';

interface QueryBuilderPanelProps {
  config: DataQueryConfig;
  schema: EntitySchema;
  allSchemas: Record<string, EntitySchema>;
  onSetEntity: (entity: MaritimeDatasetEntity) => void;
  onUpdateConfig: (patch: Partial<DataQueryConfig>) => void;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  height: '38px',
  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
  border: '1px solid var(--ol-border, #183A52)',
  borderRadius: 'var(--ol-radius-md, 6px)',
  padding: '0 32px 0 12px',
  fontSize: '12px',
  fontFamily: 'var(--font-mono, monospace)',
  color: 'var(--ol-text-primary, #F1F5F9)',
  outline: 'none',
  boxSizing: 'border-box',
  appearance: 'none',
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  transition: 'border-color 0.15s ease',
};

const dateInputStyle: React.CSSProperties = {
  height: '38px',
  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
  border: '1px solid var(--ol-border, #183A52)',
  borderRadius: 'var(--ol-radius-md, 6px)',
  padding: '0 12px',
  fontSize: '12px',
  fontFamily: 'var(--font-mono, monospace)',
  color: 'var(--ol-text-primary, #F1F5F9)',
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'dark',
  minWidth: '135px',
};

export const QueryBuilderPanel: React.FC<QueryBuilderPanelProps> = ({
  config,
  schema,
  allSchemas,
  onSetEntity,
  onUpdateConfig,
}) => {
  const isPivot = config.mode === 'pivot';
  const isTimeSeries = config.mode === 'time_series';

  // Available dimensions & metrics for current entity
  const dimensions = schema.fields.filter((f) => f.isDimension && f.name !== 'date');
  const metrics = schema.fields.filter((f) => f.isMetric);

  const datePresets = [
    { label: 'Since 2014', start: '2014-01-01', end: '2026-09-01' },
    { label: '10Y', start: '2016-01-01', end: '2026-09-01' },
    { label: '5Y', start: '2021-01-01', end: '2026-09-01' },
    { label: '3Y', start: '2023-01-01', end: '2026-09-01' },
    { label: '1Y', start: '2025-01-01', end: '2026-09-01' },
    { label: '2024–2026 Disruption', start: '2024-01-01', end: '2026-09-01' },
  ];

  // Map each dataset to a distinctive maritime icon
  const getDatasetIcon = (key: string) => {
    switch (key) {
      case 'freight_rates':
        return <TrendingUp size={15} />;
      case 'trade_flows':
        return <ArrowLeftRight size={15} />;
      case 'fleet_movements':
      case 'vessel_operations':
        return <Compass size={15} />;
      case 'port_congestion':
        return <Anchor size={15} />;
      case 'fleet_emissions':
        return <Leaf size={15} />;
      default:
        return <Database size={15} />;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--ol-surface-primary, #091B2E)',
        border: '1px solid var(--ol-border, #183A52)',
        borderRadius: 'var(--ol-radius-lg, 12px)',
        padding: '20px 24px',
        boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* ============================================================
          SECTION 1: TARGET MARITIME DATASET SELECTOR
          Segmented premium dark cards with subtle borders & cyan highlight
         ============================================================ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--ol-radius-sm, 6px)',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                color: 'var(--ol-cyan, #00D4FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={15} />
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ol-text-primary, #F1F5F9)',
              }}
            >
              Target Maritime Dataset
            </span>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #94A3B8)' }}>
            Active: <strong style={{ color: 'var(--ol-cyan, #00D4FF)' }}>{schema.label}</strong> ({schema.fields.length} dimensions & metrics)
          </span>
        </div>

        {/* Segmented Dataset Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '10px',
          }}
        >
          {Object.entries(allSchemas).map(([key, s]) => {
            const isSelected = config.entity === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSetEntity(key as MaritimeDatasetEntity)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  minHeight: '48px',
                  borderRadius: 'var(--ol-radius-md, 8px)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  border: isSelected
                    ? '1.5px solid var(--ol-cyan, #00D4FF)'
                    : '1px solid var(--ol-border, #183A52)',
                  backgroundColor: isSelected
                    ? 'rgba(0, 212, 255, 0.12)'
                    : 'var(--ol-surface-secondary, #0D2238)',
                  color: isSelected
                    ? 'var(--ol-cyan, #00D4FF)'
                    : 'var(--ol-text-primary, #F1F5F9)',
                  boxShadow: isSelected
                    ? '0 0 12px rgba(0, 212, 255, 0.15)'
                    : 'none',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.35)';
                    e.currentTarget.style.backgroundColor = 'var(--ol-surface-elevated, #102B45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)';
                    e.currentTarget.style.backgroundColor = 'var(--ol-surface-secondary, #0D2238)';
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--ol-radius-sm, 6px)',
                    backgroundColor: isSelected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? 'var(--ol-cyan, #00D4FF)' : 'var(--ol-text-secondary, #94A3B8)',
                    flexShrink: 0,
                  }}
                >
                  {getDatasetIcon(key)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.3,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: isSelected ? 'rgba(0, 212, 255, 0.8)' : 'var(--ol-text-muted, #94A3B8)',
                      marginTop: '2px',
                    }}
                  >
                    {s.fields.length} attributes
                  </div>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--ol-cyan, #00D4FF)',
                      boxShadow: '0 0 6px var(--ol-cyan, #00D4FF)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SECTION 2: ACTIVE METRIC & FUNCTION / ANALYTICAL CONTROLS GRID
          Structured 3-column layout on desktop (2-col tablet, 1-col mobile)
         ============================================================ */}
      <div
        style={{
          borderTop: '1px solid var(--ol-border, #183A52)',
          paddingTop: '16px',
        }}
      >
        {isPivot ? (
          /* Pivot Configuration Grid (4 aligned columns) */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              padding: '16px 18px',
              borderRadius: 'var(--ol-radius-lg, 10px)',
              border: '1px solid var(--ol-border, #183A52)',
            }}
          >
            {/* Row Dimension */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ol-text-secondary, #94A3B8)',
                  marginBottom: '8px',
                }}
              >
                <TableIcon size={13} style={{ color: 'var(--ol-cyan, #00D4FF)' }} />
                Row Header (Dimension)
              </div>
              <select
                value={config.pivot.rowDimension}
                onChange={(e) =>
                  onUpdateConfig({
                    pivot: { ...config.pivot, rowDimension: e.target.value },
                  })
                }
                style={selectStyle}
              >
                {dimensions.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Column Dimension */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ol-text-secondary, #94A3B8)',
                  marginBottom: '8px',
                }}
              >
                <Columns size={13} style={{ color: 'var(--ol-blue, #3B82F6)' }} />
                Column Header (Dimension)
              </div>
              <select
                value={config.pivot.colDimension}
                onChange={(e) =>
                  onUpdateConfig({
                    pivot: { ...config.pivot, colDimension: e.target.value },
                  })
                }
                style={selectStyle}
              >
                <option value="year">Year (2014..2026)</option>
                <option value="quarter">Quarter (Q1..Q4)</option>
                {dimensions
                  .filter((d) => d.name !== config.pivot.rowDimension)
                  .map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.label}
                    </option>
                  ))}
              </select>
            </div>

            {/* Value Measure */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ol-text-secondary, #94A3B8)',
                  marginBottom: '8px',
                }}
              >
                <Calculator size={13} style={{ color: 'var(--ol-green, #10B981)' }} />
                Value Measure (Metric)
              </div>
              <select
                value={config.pivot.valueMetric}
                onChange={(e) =>
                  onUpdateConfig({
                    pivot: { ...config.pivot, valueMetric: e.target.value },
                  })
                }
                style={selectStyle}
              >
                {metrics.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.label} ({m.unit || 'unit'})
                  </option>
                ))}
              </select>
            </div>

            {/* Aggregator */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ol-text-secondary, #94A3B8)',
                  marginBottom: '8px',
                }}
              >
                <Layers size={13} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
                Function Aggregator
              </div>
              <select
                value={config.pivot.aggregation}
                onChange={(e) =>
                  onUpdateConfig({
                    pivot: {
                      ...config.pivot,
                      aggregation: e.target.value as AggregationFunction,
                    },
                  })
                }
                style={{ ...selectStyle, color: 'var(--ol-cyan, #00D4FF)', fontWeight: 700 }}
              >
                <option value="AVG">AVG (Mean)</option>
                <option value="SUM">SUM (Total)</option>
                <option value="MAX">MAX (Peak)</option>
                <option value="MIN">MIN (Floor)</option>
                <option value="COUNT">COUNT (Rows)</option>
              </select>
            </div>
          </div>
        ) : (
          /* Standard 3-Column Analytical Configuration Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isTimeSeries ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
              gap: '16px',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              padding: '16px 18px',
              borderRadius: 'var(--ol-radius-lg, 10px)',
              border: '1px solid var(--ol-border, #183A52)',
            }}
          >
            {/* SECTION A — Active Metric & Function */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ol-text-secondary, #94A3B8)',
                  marginBottom: '8px',
                }}
              >
                <Calculator size={13} style={{ color: 'var(--ol-cyan, #00D4FF)' }} />
                Active Metric & Function
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={config.metrics[0]?.field || metrics[0]?.name}
                  onChange={(e) => {
                    const field = e.target.value;
                    const curAgg = config.metrics[0]?.aggregation || 'AVG';
                    onUpdateConfig({
                      metrics: [{ field, aggregation: curAgg }],
                    });
                  }}
                  style={{ ...selectStyle, flex: 1 }}
                >
                  {metrics.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.label} ({m.unit || 'unit'})
                    </option>
                  ))}
                </select>

                <select
                  value={config.metrics[0]?.aggregation || 'AVG'}
                  onChange={(e) => {
                    const aggregation = e.target.value as AggregationFunction;
                    const curField = config.metrics[0]?.field || metrics[0]?.name;
                    onUpdateConfig({
                      metrics: [{ field: curField, aggregation }],
                    });
                  }}
                  style={{
                    ...selectStyle,
                    width: '105px',
                    flex: '0 0 auto',
                    fontWeight: 700,
                    color: 'var(--ol-cyan, #00D4FF)',
                  }}
                >
                  <option value="AVG">AVG</option>
                  <option value="SUM">SUM</option>
                  <option value="MAX">MAX</option>
                  <option value="MIN">MIN</option>
                  <option value="COUNT">COUNT</option>
                </select>
              </div>
            </div>

            {/* SECTION B — Frequency Resampling (for Time Series) */}
            {isTimeSeries && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--ol-text-secondary, #94A3B8)',
                    marginBottom: '8px',
                  }}
                >
                  <Compass size={13} style={{ color: 'var(--ol-blue, #3B82F6)' }} />
                  Frequency Resampling
                </div>
                <select
                  value={config.granularity}
                  onChange={(e) =>
                    onUpdateConfig({
                      granularity: e.target.value as TimeGranularity,
                    })
                  }
                  style={selectStyle}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            )}

            {/* SECTION C — Analytical Transform (for Time Series) */}
            {isTimeSeries && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--ol-text-secondary, #94A3B8)',
                    marginBottom: '8px',
                  }}
                >
                  <Layers size={13} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
                  Analytical Transform
                </div>
                <select
                  value={config.transform}
                  onChange={(e) =>
                    onUpdateConfig({
                      transform: e.target.value as AnalyticalTransform,
                    })
                  }
                  style={selectStyle}
                >
                  <option value="NONE">None (Raw Output)</option>
                  <option value="SMA_7D">7-Period Moving Average (SMA)</option>
                  <option value="SMA_30D">30-Period Moving Average (SMA)</option>
                  <option value="YOY_PCT">Year-over-Year Growth (YoY %)</option>
                  <option value="CUMSUM">Cumulative Running Sum</option>
                  <option value="INDEX_BASE_100">Indexed to 100 (Base Period)</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 3: HISTORICAL DATE RANGE SELECTOR & PRESETS
          Dark themed inputs, calendar icons, quick range preset chips
         ============================================================ */}
      <div
        style={{
          borderTop: '1px solid var(--ol-border, #183A52)',
          paddingTop: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Date Inputs with Calendar Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--ol-radius-sm, 6px)',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              color: 'var(--ol-cyan, #00D4FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={15} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ol-text-secondary, #94A3B8)',
            }}
          >
            Date Range:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={config.timeRange.startDate}
              onChange={(e) =>
                onUpdateConfig({
                  timeRange: { ...config.timeRange, startDate: e.target.value },
                })
              }
              style={dateInputStyle}
            />
            <span style={{ color: 'var(--ol-text-muted, #94A3B8)', fontSize: '13px' }}>→</span>
            <input
              type="date"
              value={config.timeRange.endDate}
              onChange={(e) =>
                onUpdateConfig({
                  timeRange: { ...config.timeRange, endDate: e.target.value },
                })
              }
              style={dateInputStyle}
            />
          </div>
        </div>

        {/* Quick Date Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
          {datePresets.map((preset) => {
            const isMatch =
              config.timeRange.startDate === preset.start &&
              config.timeRange.endDate === preset.end;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onUpdateConfig({
                    timeRange: {
                      startDate: preset.start,
                      endDate: preset.end,
                      preset: 'CUSTOM',
                    },
                  })
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: 'var(--ol-radius-sm, 6px)',
                  fontSize: '11px',
                  fontWeight: isMatch ? 700 : 500,
                  fontFamily: 'var(--font-mono, monospace)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: isMatch
                    ? '1px solid var(--ol-cyan, #00D4FF)'
                    : '1px solid var(--ol-border, #183A52)',
                  backgroundColor: isMatch
                    ? 'var(--ol-cyan, #00D4FF)'
                    : 'var(--ol-surface-secondary, #0D2238)',
                  color: isMatch ? '#030B14' : 'var(--ol-text-secondary, #94A3B8)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isMatch) {
                    e.currentTarget.style.color = 'var(--ol-text-primary, #F1F5F9)';
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMatch) {
                    e.currentTarget.style.color = 'var(--ol-text-secondary, #94A3B8)';
                    e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)';
                  }
                }}
              >
                {isMatch && <Check size={11} />}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
