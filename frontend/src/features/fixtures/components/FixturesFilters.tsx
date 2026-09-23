/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixtures & Chartering Desk Filters & Command Bar
 */

import React from 'react';
import { Search, X, ChevronDown, RotateCcw } from 'lucide-react';
import type { FixtureFiltersState } from '../../../types/fixture';

interface FixturesFiltersProps {
  filters: FixtureFiltersState;
  onFilterChange: (filters: Partial<FixtureFiltersState>) => void;
  onResetFilters: () => void;
  chartererOptions: string[];
  cargoCategories: string[];
  vesselOptions: Array<{ id: number; name: string }>;
  totalCount: number;
  filteredCount: number;
}

export const FixturesFilters: React.FC<FixturesFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  chartererOptions,
  cargoCategories,
  vesselOptions,
  totalCount,
  filteredCount,
}) => {
  const activeFilterList: Array<{ label: string; onRemove: () => void }> = [];

  if (filters.status && filters.status !== 'all') {
    activeFilterList.push({
      label: `Status: ${filters.status.replace('_', ' ')}`,
      onRemove: () => onFilterChange({ status: 'all' }),
    });
  }

  if (filters.charterer && filters.charterer !== 'all') {
    activeFilterList.push({
      label: `Charterer: ${filters.charterer}`,
      onRemove: () => onFilterChange({ charterer: 'all' }),
    });
  }

  if (filters.vesselId && filters.vesselId !== 'all') {
    const vessel = vesselOptions.find((v) => String(v.id) === filters.vesselId);
    activeFilterList.push({
      label: `Vessel: ${vessel ? vessel.name : filters.vesselId}`,
      onRemove: () => onFilterChange({ vesselId: 'all' }),
    });
  }

  if (filters.laycanRange && filters.laycanRange !== 'all') {
    activeFilterList.push({
      label: `Laycan: ${filters.laycanRange.replace(/_/g, ' ')}`,
      onRemove: () => onFilterChange({ laycanRange: 'all' }),
    });
  }

  if (filters.rateType && filters.rateType !== 'all') {
    activeFilterList.push({
      label: `Rate: ${filters.rateType.replace('_', ' ')}`,
      onRemove: () => onFilterChange({ rateType: 'all' }),
    });
  }

  if (filters.currency && filters.currency !== 'all') {
    activeFilterList.push({
      label: `Currency: ${filters.currency}`,
      onRemove: () => onFilterChange({ currency: 'all' }),
    });
  }

  if (filters.cargoCategory && filters.cargoCategory !== 'all') {
    activeFilterList.push({
      label: `Cargo: ${filters.cargoCategory}`,
      onRemove: () => onFilterChange({ cargoCategory: 'all' }),
    });
  }

  return (
    <div className="cfw-command-bar">
      {/* Row 1: Visually Dominant Search Bar */}
      <div className="cfw-search-wrap">
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#00d8ff',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          className="cfw-search-input"
          placeholder="Search reference (FX-...), charterer, vessel, commodity..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ searchQuery: '' })}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Row 2: Structured Filter Grid */}
      <div className="cfw-filter-grid">
        {/* 1. Status */}
        <div className="cfw-select-wrap">
          <select
            className="cfw-select"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <option value="all">Status: All</option>
            <option value="draft">Draft</option>
            <option value="on_subjects">On Subjects</option>
            <option value="fully_fixed">Fully Fixed</option>
            <option value="failed">Failed / Broken</option>
          </select>
          <div className="cfw-select-arrow">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 2. Charterer */}
        <div className="cfw-select-wrap">
          <select
            className="cfw-select"
            value={filters.charterer}
            onChange={(e) => onFilterChange({ charterer: e.target.value })}
          >
            <option value="all">Charterer: All</option>
            {chartererOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="cfw-select-arrow">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 3. Vessel */}
        <div className="cfw-select-wrap">
          <select
            className="cfw-select"
            value={filters.vesselId}
            onChange={(e) => onFilterChange({ vesselId: e.target.value })}
          >
            <option value="all">Vessel: All</option>
            {vesselOptions.map((v) => (
              <option key={v.id} value={String(v.id)}>
                {v.name}
              </option>
            ))}
          </select>
          <div className="cfw-select-arrow">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 4. Laycan */}
        <div className="cfw-select-wrap">
          <select
            className="cfw-select"
            value={filters.laycanRange}
            onChange={(e) => onFilterChange({ laycanRange: e.target.value as FixtureFiltersState['laycanRange'] })}
          >
            <option value="all">Laycan: Any</option>
            <option value="next_7_days">Next 7 Days</option>
            <option value="next_14_days">Next 14 Days</option>
            <option value="next_30_days">Next 30 Days</option>
          </select>
          <div className="cfw-select-arrow">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 5. Rate Type */}
        <div className="cfw-select-wrap">
          <select
            className="cfw-select"
            value={filters.rateType}
            onChange={(e) => onFilterChange({ rateType: e.target.value })}
          >
            <option value="all">Rate: All</option>
            <option value="per_day">Time Charter ($/Day)</option>
            <option value="per_mt">Voyage Freight ($/MT)</option>
            <option value="lumpsum">Lumpsum</option>
            <option value="worldscale">Worldscale (WS)</option>
          </select>
          <div className="cfw-select-arrow">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 6. Currency */}
        <div className="cfw-select-wrap">
          <select
            className="cfw-select"
            value={filters.currency}
            onChange={(e) => onFilterChange({ currency: e.target.value })}
          >
            <option value="all">Currency: All</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="SGD">SGD (S$)</option>
          </select>
          <div className="cfw-select-arrow">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 7. Cargo Type */}
        <div className="cfw-select-wrap">
          <select
            className="cfw-select"
            value={filters.cargoCategory}
            onChange={(e) => onFilterChange({ cargoCategory: e.target.value })}
          >
            <option value="all">Cargo: All</option>
            {cargoCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="cfw-select-arrow">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Row 3: Filter Chips & Status Indicator */}
      <div className="cfw-filter-footer">
        <div className="cfw-filter-chips">
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            FILTERS:
          </span>

          {activeFilterList.length === 0 && !filters.searchQuery ? (
            <span style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
              All fixtures active
            </span>
          ) : (
            <>
              {filters.searchQuery && (
                <span className="cfw-chip">
                  <span>Search: &quot;{filters.searchQuery}&quot;</span>
                  <span
                    className="cfw-chip-remove"
                    onClick={() => onFilterChange({ searchQuery: '' })}
                    title="Clear search query"
                  >
                    <X size={12} />
                  </span>
                </span>
              )}

              {activeFilterList.map((item, idx) => (
                <span key={idx} className="cfw-chip">
                  <span>{item.label}</span>
                  <span
                    className="cfw-chip-remove"
                    onClick={item.onRemove}
                    title={`Clear ${item.label}`}
                  >
                    <X size={12} />
                  </span>
                </span>
              ))}

              <button
                type="button"
                onClick={onResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.15s ease',
                }}
                title="Reset all filter parameters"
              >
                <RotateCcw size={11} /> Clear all
              </button>
            </>
          )}
        </div>

        {/* Results indicator & active filter count */}
        <div className="cfw-filter-stats">
          <span>
            <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> fixtures
          </span>
          <span style={{ color: activeFilterList.length > 0 ? '#00d8ff' : '#64748b' }}>
            ● Active filters: {activeFilterList.length + (filters.searchQuery ? 1 : 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
