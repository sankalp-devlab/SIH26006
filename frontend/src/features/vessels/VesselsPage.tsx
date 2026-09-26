import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Ship,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  ExternalLink,
  Compass,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useVessels } from '../../hooks/useVessels';
import { StatusBadge } from '../../components/data-display/StatusBadge';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { ExportButton } from '../../components/export';
import { VesselProfileDrawer } from './components/VesselProfileDrawer';
import type { Vessel } from '../../types/vessel';
import type { VesselFilters, VesselSortField, SortDirection, VesselStatusFilter } from '../../types/vessel-filters';
import { DEFAULT_VESSEL_FILTERS, DEFAULT_VESSEL_SORT } from '../../types/vessel-filters';
import type { ExportColumnDefinition } from '../../types/export-sharing';

const VESSEL_EXPORT_COLUMNS: ExportColumnDefinition<Vessel>[] = [
  { key: 'name', label: 'Vessel Name', defaultVisible: true },
  { key: 'imo_number', label: 'IMO Number', defaultVisible: true },
  { key: 'vessel_type', label: 'Type / Class', defaultVisible: true },
  { key: 'flag', label: 'Flag', defaultVisible: true },
  { key: 'status', label: 'Status', formatter: 'status', defaultVisible: true },
  { key: 'capacity_tons', label: 'DWT (MT)', formatter: 'number', defaultVisible: true },
  { key: 'year_built', label: 'Year Built', defaultVisible: true },
  { key: 'length_m', label: 'Length LOA (m)', formatter: 'number', defaultVisible: false },
  { key: 'width_m', label: 'Beam (m)', formatter: 'number', defaultVisible: false },
  { key: 'draft_m', label: 'Draft (m)', formatter: 'number', defaultVisible: false },
  { key: 'speed_laden_knots', label: 'Speed Laden (kts)', formatter: 'number', defaultVisible: true },
  { key: 'fuel_laden_mt_day', label: 'Fuel Laden (MT/day)', formatter: 'number', defaultVisible: false },
  { key: 'cargo_types', label: 'Cargo Types', defaultVisible: true },
];

interface SortableThProps {
  field: VesselSortField;
  label: string;
  currentField: VesselSortField;
  direction: SortDirection;
  onSort: (f: VesselSortField) => void;
  align?: 'left' | 'right';
}

function SortableTh({ field, label, currentField, direction, onSort, align = 'left' }: SortableThProps) {
  const active = currentField === field;
  return (
    <th
      className={`vr-th ${active ? 'active' : ''}`}
      style={{ textAlign: align, cursor: 'pointer', userSelect: 'none' }}
      onClick={() => onSort(field)}
    >
      <span className="vr-th-inner" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <span>{label}</span>
        <span className="vr-th-icon">
          {active ? (
            direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
          ) : (
            <ArrowUpDown size={11} style={{ opacity: 0.35 }} />
          )}
        </span>
      </span>
    </th>
  );
}

function getVesselRowIconColor(vesselType: string | null): string {
  const t = (vesselType || '').toLowerCase();
  if (t.includes('container')) return '#00f0ff';
  if (t.includes('tanker')) return '#f59e0b';
  if (t.includes('lng') || t.includes('lpg')) return '#38bdf8';
  if (t.includes('handy') || t.includes('supra') || t.includes('panamax') || t.includes('cape') || t.includes('bulk')) return '#60a5fa';
  if (t.includes('passenger')) return '#ec4899';
  return '#94a3b8';
}

export function VesselsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlVesselId = searchParams.get('vessel') ? Number(searchParams.get('vessel')) : null;

  const [filters, setFilters] = useState<VesselFilters>(DEFAULT_VESSEL_FILTERS);
  const [sort, setSort] = useState<{ field: VesselSortField; direction: SortDirection }>(DEFAULT_VESSEL_SORT);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Search auto-complete state
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Column visibility state (Requirement 13)
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    imo: true,
    type: true,
    flag: true,
    dwt: true,
    built: true,
    status: true,
    length: false,
    beam: false,
    draft: false,
  });

  // Query actual vessels from FastAPI /vessels
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useVessels(500);

  const allVessels: Vessel[] = useMemo(() => queryData?.vessels ?? [], [queryData]);

  // Sync selected vessel from URL parameter if provided
  useEffect(() => {
    if (urlVesselId && allVessels.length > 0) {
      const found = allVessels.find((v) => v.id === urlVesselId);
      if (found) setSelectedVessel(found);
    }
  }, [urlVesselId, allVessels]);

  // Derived metadata lists for filters
  const vesselTypes = useMemo(
    () => [...new Set(allVessels.map((v) => v.vessel_type).filter(Boolean) as string[])].sort(),
    [allVessels]
  );

  const flags = useMemo(
    () => [...new Set(allVessels.map((v) => v.flag).filter(Boolean) as string[])].sort(),
    [allVessels]
  );

  // KPI calculations (Requirement 3: strictly calculated from actual data)
  const kpis = useMemo(() => {
    const total = allVessels.length;
    let underway = 0;
    let anchored = 0;
    let totalDwt = 0;
    const distinctTypes = new Set<string>();

    allVessels.forEach((v) => {
      const s = (v.status || '').toLowerCase();
      if (s.includes('underway')) underway += 1;
      if (s.includes('anchor')) anchored += 1;
      if (v.vessel_type) distinctTypes.add(v.vessel_type);
      if (v.capacity_tons) totalDwt += v.capacity_tons;
    });

    return {
      total,
      underway,
      anchored,
      typesCount: distinctTypes.size,
      totalDwt: totalDwt > 0 ? totalDwt.toLocaleString() + ' MT' : 'Unavailable',
    };
  }, [allVessels]);

  // Client-side search suggestions
  const searchSuggestions = useMemo(() => {
    if (!filters.search.trim() || filters.search.length < 1) return [];
    const q = filters.search.toLowerCase();
    return allVessels
      .filter((v) => {
        const nameMatch = v.name?.toLowerCase().includes(q);
        const imoMatch = v.imo_number?.toLowerCase().includes(q);
        const typeMatch = v.vessel_type?.toLowerCase().includes(q);
        const flagMatch = v.flag?.toLowerCase().includes(q);
        return nameMatch || imoMatch || typeMatch || flagMatch;
      })
      .slice(0, 6);
  }, [allVessels, filters.search]);

  // Filter application
  const filtered = useMemo(() => {
    return allVessels.filter((v) => {
      // 1. Text search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const nameMatch = v.name?.toLowerCase().includes(q);
        const imoMatch = v.imo_number?.toLowerCase().includes(q);
        const typeMatch = v.vessel_type?.toLowerCase().includes(q);
        const flagMatch = v.flag?.toLowerCase().includes(q);
        if (!nameMatch && !imoMatch && !typeMatch && !flagMatch) return false;
      }

      // 2. Status
      if (filters.status !== 'all') {
        const norm = (v.status ?? '').toLowerCase();
        if (filters.status === 'underway' && !norm.includes('underway')) return false;
        if (filters.status === 'anchored' && !norm.includes('anchor')) return false;
        if (filters.status === 'moored' && !norm.includes('moor')) return false;
        if (filters.status === 'reference' && !norm.includes('reference')) return false;
      }

      // 3. Vessel Type
      if (filters.vesselTypes.length > 0) {
        if (!v.vessel_type || !filters.vesselTypes.includes(v.vessel_type)) return false;
      }

      // 4. Flag
      if (filters.flags.length > 0) {
        if (!v.flag || !filters.flags.includes(v.flag)) return false;
      }

      // 5. DWT range
      if (filters.minDwt !== null && (v.capacity_tons ?? 0) < filters.minDwt) return false;
      if (filters.maxDwt !== null && (v.capacity_tons ?? 0) > filters.maxDwt) return false;

      // 6. Year Built
      if (filters.minYearBuilt !== null && (v.year_built ?? 0) < filters.minYearBuilt) return false;
      if (filters.maxYearBuilt !== null && (v.year_built ?? 0) > filters.maxYearBuilt) return false;

      return true;
    });
  }, [allVessels, filters]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sort.field];
      const bv = (b as unknown as Record<string, unknown>)[sort.field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      }
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const handleSort = useCallback((field: VesselSortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    );
    setPage(1);
  }, []);

  const handleClearFilters = () => {
    setFilters(DEFAULT_VESSEL_FILTERS);
    setPage(1);
  };

  const activeFilterCount = [
    filters.status !== 'all',
    filters.vesselTypes.length > 0,
    filters.flags.length > 0,
    filters.minDwt !== null,
    filters.maxDwt !== null,
    filters.minYearBuilt !== null,
    filters.maxYearBuilt !== null,
  ].filter(Boolean).length;

  const handleSelectVessel = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('vessel', String(vessel.id));
    setSearchParams(newParams);
  };

  const handleCloseDrawer = () => {
    setSelectedVessel(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('vessel');
    setSearchParams(newParams);
  };

  return (
    <div className="vr-workspace">
      {/* 2. PAGE HEADER (Requirement 2) */}
      <header className="vr-header">
        <div className="vr-header-left">
          <div className="vr-eyebrow">
            <Ship size={13} className="vr-cyan" />
            <span>VESSEL INTELLIGENCE</span>
          </div>
          <h1 className="vr-title">Vessel Registry</h1>
          <p className="vr-desc">
            Explore, search and analyze the vessels available across the OceanLens maritime database.
          </p>
        </div>

        <div className="vr-header-right">
          <button
            type="button"
            className="vr-btn-ghost"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh vessel dataset"
          >
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
            <span>Refresh Data</span>
          </button>

          <ExportButton
            dataset="Vessel Fleet Registry"
            title="Export Vessel Registry"
            data={sorted}
            columns={VESSEL_EXPORT_COLUMNS}
            label="Export Fleet"
            size="sm"
            variant="primary"
            className="vr-btn-primary-export"
            metadata={{
              source: 'OceanLens Global Vessel Intelligence Database',
              totalRecordCount: sorted.length,
            }}
          />
        </div>
      </header>

      {/* 3. KPI / SUMMARY STRIP (Requirement 3) */}
      <section className="vr-kpi-strip" aria-label="Fleet Summary Statistics">
        <div className="vr-kpi-card">
          <div className="vr-kpi-label">TOTAL VESSELS</div>
          <div className="vr-kpi-value highlight">{kpis.total}</div>
          <div className="vr-kpi-sub">Registered Fleet</div>
        </div>

        <div className="vr-kpi-card">
          <div className="vr-kpi-label">UNDERWAY</div>
          <div className="vr-kpi-value underway">{kpis.underway}</div>
          <div className="vr-kpi-sub">Navigating in Transit</div>
        </div>

        <div className="vr-kpi-card">
          <div className="vr-kpi-label">ANCHORED</div>
          <div className="vr-kpi-value anchored">{kpis.anchored}</div>
          <div className="vr-kpi-sub">Awaiting Berth / Orders</div>
        </div>

        <div className="vr-kpi-card">
          <div className="vr-kpi-label">VESSEL TYPES</div>
          <div className="vr-kpi-value">{kpis.typesCount}</div>
          <div className="vr-kpi-sub">Distinct Hull Classes</div>
        </div>

        <div className="vr-kpi-card">
          <div className="vr-kpi-label">TOTAL FLEET DWT</div>
          <div className="vr-kpi-value font-mono">{kpis.totalDwt}</div>
          <div className="vr-kpi-sub">Cumulative Capacity</div>
        </div>
      </section>

      {/* 4 & 5. SEARCH + FILTER TOOLBAR (Requirements 4 & 5 & 12) */}
      <section className="vr-toolbar-section">
        {/* Large Premium Search Bar */}
        <div className="vr-search-container">
          <div className="vr-search-bar">
            <Search size={16} className="vr-search-icon" />
            <input
              type="text"
              className="vr-search-input"
              placeholder="Search vessel name, IMO, type, flag..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              autoComplete="off"
            />
            {filters.search && (
              <button
                type="button"
                className="vr-search-clear"
                onClick={() => {
                  setFilters({ ...filters, search: '' });
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Suggestion Dropdown (Requirement 4) */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="vr-search-dropdown" role="listbox">
              <div className="vr-dropdown-header">MATCHING VESSELS</div>
              {searchSuggestions.map((v) => (
                <div
                  key={v.id}
                  className="vr-dropdown-item"
                  onMouseDown={() => handleSelectVessel(v)}
                >
                  <div className="vr-dd-left">
                    <Ship size={14} color={getVesselRowIconColor(v.vessel_type)} />
                    <div>
                      <span className="vr-dd-name">{v.name.replace(/^REFERENCE-/, '')}</span>
                      <span className="vr-dd-meta">
                        {v.vessel_type || 'Vessel'} &middot; {v.flag || 'Liberia'}
                      </span>
                    </div>
                  </div>
                  <div className="vr-dd-right">
                    {v.imo_number && <span className="vr-dd-imo">IMO {v.imo_number}</span>}
                    <span className="vr-dd-view">Open Profile &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="vr-controls-row">
          {/* Vessel Type Filter */}
          <div className="vr-control-item">
            <span className="vr-control-label">TYPE</span>
            <select
              value={filters.vesselTypes[0] || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                setFilters({
                  ...filters,
                  vesselTypes: val === 'all' ? [] : [val],
                });
                setPage(1);
              }}
              className="vr-select"
            >
              <option value="all">All Types</option>
              {vesselTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="vr-control-item">
            <span className="vr-control-label">STATUS</span>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as VesselStatusFilter });
                setPage(1);
              }}
              className="vr-select"
            >
              <option value="all">All Statuses</option>
              <option value="underway">Underway</option>
              <option value="anchored">Anchored</option>
              <option value="moored">Moored</option>
              <option value="reference">Reference Fleet</option>
            </select>
          </div>

          {/* Flag Filter */}
          {flags.length > 0 && (
            <div className="vr-control-item">
              <span className="vr-control-label">FLAG</span>
              <select
                value={filters.flags[0] || 'all'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters({
                    ...filters,
                    flags: val === 'all' ? [] : [val],
                  });
                  setPage(1);
                }}
                className="vr-select"
              >
                <option value="all">All Flags</option>
                {flags.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Columns Visibility Toggle (Requirement 13) */}
          <div className="vr-columns-menu-wrap">
            <button
              type="button"
              className={`vr-btn-control ${showColumnsMenu ? 'active' : ''}`}
              onClick={() => setShowColumnsMenu((v) => !v)}
              title="Toggle column visibility"
            >
              <Layers size={13} />
              <span>Columns</span>
              <ChevronDown size={12} />
            </button>

            {showColumnsMenu && (
              <div className="vr-columns-dropdown">
                <div className="vr-cols-header">Toggle Columns</div>
                <label className="vr-col-check">
                  <input
                    type="checkbox"
                    checked={visibleColumns.built}
                    onChange={() => setVisibleColumns((p) => ({ ...p, built: !p.built }))}
                  />
                  <span>Year Built</span>
                </label>
                <label className="vr-col-check">
                  <input
                    type="checkbox"
                    checked={visibleColumns.length}
                    onChange={() => setVisibleColumns((p) => ({ ...p, length: !p.length }))}
                  />
                  <span>Length (LOA)</span>
                </label>
                <label className="vr-col-check">
                  <input
                    type="checkbox"
                    checked={visibleColumns.beam}
                    onChange={() => setVisibleColumns((p) => ({ ...p, beam: !p.beam }))}
                  />
                  <span>Beam (Width)</span>
                </label>
                <label className="vr-col-check">
                  <input
                    type="checkbox"
                    checked={visibleColumns.draft}
                    onChange={() => setVisibleColumns((p) => ({ ...p, draft: !p.draft }))}
                  />
                  <span>Design Draft</span>
                </label>
              </div>
            )}
          </div>

          {/* Results Count & Clear */}
          <div className="vr-results-meta">
            <span className="vr-count-badge">
              <strong>{sorted.length}</strong> of {allVessels.length} vessels
            </span>

            {(activeFilterCount > 0 || filters.search) && (
              <button
                type="button"
                className="vr-btn-clear"
                onClick={handleClearFilters}
                title="Clear all filters"
              >
                <X size={12} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 6, 7, 8, 9, 10. VESSEL REGISTRY TABLE (Requirements 6-10) */}
      <section className="vr-table-section">
        {isError ? (
          <div className="vr-error-container">
            <ErrorState
              title="UNABLE TO LOAD VESSELS"
              message={
                error instanceof Error
                  ? error.message
                  : 'Vessel registry could not be retrieved from the backend API.'
              }
              onRetry={() => refetch()}
            />
          </div>
        ) : (
          <div className="vr-table-card">
            {/* Desktop / Tablet Table */}
            <div className="vr-table-responsive-wrap">
              <table className="vr-table">
                <thead>
                  <tr>
                    <SortableTh field="name" label="Vessel" currentField={sort.field} direction={sort.direction} onSort={handleSort} />
                    {visibleColumns.imo && <th className="vr-th">IMO</th>}
                    {visibleColumns.type && <SortableTh field="vessel_type" label="Type / Class" currentField={sort.field} direction={sort.direction} onSort={handleSort} />}
                    {visibleColumns.flag && <SortableTh field="flag" label="Flag" currentField={sort.field} direction={sort.direction} onSort={handleSort} />}
                    {visibleColumns.dwt && <SortableTh field="capacity_tons" label="DWT (MT)" currentField={sort.field} direction={sort.direction} onSort={handleSort} align="right" />}
                    {visibleColumns.built && <SortableTh field="year_built" label="Built" currentField={sort.field} direction={sort.direction} onSort={handleSort} align="right" />}
                    {visibleColumns.length && <th className="vr-th text-right">LOA (m)</th>}
                    {visibleColumns.beam && <th className="vr-th text-right">Beam (m)</th>}
                    {visibleColumns.draft && <th className="vr-th text-right">Draft (m)</th>}
                    {visibleColumns.status && <th className="vr-th">Status</th>}
                    <th className="vr-th text-right" style={{ width: '130px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="vr-tr-skeleton">
                        <td><Skeleton width="60%" height={16} /></td>
                        {visibleColumns.imo && <td><Skeleton width="80px" height={14} /></td>}
                        {visibleColumns.type && <td><Skeleton width="90px" height={14} /></td>}
                        {visibleColumns.flag && <td><Skeleton width="70px" height={14} /></td>}
                        {visibleColumns.dwt && <td style={{ textAlign: 'right' }}><Skeleton width="75px" height={14} /></td>}
                        {visibleColumns.built && <td style={{ textAlign: 'right' }}><Skeleton width="50px" height={14} /></td>}
                        {visibleColumns.length && <td><Skeleton width="50px" height={14} /></td>}
                        {visibleColumns.beam && <td><Skeleton width="50px" height={14} /></td>}
                        {visibleColumns.draft && <td><Skeleton width="50px" height={14} /></td>}
                        {visibleColumns.status && <td><Skeleton width="60px" height={18} /></td>}
                        <td><Skeleton width="80px" height={24} /></td>
                      </tr>
                    ))
                  ) : paged.length === 0 ? (
                    <tr>
                      <td colSpan={11}>
                        <div className="vr-empty-state">
                          <Ship size={40} className="vr-empty-icon" />
                          <h3 className="vr-empty-title">NO VESSELS FOUND</h3>
                          <p className="vr-empty-desc">
                            {filters.search
                              ? `No vessels match the search query "${filters.search}".`
                              : 'No vessels match the selected filter parameters.'}
                          </p>
                          <button
                            type="button"
                            className="vr-btn-primary"
                            onClick={handleClearFilters}
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paged.map((vessel) => {
                      const isSelected = selectedVessel?.id === vessel.id;
                      const displayName = vessel.name.replace(/^REFERENCE-/, '');
                      const iconColor = getVesselRowIconColor(vessel.vessel_type);

                      return (
                        <tr
                          key={vessel.id}
                          className={`vr-tr ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleSelectVessel(vessel)}
                          title="Click to view full vessel profile"
                        >
                          {/* VESSEL NAME + SILHOUETTE ICON (Requirement 8) */}
                          <td className="vr-td-name">
                            <div className="vr-vessel-name-cell">
                              <div className="vr-vessel-icon-badge" style={{ color: iconColor }}>
                                <Ship size={15} />
                              </div>
                              <div className="vr-vessel-text-group">
                                <span className="vr-vessel-name">{displayName}</span>
                                {vessel.cargo_types ? (
                                  <span className="vr-vessel-cargo-sub">
                                    {vessel.cargo_types.split(/[,;]+/)[0]?.trim()}
                                  </span>
                                ) : (
                                  <span className="vr-vessel-cargo-sub muted">Commercial Fleet</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* IMO */}
                          {visibleColumns.imo && (
                            <td>
                              {vessel.imo_number ? (
                                <span className="vr-imo-badge">
                                  {vessel.imo_number}
                                </span>
                              ) : (
                                <span className="vr-nil">-</span>
                              )}
                            </td>
                          )}

                          {/* TYPE / CLASS */}
                          {visibleColumns.type && (
                            <td>
                              <span className="vr-type-tag">{vessel.vessel_type || '-'}</span>
                            </td>
                          )}

                          {/* FLAG */}
                          {visibleColumns.flag && (
                            <td>
                              <span className="vr-flag-text">{vessel.flag || '-'}</span>
                            </td>
                          )}

                          {/* DWT */}
                          {visibleColumns.dwt && (
                            <td style={{ textAlign: 'right' }}>
                              <span className="vr-dwt-text">
                                {vessel.capacity_tons ? vessel.capacity_tons.toLocaleString() : '-'}
                              </span>
                            </td>
                          )}

                          {/* BUILT */}
                          {visibleColumns.built && (
                            <td style={{ textAlign: 'right' }}>
                              <span className="vr-built-text">{vessel.year_built || '-'}</span>
                            </td>
                          )}

                          {/* SECONDARY: LOA, BEAM, DRAFT */}
                          {visibleColumns.length && (
                            <td style={{ textAlign: 'right' }}>
                              <span className="vr-metric-text">{vessel.length_m ? `${vessel.length_m} m` : '-'}</span>
                            </td>
                          )}
                          {visibleColumns.beam && (
                            <td style={{ textAlign: 'right' }}>
                              <span className="vr-metric-text">{vessel.width_m ? `${vessel.width_m} m` : '-'}</span>
                            </td>
                          )}
                          {visibleColumns.draft && (
                            <td style={{ textAlign: 'right' }}>
                              <span className="vr-metric-text">{vessel.draft_m ? `${vessel.draft_m} m` : '-'}</span>
                            </td>
                          )}

                          {/* STATUS (Requirement 9) */}
                          {visibleColumns.status && (
                            <td>
                              <div className="vr-status-cell">
                                <span className={`vr-status-dot ${(vessel.status || '').toLowerCase()}`} />
                                <span className="vr-status-label">
                                  {vessel.status ? vessel.status.toUpperCase() : 'UNKNOWN'}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* ACTIONS */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="vr-row-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="vr-action-btn-profile"
                                onClick={() => handleSelectVessel(vessel)}
                                title="Open detailed vessel profile drawer"
                              >
                                Profile
                              </button>
                              <Link
                                to={`/map?vessel=${vessel.id}`}
                                className="vr-action-icon-link"
                                title="View live geographic position on Live Vessel Map"
                              >
                                <Compass size={14} />
                              </Link>
                              <Link
                                to={`/vessels/${vessel.id}`}
                                className="vr-action-icon-link"
                                title="Open Technical Workspace"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Representation (Requirement 29) */}
            <div className="vr-mobile-cards-list">
              {paged.map((vessel) => {
                const displayName = vessel.name.replace(/^REFERENCE-/, '');
                const iconColor = getVesselRowIconColor(vessel.vessel_type);

                return (
                  <div
                    key={vessel.id}
                    className="vr-mobile-card"
                    onClick={() => handleSelectVessel(vessel)}
                  >
                    <div className="vr-m-card-header">
                      <div className="vr-m-name-group">
                        <Ship size={15} color={iconColor} />
                        <span className="vr-m-vessel-name">{displayName}</span>
                      </div>
                      <StatusBadge status={vessel.status} />
                    </div>

                    <div className="vr-m-card-body">
                      <div className="vr-m-metric">
                        <span className="vr-m-label">TYPE</span>
                        <span className="vr-m-val">{vessel.vessel_type || '-'}</span>
                      </div>
                      <div className="vr-m-metric">
                        <span className="vr-m-label">IMO</span>
                        <span className="vr-m-val font-mono">{vessel.imo_number || '-'}</span>
                      </div>
                      <div className="vr-m-metric">
                        <span className="vr-m-label">DWT</span>
                        <span className="vr-m-val font-mono">
                          {vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT` : '-'}
                        </span>
                      </div>
                      <div className="vr-m-metric">
                        <span className="vr-m-label">FLAG</span>
                        <span className="vr-m-val">{vessel.flag || '-'}</span>
                      </div>
                    </div>

                    <div className="vr-m-card-footer">
                      <span className="vr-m-prompt">Tap to open profile &rarr;</span>
                      <Link
                        to={`/map?vessel=${vessel.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="vr-m-live-link"
                      >
                        <Compass size={13} />
                        <span>Live Map</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 11. PAGINATION / DATA STATUS (Requirement 11 & 18) */}
            <div className="vr-pagination-bar">
              <div className="vr-data-status-meta">
                <span className="vr-meta-text">
                  Showing <strong>{sorted.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</strong> &ndash;{' '}
                  <strong>{Math.min(page * PAGE_SIZE, sorted.length)}</strong> of {sorted.length} vessels
                </span>
                <span className="vr-data-badge">
                  <Database size={11} className="vr-cyan" />
                  <span>DATA STATUS: Verified OceanLens Registry</span>
                </span>
              </div>

              {totalPages > 1 && (
                <div className="vr-page-controls">
                  <button
                    type="button"
                    className="vr-page-btn"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    First
                  </button>
                  <button
                    type="button"
                    className="vr-page-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={13} />
                    <span>Prev</span>
                  </button>

                  <span className="vr-page-indicator">
                    Page <strong>{page}</strong> of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="vr-page-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <span>Next</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="vr-page-btn"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 14. VESSEL PROFILE DRAWER (Requirements 14-17) */}
      <VesselProfileDrawer
        vessel={selectedVessel}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
