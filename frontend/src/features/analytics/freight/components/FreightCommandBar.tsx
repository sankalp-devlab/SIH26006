/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics Command Bar & Filter Surface
 */

import React from 'react';
import { Search, X, Layers, Globe, Sliders, Filter } from 'lucide-react';
import type {
  FreightFilterState,
  FreightDateRange,
  MarketSegment,
  FreightRegion,
  FreightRateBasis,
} from '../../../../types/freight-analytics';

interface FreightCommandBarProps {
  filters: FreightFilterState;
  hasActiveFilters: boolean;
  onFilterChange: <K extends keyof FreightFilterState>(key: K, value: FreightFilterState[K]) => void;
  onResetFilters: () => void;
  lastUpdated?: string;
}

export const FreightCommandBar: React.FC<FreightCommandBarProps> = ({
  filters,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
  lastUpdated,
}) => {
  const dateRanges: { id: FreightDateRange; label: string }[] = [
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '1Y' },
  ];

  const segments: { id: MarketSegment; label: string }[] = [
    { id: 'all', label: 'All Segments' },
    { id: 'dry_bulk', label: 'Dry Bulk' },
    { id: 'tanker', label: 'Tankers' },
    { id: 'container', label: 'Containers' },
  ];

  const regions: { id: FreightRegion; label: string }[] = [
    { id: 'all', label: 'Global (All)' },
    { id: 'pacific', label: 'Pacific Basin' },
    { id: 'atlantic', label: 'Atlantic Basin' },
    { id: 'middle_east_gulf', label: 'Middle East Gulf' },
    { id: 'mediterranean', label: 'Mediterranean' },
    { id: 'indian_ocean', label: 'Indian Ocean' },
  ];

  const rateBases: { id: FreightRateBasis; label: string }[] = [
    { id: 'all', label: 'All Units' },
    { id: 'per_mt', label: '$/MT' },
    { id: 'per_day_tce', label: '$/Day TCE' },
    { id: 'worldscale', label: 'WorldScale' },
    { id: 'lumpsum', label: 'LumpSum' },
  ];

  return (
    <div className="freight-command-bar">
      {/* Top Filter Controls: Search Route, Segment, Geography, Units */}
      <div className="freight-filters-grid">
        {/* Search Route / Corridor / Vessel Class */}
        <div className="freight-input-wrap">
          <Search size={16} className="freight-input-icon" />
          <input
            type="text"
            className="freight-input"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            placeholder="Search route (C5, TD3C), corridor, vessel class..."
            aria-label="Search freight routes"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange('searchQuery', '')}
              className="freight-badge-remove"
              style={{ position: 'absolute', right: '12px' }}
              title="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Market Segment Selector */}
        <div className="freight-input-wrap">
          <Layers size={15} className="freight-input-icon" />
          <select
            className="freight-select"
            value={filters.segment}
            onChange={(e) => onFilterChange('segment', e.target.value as MarketSegment)}
            aria-label="Filter by market segment"
          >
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Geographic Region Selector */}
        <div className="freight-input-wrap">
          <Globe size={15} className="freight-input-icon" />
          <select
            className="freight-select"
            value={filters.region}
            onChange={(e) => onFilterChange('region', e.target.value as FreightRegion)}
            aria-label="Filter by geographic region"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rate Basis / Units Selector */}
        <div className="freight-input-wrap">
          <Sliders size={15} className="freight-input-icon" />
          <select
            className="freight-select"
            value={filters.rateBasis}
            onChange={(e) => onFilterChange('rateBasis', e.target.value as FreightRateBasis)}
            aria-label="Filter by rate basis"
          >
            {rateBases.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Command Row: Horizontal Time Range Segmented Control + Feed Status */}
      <div className="freight-command-bottom">
        <div className="freight-time-selector-row">
          <span className="freight-time-label">Time Range:</span>
          <div className="freight-time-segmented-group" role="group" aria-label="Time range selector">
            {dateRanges.map((range) => {
              const isActive = filters.dateRange === range.id;
              return (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => onFilterChange('dateRange', range.id)}
                  className={`freight-time-btn ${isActive ? 'active' : ''}`}
                  aria-pressed={isActive}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="freight-feed-status">
          <span className="freight-live-pulse" title="Feed Connected" />
          <span>Baltic & AIS Live Normalized Feed</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ color: 'var(--freight-text-muted)' }}>
            Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
          </span>
        </div>
      </div>

      {/* Active Filter Badges Strip */}
      {hasActiveFilters && (
        <div className="freight-active-filters-strip">
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--freight-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={11} />
            <span>Active Filters:</span>
          </span>

          {filters.segment !== 'all' && (
            <span className="freight-filter-badge">
              <span>Segment: {segments.find((s) => s.id === filters.segment)?.label}</span>
              <button
                type="button"
                onClick={() => onFilterChange('segment', 'all')}
                className="freight-badge-remove"
                aria-label="Remove segment filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.region !== 'all' && (
            <span className="freight-filter-badge">
              <span>Region: {regions.find((r) => r.id === filters.region)?.label}</span>
              <button
                type="button"
                onClick={() => onFilterChange('region', 'all')}
                className="freight-badge-remove"
                aria-label="Remove region filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.rateBasis !== 'all' && (
            <span className="freight-filter-badge">
              <span>Unit: {rateBases.find((b) => b.id === filters.rateBasis)?.label}</span>
              <button
                type="button"
                onClick={() => onFilterChange('rateBasis', 'all')}
                className="freight-badge-remove"
                aria-label="Remove unit filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="freight-filter-badge">
              <span>Query: "{filters.searchQuery}"</span>
              <button
                type="button"
                onClick={() => onFilterChange('searchQuery', '')}
                className="freight-badge-remove"
                aria-label="Clear search filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="freight-reset-link"
          >
            Reset All
          </button>
        </div>
      )}
    </div>
  );
};
