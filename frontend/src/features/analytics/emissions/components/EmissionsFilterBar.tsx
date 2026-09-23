/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Emissions Global Cascading Filter Bar
 */

import {
  Search,
  RotateCcw,
  X,
  Filter,
} from 'lucide-react';
import type {
  EmissionsFiltersState,
  EmissionsTimeHorizon,
  EmissionsVesselRecord,
} from '../../../../types/emissions';

interface EmissionsFilterBarProps {
  filters: EmissionsFiltersState;
  onSearchChange: (search: string) => void;
  onTimeHorizonChange: (horizon: EmissionsTimeHorizon) => void;
  onFleetChange: (fleet: string) => void;
  onVesselClassChange: (vClass: string) => void;
  onVesselChange: (vesselId: string) => void;
  onRegionChange: (region: string) => void;
  onOperationalStateChange: (state: string) => void;
  onReset: () => void;
  availableFleets: { id: string; name: string }[];
  availableVesselClasses: string[];
  availableRegions: string[];
  vessels: EmissionsVesselRecord[];
  totalFilteredCount: number;
}

export function EmissionsFilterBar({
  filters,
  onSearchChange,
  onTimeHorizonChange,
  onFleetChange,
  onVesselClassChange,
  onVesselChange,
  onRegionChange,
  onOperationalStateChange,
  onReset,
  availableFleets,
  availableVesselClasses,
  availableRegions,
  vessels,
  totalFilteredCount,
}: EmissionsFilterBarProps) {
  // Count active filters for badge
  const activeCount = [
    filters.search,
    filters.fleet !== 'all' ? filters.fleet : '',
    filters.vesselClass !== 'all' ? filters.vesselClass : '',
    filters.vesselId !== 'all' ? filters.vesselId : '',
    filters.region !== 'all' ? filters.region : '',
    filters.operationalState !== 'all' ? filters.operationalState : '',
  ].filter(Boolean).length;

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '0.875rem 1rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* Top row controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', gridColumn: 'span 2', minWidth: '220px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search vessels, IMO, voyages, operators..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              fontSize: '0.75rem',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#f8fafc',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Fleet Dropdown */}
        <div>
          <select
            value={filters.fleet}
            onChange={(e) => onFleetChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '0.75rem',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#e2e8f0',
              outline: 'none',
            }}
          >
            {availableFleets.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vessel Class Dropdown */}
        <div>
          <select
            value={filters.vesselClass}
            onChange={(e) => onVesselClassChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '0.75rem',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#e2e8f0',
              outline: 'none',
            }}
          >
            {availableVesselClasses.map((vc) => (
              <option key={vc} value={vc}>
                {vc === 'all' ? 'All Classes' : vc}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Vessel Selector */}
        <div>
          <select
            value={filters.vesselId}
            onChange={(e) => onVesselChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '0.75rem',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#e2e8f0',
              outline: 'none',
            }}
          >
            <option value="all">All Vessels ({vessels.length})</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id.toString()}>
                {v.name} ({v.vesselClass})
              </option>
            ))}
          </select>
        </div>

        {/* Geographic Region */}
        <div>
          <select
            value={filters.region}
            onChange={(e) => onRegionChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '0.75rem',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#e2e8f0',
              outline: 'none',
            }}
          >
            {availableRegions.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Regions' : r}
              </option>
            ))}
          </select>
        </div>

        {/* Operational State */}
        <div>
          <select
            value={filters.operationalState}
            onChange={(e) => onOperationalStateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '0.75rem',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#e2e8f0',
              outline: 'none',
            }}
          >
            <option value="all">All Operational States</option>
            <option value="at_sea">At Sea</option>
            <option value="laden">Laden Transit</option>
            <option value="ballast">Ballast Transit</option>
            <option value="port">In Port / Berth</option>
            <option value="maneuvering">Maneuvering</option>
            <option value="anchored">At Anchor</option>
            <option value="waiting">Canal / Chokepoint Queue</option>
          </select>
        </div>

        {/* Time Horizon Pills */}
        <div
          style={{
            display: 'flex',
            background: '#0f172a',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #1e293b',
          }}
        >
          {(['7d', '30d', '90d', '1y', 'all'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onTimeHorizonChange(h)}
              style={{
                padding: '4px 8px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: filters.timeHorizon === h ? '#0066cc' : 'transparent',
                color: filters.timeHorizon === h ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease',
              }}
            >
              {h.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Reset Filter Button */}
        {activeCount > 0 && (
          <div>
            <button
              type="button"
              onClick={onReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Chips Bar */}
      {activeCount > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
            <Filter size={12} />
            <span>Active Filters ({activeCount}):</span>
          </div>

          {filters.search && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 102, 204, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              Search: "{filters.search}"
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => onSearchChange('')} />
            </span>
          )}

          {filters.fleet !== 'all' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 102, 204, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              Fleet: {availableFleets.find((f) => f.id === filters.fleet)?.name || filters.fleet}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => onFleetChange('all')} />
            </span>
          )}

          {filters.vesselClass !== 'all' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 102, 204, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              Class: {filters.vesselClass}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => onVesselClassChange('all')} />
            </span>
          )}

          {filters.vesselId !== 'all' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 102, 204, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              Vessel: {vessels.find((v) => v.id.toString() === filters.vesselId)?.name || filters.vesselId}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => onVesselChange('all')} />
            </span>
          )}

          {filters.region !== 'all' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 102, 204, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              Region: {filters.region}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => onRegionChange('all')} />
            </span>
          )}

          {filters.operationalState !== 'all' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 102, 204, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              State: {filters.operationalState}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => onOperationalStateChange('all')} />
            </span>
          )}

          <span style={{ color: '#64748b', marginLeft: 'auto' }}>
            Showing <strong>{totalFilteredCount}</strong> matching vessels
          </span>
        </div>
      )}
    </div>
  );
}
