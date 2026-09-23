import React, { useState, useMemo } from 'react';
import {
  Mail,
  MessageSquare,
  Radio,
  FileCode,
  PenTool,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Ship,
  Lock,
  Eye,
  CheckCircle2,
  Archive,
  Share2,
  GitCompare,
  ArrowRight,
} from 'lucide-react';
import type { CargoRecord } from '../../../types/cargo';
import { ProvenanceBadge } from '../../../components/provenance';

interface CargoTableProps {
  cargos: CargoRecord[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onSelectAll: (items: CargoRecord[]) => void;
  onClearSelection: () => void;
  onOpenDetail: (cargo: CargoRecord) => void;
  onOpenVesselMatch: (cargo: CargoRecord) => void;
  onOpenShare: (cargo: CargoRecord) => void;
  onValidateSingle: (cargoId: number) => void;
  onArchiveSingle: (cargoId: number) => void;
  onRestoreSingle: (cargoId: number) => void;
  onValidateSelected: () => void;
  onArchiveSelected: () => void;
  onOpenCompare: (cargos: CargoRecord[]) => void;
  isLoading?: boolean;
}

export const CargoTable: React.FC<CargoTableProps> = ({
  cargos,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenDetail,
  onOpenVesselMatch,
  onOpenShare,
  onValidateSingle: _onValidateSingle,
  onArchiveSingle,
  onRestoreSingle,
  onValidateSelected,
  onArchiveSelected,
  onOpenCompare,
  isLoading: _isLoading,
}) => {
  const [sortKey, setSortKey] = useState<keyof CargoRecord | 'origin' | 'destination'>('ready_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof CargoRecord | 'origin' | 'destination') => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedCargos = useMemo(() => {
    return [...cargos].sort((a, b) => {
      let valA: unknown;
      let valB: unknown;

      if (sortKey === 'origin') {
        valA = a.origin_port.name;
        valB = b.origin_port.name;
      } else if (sortKey === 'destination') {
        valA = a.destination_port.name;
        valB = b.destination_port.name;
      } else {
        valA = a[sortKey];
        valB = b[sortKey];
      }

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDir === 'asc' ? -1 : 1;
      if (strA > strB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [cargos, sortKey, sortDir]);

  const renderSourceIcon = (source: CargoRecord['source']) => {
    switch (source) {
      case 'email':
        return <span title="Ingested via Email"><Mail size={12} color="#00d8ff" /></span>;
      case 'whatsapp':
        return <span title="Ingested via WhatsApp"><MessageSquare size={12} color="#10b981" /></span>;
      case 'slack':
        return <span title="Ingested via Slack"><Radio size={12} color="#a855f7" /></span>;
      case 'edi':
        return <span title="Ingested via EDI/API"><FileCode size={12} color="#f59e0b" /></span>;
      case 'manual':
      default:
        return <span title="Manual Entry"><PenTool size={12} color="#64748b" /></span>;
    }
  };

  const renderValidationPill = (status: CargoRecord['validation_status'], issuesCount: number) => {
    if (status === 'valid') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <ShieldCheck size={11} /> Valid
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
          title={`${issuesCount} warning(s)`}
        >
          <AlertTriangle size={11} /> Warning ({issuesCount})
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '11px',
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: '4px',
          backgroundColor: 'rgba(244, 63, 94, 0.12)',
          color: '#f43f5e',
          border: '1px solid rgba(244, 63, 94, 0.25)',
        }}
        title={`${issuesCount} error(s)`}
      >
        <AlertCircle size={11} /> Review ({issuesCount})
      </span>
    );
  };

  const renderStatusBadge = (status: CargoRecord['status']) => {
    switch (status) {
      case 'matched':
        return (
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Matched
          </span>
        );
      case 'in_transit':
        return (
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            In Transit
          </span>
        );
      case 'delivered':
        return (
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Delivered
          </span>
        );
      case 'validated':
        return (
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 216, 255, 0.1)',
              color: '#00d8ff',
              border: '1px solid rgba(0, 216, 255, 0.25)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Validated
          </span>
        );
      case 'archived':
        return (
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              color: '#64748b',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Archived
          </span>
        );
      case 'draft':
      default:
        return (
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Draft
          </span>
        );
    }
  };

  const renderPriorityBadge = (priority: CargoRecord['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span style={{ color: '#f43f5e', fontWeight: 700, fontSize: '10px' }}>URGENT</span>;
      case 'high':
        return <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '10px' }}>HIGH</span>;
      case 'standard':
        return <span style={{ color: '#64748b', fontSize: '10px' }}>STD</span>;
      case 'low':
      default:
        return <span style={{ color: '#64748b', fontSize: '10px' }}>LOW</span>;
    }
  };

  const isAllSelected = cargos.length > 0 && selectedIds.size === cargos.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < cargos.length;

  const selectedCargosList = useMemo(() => {
    return cargos.filter((c) => selectedIds.has(c.id));
  }, [cargos, selectedIds]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Docked Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'sticky',
            top: '64px',
            zIndex: 40,
            marginBottom: '12px',
            backgroundColor: '#0c243b',
            border: '1px solid #00d8ff',
            color: 'white',
            padding: '10px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#00d8ff' }}>
              {selectedIds.size} consignment{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12px',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Deselect all
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(0, 216, 255, 0.15)',
                color: '#00d8ff',
                border: '1px solid rgba(0, 216, 255, 0.3)',
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '6px',
              }}
              onClick={onValidateSelected}
            >
              <CheckCircle2 size={13} style={{ marginRight: '5px' }} /> Validate Selected
            </button>

            {selectedIds.size >= 2 && selectedIds.size <= 4 && (
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '6px',
                }}
                onClick={() => onOpenCompare(selectedCargosList)}
              >
                <GitCompare size={13} style={{ marginRight: '5px' }} /> Compare ({selectedIds.size})
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '6px',
              }}
              onClick={onArchiveSelected}
            >
              <Archive size={13} style={{ marginRight: '5px' }} /> Archive
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="ciw-table-card">
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="ciw-table">
            <thead>
              <tr>
                {/* Checkbox Column */}
                <th className="ciw-th" style={{ width: '42px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={() => onSelectAll(cargos)}
                    style={{ cursor: 'pointer', accentColor: '#00d8ff' }}
                  />
                </th>

                {/* Reference ID & Source */}
                <th
                  className="ciw-th ciw-th-sortable"
                  onClick={() => handleSort('reference_number')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>REF / CHANNEL</span>
                    {sortKey === 'reference_number' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} color="#00d8ff" /> : <ArrowDown size={12} color="#00d8ff" />
                    ) : (
                      <ArrowUpDown size={11} color="#64748b" />
                    )}
                  </div>
                </th>

                {/* Commercial Parties */}
                <th
                  className="ciw-th ciw-th-sortable"
                  onClick={() => handleSort('shipper')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>SHIPPER / COMMODITY</span>
                    {sortKey === 'shipper' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} color="#00d8ff" /> : <ArrowDown size={12} color="#00d8ff" />
                    ) : (
                      <ArrowUpDown size={11} color="#64748b" />
                    )}
                  </div>
                </th>

                {/* Nautical Corridor (Origin -> Destination) */}
                <th
                  className="ciw-th ciw-th-sortable"
                  onClick={() => handleSort('origin')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>CORRIDOR (ORIGIN → DEST)</span>
                    {sortKey === 'origin' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} color="#00d8ff" /> : <ArrowDown size={12} color="#00d8ff" />
                    ) : (
                      <ArrowUpDown size={11} color="#64748b" />
                    )}
                  </div>
                </th>

                {/* Weight & Specifications */}
                <th
                  className="ciw-th ciw-th-sortable"
                  onClick={() => handleSort('weight_tons')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>WEIGHT / VOLUME</span>
                    {sortKey === 'weight_tons' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} color="#00d8ff" /> : <ArrowDown size={12} color="#00d8ff" />
                    ) : (
                      <ArrowUpDown size={11} color="#64748b" />
                    )}
                  </div>
                </th>

                {/* Laycan Schedule */}
                <th
                  className="ciw-th ciw-th-sortable"
                  onClick={() => handleSort('ready_date')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>LAYCAN WINDOW</span>
                    {sortKey === 'ready_date' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} color="#00d8ff" /> : <ArrowDown size={12} color="#00d8ff" />
                    ) : (
                      <ArrowUpDown size={11} color="#64748b" />
                    )}
                  </div>
                </th>

                {/* Validation Status */}
                <th className="ciw-th">
                  VALIDATION
                </th>

                {/* Fleet Match */}
                <th className="ciw-th">
                  VESSEL ALLOCATION
                </th>

                {/* Status / Priority */}
                <th
                  className="ciw-th ciw-th-sortable"
                  onClick={() => handleSort('status')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>STATUS</span>
                    {sortKey === 'status' ? (
                      sortDir === 'asc' ? <ArrowUp size={12} color="#00d8ff" /> : <ArrowDown size={12} color="#00d8ff" />
                    ) : (
                      <ArrowUpDown size={11} color="#64748b" />
                    )}
                  </div>
                </th>

                {/* Actions Column */}
                <th className="ciw-th" style={{ textAlign: 'right', paddingRight: '18px' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCargos.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
                        No consignments match the active search and filter criteria.
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Try clearing search terms or resetting corridor and status filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCargos.map((cargo) => {
                  const isSelected = selectedIds.has(cargo.id);
                  const readyDateStr = new Date(cargo.ready_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  const deadlineStr = new Date(cargo.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                  return (
                    <tr
                      key={cargo.id}
                      className={`ciw-tr ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        // Avoid drawer trigger if clicking checkbox or action button
                        if ((e.target as HTMLElement).closest('input[type="checkbox"]') || (e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        onOpenDetail(cargo);
                      }}
                    >
                      {/* Checkbox */}
                      <td className="ciw-td" style={{ textAlign: 'center', width: '42px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(cargo.id)}
                          style={{ cursor: 'pointer', accentColor: '#00d8ff' }}
                        />
                      </td>

                      {/* Reference & Source */}
                      <td className="ciw-td" style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {cargo.provenance ? (
                            <ProvenanceBadge provenance={cargo.provenance} compact showInspector />
                          ) : (
                            renderSourceIcon(cargo.source)
                          )}
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              fontFamily: 'monospace',
                              color: '#00d8ff',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {cargo.reference_number}
                          </span>
                          {cargo.is_private && !cargo.provenance && (
                            <span
                              style={{
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(129, 140, 248, 0.15)',
                                color: '#818cf8',
                                border: '1px solid rgba(129, 140, 248, 0.25)',
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title="Private Company Lineup"
                            >
                              <Lock size={9} /> Private
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                          {cargo.zone.split(' - ')[0]} &middot; {cargo.source.toUpperCase()}
                        </div>
                      </td>

                      {/* Shipper & Commodity */}
                      <td className="ciw-td" style={{ minWidth: '190px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc' }}>
                          {cargo.shipper}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {cargo.commodity}
                        </div>
                      </td>

                      {/* Origin -> Destination */}
                      <td className="ciw-td" style={{ minWidth: '190px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600 }}>
                          <span style={{ color: '#f1f5f9' }}>{cargo.origin_port.name}</span>
                          <ArrowRight size={12} color="#38bdf8" />
                          <span style={{ color: '#f1f5f9' }}>{cargo.destination_port.name}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {cargo.origin_port.unlocode || cargo.origin_port.country} → {cargo.destination_port.unlocode || cargo.destination_port.country}
                        </div>
                      </td>

                      {/* Weight & Volume */}
                      <td className="ciw-td" style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>
                          {cargo.weight_tons.toLocaleString()} {cargo.unit}
                        </div>
                        {cargo.volume_m3 && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                            {cargo.volume_m3.toLocaleString()} m³
                          </div>
                        )}
                      </td>

                      {/* Laycan Schedule */}
                      <td className="ciw-td" style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f1f5f9' }}>
                          {readyDateStr} – {deadlineStr}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {renderPriorityBadge(cargo.priority)} Laycan
                        </div>
                      </td>

                      {/* Validation */}
                      <td className="ciw-td" style={{ whiteSpace: 'nowrap' }}>
                        {renderValidationPill(cargo.validation_status, cargo.validation_issues.length)}
                      </td>

                      {/* Matched Vessel */}
                      <td className="ciw-td" style={{ minWidth: '160px' }}>
                        {cargo.matched_vessel ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <Ship size={14} color="#38bdf8" />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '12px', color: '#38bdf8' }}>
                                {cargo.matched_vessel.vessel_name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                                {cargo.matched_vessel.match_score}% Match
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              fontSize: '11px',
                              padding: '3px 8px',
                              color: '#38bdf8',
                              backgroundColor: 'rgba(56, 189, 248, 0.08)',
                              border: '1px dashed rgba(56, 189, 248, 0.3)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenVesselMatch(cargo);
                            }}
                          >
                            + Match Vessel
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="ciw-td" style={{ whiteSpace: 'nowrap' }}>
                        {renderStatusBadge(cargo.status)}
                      </td>

                      {/* Action buttons */}
                      <td className="ciw-td" style={{ paddingRight: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            style={{
                              padding: '4px 6px',
                              color: '#94a3b8',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetail(cargo);
                            }}
                            title="Open Operational Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            style={{
                              padding: '4px 6px',
                              color: '#94a3b8',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenShare(cargo);
                            }}
                            title="Share Consignment Recap"
                          >
                            <Share2 size={14} />
                          </button>

                          {cargo.status === 'archived' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{
                                padding: '3px 8px',
                                color: '#10b981',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestoreSingle(cargo.id);
                              }}
                              title="Restore from Archive"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{
                                padding: '4px 6px',
                                color: '#64748b',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onArchiveSingle(cargo.id);
                              }}
                              title="Archive Consignment"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

