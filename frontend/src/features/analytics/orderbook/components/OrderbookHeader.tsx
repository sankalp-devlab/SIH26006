/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook Header & Multi-Dimensional Filter Bar
 */

import type { ReactNode } from 'react';
import {
  Layers,
  Ship,
  Fuel,
  Flame,
  Box,
  Search,
  RotateCcw,
  RefreshCw,
  Download,
} from 'lucide-react';
import type {
  OrderbookFiltersState,
  OrderbookSector,
} from '../../../../types/orderbook';

interface OrderbookHeaderProps {
  filters: OrderbookFiltersState;
  onFilterChange: <K extends keyof OrderbookFiltersState>(
    key: K,
    value: OrderbookFiltersState[K]
  ) => void;
  onReset: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  isLoading: boolean;
  availableVesselClasses: string[];
  availableShipyardCountries: string[];
  availablePropulsionTypes: string[];
}

const SECTORS: { id: OrderbookSector; label: string; icon: ReactNode; color: string }[] = [
  { id: 'all', label: 'All Sectors', icon: <Layers size={14} />, color: '#94a3b8' },
  { id: 'dry', label: 'Dry Bulk', icon: <Ship size={14} />, color: '#38bdf8' },
  { id: 'tanker', label: 'Tankers', icon: <Fuel size={14} />, color: '#f59e0b' },
  { id: 'gas', label: 'Gas Carriers', icon: <Flame size={14} />, color: '#10b981' },
  { id: 'container', label: 'Containers', icon: <Box size={14} />, color: '#c084fc' },
];

export function OrderbookHeader({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  onExportCsv,
  isLoading,
  availableVesselClasses,
  availableShipyardCountries,
  availablePropulsionTypes,
}: OrderbookHeaderProps) {
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
      {/* Top Row: Title, Subtitle, and Utility Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--color-text-primary, #f8fafc)',
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Orderbook & Fleet Growth Intelligence
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              Module 17
            </span>
          </div>
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary, #94a3b8)',
              maxWidth: '720px',
            }}
          >
            Multi-sector shipyard contracting registry, forward delivery pipelines (2026–2030),
            scrapping rate projections, and empirical fleet expansion dynamics.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onExportCsv}
            title="Export filtered orderbook records to CSV"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onReset}
            title="Reset all filters to defaults"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary, #94a3b8)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--color-border-subtle, #1e293b)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh orderbook intelligence stream"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#fff',
              background: 'var(--color-brand-primary, #2563eb)',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Row 2: Sector Pill Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-muted, #64748b)',
            marginRight: '0.25rem',
          }}
        >
          Sector:
        </span>
        {SECTORS.map((s) => {
          const isActive = filters.sector === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onFilterChange('sector', s.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                borderRadius: '9999px',
                border: isActive
                  ? `1px solid ${s.color}`
                  : '1px solid var(--color-border-subtle, #1e293b)',
                background: isActive ? `${s.color}22` : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? s.color : 'var(--color-text-secondary, #94a3b8)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Row 3: Filter Controls Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted, #64748b)',
            }}
          />
          <input
            type="text"
            placeholder="Search hull, vessel, owner, yard..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.2rem',
              fontSize: '0.8125rem',
              background: 'var(--color-bg-base, #0b0f19)',
              border: '1px solid var(--color-border-subtle, #1e293b)',
              borderRadius: '6px',
              color: 'var(--color-text-primary, #f8fafc)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Vessel Class Select */}
        <div>
          <select
            value={filters.vesselClass}
            onChange={(e) => onFilterChange('vesselClass', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              background: 'var(--color-bg-base, #0b0f19)',
              border: '1px solid var(--color-border-subtle, #1e293b)',
              borderRadius: '6px',
              color: 'var(--color-text-primary, #f8fafc)',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
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

        {/* Shipyard Country Select */}
        <div>
          <select
            value={filters.shipyardCountry}
            onChange={(e) => onFilterChange('shipyardCountry', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              background: 'var(--color-bg-base, #0b0f19)',
              border: '1px solid var(--color-border-subtle, #1e293b)',
              borderRadius: '6px',
              color: 'var(--color-text-primary, #f8fafc)',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Yard Nations</option>
            {availableShipyardCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Propulsion Type Select */}
        <div>
          <select
            value={filters.propulsionType}
            onChange={(e) => onFilterChange('propulsionType', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              background: 'var(--color-bg-base, #0b0f19)',
              border: '1px solid var(--color-border-subtle, #1e293b)',
              borderRadius: '6px',
              color: 'var(--color-text-primary, #f8fafc)',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Propulsion / Fuels</option>
            {availablePropulsionTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Year Select */}
        <div>
          <select
            value={filters.deliveryYear}
            onChange={(e) =>
              onFilterChange(
                'deliveryYear',
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              background: 'var(--color-bg-base, #0b0f19)',
              border: '1px solid var(--color-border-subtle, #1e293b)',
              borderRadius: '6px',
              color: 'var(--color-text-primary, #f8fafc)',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Delivery Horizons</option>
            <option value="2026">2026 (Prompt Deliveries)</option>
            <option value="2027">2027 (Next Wave)</option>
            <option value="2028">2028 (Forward Pipeline)</option>
            <option value="2029">2029 (Long-Lead)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
