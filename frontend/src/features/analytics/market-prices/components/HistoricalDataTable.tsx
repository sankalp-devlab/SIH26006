import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  HistoricalPricePoint,
  MaritimeRouteSpec,
} from '../../../../types/market-prices';
import {
  formatFreightRate,
  formatPercent,
  formatSpreadUsd,
} from '../../../../services/market-prices/market-prices-analytics-engine';

interface HistoricalDataTableProps {
  data: HistoricalPricePoint[];
  route: MaritimeRouteSpec | null;
  onExportCsv: () => void;
  onExportJson: () => void;
}

type SortField = 'date' | 'spot' | 'ffa' | 'spread' | 'spreadPct' | 'volume';
type SortOrder = 'asc' | 'desc';

export const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({
  data,
  route,
  onExportCsv,
  onExportJson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Statistics
  const stats = useMemo(() => {
    if (!data.length) return null;
    let maxSpot = -Infinity;
    let minSpot = Infinity;
    let sumSpread = 0;
    data.forEach((p) => {
      if (p.spotRateUsdPerDay > maxSpot) maxSpot = p.spotRateUsdPerDay;
      if (p.spotRateUsdPerDay < minSpot) minSpot = p.spotRateUsdPerDay;
      sumSpread += p.spreadUsdPerDay;
    });
    return {
      count: data.length,
      maxSpot,
      minSpot,
      avgSpread: sumSpread / data.length,
    };
  }, [data]);

  // Filtered and Sorted rows
  const processedData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((row) => row.date.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => {
      let diff = 0;
      switch (sortField) {
        case 'date':
          diff = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'spot':
          diff = a.spotRateUsdPerDay - b.spotRateUsdPerDay;
          break;
        case 'ffa':
          diff = a.ffaFrontMonthUsdPerDay - b.ffaFrontMonthUsdPerDay;
          break;
        case 'spread':
          diff = a.spreadUsdPerDay - b.spreadUsdPerDay;
          break;
        case 'spreadPct':
          diff = a.spreadPct - b.spreadPct;
          break;
        case 'volume':
          diff = (a.volumeLots ?? 0) - (b.volumeLots ?? 0);
          break;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  return (
    <div className="mp-card">
      {/* Top Ledger Stats Bar */}
      {stats && (
        <div className="mp-volatility-grid" style={{ marginBottom: '6px' }}>
          <div className="mp-vol-box">
            <div className="mp-vol-label">Total Observations</div>
            <div className="mp-vol-value">{stats.count} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ol-text-secondary, #94A3B8)' }}>Days</span></div>
            <div className="mp-vol-subtext">Baltic Daily Assessments</div>
          </div>
          <div className="mp-vol-box">
            <div className="mp-vol-label">Period High Spot</div>
            <div className="mp-vol-value" style={{ color: 'var(--ol-green, #10B981)' }}>
              {formatFreightRate(stats.maxSpot)}
            </div>
            <div className="mp-vol-subtext">Peak Physical Rate</div>
          </div>
          <div className="mp-vol-box">
            <div className="mp-vol-label">Period Low Spot</div>
            <div className="mp-vol-value" style={{ color: 'var(--ol-red, #F43F5E)' }}>
              {formatFreightRate(stats.minSpot)}
            </div>
            <div className="mp-vol-subtext">Trough Physical Rate</div>
          </div>
          <div className="mp-vol-box">
            <div className="mp-vol-label">Average Spread</div>
            <div className="mp-vol-value" style={{ color: stats.avgSpread >= 0 ? 'var(--ol-cyan, #22D3EE)' : 'var(--ol-amber, #F59E0B)' }}>
              {formatSpreadUsd(stats.avgSpread)}
            </div>
            <div className="mp-vol-subtext">Spot vs Forward Mean</div>
          </div>
        </div>
      )}

      {/* Table Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '10px 14px', background: 'var(--ol-surface-secondary, #0B1D2E)', borderRadius: '8px', border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.14))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', maxWidth: '340px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ol-text-secondary, #94A3B8)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by date (YYYY-MM-DD)..."
              style={{
                width: '100%',
                paddingLeft: '30px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '6px',
                background: 'var(--ol-surface-primary, #091A2A)',
                border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.16))',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                outline: 'none',
              }}
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--ol-text-secondary, #94A3B8)', fontSize: '11.5px', cursor: 'pointer', padding: '2px 6px' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Export & Page Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ background: 'var(--ol-surface-primary, #091A2A)', border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.16))', color: '#fff', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', outline: 'none', cursor: 'pointer' }}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onExportCsv}
            className="mp-btn mp-btn-secondary"
            style={{ padding: '5px 12px', fontSize: '11.5px' }}
            title="Download CSV historical dataset"
          >
            <Download size={13} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="mp-btn mp-btn-secondary"
            style={{ padding: '5px 12px', fontSize: '11.5px' }}
            title="Export JSON historical array"
          >
            <Download size={13} style={{ color: 'var(--ol-indigo, #6366F1)' }} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="mp-table-container" style={{ marginTop: '0' }}>
        <table className="mp-table" style={{ minWidth: '950px' }}>
          <thead>
            <tr>
              <th
                onClick={() => toggleSort('date')}
                className="sortable"
                style={{ width: '150px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} style={{ color: 'var(--ol-text-muted, #64748B)' }} />
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th
                onClick={() => toggleSort('spot')}
                className="sortable"
                style={{ width: '150px', textAlign: 'right' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Spot TCE ($/day)</span>
                  {getSortIcon('spot')}
                </div>
              </th>
              <th
                onClick={() => toggleSort('ffa')}
                className="sortable"
                style={{ width: '150px', textAlign: 'right' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Front-Month FFA</span>
                  {getSortIcon('ffa')}
                </div>
              </th>
              <th
                onClick={() => toggleSort('spread')}
                className="sortable"
                style={{ width: '160px', textAlign: 'right' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Spot - FFA Spread</span>
                  {getSortIcon('spread')}
                </div>
              </th>
              <th
                onClick={() => toggleSort('spreadPct')}
                className="sortable"
                style={{ width: '120px', textAlign: 'right' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Spread %</span>
                  {getSortIcon('spreadPct')}
                </div>
              </th>
              <th style={{ width: '130px', textAlign: 'center' }}>Structure</th>
              <th
                onClick={() => toggleSort('volume')}
                className="sortable"
                style={{ width: '130px', textAlign: 'right' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Volume (Lots)</span>
                  {getSortIcon('volume')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--ol-text-muted, #64748B)' }}>
                  No historical records matched &quot;{searchTerm}&quot; for route {route?.routeCode}.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const isContango = row.spreadUsdPerDay < 0; // FFA > Spot
                const isBackwardation = row.spreadUsdPerDay > 0; // Spot > FFA

                return (
                  <tr key={row.date}>
                    <td style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                      {row.date}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#fff' }}>
                      {formatFreightRate(row.spotRateUsdPerDay)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                      {formatFreightRate(row.ffaFrontMonthUsdPerDay)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 600,
                        color: row.spreadUsdPerDay >= 0 ? 'var(--ol-cyan, #22D3EE)' : 'var(--ol-red, #F43F5E)',
                      }}
                    >
                      {formatSpreadUsd(row.spreadUsdPerDay)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: row.spreadPct >= 0 ? 'var(--ol-cyan, #22D3EE)' : 'var(--ol-red, #F43F5E)',
                      }}
                    >
                      {row.spreadPct >= 0 ? '+' : ''}
                      {formatPercent(row.spreadPct)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`mp-curve-badge ${
                          isContango
                            ? 'contango'
                            : isBackwardation
                            ? 'backwardation'
                            : 'flat'
                        }`}
                      >
                        {isContango ? 'Contango' : isBackwardation ? 'Backward.' : 'Flat'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #64748B)' }}>
                      {row.volumeLots ? row.volumeLots.toLocaleString() : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: 'var(--ol-text-secondary, #94A3B8)', paddingTop: '4px' }}>
        <div>
          Showing{' '}
          <span style={{ color: '#fff', fontFamily: 'var(--font-mono, monospace)' }}>
            {processedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span style={{ color: '#fff', fontFamily: 'var(--font-mono, monospace)' }}>
            {Math.min(processedData.length, currentPage * pageSize)}
          </span>{' '}
          of <span style={{ color: '#fff', fontFamily: 'var(--font-mono, monospace)' }}>{processedData.length}</span> records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="mp-btn mp-btn-secondary"
            style={{ padding: '5px 10px', opacity: currentPage === 1 ? 0.35 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-primary, #F1F5F9)', padding: '0 6px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="mp-btn mp-btn-secondary"
            style={{ padding: '5px 10px', opacity: currentPage === totalPages ? 0.35 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
