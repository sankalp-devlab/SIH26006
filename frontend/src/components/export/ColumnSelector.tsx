/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Column Selector Component
 */

import React from 'react';
import { CheckSquare, Square, ArrowUp, ArrowDown } from 'lucide-react';
import type { ExportColumnDefinition } from '../../types/export-sharing';

interface ColumnSelectorProps<T = any> {
  columns: ExportColumnDefinition<T>[];
  selectedKeys: string[];
  onChangeSelectedKeys: (keys: string[]) => void;
  onReorderColumns?: (newColumns: ExportColumnDefinition<T>[]) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedKeys,
  onChangeSelectedKeys,
  onReorderColumns,
}) => {
  const isSelected = (key: string) => selectedKeys.includes(key);

  const toggleColumn = (key: string) => {
    if (isSelected(key)) {
      if (selectedKeys.length === 1) return; // Prevent 0 selected columns
      onChangeSelectedKeys(selectedKeys.filter((k) => k !== key));
    } else {
      onChangeSelectedKeys([...selectedKeys, key]);
    }
  };

  const selectAll = () => {
    onChangeSelectedKeys(columns.map((c) => c.key));
  };

  const selectDefaults = () => {
    const defaultKeys = columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);
    onChangeSelectedKeys(defaultKeys.length > 0 ? defaultKeys : columns.map((c) => c.key));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    if (!onReorderColumns) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= columns.length) return;

    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIdx];
    newCols[targetIdx] = temp;
    onReorderColumns(newCols);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Selected Columns ({selectedKeys.length} of {columns.length})
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={selectAll}
            style={{ padding: '2px 8px', fontSize: '0.72rem' }}
          >
            Select All
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={selectDefaults}
            style={{ padding: '2px 8px', fontSize: '0.72rem' }}
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Columns Grid / List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 6,
          maxHeight: 220,
          overflowY: 'auto',
          padding: '6px 4px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {columns.map((col, idx) => {
          const checked = isSelected(col.key);
          return (
            <div
              key={col.key}
              onClick={() => toggleColumn(col.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 6,
                background: checked ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                border: checked ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                {checked ? (
                  <CheckSquare size={14} color="#38bdf8" />
                ) : (
                  <Square size={14} color="#64748b" />
                )}
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: checked ? '#f8fafc' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {col.header}
                </span>
              </div>

              {onReorderColumns && (
                <div
                  style={{ display: 'flex', gap: 2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveColumn(idx, 'up')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: idx === 0 ? '#334155' : '#94a3b8',
                      cursor: idx === 0 ? 'default' : 'pointer',
                      padding: 2,
                    }}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === columns.length - 1}
                    onClick={() => moveColumn(idx, 'down')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: idx === columns.length - 1 ? '#334155' : '#94a3b8',
                      cursor: idx === columns.length - 1 ? 'default' : 'pointer',
                      padding: 2,
                    }}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
