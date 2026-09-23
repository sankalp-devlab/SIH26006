import { Search, X, RotateCcw } from 'lucide-react';
import type { VoyageFiltersState, VoyageStatus, VoyageLegType } from '../../../types/voyage';

interface VoyageFiltersProps {
  filters: VoyageFiltersState;
  onChange: (filters: VoyageFiltersState) => void;
  operators: string[];
}

export function VoyageFilters({ filters, onChange, operators }: VoyageFiltersProps) {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.status !== 'all' ||
    filters.legType !== 'all' ||
    filters.operator !== '';

  const resetFilters = () => {
    onChange({
      ...filters,
      searchQuery: '',
      status: 'all',
      legType: 'all',
      operator: '',
    });
  };

  const statusPills: { key: 'all' | VoyageStatus; label: string }[] = [
    { key: 'all', label: 'All Voyages' },
    { key: 'active', label: 'Active Underway' },
    { key: 'in_port', label: 'In Port / Berth' },
    { key: 'predicted', label: 'Predicted Next' },
    { key: 'completed', label: 'Completed History' },
  ];

  const legPills: { key: 'all' | VoyageLegType; label: string }[] = [
    { key: 'all', label: 'All Logs' },
    { key: 'laden', label: 'Laden / Cargo' },
    { key: 'ballast', label: 'Ballast / Empty' },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. Search Toolbar (1fr + 260px Operator selector, both 46px height) */}
      <div className="cvi-search-row">
        {/* Search Input */}
        <div className="cvi-search-input-wrap">
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="cvi-search-input"
            placeholder="Search Voyage ID, vessel, IMO, corridor, ports, operator, charterer..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Operator Selector */}
        <div>
          <select
            className="cvi-operator-select"
            value={filters.operator}
            onChange={(e) => onChange({ ...filters, operator: e.target.value })}
          >
            <option value="">All Commercial Operators</option>
            {operators.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Filter Row (Lifecycle chips + Log chips + Reset) */}
      <div className="cvi-filter-chips-row">
        {/* Group A: Lifecycle */}
        <div className="cvi-chips-group">
          <span className="cvi-chips-label">LIFECYCLE</span>
          {statusPills.map((pill) => {
            const isSelected = filters.status === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                className={`cvi-chip-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onChange({ ...filters, status: pill.key })}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Group B: Log (Laden / Ballast) */}
        <div className="cvi-chips-group">
          <span className="cvi-chips-label">LOG</span>
          {legPills.map((pill) => {
            const isSelected = filters.legType === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                className={`cvi-chip-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onChange({ ...filters, legType: pill.key })}
              >
                {pill.label}
              </button>
            );
          })}

          {/* Reset Filters if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '30px',
                padding: '0 10px',
                borderRadius: '15px',
                fontSize: '11px',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                cursor: 'pointer',
                fontWeight: 600,
                marginLeft: '6px',
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
