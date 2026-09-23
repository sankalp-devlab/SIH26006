import React from 'react';

export interface ColumnDef<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  className?: string;
}

export interface IntelligenceTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function IntelligenceTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records available matching current filters.',
  isLoading = false,
}: IntelligenceTableProps<T>) {
  return (
    <div className="ol-table-container">
      <div className="ol-table-scroll">
        <table className="ol-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    textAlign: col.align || 'left',
                    width: col.width,
                  }}
                  className={col.className}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ol-text-muted)' }}>
                  Loading telemetry records...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--ol-text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row, rowIdx)}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, colIdx) => {
                    let cellContent: React.ReactNode = null;
                    if (typeof col.accessor === 'function') {
                      cellContent = col.accessor(row);
                    } else if (col.accessor) {
                      cellContent = (row[col.accessor] as unknown) as React.ReactNode;
                    }
                    return (
                      <td
                        key={colIdx}
                        style={{ textAlign: col.align || 'left' }}
                        className={col.align === 'right' ? 'ol-table-num' : ''}
                      >
                        {cellContent ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
