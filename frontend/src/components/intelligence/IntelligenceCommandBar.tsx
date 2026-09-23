import React from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';

export interface FilterDropdownOption {
  value: string;
  label: string;
}

export interface FilterDropdownConfig {
  id: string;
  label: string;
  value: string;
  options: FilterDropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface IntelligenceCommandBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDropdownConfig[];
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  timeRangeOptions?: string[];
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  resultsCount?: number;
  resultsLabel?: string;
  children?: React.ReactNode;
}

export const IntelligenceCommandBar: React.FC<IntelligenceCommandBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records, corridors, identifiers...',
  filters = [],
  timeRange,
  onTimeRangeChange,
  timeRangeOptions = ['7D', '30D', '90D', '6M', '1Y'],
  hasActiveFilters = false,
  onResetFilters,
  resultsCount,
  resultsLabel = 'records',
  children,
}) => {
  return (
    <div className="ol-command-bar">
      <div className="ol-command-left">
        {/* Search Input */}
        {onSearchChange && (
          <div className="ol-search-wrapper">
            <Search size={15} className="ol-search-icon" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="ol-input"
            />
          </div>
        )}

        {/* Custom Dark Select Filters */}
        {filters.map((flt) => (
          <div key={flt.id} className="ol-select-wrapper">
            <select
              value={flt.value}
              onChange={(e) => flt.onChange(e.target.value)}
              disabled={flt.disabled}
              className="ol-select"
              aria-label={flt.label}
            >
              {flt.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="ol-select-chevron" />
          </div>
        ))}

        {children}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Horizontal Time Range Selector */}
        {onTimeRangeChange && timeRangeOptions.length > 0 && (
          <div className="ol-time-range-group">
            {timeRangeOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onTimeRangeChange(opt)}
                className={`ol-time-pill ${timeRange === opt ? 'active' : ''}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Reset Filter Button */}
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="ol-btn ol-btn-ghost ol-btn-sm"
            title="Reset all active filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}

        {/* Record count indicator */}
        {resultsCount !== undefined && (
          <span style={{ fontSize: '12px', color: 'var(--ol-text-muted)', fontWeight: 600 }}>
            {resultsCount.toLocaleString()} {resultsLabel}
          </span>
        )}
      </div>
    </div>
  );
};
