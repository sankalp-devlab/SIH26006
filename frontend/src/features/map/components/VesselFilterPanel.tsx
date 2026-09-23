import { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  ChevronLeft,
  RotateCcw,
  Gauge,
  Flag,
  Filter,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import type { VesselPosition } from '../../../types/map';
import {
  VESSEL_CATEGORY_STYLES,
  getVesselCategoryKey,
  type VesselCategoryKey,
} from './VesselMarker';

export interface VesselFilterState {
  types: Set<string>;
  statuses: Set<string>;
  minSpeed: number;
  maxSpeed: number;
  flag: string;
  areaSearch: string;
}

interface VesselFilterPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  filters: VesselFilterState;
  onUpdateFilters: (updater: (prev: VesselFilterState) => VesselFilterState) => void;
  onResetFilters: () => void;
  allVessels: VesselPosition[];
  filteredCount: number;
  onOpenFleetList?: () => void;
  isFleetListOpen?: boolean;
}

const ALL_VESSEL_CATEGORIES: { key: VesselCategoryKey; label: string }[] = [
  { key: 'container', label: 'Container' },
  { key: 'tanker', label: 'Tanker' },
  { key: 'bulk carrier', label: 'Bulk Carrier' },
  { key: 'lng/lpg', label: 'LNG / LPG' },
  { key: 'ro-ro', label: 'Ro-Ro' },
  { key: 'passenger', label: 'Passenger' },
  { key: 'other', label: 'Other' },
];

const ALL_STATUSES = [
  { id: 'underway', label: 'Underway' },
  { id: 'anchored', label: 'Anchored' },
  { id: 'moored', label: 'Moored' },
  { id: 'unknown', label: 'Unknown' },
];

export function VesselFilterPanel({
  isOpen,
  onToggleOpen,
  filters,
  onUpdateFilters,
  onResetFilters,
  allVessels,
  filteredCount,
  onOpenFleetList,
  isFleetListOpen = false,
}: VesselFilterPanelProps) {
  const [speedMaxLimit] = useState(30);

  // Derive counts per vessel type from allVessels
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_VESSEL_CATEGORIES.forEach((c) => (counts[c.key] = 0));

    allVessels.forEach((v) => {
      const k = getVesselCategoryKey(v.vessel_type);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [allVessels]);

  // Derive status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      underway: 0,
      anchored: 0,
      moored: 0,
      unknown: 0,
    };

    allVessels.forEach((v) => {
      const s = (v.status || '').toLowerCase();
      if (s.includes('underway')) counts.underway += 1;
      else if (s.includes('anchor')) counts.anchored += 1;
      else if (s.includes('moor')) counts.moored += 1;
      else counts.unknown += 1;
    });
    return counts;
  }, [allVessels]);

  // Unique flags
  const uniqueFlags = useMemo(() => {
    const flags = new Set<string>();
    allVessels.forEach((v) => {
      if (v.flag) flags.add(v.flag);
    });
    return ['all', ...Array.from(flags).sort()];
  }, [allVessels]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.size > 0) count += filters.types.size;
    if (filters.statuses.size > 0) count += filters.statuses.size;
    if (filters.minSpeed > 0 || filters.maxSpeed < 30) count += 1;
    if (filters.flag !== 'all') count += 1;
    if (filters.areaSearch.trim()) count += 1;
    return count;
  }, [filters]);

  const toggleType = (key: string) => {
    onUpdateFilters((prev) => {
      const nextTypes = new Set(prev.types);
      if (nextTypes.has(key)) {
        nextTypes.delete(key);
      } else {
        nextTypes.add(key);
      }
      return { ...prev, types: nextTypes };
    });
  };

  const toggleStatus = (id: string) => {
    onUpdateFilters((prev) => {
      const next = new Set(prev.statuses);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { ...prev, statuses: next };
    });
  };

  return (
    <>
      {/* Floating collapsed trigger button */}
      {!isOpen && (
        <button
          className="vmp-filter-trigger-btn"
          onClick={onToggleOpen}
          title="Open Fleet Intelligence Panel"
          aria-label="Open Fleet Intelligence"
        >
          <Filter size={15} />
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="vmp-filter-counter">{activeFilterCount}</span>}
        </button>
      )}

      {/* Expanded Left Filter Panel */}
      <aside className={`vmp-filter-panel ${isOpen ? 'is-open' : 'is-collapsed'}`}>
        <div className="vmp-filter-header">
          <div className="vmp-filter-header-title">
            <SlidersHorizontal size={16} className="vmp-cyan-glow" />
            <h3>FLEET INTELLIGENCE</h3>
            {activeFilterCount > 0 && (
              <span className="vmp-filter-active-pill">{activeFilterCount} active</span>
            )}
          </div>
          <button
            className="vmp-filter-close-btn"
            onClick={onToggleOpen}
            title="Collapse Filter Panel"
            aria-label="Collapse Filter Panel"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* FLEET SUMMARY STATS (Requirement 10) */}
        <div className="vmp-fleet-summary-grid">
          <div className="vmp-summary-card">
            <span className="vmp-summary-label">FLEET</span>
            <span className="vmp-summary-value highlight">{allVessels.length}</span>
          </div>
          <div className="vmp-summary-card">
            <span className="vmp-summary-label">UNDERWAY</span>
            <span className="vmp-summary-value underway">{statusCounts.underway}</span>
          </div>
          <div className="vmp-summary-card">
            <span className="vmp-summary-label">ANCHORED</span>
            <span className="vmp-summary-value anchored">{statusCounts.anchored}</span>
          </div>
          <div className="vmp-summary-card">
            <span className="vmp-summary-label">ALERTS</span>
            <span className="vmp-summary-value alerts">0</span>
          </div>
        </div>

        {/* FLEET LIST BUTTON (Requirement 3 & 20) */}
        {onOpenFleetList && (
          <div className="vmp-fleet-list-btn-row">
            <button
              type="button"
              className={`vmp-fleet-list-toggle-btn ${isFleetListOpen ? 'is-active' : ''}`}
              onClick={onOpenFleetList}
              title="Open tabular Fleet List Registry Drawer"
            >
              <FileSpreadsheet size={15} className="vmp-cyan-glow" />
              <span>FLEET LIST REGISTRY</span>
              <span className="vmp-fleet-count-chip">{allVessels.length}</span>
            </button>
          </div>
        )}

        {/* SEARCH INPUT (Requirement 9) */}
        <div className="vmp-filter-search-box-wrap">
          <div className="vmp-filter-search-box">
            <Search size={14} className="vmp-search-icon" />
            <input
              type="text"
              placeholder="Search vessel, IMO, port..."
              value={filters.areaSearch}
              onChange={(e) => onUpdateFilters((p) => ({ ...p, areaSearch: e.target.value }))}
              className="vmp-filter-search-input"
            />
            {filters.areaSearch && (
              <button
                type="button"
                className="vmp-search-clear-btn"
                onClick={() => onUpdateFilters((p) => ({ ...p, areaSearch: '' }))}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="vmp-filter-content">
          {/* SECTION 1: VESSEL TYPE */}
          <div className="vmp-filter-section">
            <div className="vmp-section-title">
              <span>VESSEL TYPE</span>
              {filters.types.size > 0 && (
                <button
                  type="button"
                  className="vmp-section-clear"
                  onClick={() => onUpdateFilters((p) => ({ ...p, types: new Set() }))}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="vmp-checkbox-group">
              {ALL_VESSEL_CATEGORIES.map((cat) => {
                const style = VESSEL_CATEGORY_STYLES[cat.key];
                const isChecked = filters.types.has(cat.key);
                const count = categoryCounts[cat.key] || 0;

                return (
                  <label key={cat.key} className={`vmp-filter-checkbox-item ${isChecked ? 'is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleType(cat.key)}
                    />
                    <span
                      className="vmp-cat-color-dot"
                      style={{ backgroundColor: style.stroke, boxShadow: `0 0 6px ${style.glow}` }}
                    />
                    <span className="vmp-checkbox-label">{cat.label}</span>
                    <span className="vmp-checkbox-count">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: STATUS */}
          <div className="vmp-filter-section">
            <div className="vmp-section-title">
              <span>STATUS</span>
              {filters.statuses.size > 0 && (
                <button
                  type="button"
                  className="vmp-section-clear"
                  onClick={() => onUpdateFilters((p) => ({ ...p, statuses: new Set() }))}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="vmp-checkbox-group">
              {ALL_STATUSES.map((st) => {
                const isChecked = filters.statuses.has(st.id);
                const count = statusCounts[st.id] || 0;

                return (
                  <label key={st.id} className={`vmp-filter-checkbox-item ${isChecked ? 'is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStatus(st.id)}
                    />
                    <span className="vmp-checkbox-label">{st.label}</span>
                    <span className="vmp-checkbox-count">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: REGION / FLAG */}
          <div className="vmp-filter-section">
            <div className="vmp-section-title">
              <span><Flag size={12} /> REGION / FLAG</span>
            </div>
            <select
              value={filters.flag}
              onChange={(e) => onUpdateFilters((p) => ({ ...p, flag: e.target.value }))}
              className="vmp-select-input"
            >
              <option value="all">All Regions</option>
              {uniqueFlags
                .filter((fl) => fl !== 'all')
                .map((fl) => (
                  <option key={fl} value={fl}>
                    {fl}
                  </option>
                ))}
            </select>
          </div>

          {/* SECTION 4: SPEED SLIDER */}
          <div className="vmp-filter-section">
            <div className="vmp-section-title">
              <span><Gauge size={12} /> SPEED (SOG)</span>
              <span className="vmp-speed-readout">
                {filters.minSpeed} &ndash; {filters.maxSpeed} kn
              </span>
            </div>
            <div className="vmp-slider-container">
              <div className="vmp-slider-row">
                <span className="vmp-slider-tag">Min: {filters.minSpeed} kn</span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={filters.minSpeed}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      minSpeed: Math.min(Number(e.target.value), p.maxSpeed),
                    }))
                  }
                  className="vmp-range-slider"
                />
              </div>
              <div className="vmp-slider-row">
                <span className="vmp-slider-tag">Max: {filters.maxSpeed} kn</span>
                <input
                  type="range"
                  min="5"
                  max={speedMaxLimit}
                  step="1"
                  value={filters.maxSpeed}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      maxSpeed: Math.max(Number(e.target.value), p.minSpeed),
                    }))
                  }
                  className="vmp-range-slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="vmp-filter-footer">
          <button
            type="button"
            className="vmp-clear-all-btn"
            onClick={onResetFilters}
            disabled={activeFilterCount === 0}
            title="Reset all filter parameters"
          >
            <RotateCcw size={13} />
            <span>CLEAR FILTERS</span>
          </button>
          <div className="vmp-filter-summary">
            Showing <strong>{filteredCount}</strong> of {allVessels.length} vessels
          </div>
        </div>
      </aside>
    </>
  );
}
