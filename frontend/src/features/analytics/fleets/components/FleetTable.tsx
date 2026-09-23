/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Commercial Fleet Registry & Live Voyage Tracking Table
 */

import { useState, useMemo, useEffect } from 'react';
import type { FC } from 'react';
import {
  Ship,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MapPin,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import type { FleetVesselRecord, FleetDeploymentStatus } from '../../../../types/fleets';

interface FleetTableProps {
  vessels: FleetVesselRecord[];
  selectedVesselId: number | null;
  onSelectVessel: (vessel: FleetVesselRecord) => void;
}

type SortField = 'name' | 'vesselClass' | 'dwt' | 'yearBuilt' | 'ownerName' | 'operatorName' | 'region' | 'speed';

const getStatusBadge = (status: FleetDeploymentStatus) => {
  switch (status) {
    case 'underway':
      return (
        <span className="fi-badge fi-badge-underway">
          <span className="fi-status-dot" style={{ backgroundColor: '#10B981' }} />
          <span>Underway</span>
        </span>
      );
    case 'anchored':
      return (
        <span className="fi-badge fi-badge-anchored">
          <span className="fi-status-dot" style={{ backgroundColor: '#F59E0B' }} />
          <span>Anchored</span>
        </span>
      );
    case 'loading':
      return (
        <span className="fi-badge fi-badge-loading">
          <span className="fi-status-dot" style={{ backgroundColor: '#60A5FA' }} />
          <span>Loading</span>
        </span>
      );
    case 'discharging':
      return (
        <span className="fi-badge fi-badge-discharging">
          <span className="fi-status-dot" style={{ backgroundColor: '#C084FC' }} />
          <span>Discharging</span>
        </span>
      );
    case 'in_repair':
      return (
        <span className="fi-badge fi-badge-repair">
          <span className="fi-status-dot" style={{ backgroundColor: '#F43F5E' }} />
          <span>In Repair</span>
        </span>
      );
    default:
      return (
        <span className="fi-badge fi-badge-underway">
          <span className="fi-status-dot" style={{ backgroundColor: '#10B981' }} />
          <span>{status}</span>
        </span>
      );
  }
};

const getCiiBadge = (rating: string) => {
  const r = (rating || 'B').toUpperCase();
  let cls = 'fi-cii-b';
  if (r === 'A') cls = 'fi-cii-a';
  else if (r === 'B') cls = 'fi-cii-b';
  else if (r === 'C') cls = 'fi-cii-c';
  else if (r === 'D') cls = 'fi-cii-d';
  else if (r === 'E') cls = 'fi-cii-e';

  return <span className={`fi-cii-badge ${cls}`}>{r}</span>;
};

export const FleetTable: FC<FleetTableProps> = ({
  vessels,
  selectedVesselId,
  onSelectVessel,
}) => {
  const [sortField, setSortField] = useState<SortField>('dwt');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending
    }
    setCurrentPage(1);
  };

  const sortedVessels = useMemo(() => {
    return [...vessels].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'vesselClass':
          comparison = a.vesselClass.localeCompare(b.vesselClass);
          break;
        case 'dwt':
          comparison = a.dwt - b.dwt;
          break;
        case 'yearBuilt':
          comparison = a.yearBuilt - b.yearBuilt;
          break;
        case 'ownerName':
          comparison = a.ownerName.localeCompare(b.ownerName);
          break;
        case 'operatorName':
          comparison = a.operatorName.localeCompare(b.operatorName);
          break;
        case 'region':
          comparison = a.deployment.region.localeCompare(b.deployment.region);
          break;
        case 'speed':
          comparison = a.deployment.speedKnots - b.deployment.speedKnots;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [vessels, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedVessels.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedVessels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedVessels.slice(start, start + pageSize);
  }, [sortedVessels, currentPage, pageSize]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ color: '#7189A3', flexShrink: 0 }} />;
    }
    return sortAsc ? (
      <ArrowUp size={12} style={{ color: '#22D3EE', flexShrink: 0 }} />
    ) : (
      <ArrowDown size={12} style={{ color: '#22D3EE', flexShrink: 0 }} />
    );
  };

  const startRecord = sortedVessels.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, sortedVessels.length);

  return (
    <div className="fi-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Table Header Bar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(100, 190, 240, 0.16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="fi-kpi-icon-wrap" style={{ width: '32px', height: '32px' }}>
            <Ship size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F1F5F9' }}>
              Commercial Fleet Registry & Live Voyage Tracking
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#94A3B8' }}>
              Verified AIS positions, commercial charters, speed over ground, and operational status
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="fi-select"
              style={{ width: '68px', height: '30px', padding: '0 8px', fontSize: '12px' }}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600 }}>
            {sortedVessels.length} Vessels Verified
          </span>
        </div>
      </div>

      {/* Semantic Table with Rigid Geometry */}
      <div className="fi-table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="fi-table">
          <thead>
            <tr>
              {/* Col 1: Vessel & IMO */}
              <th
                onClick={() => handleSort('name')}
                className="fi-col-vessel sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Vessel & IMO</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* Col 2: Class & Cargo */}
              <th
                onClick={() => handleSort('vesselClass')}
                className="fi-col-class sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Class & Cargo</span>
                  {renderSortIcon('vesselClass')}
                </div>
              </th>

              {/* Col 3: DWT & Built */}
              <th
                onClick={() => handleSort('dwt')}
                className="fi-col-dwt sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>DWT</span>
                  {renderSortIcon('dwt')}
                </div>
              </th>

              {/* Col 4: Asset Owner */}
              <th
                onClick={() => handleSort('ownerName')}
                className="fi-col-owner sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Asset Owner</span>
                  {renderSortIcon('ownerName')}
                </div>
              </th>

              {/* Col 5: Commercial Operator */}
              <th
                onClick={() => handleSort('operatorName')}
                className="fi-col-operator sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Commercial Operator</span>
                  {renderSortIcon('operatorName')}
                </div>
              </th>

              {/* Col 6: Region & Port */}
              <th
                onClick={() => handleSort('region')}
                className="fi-col-region sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Region & Port</span>
                  {renderSortIcon('region')}
                </div>
              </th>

              {/* Col 7: Status */}
              <th className="fi-col-status">
                <span>Status</span>
              </th>

              {/* Col 8: Speed / ETA */}
              <th
                onClick={() => handleSort('speed')}
                className="fi-col-speed sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  <span>Speed / ETA</span>
                  {renderSortIcon('speed')}
                </div>
              </th>

              {/* Col 9: CII Rating */}
              <th className="fi-col-cii">
                <span>CII</span>
              </th>

              {/* Col 10: Actions */}
              <th className="fi-col-action">
                <span>Inspect</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedVessels.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8' }}>
                  No vessels match the active filter criteria. Try resetting or broadening your filters.
                </td>
              </tr>
            ) : (
              paginatedVessels.map((v) => {
                const isSelected = v.id === selectedVesselId;

                return (
                  <tr
                    key={v.id}
                    onClick={() => onSelectVessel(v)}
                    className={isSelected ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Col 1: Vessel & IMO */}
                    <td className="fi-col-vessel">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ship size={14} style={{ color: '#22D3EE', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                            IMO {v.imoNumber} • {v.flag}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Class & Cargo */}
                    <td className="fi-col-class">
                      <div style={{ fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.vesselClass}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.cargoCategory}
                      </div>
                    </td>

                    {/* Col 3: DWT & Built */}
                    <td className="fi-col-dwt">
                      <div style={{ fontWeight: 700, color: '#F1F5F9', fontFamily: 'monospace' }}>
                        {v.dwt.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#7189A3' }}>
                        Built {v.yearBuilt}
                      </div>
                    </td>

                    {/* Col 4: Asset Owner */}
                    <td className="fi-col-owner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Building2 size={13} style={{ color: '#C084FC', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.ownerName}</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#7189A3' }}>
                        {v.ownerCountry}
                      </div>
                    </td>

                    {/* Col 5: Commercial Operator */}
                    <td className="fi-col-operator">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#38BDF8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Briefcase size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.operatorName}</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#7189A3' }}>
                        {v.operatorCountry}
                      </div>
                    </td>

                    {/* Col 6: Region & Port */}
                    <td className="fi-col-region">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin size={12} style={{ color: '#22D3EE', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.deployment.region}</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.deployment.destinationPort || 'At Sea'} {v.deployment.country ? `(${v.deployment.country})` : ''}
                      </div>
                    </td>

                    {/* Col 7: Status */}
                    <td className="fi-col-status">
                      {getStatusBadge(v.deployment.status)}
                    </td>

                    {/* Col 8: Speed / ETA */}
                    <td className="fi-col-speed">
                      <div style={{ fontWeight: 700, color: '#F1F5F9', fontFamily: 'monospace' }}>
                        {v.deployment.speedKnots.toFixed(1)} kts
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {v.deployment.eta || 'In Port'}
                      </div>
                    </td>

                    {/* Col 9: CII Rating */}
                    <td className="fi-col-cii">
                      {getCiiBadge(v.ciiRating)}
                    </td>

                    {/* Col 10: Inspect Action */}
                    <td className="fi-col-action">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVessel(v);
                        }}
                        className="fi-btn fi-btn-secondary"
                        style={{ width: '30px', height: '30px', padding: 0, justifyContent: 'center', margin: '0 auto' }}
                        title="Inspect Vessel Profile"
                      >
                        <ExternalLink size={13} style={{ color: '#22D3EE' }} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Summary Footer */}
      <div className="fi-pagination-container">
        <div className="fi-pagination-info">
          Showing <strong style={{ color: '#F1F5F9' }}>{startRecord}</strong> to <strong style={{ color: '#F1F5F9' }}>{endRecord}</strong> of <strong style={{ color: '#F1F5F9' }}>{sortedVessels.length}</strong> vessels
        </div>

        <div className="fi-pagination-controls">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="fi-page-btn"
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="fi-page-btn"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          <span style={{ fontSize: '12px', color: '#94A3B8', margin: '0 8px' }}>
            Page <strong style={{ color: '#F1F5F9' }}>{currentPage}</strong> of <strong style={{ color: '#F1F5F9' }}>{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="fi-page-btn"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="fi-page-btn"
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

