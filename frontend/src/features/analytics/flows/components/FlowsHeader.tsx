/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Header & Dynamic Cascading Filter Bar
 */

import type { ReactNode } from 'react';
import {
  Ship,
  Flame,
  Fuel,
  Waves,
  Search,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import type { FlowFiltersState, FlowMode, FlowDirection, FlowTimeHorizon } from '../../../../types/trade-flows';

interface FlowsHeaderProps {
  filters: FlowFiltersState;
  onFilterChange: <K extends keyof FlowFiltersState>(key: K, value: FlowFiltersState[K]) => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  availableCommodities: string[];
  availableVesselClasses: string[];
  availableCountries: { origins: string[]; destinations: string[] };
  availableRegions: string[];
}

const MODES: { id: FlowMode; label: string; icon: ReactNode; color: string }[] = [
  { id: 'dry', label: 'Dry Bulk', icon: <Ship size={15} />, color: '#38bdf8' },
  { id: 'tanker', label: 'Tanker', icon: <Fuel size={15} />, color: '#f59e0b' },
  { id: 'lng', label: 'LNG', icon: <Flame size={15} />, color: '#c084fc' },
  { id: 'lpg', label: 'LPG', icon: <Waves size={15} />, color: '#10b981' },
];

export function FlowsHeader({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isLoading,
  availableCommodities,
  availableVesselClasses,
  availableCountries,
  availableRegions,
}: FlowsHeaderProps) {
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
      {/* Top Row: Title, Mode Badges & Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand-cyan, #38bdf8)',
            }}
          >
            <Waves size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Trade Flows & Commodity Movements
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 4,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                Module 16
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #94a3b8)', margin: '0.15rem 0 0' }}>
              Bilateral maritime origin-destination matrices, ton-mile volume intelligence, and vessel segment dynamics.
            </p>
          </div>
        </div>

        {/* Sector / Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              padding: '0.25rem',
              borderRadius: 8,
              border: '1px solid var(--color-border-subtle, #334155)',
            }}
          >
            {MODES.map((mode) => {
              const isActive = filters.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onFilterChange('mode', mode.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: isActive ? mode.color : 'transparent',
                    color: isActive ? '#0f172a' : 'var(--color-text-secondary, #cbd5e1)',
                  }}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Refresh flow telemetry"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Sync
          </button>

          <button
            type="button"
            onClick={onReset}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Bottom Row: Cascading Selectors & Search Input */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginTop: '1rem',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search port, country, code..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem 0.45rem 2rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          />
        </div>

        {/* Commodity (Cascading) */}
        <div>
          <select
            value={filters.commodity}
            onChange={(e) => onFilterChange('commodity', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          >
            <option value="all">All Commodities</option>
            {availableCommodities.map((comm) => (
              <option key={comm} value={comm}>
                {comm}
              </option>
            ))}
          </select>
        </div>

        {/* Vessel Class (Cascading) */}
        <div>
          <select
            value={filters.vesselClass}
            onChange={(e) => onFilterChange('vesselClass', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          >
            <option value="all">All Vessel Classes</option>
            {availableVesselClasses.map((vc) => (
              <option key={vc} value={vc}>
                {vc}
              </option>
            ))}
          </select>
        </div>

        {/* Origin Country */}
        <div>
          <select
            value={filters.originCountry}
            onChange={(e) => onFilterChange('originCountry', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          >
            <option value="all">All Origin Countries</option>
            {availableCountries.origins.map((country) => (
              <option key={country} value={country}>
                From: {country}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Country */}
        <div>
          <select
            value={filters.destinationCountry}
            onChange={(e) => onFilterChange('destinationCountry', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          >
            <option value="all">All Destination Countries</option>
            {availableCountries.destinations.map((country) => (
              <option key={country} value={country}>
                To: {country}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <select
            value={filters.region}
            onChange={(e) => onFilterChange('region', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          >
            <option value="all">All Regions</option>
            {availableRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Direction (Import/Export/All) */}
        <div>
          <select
            value={filters.direction}
            onChange={(e) => onFilterChange('direction', e.target.value as FlowDirection)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          >
            <option value="all">Trade Balance: All</option>
            <option value="export">Exports Only</option>
            <option value="import">Imports Only</option>
          </select>
        </div>

        {/* Time Horizon */}
        <div>
          <select
            value={filters.timeHorizon}
            onChange={(e) => onFilterChange('timeHorizon', e.target.value as FlowTimeHorizon)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              fontSize: '0.8rem',
              background: 'var(--color-bg-surface-alt, #1e293b)',
              color: '#f8fafc',
              border: '1px solid var(--color-border-subtle, #334155)',
              borderRadius: 6,
              outline: 'none',
            }}
          >
            <option value="current">Horizon: Current Snapshot</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 12 Months</option>
          </select>
        </div>
      </div>
    </div>
  );
}
