import React, { useMemo } from 'react';
import {
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';
import type { PivotQueryResult } from '../../../types/data-query';

interface PivotTableViewProps {
  data?: PivotQueryResult;
  isLoading?: boolean;
}

export const PivotTableView: React.FC<PivotTableViewProps> = ({
  data,
  isLoading,
}) => {
  const rowKeys = data?.rowKeys || [];
  const colKeys = data?.colKeys || [];

  // Compute min and max values in matrix for subtle heatmap shading
  const { maxVal } = useMemo(() => {
    if (!data) return { minVal: 0, maxVal: 1 };
    const vals: number[] = [];
    rowKeys.forEach((r) => {
      colKeys.forEach((c) => {
        const cell = data.matrix[r]?.[c];
        if (cell && cell.value !== null) vals.push(cell.value);
      });
    });
    return {
      minVal: vals.length > 0 ? Math.min(...vals) : 0,
      maxVal: vals.length > 0 ? Math.max(...vals) : 1,
    };
  }, [data, rowKeys, colKeys]);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--ol-surface-primary, #091B2E)',
          border: '1px solid var(--ol-border, #183A52)',
          borderRadius: 'var(--ol-radius-lg, 12px)',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        }}
      >
        <Activity size={36} style={{ color: 'var(--ol-cyan, #00D4FF)', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)', margin: 0 }}>
          Computing multi-dimensional pivot matrix...
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)', marginTop: '4px' }}>
          Aggregating cross-tabulated intersections and calculating margins
        </p>
      </div>
    );
  }

  if (!data || rowKeys.length === 0 || colKeys.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--ol-surface-primary, #091B2E)',
          border: '1px solid var(--ol-border, #183A52)',
          borderRadius: 'var(--ol-radius-lg, 12px)',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        }}
      >
        <AlertCircle size={36} style={{ color: 'var(--ol-amber, #F59E0B)', margin: '0 auto 14px' }} />
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', margin: '0 0 6px 0' }}>
          No Pivot Data Available For Selected Dimensions
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)', margin: 0 }}>
          Adjust row or column dimensions in the query configuration panel above.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--ol-surface-primary, #091B2E)',
        border: '1px solid var(--ol-border, #183A52)',
        borderRadius: 'var(--ol-radius-lg, 12px)',
        boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Pivot Header Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--ol-border, #183A52)',
          backgroundColor: 'rgba(9, 27, 46, 0.4)',
        }}
      >
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
            <Layers size={15} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-text-secondary, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pivot Cross-Tabulation:{' '}
            <strong style={{ color: 'var(--ol-cyan, #00D4FF)' }}>{data.rowDimension}</strong>
            {' '}(Rows) ×{' '}
            <strong style={{ color: 'var(--ol-blue, #3B82F6)' }}>{data.colDimension}</strong>
            {' '}(Columns)
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #94A3B8)' }}>
          {rowKeys.length} Rows × {colKeys.length} Columns • Total: <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{data.grandTotal.formatted}</strong>
        </span>
      </div>

      {/* Pivot Matrix Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', minWidth: '650px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ol-border, #183A52)', backgroundColor: 'var(--ol-surface-secondary, #0D2238)' }}>
              <th
                style={{
                  padding: '12px 14px',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                  zIndex: 10,
                  borderRight: '1px solid var(--ol-border, #183A52)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ol-text-muted, #94A3B8)',
                  textAlign: 'left',
                }}
              >
                {data.rowDimension}
              </th>
              {colKeys.map((cKey) => (
                <th
                  key={cKey}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    minWidth: '100px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--ol-text-muted, #94A3B8)',
                  }}
                >
                  {cKey}
                </th>
              ))}
              <th
                style={{
                  padding: '12px 14px',
                  textAlign: 'right',
                  backgroundColor: 'rgba(0, 212, 255, 0.08)',
                  borderLeft: '1px solid var(--ol-border, #183A52)',
                  color: 'var(--ol-cyan, #00D4FF)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rowKeys.map((rKey) => (
              <tr
                key={rKey}
                style={{ borderBottom: '1px solid rgba(100, 190, 240, 0.08)', transition: 'background-color 0.1s ease' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(0, 212, 255, 0.03)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
              >
                {/* Row Header */}
                <td
                  style={{
                    padding: '11px 14px',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'var(--ol-surface-primary, #091B2E)',
                    fontWeight: 700,
                    color: 'var(--ol-text-primary, #F1F5F9)',
                    borderRight: '1px solid var(--ol-border, #183A52)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rKey}
                </td>

                {/* Matrix Cells */}
                {colKeys.map((cKey) => {
                  const cell = data.matrix[rKey]?.[cKey];
                  const hasVal = cell && cell.value !== null;
                  const intensity = hasVal && maxVal > 0 ? (cell.value! / maxVal) * 0.35 : 0;

                  return (
                    <td
                      key={cKey}
                      style={{
                        padding: '11px 14px',
                        textAlign: 'right',
                        color: 'var(--ol-text-primary, #F1F5F9)',
                        fontVariantNumeric: 'tabular-nums',
                        backgroundColor: hasVal && intensity > 0.04 ? `rgba(0, 212, 255, ${intensity})` : undefined,
                        transition: 'background-color 0.15s ease',
                      }}
                      title={hasVal ? `${cell.count} fixtures / observations` : 'No data'}
                    >
                      {cell ? cell.formatted : '—'}
                    </td>
                  );
                })}

                {/* Row Total */}
                <td
                  style={{
                    padding: '11px 14px',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: 'var(--ol-cyan, #00D4FF)',
                    backgroundColor: 'rgba(0, 212, 255, 0.06)',
                    borderLeft: '1px solid var(--ol-border, #183A52)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {data.rowTotals[rKey]?.formatted ?? '—'}
                </td>
              </tr>
            ))}

            {/* Column Totals Row */}
            <tr style={{ borderTop: '2px solid var(--ol-border, #183A52)', backgroundColor: 'var(--ol-surface-secondary, #0D2238)' }}>
              <td
                style={{
                  padding: '12px 14px',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                  fontWeight: 700,
                  color: 'var(--ol-cyan, #00D4FF)',
                  borderRight: '1px solid var(--ol-border, #183A52)',
                }}
              >
                Grand Total
              </td>
              {colKeys.map((cKey) => (
                <td key={cKey} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--ol-cyan, #00D4FF)', fontVariantNumeric: 'tabular-nums' }}>
                  {data.colTotals[cKey]?.formatted ?? '—'}
                </td>
              ))}
              <td
                style={{
                  padding: '12px 14px',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: 'var(--ol-cyan, #00D4FF)',
                  backgroundColor: 'rgba(0, 212, 255, 0.12)',
                  borderLeft: '1px solid var(--ol-border, #183A52)',
                  fontSize: '13px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {data.grandTotal.formatted}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
