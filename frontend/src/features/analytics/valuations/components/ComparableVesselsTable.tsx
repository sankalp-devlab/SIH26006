/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: High-Density Comparable Peer Vessels Table
 */

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  GitCompare,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  ComparableVesselSummary,
  ValuationCurrency,
  MarketPosition,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface ComparableVesselsTableProps {
  peers: ComparableVesselSummary[];
  selectedVesselId: number;
  onSelectVessel: (id: number) => void;
  comparisonVesselIds: number[];
  onToggleComparisonVessel: (id: number) => void;
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
}

type SortField =
  | 'name'
  | 'vesselClass'
  | 'dwt'
  | 'ageYears'
  | 'currentMarketValueUsdM'
  | 'valuationPerDwtUsd'
  | 'demolitionScrapValueUsdM'
  | 'change1yPct';

export function ComparableVesselsTable({
  peers,
  selectedVesselId,
  onSelectVessel,
  comparisonVesselIds,
  onToggleComparisonVessel,
  currency,
  rates,
}: ComparableVesselsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('currentMarketValueUsdM');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filtered = useMemo(() => {
    return peers.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.imoNumber.toLowerCase().includes(q) ||
        p.vesselClass.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q)
      );
    });
  }, [peers, searchTerm]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const numA = Number(aVal) || 0;
      const numB = Number(bVal) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [filtered, sortField, sortDirection]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPositionStyle = (pos: MarketPosition) => {
    if (pos === 'Above Market') return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    if (pos === 'Below Market') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
    return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
  };

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* Header & Table Search */}
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
            COMPARABLE PEER ASSETS REGISTRY
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Click any row to switch dashboard valuation focus &bull; Check boxes to add to 5-vessel comparison
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0a111c',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '5px 10px',
            width: '260px',
          }}
        >
          <Search size={14} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search peer vessels..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.75rem',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
              <th style={{ padding: '8px 10px', width: '36px' }}>
                <span title="Select to compare">
                  <GitCompare size={13} />
                </span>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Vessel</span>
                  {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('vesselClass')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Class</span>
                  {sortField === 'vesselClass' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('dwt')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>DWT</span>
                  {sortField === 'dwt' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('ageYears')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Age</span>
                  {sortField === 'ageYears' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('currentMarketValueUsdM')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Market Valuation</span>
                  {sortField === 'currentMarketValueUsdM' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('valuationPerDwtUsd')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Val / DWT</span>
                  {sortField === 'valuationPerDwtUsd' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('demolitionScrapValueUsdM')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Scrap Floor</span>
                  {sortField === 'demolitionScrapValueUsdM' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px', cursor: 'pointer' }} onClick={() => handleSort('change1yPct')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>12M YoY</span>
                  {sortField === 'change1yPct' ? (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
                </div>
              </th>
              <th style={{ padding: '8px 10px' }}>Market Position</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => {
              const isSelected = p.id === selectedVesselId;
              const isCompared = comparisonVesselIds.includes(p.id);
              const posStyle = getPositionStyle(p.marketPosition);
              const isUp = p.change1yPct >= 0;

              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: isSelected ? 'rgba(0, 102, 204, 0.12)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Compare Checkbox */}
                  <td
                    style={{ padding: '8px 10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComparisonVessel(p.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => {}}
                      style={{ accentColor: '#0066cc', cursor: 'pointer' }}
                    />
                  </td>

                  {/* Vessel Name & IMO */}
                  <td style={{ padding: '8px 10px' }} onClick={() => onSelectVessel(p.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {p.name}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: '0.625rem', padding: '1px 4px', borderRadius: '3px', background: '#0066cc', color: '#ffffff', fontWeight: 700 }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>{p.imoNumber}</span>
                  </td>

                  {/* Class */}
                  <td style={{ padding: '8px 10px', color: '#cbd5e1' }} onClick={() => onSelectVessel(p.id)}>
                    {p.vesselClass}
                  </td>

                  {/* DWT */}
                  <td style={{ padding: '8px 10px', color: '#cbd5e1', fontFamily: 'var(--font-mono, monospace)' }} onClick={() => onSelectVessel(p.id)}>
                    {p.dwt.toLocaleString()}
                  </td>

                  {/* Age */}
                  <td style={{ padding: '8px 10px', color: '#cbd5e1' }} onClick={() => onSelectVessel(p.id)}>
                    {p.ageYears.toFixed(1)} yrs <span style={{ color: '#64748b', fontSize: '0.6875rem' }}>({p.yearBuilt})</span>
                  </td>

                  {/* Market Valuation */}
                  <td style={{ padding: '8px 10px' }} onClick={() => onSelectVessel(p.id)}>
                    <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
                      {formatValuation(p.currentMarketValueUsdM, currency, rates)}
                    </strong>
                  </td>

                  {/* Val / DWT */}
                  <td style={{ padding: '8px 10px', color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }} onClick={() => onSelectVessel(p.id)}>
                    ${p.valuationPerDwtUsd.toFixed(1)}
                  </td>

                  {/* Scrap Floor */}
                  <td style={{ padding: '8px 10px', color: '#f59e0b', fontFamily: 'var(--font-mono, monospace)' }} onClick={() => onSelectVessel(p.id)}>
                    {formatValuation(p.demolitionScrapValueUsdM, currency, rates)}
                  </td>

                  {/* 12M Change */}
                  <td style={{ padding: '8px 10px' }} onClick={() => onSelectVessel(p.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isUp ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{isUp ? '+' : ''}{p.change1yPct}%</span>
                    </div>
                  </td>

                  {/* Market Position Badge */}
                  <td style={{ padding: '8px 10px' }} onClick={() => onSelectVessel(p.id)}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        background: posStyle.bg,
                        color: posStyle.text,
                        border: `1px solid ${posStyle.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.marketPosition}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #1e293b',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <span>
          Showing {Math.min(sorted.length, (currentPage - 1) * pageSize + 1)} to {Math.min(sorted.length, currentPage * pageSize)} of {sorted.length} comparable vessels
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #1e293b',
              background: '#0a111c',
              color: currentPage === 1 ? '#475569' : '#cbd5e1',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #1e293b',
              background: '#0a111c',
              color: currentPage === totalPages ? '#475569' : '#cbd5e1',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
