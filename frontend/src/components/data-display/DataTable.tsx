import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  SlidersHorizontal,
} from 'lucide-react';
import { Pagination } from '../ui/Pagination';
import { Skeleton } from '../ui/Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  exportFileName?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  title,
  searchable = false,
  searchPlaceholder = 'Filter records in view...',
  pageSize = 15,
  onRowClick,
  exportFileName = 'maritime-data.csv',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dense, setDense] = useState(false);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      return Object.values(row as Record<string, unknown>).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(query)
      );
    });
  }, [data, searchQuery]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return sortDir === 'asc' ? -1 : 1;
      if (strA > strB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize <= 0) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Export CSV
  const handleExport = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          const val = (row as Record<string, unknown>)[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="table-container" style={{ overflow: 'hidden' }}>
      {/* Optional Table Toolbar */}
      {(title || searchable || data.length > 0) && (
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            {title && (
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                {title}
              </span>
            )}
            {searchable && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: 8, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '4px 10px 4px 28px',
                    fontSize: '0.8125rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    outline: 'none',
                    background: 'var(--color-bg-surface-alt)',
                  }}
                />
              </div>
            )}
          </div>

          <div className="table-toolbar-right">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setDense(!dense)}
              title={dense ? 'Normal density' : 'Compact table density'}
              style={{ fontSize: '0.75rem', padding: '4px 8px', gap: 4 }}
            >
              <SlidersHorizontal size={13} />
              <span>{dense ? 'Comfort' : 'Compact'}</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleExport}
              disabled={sortedData.length === 0}
              title="Export filtered data to CSV"
              style={{ fontSize: '0.75rem', padding: '4px 8px', gap: 4 }}
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton View */}
      {isLoading ? (
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Skeleton type="title" width="30%" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Skeleton width="20%" height={16} />
                <Skeleton width="30%" height={16} />
                <Skeleton width="25%" height={16} />
                <Skeleton width="25%" height={16} />
              </div>
            ))}
          </div>
        </div>
      ) : sortedData.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-sm text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className={`data-table ${dense ? 'dense-table' : ''}`}>
            <thead>
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  const isSortable = col.sortable !== false;

                  return (
                    <th
                      key={col.key}
                      style={col.width ? { width: col.width } : undefined}
                      className={isSortable ? 'sortable-th' : ''}
                      onClick={() => isSortable && handleSort(col.key)}
                    >
                      <div className="th-content">
                        <span>{col.header}</span>
                        {isSortable && (
                          <span style={{ display: 'inline-flex', color: isSorted ? 'var(--color-brand-accent)' : '#94a3b8' }}>
                            {isSorted ? (
                              sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                            ) : (
                              <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}
