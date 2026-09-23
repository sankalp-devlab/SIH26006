import React, { useState } from 'react';
import {
  Filter,
  Plus,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  QueryFilterCondition,
  EntitySchema,
  FilterOperator,
} from '../../../types/data-query';

interface QueryFiltersPanelProps {
  filters: QueryFilterCondition[];
  schema: EntitySchema;
  onAddFilter: (filter: QueryFilterCondition) => void;
  onRemoveFilter: (id: string) => void;
  onClearFilters: () => void;
}

export const QueryFiltersPanel: React.FC<QueryFiltersPanelProps> = ({
  filters,
  schema,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedField, setSelectedField] = useState<string>(
    schema.fields.find((f) => f.isDimension && f.name !== 'date')?.name || 'vesselClass'
  );
  const [selectedOp, setSelectedOp] = useState<FilterOperator>('=');
  const [filterValue, setFilterValue] = useState<string>('');

  const filterableFields = schema.fields.filter((f) => f.name !== 'date');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterValue.trim()) return;

    onAddFilter({
      id: `filt_${Date.now()}`,
      field: selectedField,
      operator: selectedOp,
      value: filterValue.trim(),
    });
    setFilterValue('');
  };

  // Quick segment / vessel class chips
  const quickChips = [
    { field: 'vesselClass', op: '=' as FilterOperator, val: 'VLCC' },
    { field: 'vesselClass', op: '=' as FilterOperator, val: 'Capesize' },
    { field: 'vesselClass', op: '=' as FilterOperator, val: 'Suezmax' },
    { field: 'marketSegment', op: '=' as FilterOperator, val: 'Crude Tanker' },
    { field: 'marketSegment', op: '=' as FilterOperator, val: 'Dry Bulk' },
    { field: 'marketSegment', op: '=' as FilterOperator, val: 'LNG' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--ol-surface-primary, #091B2E)',
        border: '1px solid var(--ol-border, #183A52)',
        borderRadius: 'var(--ol-radius-lg, 12px)',
        padding: '16px 20px',
        boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: isExpanded ? '14px' : '0',
        transition: 'all 0.2s ease',
      }}
    >
      {/* 1. Collapsible Filter Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: isExpanded ? '12px' : '0',
          borderBottom: isExpanded ? '1px solid var(--ol-border, #183A52)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <Filter size={15} />
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
            Query Conditions & Filters
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '22px',
              height: '22px',
              padding: '0 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              backgroundColor: filters.length > 0 ? 'rgba(0, 212, 255, 0.15)' : 'var(--ol-surface-secondary, #0D2238)',
              color: filters.length > 0 ? 'var(--ol-cyan, #00D4FF)' : 'var(--ol-text-muted, #94A3B8)',
              border: `1px solid ${filters.length > 0 ? 'rgba(0, 212, 255, 0.35)' : 'var(--ol-border, #183A52)'}`,
            }}
          >
            {filters.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {filters.length > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ol-red, #F43F5E)',
                fontFamily: 'inherit',
                padding: '4px 8px',
                borderRadius: 'var(--ol-radius-sm, 4px)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <RotateCcw size={12} />
              <span>Clear All ({filters.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              border: '1px solid var(--ol-border, #183A52)',
              borderRadius: 'var(--ol-radius-md, 6px)',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ol-text-secondary, #94A3B8)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ol-cyan, #00D4FF)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ol-text-secondary, #94A3B8)';
              e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)';
            }}
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Expanded Filter Builder Controls */}
      {isExpanded && (
        <>
          {/* Filter Creator Form */}
          <form
            onSubmit={handleCreate}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Field selector */}
            <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                  border: '1px solid var(--ol-border, #183A52)',
                  borderRadius: 'var(--ol-radius-md, 6px)',
                  padding: '0 30px 0 12px',
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
                }}
              >
                {filterableFields.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label} ({f.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Operator selector */}
            <div style={{ width: '110px', flexShrink: 0 }}>
              <select
                value={selectedOp}
                onChange={(e) => setSelectedOp(e.target.value as FilterOperator)}
                style={{
                  width: '100%',
                  height: '38px',
                  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                  border: '1px solid var(--ol-border, #183A52)',
                  borderRadius: 'var(--ol-radius-md, 6px)',
                  padding: '0 26px 0 10px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  color: 'var(--ol-cyan, #00D4FF)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  cursor: 'pointer',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                <option value="=">= (equals)</option>
                <option value="!=">!= (not equal)</option>
                <option value=">">&gt; (greater than)</option>
                <option value="<">&lt; (less than)</option>
                <option value=">=">&gt;= (greater or equal)</option>
                <option value="<=">&lt;= (less or equal)</option>
                <option value="CONTAINS">CONTAINS</option>
                <option value="IN">IN (comma-sep)</option>
              </select>
            </div>

            {/* Value Input */}
            <div style={{ flex: '2 1 200px', minWidth: '180px' }}>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Enter value (e.g. VLCC, Suezmax, China)..."
                style={{
                  width: '100%',
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
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ol-cyan, #00D4FF)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)')}
              />
            </div>

            {/* Add Button */}
            <button
              type="submit"
              className="ol-btn ol-btn-primary"
              style={{ height: '38px', padding: '0 16px', flexShrink: 0 }}
            >
              <Plus size={15} />
              <span>Add Filter</span>
            </button>
          </form>

          {/* Quick Filters / Preset Chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              paddingTop: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--ol-text-muted, #94A3B8)' }}>
              <SlidersHorizontal size={12} style={{ color: 'var(--ol-blue, #3B82F6)' }} />
              <span>Quick Presets:</span>
            </div>
            {quickChips.map((chip) => {
              const isApplied = filters.some(
                (f) => f.field === chip.field && String(f.value).toLowerCase() === chip.val.toLowerCase()
              );
              return (
                <button
                  key={`${chip.field}_${chip.val}`}
                  type="button"
                  onClick={() => {
                    if (!isApplied) {
                      onAddFilter({
                        id: `quick_${Date.now()}_${chip.val}`,
                        field: chip.field,
                        operator: chip.op,
                        value: chip.val,
                      });
                    }
                  }}
                  disabled={isApplied}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--ol-radius-sm, 6px)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600,
                    cursor: isApplied ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    border: isApplied
                      ? '1px solid rgba(0, 212, 255, 0.35)'
                      : '1px solid var(--ol-border, #183A52)',
                    backgroundColor: isApplied
                      ? 'rgba(0, 212, 255, 0.12)'
                      : 'var(--ol-surface-secondary, #0D2238)',
                    color: isApplied
                      ? 'var(--ol-cyan, #00D4FF)'
                      : 'var(--ol-text-secondary, #94A3B8)',
                    opacity: isApplied ? 0.75 : 1,
                  }}
                >
                  {isApplied ? <Check size={11} /> : <Plus size={11} />}
                  <span>{chip.val}</span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Rows / Empty State */}
          {filters.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: 'var(--ol-radius-md, 8px)',
                backgroundColor: 'rgba(9, 27, 46, 0.6)',
                border: '1px dashed var(--ol-border, #183A52)',
                color: 'var(--ol-text-muted, #94A3B8)',
                fontSize: '12px',
              }}
            >
              <Info size={14} style={{ color: 'var(--ol-blue, #3B82F6)', flexShrink: 0 }} />
              <span>
                No active filter conditions applied. All historical records for this dataset are returned. Use the builder above or click a quick preset to constrain records.
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--ol-border, #183A52)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ol-text-muted, #94A3B8)' }}>
                Active Conditions:
              </span>
              {filters.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--ol-radius-md, 6px)',
                    backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>{f.field}</span>
                  <span style={{ color: 'var(--ol-cyan, #00D4FF)', fontWeight: 700 }}>{f.operator}</span>
                  <span style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontWeight: 600 }}>
                    {Array.isArray(f.value) ? f.value.join(', ') : String(f.value)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFilter(f.id)}
                    title="Remove filter"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--ol-text-muted, #94A3B8)',
                      padding: '2px',
                      marginLeft: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ol-red, #F43F5E)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ol-text-muted, #94A3B8)')}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
