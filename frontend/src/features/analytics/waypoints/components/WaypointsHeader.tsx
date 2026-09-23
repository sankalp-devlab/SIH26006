/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Waypoints Header & Dynamic Cascading Filter Bar
 */

import type { ReactNode } from 'react';
import {
  Compass,
  Ship,
  Flame,
  Fuel,
  Waves,
  Search,
  RotateCcw,
  RefreshCw,
  Download,
  GitCompare,
  Layers,
} from 'lucide-react';
import type {
  WaypointFiltersState,
  WaypointMode,
  WaypointType,
  WaypointCongestionLevel,
  WaypointTimeHorizon,
} from '../../../../types/waypoints';

interface WaypointsHeaderProps {
  filters: WaypointFiltersState;
  onModeChange: (mode: WaypointMode | 'all') => void;
  onVesselClassChange: (cls: string | 'all') => void;
  onRegionChange: (region: string | 'all') => void;
  onCountryChange: (country: string | 'all') => void;
  onTypeChange: (type: WaypointType | 'all') => void;
  onTimeHorizonChange: (horizon: WaypointTimeHorizon) => void;
  onCongestionChange: (level: WaypointCongestionLevel | 'all') => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  onOpenCompare: () => void;
  compareCount: number;
  totalFilteredCount: number;
  isLoading: boolean;
  availableRegions: string[];
  availableCountries: string[];
  availableVesselClasses: string[];
}

const MODES: { id: WaypointMode | 'all'; label: string; icon: ReactNode; color: string }[] = [
  { id: 'all', label: 'All Modes', icon: <Layers size={14} />, color: '#94a3b8' },
  { id: 'tanker', label: 'Tanker', icon: <Fuel size={14} />, color: '#f59e0b' },
  { id: 'dry', label: 'Dry Bulk', icon: <Ship size={14} />, color: '#38bdf8' },
  { id: 'lng', label: 'LNG', icon: <Flame size={14} />, color: '#c084fc' },
  { id: 'lpg', label: 'LPG', icon: <Waves size={14} />, color: '#10b981' },
];

const TYPES: { id: WaypointType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Geometries' },
  { id: 'CANAL', label: 'Canals (3)' },
  { id: 'STRAIT', label: 'Straits (19)' },
  { id: 'CAPE', label: 'Capes (3)' },
  { id: 'CHOKEPOINT', label: 'Chokepoints (3)' },
  { id: 'PASSAGE', label: 'Passages (6)' },
];

const CONGESTIONS: { id: WaypointCongestionLevel | 'all'; label: string }[] = [
  { id: 'all', label: 'All Congestion Levels' },
  { id: 'CRITICAL', label: 'Critical Delay (>75)' },
  { id: 'HIGH', label: 'High Queue (60-74)' },
  { id: 'MODERATE', label: 'Moderate (35-59)' },
  { id: 'LOW', label: 'Nominal Flow (<35)' },
];

const TIME_HORIZONS: { id: WaypointTimeHorizon; label: string }[] = [
  { id: '7d', label: '7D Window' },
  { id: '30d', label: '30D Window' },
  { id: '90d', label: '90D Window' },
  { id: '1y', label: '1Y Historic' },
];

export function WaypointsHeader({
  filters,
  onModeChange,
  onVesselClassChange,
  onRegionChange,
  onCountryChange,
  onTypeChange,
  onTimeHorizonChange,
  onCongestionChange,
  onSearchChange,
  onReset,
  onRefresh,
  onExportCsv,
  onOpenCompare,
  compareCount,
  totalFilteredCount,
  isLoading,
  availableRegions,
  availableCountries,
  availableVesselClasses,
}: WaypointsHeaderProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface, #0f172a)',
        border: '1px solid var(--color-border-subtle, #1e293b)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Top Bar: Title & Global Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Compass size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Maritime Waypoints & Chokepoint Intelligence
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                34 Strategic Nodes
              </span>
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#94a3b8',
                margin: '0.2rem 0 0 0',
              }}
            >
              Geographic telemetry, bottleneck congestion, waiting queues, and detour diversion analytics.
            </p>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onOpenCompare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: compareCount > 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.6)',
              color: compareCount > 0 ? '#a5b4fc' : '#94a3b8',
              border: `1px solid ${compareCount > 0 ? 'rgba(99, 102, 241, 0.4)' : '#334155'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <GitCompare size={15} />
            <span>Compare ({compareCount})</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              background: 'rgba(30, 41, 59, 0.6)',
              color: '#cbd5e1',
              border: '1px solid #334155',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            <span>Export Registry</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              background: 'rgba(30, 41, 59, 0.6)',
              color: '#cbd5e1',
              border: '1px solid #334155',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Live Telemetry'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#94a3b8',
              background: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Row 2: Mode Selector Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '0.85rem 0',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginRight: '0.25rem' }}>
            Maritime Sector:
          </span>
          {MODES.map((m) => {
            const isActive = filters.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? `${m.color}22` : 'rgba(15, 23, 42, 0.6)',
                  color: isActive ? m.color : '#94a3b8',
                  border: `1px solid ${isActive ? m.color : '#334155'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filtered result count badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Active Filter: <strong style={{ color: '#38bdf8' }}>{totalFilteredCount}</strong> of 34 Chokepoints
          </span>
        </div>
      </div>

      {/* Row 3: Search & Cascading Dropdowns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem',
          paddingTop: '0.85rem',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 34 chokepoints..."
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Region */}
        <select
          value={filters.region}
          onChange={(e) => onRegionChange(e.target.value)}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            color: '#f8fafc',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          <option value="all">All Oceanic Regions</option>
          {availableRegions.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>

        {/* Country */}
        <select
          value={filters.country}
          onChange={(e) => onCountryChange(e.target.value)}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            color: '#f8fafc',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          <option value="all">All Jurisdictions / Coastal States</option>
          {availableCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Geometry Type */}
        <select
          value={filters.waypointType}
          onChange={(e) => onTypeChange(e.target.value as WaypointType | 'all')}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            color: '#f8fafc',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          {TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Vessel Class */}
        <select
          value={filters.vesselClass}
          onChange={(e) => onVesselClassChange(e.target.value)}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            color: '#f8fafc',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          <option value="all">All Vessel Classes</option>
          {availableVesselClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        {/* Congestion Level */}
        <select
          value={filters.congestionLevel}
          onChange={(e) => onCongestionChange(e.target.value as WaypointCongestionLevel | 'all')}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            color: '#f8fafc',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          {CONGESTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Time Horizon */}
        <select
          value={filters.timeHorizon}
          onChange={(e) => onTimeHorizonChange(e.target.value as WaypointTimeHorizon)}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            color: '#f8fafc',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          {TIME_HORIZONS.map((th) => (
            <option key={th.id} value={th.id}>
              {th.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
