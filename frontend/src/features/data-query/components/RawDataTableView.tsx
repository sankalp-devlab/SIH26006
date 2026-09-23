import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import type { RawDataQueryResult } from '../../../types/data-query';

interface RawDataTableViewProps {
  data?: RawDataQueryResult;
  isLoading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const RawDataTableView: React.FC<RawDataTableViewProps> = ({
  data,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortField,
  sortOrder,
  onSort,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenCols, setHiddenCols] = useState<string[]>([]);
  const [isColSelectorOpen, setIsColSelectorOpen] = useState(false);

  const columns = data?.columns || [];
  const records = data?.records || [];

  // Filter records by local search
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const q = searchTerm.toLowerCase();
    return records.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      )
    );
  }, [records, searchTerm]);

  const visibleColumns = useMemo(() => {
    return columns.filter((col) => !hiddenCols.includes(col));
  }, [columns, hiddenCols]);

  const toggleColumnVisibility = (col: string) => {
    setHiddenCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const getSortIcon = (col: string) => {
    if (sortField !== col) return <ArrowUpDown size={12} style={{ color: 'var(--ol-text-muted, #94A3B8)', opacity: 0.6 }} />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--ol-cyan, #00D4FF)' }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--ol-cyan, #00D4FF)' }} />
    );
  };

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
          Querying and paginating maritime records...
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)', marginTop: '4px' }}>
          Applying active dimension projections and sorting parameters
        </p>
      </div>
    );
  }

  if (!data || records.length === 0) {
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
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', margin: 0 }}>
          No Raw Data Records Match Current Parameters
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)', marginTop: '6px' }}>
          Try clearing query filter conditions or expanding the historical date window.
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
      {/* Table Command Bar: Search, Column Visibility, Page Size */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px 18px',
          borderBottom: '1px solid var(--ol-border, #183A52)',
          backgroundColor: 'rgba(9, 27, 46, 0.4)',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ol-text-muted, #94A3B8)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records in current page..."
            style={{
              width: '100%',
              height: '38px',
              paddingLeft: '34px',
              paddingRight: searchTerm ? '32px' : '12px',
              borderRadius: 'var(--ol-radius-md, 6px)',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              border: '1px solid var(--ol-border, #183A52)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--ol-text-primary, #F1F5F9)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ol-cyan, #00D4FF)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)')}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--ol-text-muted, #94A3B8)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right Tools: Column Visibility & Page Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Column Visibility Selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsColSelectorOpen((p) => !p)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '38px',
                padding: '0 14px',
                borderRadius: 'var(--ol-radius-md, 6px)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                border: '1px solid var(--ol-border, #183A52)',
                color: 'var(--ol-text-secondary, #94A3B8)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--ol-cyan, #00D4FF)';
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--ol-text-secondary, #94A3B8)';
                e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)';
              }}
            >
              <Eye size={14} style={{ color: 'var(--ol-cyan, #00D4FF)' }} />
              <span>Columns ({visibleColumns.length}/{columns.length})</span>
            </button>

            {isColSelectorOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '6px',
                  width: '240px',
                  backgroundColor: 'var(--ol-surface-primary, #091B2E)',
                  border: '1px solid var(--ol-border, #183A52)',
                  borderRadius: 'var(--ol-radius-lg, 10px)',
                  boxShadow: 'var(--ol-shadow-lg, 0 12px 28px rgba(0,0,0,0.45))',
                  padding: '10px',
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 6px 8px 6px',
                    borderBottom: '1px solid var(--ol-border, #183A52)',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ol-text-muted, #94A3B8)', letterSpacing: '0.06em' }}>
                    Toggle Columns
                  </span>
                  {hiddenCols.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setHiddenCols([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ol-cyan, #00D4FF)',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Show All
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {columns.map((col) => {
                    const isVisible = !hiddenCols.includes(col);
                    return (
                      <label
                        key={col}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: 'var(--ol-radius-sm, 4px)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: isVisible ? 'var(--ol-text-primary, #F1F5F9)' : 'var(--ol-text-muted, #94A3B8)',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLLabelElement).style.backgroundColor = 'var(--ol-surface-elevated, #102B45)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLLabelElement).style.backgroundColor = 'transparent')}
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleColumnVisibility(col)}
                          style={{ accentColor: 'var(--ol-cyan, #00D4FF)', cursor: 'pointer' }}
                        />
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {col}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rows per page dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)' }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                height: '38px',
                backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                border: '1px solid var(--ol-border, #183A52)',
                borderRadius: 'var(--ol-radius-md, 6px)',
                padding: '0 26px 0 10px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--ol-text-primary, #F1F5F9)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '850px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ol-border, #183A52)', backgroundColor: 'var(--ol-surface-secondary, #0D2238)' }}>
              {visibleColumns.map((col) => (
                <th
                  key={col}
                  onClick={() => onSort(col)}
                  style={{
                    padding: '12px 14px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: sortField === col ? 'var(--ol-cyan, #00D4FF)' : 'var(--ol-text-muted, #94A3B8)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.12s ease',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{col}</span>
                    {getSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--ol-text-muted, #94A3B8)' }}>
                  No records match filter &quot;{searchTerm}&quot; on this page.
                </td>
              </tr>
            ) : (
              filteredRecords.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: '1px solid rgba(100, 190, 240, 0.08)',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(0, 212, 255, 0.04)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
                >
                  {visibleColumns.map((col) => {
                    const val = row[col];
                    const isTce = col.toLowerCase().includes('tce');
                    const isStatus = col === 'status';

                    return (
                      <td
                        key={col}
                        title={String(val ?? '')}
                        style={{
                          padding: '11px 14px',
                          color: 'var(--ol-text-primary, #F1F5F9)',
                          whiteSpace: 'nowrap',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontVariantNumeric: typeof val === 'number' ? 'tabular-nums' : undefined,
                          maxWidth: '240px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {isStatus ? (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: 'rgba(0, 212, 255, 0.12)',
                              color: 'var(--ol-cyan, #00D4FF)',
                              border: '1px solid rgba(0, 212, 255, 0.3)',
                            }}
                          >
                            {String(val)}
                          </span>
                        ) : isTce && typeof val === 'number' ? (
                          <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #00D4FF)' }}>
                            ${Math.round(val).toLocaleString()}
                          </span>
                        ) : typeof val === 'number' ? (
                          val.toLocaleString()
                        ) : (
                          String(val ?? '—')
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 18px',
          fontSize: '12px',
          color: 'var(--ol-text-muted, #94A3B8)',
          borderTop: '1px solid var(--ol-border, #183A52)',
          backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
        }}
      >
        <div>
          Showing{' '}
          <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
            {data.totalMatchingRecords === 0 ? 0 : (page - 1) * pageSize + 1}
          </strong>{' '}
          to{' '}
          <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
            {Math.min(data.totalMatchingRecords, page * pageSize)}
          </strong>{' '}
          of{' '}
          <strong style={{ color: 'var(--ol-cyan, #00D4FF)', fontFamily: 'var(--font-mono, monospace)' }}>
            {data.totalMatchingRecords.toLocaleString()}
          </strong>{' '}
          records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--ol-radius-md, 6px)',
              border: '1px solid var(--ol-border, #183A52)',
              backgroundColor: 'var(--ol-surface-primary, #091B2E)',
              color: 'var(--ol-text-secondary, #94A3B8)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.35 : 1,
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
          >
            <ChevronLeft size={15} />
            <span>Prev</span>
          </button>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-primary, #F1F5F9)', padding: '0 8px', fontSize: '12px' }}>
            Page {page} of {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(data.totalPages, page + 1))}
            disabled={page === data.totalPages}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--ol-radius-md, 6px)',
              border: '1px solid var(--ol-border, #183A52)',
              backgroundColor: 'var(--ol-surface-primary, #091B2E)',
              color: 'var(--ol-text-secondary, #94A3B8)',
              cursor: page === data.totalPages ? 'not-allowed' : 'pointer',
              opacity: page === data.totalPages ? 0.35 : 1,
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
