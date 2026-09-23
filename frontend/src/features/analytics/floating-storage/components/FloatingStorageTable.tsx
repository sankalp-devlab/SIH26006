import { useState, useMemo, useEffect } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Ship,
  Clock,
  MapPin,
  Eye,
  RotateCcw,
} from 'lucide-react';
import type {
  FloatingStorageObservationRecord,
  FloatingStorageCargoType,
} from '../../../../types/floating-storage';

interface FloatingStorageTableProps {
  vessels: FloatingStorageObservationRecord[];
  selectedVesselId: string | null;
  onSelectVessel: (id: string) => void;
  onResetFilters: () => void;
}

type SortField =
  | 'vesselName'
  | 'vesselClass'
  | 'cargoType'
  | 'volumeBbl'
  | 'estimatedCargoValueUsd'
  | 'stationaryDays'
  | 'region';

type SortDirection = 'asc' | 'desc';

const CARGO_BADGE_CLASSES: Record<FloatingStorageCargoType, string> = {
  'Crude Oil': 'fs-cargo-crude',
  'Clean Petroleum Products': 'fs-cargo-clean',
  'Dirty Petroleum Products / Fuel Oil': 'fs-cargo-dirty',
  'LNG Gas': 'fs-cargo-lng',
  'LPG Gas': 'fs-cargo-lpg',
  Chemicals: 'fs-cargo-chem',
};

export function FloatingStorageTable({
  vessels,
  selectedVesselId,
  onSelectVessel,
  onResetFilters,
}: FloatingStorageTableProps) {
  const [sortField, setSortField] = useState<SortField>('stationaryDays');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedVessels = useMemo(() => {
    return [...vessels].sort((a, b) => {
      let valA: string | number = a[sortField] ?? 0;
      let valB: string | number = b[sortField] ?? 0;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA);
      valB = Number(valB);
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }, [vessels, sortField, sortDir]);

  // Reset to first page when vessels dataset or sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [vessels.length, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedVessels.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedVessels = useMemo(() => {
    return sortedVessels.slice(startIndex, startIndex + pageSize);
  }, [sortedVessels, startIndex, pageSize]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} style={{ opacity: 0.45 }} />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp size={13} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
    ) : (
      <ChevronDown size={13} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
    );
  };

  if (vessels.length === 0) {
    return (
      <div
        className="fs-card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ship size={38} style={{ color: 'var(--ol-text-muted, #64748B)', marginBottom: '12px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', margin: 0 }}>
          No Floating Storage Vessels Found
        </h3>
        <p
          style={{
            fontSize: '12.5px',
            color: 'var(--ol-text-secondary, #94A3B8)',
            maxWidth: '440px',
            margin: '8px 0 20px 0',
            lineHeight: 1.5,
          }}
        >
          No stationary vessels match your current search, cargo, region, or duration filters. Try resetting your filters to view all offshore surveillance targets.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="fs-btn fs-btn-primary"
        >
          <RotateCcw size={13} />
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="fs-card" style={{ padding: '20px' }}>
      {/* Table Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="fs-section-title" style={{ margin: 0 }}>
              Floating Storage Fleet Registry
            </h3>
            <span className="fs-header-badge">{sortedVessels.length} Identified Units</span>
          </div>
          <p className="fs-section-subtitle" style={{ margin: '4px 0 0 0' }}>
            Surveillance list of stationary vessels (&ge; 7 days anchored / idle) with cargo telemetry &amp; commercial valuations
          </p>
        </div>

        {/* Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="fs-filter-select"
            style={{ padding: '4px 8px', fontSize: '12px', minWidth: '95px' }}
          >
            <option value={15}>15 vessels</option>
            <option value={25}>25 vessels</option>
            <option value={50}>50 vessels</option>
            <option value={100}>100 vessels</option>
          </select>
        </div>
      </div>

      {/* Horizontally Isolated Table Scroll Container */}
      <div className="fs-table-container">
        <table className="fs-table">
          <colgroup>
            <col className="fs-col-vessel" />
            <col className="fs-col-class" />
            <col className="fs-col-cargo" />
            <col className="fs-col-volume" />
            <col className="fs-col-value" />
            <col className="fs-col-hub" />
            <col className="fs-col-days" />
            <col className="fs-col-action" />
          </colgroup>
          <thead>
            <tr>
              <th
                className="sortable"
                onClick={() => handleSort('vesselName')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Vessel &amp; IMO</span>
                  {renderSortIndicator('vesselName')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('vesselClass')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Class &amp; Flag</span>
                  {renderSortIndicator('vesselClass')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('cargoType')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Cargo &amp; Grade</span>
                  {renderSortIndicator('cargoType')}
                </div>
              </th>
              <th
                className="sortable"
                style={{ textAlign: 'right' }}
                onClick={() => handleSort('volumeBbl')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Volume (BBL / MT)</span>
                  {renderSortIndicator('volumeBbl')}
                </div>
              </th>
              <th
                className="sortable"
                style={{ textAlign: 'right' }}
                onClick={() => handleSort('estimatedCargoValueUsd')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Est. Value</span>
                  {renderSortIndicator('estimatedCargoValueUsd')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('region')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Offshore Hub &amp; Anchorage</span>
                  {renderSortIndicator('region')}
                </div>
              </th>
              <th
                className="sortable"
                style={{ textAlign: 'center' }}
                onClick={() => handleSort('stationaryDays')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span>Stationary</span>
                  {renderSortIndicator('stationaryDays')}
                </div>
              </th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVessels.map((v) => {
              const isSelected = v.id === selectedVesselId;
              const cargoBadgeClass = CARGO_BADGE_CLASSES[v.cargoType] ?? 'fs-cargo-dirty';

              return (
                <tr
                  key={v.id}
                  onClick={() => onSelectVessel(v.id)}
                  className={isSelected ? 'selected' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Vessel Name & IMO */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ship size={15} style={{ color: 'var(--ol-amber, #F59E0B)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: isSelected ? 'var(--ol-amber, #F59E0B)' : 'var(--ol-text-primary, #F1F5F9)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {v.vesselName}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                          IMO {v.imoNumber} • Built {v.yearBuilt}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Class & Flag */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {v.vesselClass}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                      {v.flag} • {(v.dwt / 1000).toFixed(0)}k DWT
                    </div>
                  </td>

                  {/* Cargo & Grade */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <span className={`fs-cargo-badge ${cargoBadgeClass}`}>
                        {v.cargoType}
                      </span>
                      {v.crudeGrade && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ol-amber, #F59E0B)' }}>
                          {v.crudeGrade}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Volume (BBL / MT) */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: 'var(--ol-cyan, #22D3EE)',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      {(v.volumeBbl / 1_000_000).toFixed(2)}M bbl
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                      {(v.volumeMt / 1_000).toFixed(0)}k MT ({v.capacityUtilizationPct}%)
                    </div>
                  </td>

                  {/* Cargo Value */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: 'var(--ol-emerald, #10B981)',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      ${(v.estimatedCargoValueUsd / 1_000_000).toFixed(1)}M
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                      USD Val
                    </div>
                  </td>

                  {/* Offshore Hub & Anchorage */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      <MapPin size={12} style={{ color: 'var(--ol-amber, #F59E0B)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.anchorageName}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        color: 'var(--ol-text-muted, #64748B)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px',
                      }}
                    >
                      {v.region.split('&')[0]} • {v.country}
                    </div>
                  </td>

                  {/* Stationary Days & SOG */}
                  <td style={{ textAlign: 'center' }}>
                    <div
                      className="fs-duration-pill"
                      style={{
                        color:
                          v.stationaryDays >= 30
                            ? '#C084FC'
                            : v.stationaryDays >= 14
                            ? 'var(--ol-amber, #F59E0B)'
                            : 'var(--ol-text-primary, #F1F5F9)',
                      }}
                    >
                      <Clock
                        size={11}
                        style={{
                          color:
                            v.stationaryDays >= 30
                              ? '#C084FC'
                              : 'var(--ol-amber, #F59E0B)',
                        }}
                      />
                      <span>{v.stationaryDays}d</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--ol-text-muted, #64748B)', marginTop: '3px' }}>
                      {v.speedKnots.toFixed(1)} kts • {v.draftMeters.toFixed(1)}m
                    </div>
                  </td>

                  {/* Action Button */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVessel(v.id);
                      }}
                      className="fs-inspect-btn"
                      title="Inspect vessel telemetry & commercial details"
                    >
                      <Eye size={12} />
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="fs-pagination-container">
        <div>
          Showing <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>{startIndex + 1}</span> to{' '}
          <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
            {Math.min(startIndex + pageSize, sortedVessels.length)}
          </span>{' '}
          of <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>{sortedVessels.length}</span> vessels
        </div>

        <div className="fs-pagination-controls">
          <button
            type="button"
            className="fs-pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={13} style={{ marginRight: '2px' }} />
            Previous
          </button>

          <span style={{ fontSize: '12px', padding: '0 6px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
            Page <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{currentPage}</strong> of{' '}
            <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{totalPages}</strong>
          </span>

          <button
            type="button"
            className="fs-pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight size={13} style={{ marginLeft: '2px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

