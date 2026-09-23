import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { VesselFilters, VesselStatusFilter } from '../../../types/vessel-filters';
import { DEFAULT_VESSEL_FILTERS } from '../../../types/vessel-filters';

interface VesselFilterPanelProps {
  filters: VesselFilters;
  onChange: (filters: VesselFilters) => void;
  onClose: () => void;
  vesselTypes: string[];
  flags: string[];
  cargoTypes: string[];
  totalCount: number;
  filteredCount: number;
}

const STATUS_OPTIONS: { value: VesselStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'scrapped', label: 'Scrapped' },
  { value: 'orderbook', label: 'Orderbook' },
];

export function VesselFilterPanel({
  filters, onChange, onClose, vesselTypes, flags, cargoTypes,
  totalCount, filteredCount,
}: VesselFilterPanelProps) {
  const set = (partial: Partial<VesselFilters>) => onChange({ ...filters, ...partial });

  const toggleInArray = (arr: string[], value: string): string[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const isDirty =
    filters.status !== 'all' ||
    filters.vesselTypes.length > 0 ||
    filters.flags.length > 0 ||
    filters.minDwt !== null ||
    filters.maxDwt !== null ||
    filters.minYearBuilt !== null ||
    filters.maxYearBuilt !== null ||
    filters.cargoTypes.length > 0;

  return (
    <div className="vfp-panel">
      <div className="vfp-header">
        <span className="vfp-header-title">
          <SlidersHorizontal size={15} />
          Filters
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isDirty && (
            <button
              className="vfp-reset-btn"
              onClick={() => onChange({ ...DEFAULT_VESSEL_FILTERS, search: filters.search })}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
          <button className="vfp-close-btn" onClick={onClose} aria-label="Close filters">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="vfp-count">
        Showing <strong>{filteredCount.toLocaleString()}</strong> of{' '}
        <strong>{totalCount.toLocaleString()}</strong> vessels
      </div>

      <div className="vfp-body">
        <div className="vfp-group">
          <div className="vfp-group-label">Vessel Status</div>
          <div className="vfp-pill-group">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`vfp-pill${filters.status === opt.value ? ' active' : ''}`}
                onClick={() => set({ status: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {vesselTypes.length > 0 && (
          <div className="vfp-group">
            <div className="vfp-group-label">Vessel Type</div>
            <div className="vfp-pill-group">
              {vesselTypes.map((vt) => (
                <button
                  key={vt}
                  className={`vfp-pill${filters.vesselTypes.includes(vt) ? ' active' : ''}`}
                  onClick={() => set({ vesselTypes: toggleInArray(filters.vesselTypes, vt) })}
                >
                  {vt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="vfp-group">
          <div className="vfp-group-label">Deadweight (DWT)</div>
          <div className="vfp-range-row">
            <input type="number" className="vfp-range-input" placeholder="Min DWT"
              value={filters.minDwt ?? ''}
              onChange={(e) => set({ minDwt: e.target.value ? Number(e.target.value) : null })} />
            <span className="vfp-range-sep">to</span>
            <input type="number" className="vfp-range-input" placeholder="Max DWT"
              value={filters.maxDwt ?? ''}
              onChange={(e) => set({ maxDwt: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>

        <div className="vfp-group">
          <div className="vfp-group-label">Year Built</div>
          <div className="vfp-range-row">
            <input type="number" className="vfp-range-input" placeholder="From"
              value={filters.minYearBuilt ?? ''}
              onChange={(e) => set({ minYearBuilt: e.target.value ? Number(e.target.value) : null })} />
            <span className="vfp-range-sep">to</span>
            <input type="number" className="vfp-range-input" placeholder="To"
              value={filters.maxYearBuilt ?? ''}
              onChange={(e) => set({ maxYearBuilt: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>

        {flags.length > 0 && (
          <div className="vfp-group">
            <div className="vfp-group-label">Flag State</div>
            <div className="vfp-pill-group" style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {flags.slice(0, 24).map((flag) => (
                <button
                  key={flag}
                  className={`vfp-pill${filters.flags.includes(flag) ? ' active' : ''}`}
                  onClick={() => set({ flags: toggleInArray(filters.flags, flag) })}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        )}

        {cargoTypes.length > 0 && (
          <div className="vfp-group">
            <div className="vfp-group-label">Cargo Compatibility</div>
            <div className="vfp-pill-group">
              {cargoTypes.map((ct) => (
                <button
                  key={ct}
                  className={`vfp-pill${filters.cargoTypes.includes(ct) ? ' active' : ''}`}
                  onClick={() => set({ cargoTypes: toggleInArray(filters.cargoTypes, ct) })}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
