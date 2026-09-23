import React, { useState, useEffect } from 'react';
import { Search, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { CargoFiltersState } from '../../../types/cargo';

interface CargoFiltersProps {
  filters: CargoFiltersState;
  onChange: (next: CargoFiltersState) => void;
  filterOptions: {
    sources: string[];
    categories: string[];
    zones: string[];
  };
}

export const CargoFilters: React.FC<CargoFiltersProps> = ({
  filters,
  onChange,
  filterOptions: _filterOptions,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        onChange({ ...filters, searchQuery: localSearch });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  // Keep local search in sync if filters cleared from outside
  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleReset = () => {
    setLocalSearch('');
    onChange({
      searchQuery: '',
      source: 'all',
      status: 'all',
      priority: 'all',
      zone: 'all',
      cargoType: 'all',
      validationStatus: 'all',
      vesselMatchStatus: 'all',
      scope: 'all',
      showArchived: false,
    });
  };

  const activeFilterCount = [
    Boolean(filters.searchQuery.trim()),
    filters.source !== 'all',
    filters.status !== 'all',
    filters.priority !== 'all',
    filters.zone !== 'all',
    filters.cargoType !== 'all',
    filters.validationStatus !== 'all',
    filters.vesselMatchStatus !== 'all',
    filters.scope !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="ciw-command-bar">
      {/* Search and Primary Filters Bar */}
      <div className="ciw-filter-controls">
        {/* Global Search Input */}
        <div className="ciw-search-wrap">
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="ciw-search-input"
            placeholder="Search Ref, Shipper, Port, Commodity, IMO..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onChange({ ...filters, searchQuery: '' });
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Source Filter */}
        <select
          className="ciw-select"
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value })}
        >
          <option value="all">All Sources</option>
          <option value="email">Channel: Email</option>
          <option value="whatsapp">Channel: WhatsApp</option>
          <option value="slack">Channel: Slack</option>
          <option value="edi">Channel: EDI / API</option>
          <option value="manual">Manual Entry</option>
        </select>

        {/* Operational Status */}
        <select
          className="ciw-select"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="validated">Validated</option>
          <option value="matched">Vessel Matched</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="archived">Archived</option>
        </select>

        {/* Corridor Zone */}
        <select
          className="ciw-select"
          value={filters.zone}
          onChange={(e) => onChange({ ...filters, zone: e.target.value })}
        >
          <option value="all">All Corridor Zones</option>
          <option value="Zone A - Arabian Gulf">Zone A &middot; Arabian Gulf</option>
          <option value="Zone B - Bay of Bengal">Zone B &middot; Bay of Bengal</option>
          <option value="Zone C - Far East">Zone C &middot; Far East</option>
          <option value="Zone D - Med & Europe">Zone D &middot; Med & Europe</option>
          <option value="Zone E - Atlantic & Americas">Zone E &middot; Atlantic</option>
        </select>

        {/* Cargo Category */}
        <select
          className="ciw-select"
          value={filters.cargoType}
          onChange={(e) => onChange({ ...filters, cargoType: e.target.value })}
        >
          <option value="all">All Categories</option>
          <option value="Dry Bulk">Dry Bulk</option>
          <option value="Liquid Bulk">Liquid Bulk</option>
          <option value="Containerized">Containerized</option>
          <option value="Breakbulk">Breakbulk</option>
        </select>

        {/* Fleet Match Status */}
        <select
          className="ciw-select"
          value={filters.vesselMatchStatus}
          onChange={(e) => onChange({ ...filters, vesselMatchStatus: e.target.value as CargoFiltersState['vesselMatchStatus'] })}
        >
          <option value="all">Fleet Match: All</option>
          <option value="matched">Matched to Vessel</option>
          <option value="unmatched">Open / Unmatched</option>
        </select>

        {/* Privacy Scope */}
        <select
          className="ciw-select"
          value={filters.scope}
          onChange={(e) => onChange({ ...filters, scope: e.target.value as CargoFiltersState['scope'] })}
        >
          <option value="all">Scope: All</option>
          <option value="public">Market Demands</option>
          <option value="private">Private Lineup Only</option>
        </select>
      </div>

      {/* Filter Footer: Active Indicator, Removable Chips, Reset, and Archived Checkbox */}
      <div className="ciw-filter-footer">
        <div className="ciw-filter-chips">
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <SlidersHorizontal size={12} color="#00d8ff" />
            <span>FILTERS</span>
          </span>

          {activeFilterCount === 0 ? (
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              0 filters active &middot; showing standard active inquiries
            </span>
          ) : (
            <>
              {filters.searchQuery && (
                <span className="ciw-chip">
                  <span>"{filters.searchQuery}"</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, searchQuery: '' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              {filters.source !== 'all' && (
                <span className="ciw-chip">
                  <span>Source: {filters.source.toUpperCase()}</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, source: 'all' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              {filters.status !== 'all' && (
                <span className="ciw-chip">
                  <span>Status: {filters.status}</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, status: 'all' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              {filters.zone !== 'all' && (
                <span className="ciw-chip">
                  <span>{filters.zone.split(' - ')[0]}</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, zone: 'all' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              {filters.cargoType !== 'all' && (
                <span className="ciw-chip">
                  <span>{filters.cargoType}</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, cargoType: 'all' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              {filters.validationStatus !== 'all' && (
                <span className="ciw-chip" style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
                  <span>Validation: {filters.validationStatus}</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, validationStatus: 'all' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              {filters.vesselMatchStatus !== 'all' && (
                <span className="ciw-chip">
                  <span>{filters.vesselMatchStatus === 'matched' ? 'Vessel Matched' : 'Open Fleet'}</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, vesselMatchStatus: 'all' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              {filters.scope !== 'all' && (
                <span className="ciw-chip" style={{ color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.3)', backgroundColor: 'rgba(129, 140, 248, 0.08)' }}>
                  <span>{filters.scope === 'private' ? 'Private Lineup' : 'Public Market'}</span>
                  <span className="ciw-chip-remove" onClick={() => onChange({ ...filters, scope: 'all' })}>
                    <X size={10} />
                  </span>
                </span>
              )}

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00d8ff',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginLeft: '4px',
                  padding: '2px 4px',
                }}
              >
                <RotateCcw size={11} /> Reset All
              </button>
            </>
          )}
        </div>

        {/* Include Archived Checkbox */}
        <label className="ciw-archived-label">
          <input
            type="checkbox"
            checked={filters.showArchived}
            onChange={(e) => onChange({ ...filters, showArchived: e.target.checked })}
            style={{
              accentColor: '#00d8ff',
              cursor: 'pointer',
              width: '14px',
              height: '14px',
            }}
          />
          <span>Include Archived Consignments</span>
        </label>
      </div>
    </div>
  );
};

