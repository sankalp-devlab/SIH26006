/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: High-Density Emissions Vessel Table
 */

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitCompare,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  EmissionsVesselRecord,
  CiiRating,
} from '../../../../types/emissions';

interface EmissionsVesselTableProps {
  vessels: EmissionsVesselRecord[];
  selectedVesselId: number | null;
  onSelectVessel: (id: number) => void;
  comparisonVesselIds: number[];
  onToggleComparison: (id: number) => void;
  onOpenCompareModal: () => void;
}

type SortField =
  | 'name'
  | 'imoNumber'
  | 'vesselClass'
  | 'fleetName'
  | 'totalCo2Mt'
  | 'totalNoxMt'
  | 'totalSoxMt'
  | 'attainedEeoi'
  | 'attainedAer'
  | 'ciiScore'
  | 'ciiRating'
  | 'totalDistanceNm'
  | 'totalFuelConsumedMt'
  | 'co2TrendPct'
  | 'status';

export function EmissionsVesselTable({
  vessels,
  selectedVesselId,
  onSelectVessel,
  comparisonVesselIds,
  onToggleComparison,
  onOpenCompareModal,
}: EmissionsVesselTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalCo2Mt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    vessel: true,
    imo: true,
    class: true,
    fleet: true,
    co2: true,
    nox: true,
    sox: true,
    eeoi: true,
    aer: true,
    cii: true,
    rating: true,
    distance: true,
    fuel: true,
    trend: true,
    status: true,
  });
  const [showColMenu, setShowColMenu] = useState(false);

  const ciiColors: Record<CiiRating, string> = {
    A: '#10b981',
    B: '#34d399',
    C: '#f59e0b',
    D: '#f97316',
    E: '#ef4444',
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sorted list
  const sortedVessels = useMemo(() => {
    return [...vessels].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vessels, sortField, sortDirection]);

  // Paginated
  const totalPages = Math.ceil(sortedVessels.length / pageSize) || 1;
  const paginatedVessels = sortedVessels.slice((page - 1) * pageSize, page * pageSize);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    }
    return sortDirection === 'asc' ? <ArrowUp size={12} style={{ color: '#38bdf8' }} /> : <ArrowDown size={12} style={{ color: '#38bdf8' }} />;
  };

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header bar with comparison action & column visibility */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            EMISSIONS INTELLIGENCE BY VESSEL
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Multi-metric carbon intensity registry &bull; Select rows to compare up to 5 vessels side-by-side
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Compare Button */}
          {comparisonVesselIds.length > 0 && (
            <button
              type="button"
              onClick={onOpenCompareModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#0066cc',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <GitCompare size={14} />
              Compare ({comparisonVesselIds.length})
            </button>
          )}

          {/* Column Visibility Menu Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowColMenu(!showColMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                color: '#94a3b8',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={14} />
              Columns
            </button>

            {showColMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  width: '180px',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '8px',
                  zIndex: 50,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>Toggle Columns</div>
                {Object.keys(visibleColumns).map((colKey) => (
                  <label key={colKey} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0', cursor: 'pointer', color: '#cbd5e1' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns[colKey]}
                      onChange={(e) => setVisibleColumns((prev) => ({ ...prev, [colKey]: e.target.checked }))}
                      style={{ accentColor: '#0066cc' }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{colKey}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.75rem',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '8px 10px', width: '32px' }}>
                <span title="Select to compare">✓</span>
              </th>
              {visibleColumns.vessel && (
                <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Vessel {renderSortIndicator('name')}
                  </div>
                </th>
              )}
              {visibleColumns.imo && (
                <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('imoNumber')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    IMO {renderSortIndicator('imoNumber')}
                  </div>
                </th>
              )}
              {visibleColumns.class && (
                <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('vesselClass')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Class {renderSortIndicator('vesselClass')}
                  </div>
                </th>
              )}
              {visibleColumns.fleet && (
                <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('fleetName')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Fleet {renderSortIndicator('fleetName')}
                  </div>
                </th>
              )}
              {visibleColumns.co2 && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('totalCo2Mt')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    CO₂ (mt) {renderSortIndicator('totalCo2Mt')}
                  </div>
                </th>
              )}
              {visibleColumns.nox && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('totalNoxMt')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    NOx (t) {renderSortIndicator('totalNoxMt')}
                  </div>
                </th>
              )}
              {visibleColumns.sox && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('totalSoxMt')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    SOx (t) {renderSortIndicator('totalSoxMt')}
                  </div>
                </th>
              )}
              {visibleColumns.eeoi && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('attainedEeoi')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    EEOI {renderSortIndicator('attainedEeoi')}
                  </div>
                </th>
              )}
              {visibleColumns.aer && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('attainedAer')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    AER {renderSortIndicator('attainedAer')}
                  </div>
                </th>
              )}
              {visibleColumns.cii && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('ciiScore')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    CII {renderSortIndicator('ciiScore')}
                  </div>
                </th>
              )}
              {visibleColumns.rating && (
                <th style={{ padding: '8px 10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('ciiRating')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Rating {renderSortIndicator('ciiRating')}
                  </div>
                </th>
              )}
              {visibleColumns.distance && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('totalDistanceNm')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    Distance {renderSortIndicator('totalDistanceNm')}
                  </div>
                </th>
              )}
              {visibleColumns.fuel && (
                <th style={{ padding: '8px 10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('totalFuelConsumedMt')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    Fuel (mt) {renderSortIndicator('totalFuelConsumedMt')}
                  </div>
                </th>
              )}
              {visibleColumns.trend && (
                <th style={{ padding: '8px 10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('co2TrendPct')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Trend {renderSortIndicator('co2TrendPct')}
                  </div>
                </th>
              )}
              {visibleColumns.status && (
                <th style={{ padding: '8px 10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('status')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Status {renderSortIndicator('status')}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedVessels.map((v) => {
              const isSelected = v.id === selectedVesselId;
              const isCompared = comparisonVesselIds.includes(v.id);
              const rColor = ciiColors[v.ciiRating] || '#94a3b8';
              const trendGood = v.co2TrendPct <= 0;

              return (
                <tr
                  key={v.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: isSelected ? 'rgba(0, 102, 204, 0.15)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                  onClick={() => onSelectVessel(v.id)}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '8px 10px' }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => onToggleComparison(v.id)}
                      style={{ accentColor: '#0066cc', cursor: 'pointer' }}
                    />
                  </td>

                  {/* Vessel Name */}
                  {visibleColumns.vessel && (
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{v.name}</span>
                        {v.scrubberFitted && (
                          <span
                            title="Scrubber Fitted"
                            style={{
                              fontSize: '0.625rem',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                            }}
                          >
                            EGCS
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* IMO */}
                  {visibleColumns.imo && (
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
                      {v.imoNumber}
                    </td>
                  )}

                  {/* Class */}
                  {visibleColumns.class && (
                    <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>
                      {v.vesselClass}
                    </td>
                  )}

                  {/* Fleet */}
                  {visibleColumns.fleet && (
                    <td style={{ padding: '8px 10px', color: '#94a3b8', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.fleetName}
                    </td>
                  )}

                  {/* CO2 */}
                  {visibleColumns.co2 && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: '#f8fafc' }}>
                      {v.totalCo2Mt.toLocaleString()}
                    </td>
                  )}

                  {/* NOx */}
                  {visibleColumns.nox && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#e2e8f0' }}>
                      {v.totalNoxMt.toFixed(1)}
                    </td>
                  )}

                  {/* SOx */}
                  {visibleColumns.sox && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#e2e8f0' }}>
                      {v.totalSoxMt.toFixed(1)}
                    </td>
                  )}

                  {/* EEOI */}
                  {visibleColumns.eeoi && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8' }}>
                      {v.attainedEeoi.toFixed(2)}
                    </td>
                  )}

                  {/* AER */}
                  {visibleColumns.aer && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#cbd5e1' }}>
                      {v.attainedAer.toFixed(2)}
                    </td>
                  )}

                  {/* CII Score */}
                  {visibleColumns.cii && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: rColor }}>
                      {v.ciiScore.toFixed(2)}
                    </td>
                  )}

                  {/* CII Rating Badge */}
                  {visibleColumns.rating && (
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: `${rColor}22`,
                          color: rColor,
                          border: `1px solid ${rColor}55`,
                        }}
                      >
                        {v.ciiRating}
                      </span>
                    </td>
                  )}

                  {/* Distance */}
                  {visibleColumns.distance && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
                      {v.totalDistanceNm.toLocaleString()} nm
                    </td>
                  )}

                  {/* Fuel */}
                  {visibleColumns.fuel && (
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
                      {v.totalFuelConsumedMt.toLocaleString()}
                    </td>
                  )}

                  {/* Trend */}
                  {visibleColumns.trend && (
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', color: trendGood ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {trendGood ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                        <span>{Math.abs(v.co2TrendPct)}%</span>
                      </div>
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.status && (
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: v.status === 'At Sea' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: v.status === 'At Sea' ? '#10b981' : '#f59e0b',
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #1e293b',
          fontSize: '0.75rem',
          color: '#94a3b8',
        }}
      >
        <span>
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedVessels.length)} of {sortedVessels.length} vessels
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #1e293b',
              background: '#0f172a',
              color: page === 1 ? '#475569' : '#f8fafc',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
            <button
              key={pNum}
              type="button"
              onClick={() => setPage(pNum)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: page === pNum ? '#0066cc' : '#0f172a',
                color: page === pNum ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {pNum}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #1e293b',
              background: '#0f172a',
              color: page === totalPages ? '#475569' : '#f8fafc',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
