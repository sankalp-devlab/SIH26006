import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Search,
  Ship,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  ExternalLink,
  RefreshCw,
  Layers,
} from 'lucide-react';
import type { Vessel } from '../../../types/vessel';
import type { VesselSortField, SortDirection } from '../../../types/vessel-filters';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import { ExportButton } from '../../../components/export';
import type { ExportColumnDefinition } from '../../../types/export-sharing';

interface FleetListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: Vessel[];
  selectedVesselId: number | null;
  onSelectVessel: (vesselId: number) => void;
  onRefetch?: () => void;
  isFetching?: boolean;
}

const VESSEL_EXPORT_COLUMNS: ExportColumnDefinition<Vessel>[] = [
  { key: 'name', label: 'Vessel Name', defaultVisible: true },
  { key: 'imo_number', label: 'IMO Number', defaultVisible: true },
  { key: 'vessel_type', label: 'Vessel Type', defaultVisible: true },
  { key: 'flag', label: 'Flag', defaultVisible: true },
  { key: 'status', label: 'Status', formatter: 'status', defaultVisible: true },
  { key: 'capacity_tons', label: 'DWT (MT)', formatter: 'number', defaultVisible: true },
  { key: 'year_built', label: 'Year Built', defaultVisible: true },
  { key: 'speed_laden_knots', label: 'Speed Laden (kts)', formatter: 'number', defaultVisible: true },
  { key: 'fuel_laden_mt_day', label: 'Fuel Laden (MT/day)', formatter: 'number', defaultVisible: false },
  { key: 'cargo_types', label: 'Cargo Types', defaultVisible: true },
];

function sortVessels(vessels: Vessel[], field: VesselSortField, direction: SortDirection): Vessel[] {
  return [...vessels].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[field];
    const bv = (b as unknown as Record<string, unknown>)[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    let cmp = 0;
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    }
    return direction === 'asc' ? cmp : -cmp;
  });
}

export function FleetListDrawer({
  isOpen,
  onClose,
  vessels,
  selectedVesselId,
  onSelectVessel,
  onRefetch,
  isFetching = false,
}: FleetListDrawerProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<VesselSortField>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const handleSort = (field: VesselSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filteredVessels = useMemo(() => {
    if (!search.trim()) return vessels;
    const q = search.toLowerCase();
    return vessels.filter((v) => {
      const nameMatch = v.name?.toLowerCase().includes(q);
      const imoMatch = v.imo_number?.toLowerCase().includes(q);
      const typeMatch = v.vessel_type?.toLowerCase().includes(q);
      const flagMatch = v.flag?.toLowerCase().includes(q);
      return nameMatch || imoMatch || typeMatch || flagMatch;
    });
  }, [vessels, search]);

  const sortedVessels = useMemo(() => {
    return sortVessels(filteredVessels, sortField, sortDir);
  }, [filteredVessels, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedVessels.length / PAGE_SIZE));
  const pagedVessels = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedVessels.slice(start, start + PAGE_SIZE);
  }, [sortedVessels, page]);

  if (!isOpen) return null;

  return (
    <div className="vmp-fleet-drawer-backdrop" onClick={onClose}>
      <aside
        className="vmp-fleet-drawer"
        role="dialog"
        aria-label="Fleet & Vessel Registry Table"
        onClick={(e) => e.stopPropagation()}
      >
        {/* DRAWER HEADER */}
        <div className="vmp-fleet-drawer-header">
          <div className="vmp-fleet-drawer-title-wrap">
            <div className="vmp-fleet-drawer-icon">
              <Ship size={18} />
            </div>
            <div>
              <h2 className="vmp-fleet-drawer-title">FLEET &amp; VESSEL REGISTRY</h2>
              <p className="vmp-fleet-drawer-desc">
                {vessels.length} vessels registered &middot; Select any vessel to focus live map
              </p>
            </div>
          </div>
          <div className="vmp-fleet-drawer-actions">
            {onRefetch && (
              <button
                type="button"
                className="vmp-btn-ghost-icon"
                onClick={onRefetch}
                disabled={isFetching}
                title="Refresh fleet dataset"
                aria-label="Refresh fleet"
              >
                <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
              </button>
            )}
            <ExportButton
              dataset="Vessel Fleet Registry"
              title="Export Vessel Registry"
              data={sortedVessels}
              columns={VESSEL_EXPORT_COLUMNS}
              label="Export"
              size="sm"
              variant="ghost"
              className="vmp-btn-export"
              metadata={{
                source: 'OceanLens Maritime Live Fleet Registry',
                totalRecordCount: sortedVessels.length,
              }}
            />
            <button
              type="button"
              className="vmp-fleet-drawer-close"
              onClick={onClose}
              title="Close Fleet Registry"
              aria-label="Close Fleet Registry"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="vmp-fleet-drawer-toolbar">
          <div className="vmp-fleet-search-wrap">
            <Search size={14} className="vmp-fleet-search-icon" />
            <input
              type="text"
              placeholder="Search by name, IMO, type, flag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="vmp-fleet-search-input"
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="vmp-fleet-search-clear"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="vmp-fleet-meta-chip">
            <Layers size={13} />
            <span>
              {sortedVessels.length} / {vessels.length}
            </span>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="vmp-fleet-drawer-table-wrap">
          <table className="vmp-fleet-dark-table">
            <thead>
              <tr>
                <th
                  className={`vmp-fth ${sortField === 'name' ? 'active' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  <span className="vmp-fth-inner">
                    <span>Vessel Name</span>
                    {sortField === 'name' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                    )}
                  </span>
                </th>
                <th className="vmp-fth">IMO</th>
                <th
                  className={`vmp-fth ${sortField === 'vessel_type' ? 'active' : ''}`}
                  onClick={() => handleSort('vessel_type')}
                >
                  <span className="vmp-fth-inner">
                    <span>Type / Class</span>
                    {sortField === 'vessel_type' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                    )}
                  </span>
                </th>
                <th
                  className={`vmp-fth ${sortField === 'flag' ? 'active' : ''}`}
                  onClick={() => handleSort('flag')}
                >
                  <span className="vmp-fth-inner">
                    <span>Flag</span>
                    {sortField === 'flag' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                    )}
                  </span>
                </th>
                <th
                  className={`vmp-fth text-right ${sortField === 'capacity_tons' ? 'active' : ''}`}
                  onClick={() => handleSort('capacity_tons')}
                  style={{ textAlign: 'right' }}
                >
                  <span className="vmp-fth-inner" style={{ justifyContent: 'flex-end' }}>
                    <span>DWT (MT)</span>
                    {sortField === 'capacity_tons' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                    )}
                  </span>
                </th>
                <th
                  className={`vmp-fth text-right ${sortField === 'year_built' ? 'active' : ''}`}
                  onClick={() => handleSort('year_built')}
                  style={{ textAlign: 'right' }}
                >
                  <span className="vmp-fth-inner" style={{ justifyContent: 'flex-end' }}>
                    <span>Built</span>
                    {sortField === 'year_built' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                    )}
                  </span>
                </th>
                <th className="vmp-fth">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagedVessels.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="vmp-fleet-empty">
                      <Ship size={36} style={{ opacity: 0.3 }} />
                      <p>No vessels found matching &ldquo;{search}&rdquo;</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedVessels.map((vessel) => {
                  const isSelected = selectedVesselId === vessel.id;
                  const displayName = vessel.name.replace(/^REFERENCE-/, '');

                  return (
                    <tr
                      key={vessel.id}
                      className={`vmp-ftr ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => onSelectVessel(vessel.id)}
                      title="Click to track vessel on Live Map"
                    >
                      <td className="vmp-ftd-name">
                        <div className="vmp-name-row">
                          <span className="vmp-ship-dot"></span>
                          <span className="vmp-name-text">{displayName}</span>
                          <Link
                            to={`/vessels/${vessel.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="vmp-ftd-link"
                            title="Open Technical Workspace"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                        {vessel.cargo_types && (
                          <span className="vmp-ftd-cargo">
                            {vessel.cargo_types.split(/[,;]+/)[0]?.trim()}
                          </span>
                        )}
                      </td>
                      <td>
                        {vessel.imo_number ? (
                          <span className="vmp-ftd-imo">
                            <SlidersHorizontal size={10} />
                            {vessel.imo_number}
                          </span>
                        ) : (
                          <span className="vmp-ftd-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className="vmp-ftd-type">{vessel.vessel_type || '-'}</span>
                      </td>
                      <td>
                        <span className="vmp-ftd-flag">{vessel.flag || '-'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="vmp-ftd-dwt">
                          {vessel.capacity_tons
                            ? vessel.capacity_tons.toLocaleString()
                            : '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="vmp-ftd-year">{vessel.year_built || '-'}</span>
                      </td>
                      <td>
                        <StatusBadge status={vessel.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* DRAWER FOOTER / PAGINATION */}
        <div className="vmp-fleet-drawer-footer">
          <span className="vmp-fleet-footer-info">
            Page {page} of {totalPages} &middot; {sortedVessels.length} vessels
          </span>
          <div className="vmp-fleet-footer-btns">
            <button
              type="button"
              className="vmp-btn-page"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              type="button"
              className="vmp-btn-page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="vmp-btn-page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              type="button"
              className="vmp-btn-page"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
