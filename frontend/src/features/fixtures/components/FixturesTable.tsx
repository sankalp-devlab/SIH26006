/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixtures Table & Multi-Port Operational Workspace
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Share2,
  CheckCircle,
  Ship,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FixtureRecord, FixtureStatus } from '../../../types/fixture';

interface FixturesTableProps {
  fixtures: FixtureRecord[];
  onOpenDetail: (fixture: FixtureRecord) => void;
  onOpenEdit: (fixture: FixtureRecord) => void;
  onOpenStatusModal: (fixture: FixtureRecord) => void;
  onOpenShare: (fixture: FixtureRecord) => void;
  onResetFilters?: () => void;
  isLoading?: boolean;
}

export const FixturesTable: React.FC<FixturesTableProps> = ({
  fixtures,
  onOpenDetail,
  onOpenEdit,
  onOpenStatusModal,
  onOpenShare,
  onResetFilters,
  isLoading = false,
}) => {
  const [sortKey, setSortKey] = useState<keyof FixtureRecord | 'port_count'>('fixture_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: keyof FixtureRecord | 'port_count') => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedFixtures = useMemo(() => {
    return [...fixtures].sort((a, b) => {
      let valA: unknown;
      let valB: unknown;

      if (sortKey === 'port_count') {
        valA = a.ports.length;
        valB = b.ports.length;
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
  }, [fixtures, sortKey, sortDir]);

  const renderStatusBadge = (status: FixtureStatus) => {
    switch (status) {
      case 'fully_fixed':
        return (
          <span className="cfw-badge cfw-badge-fully-fixed">
            <span className="cfw-badge-dot" />
            <span>FULLY FIXED</span>
          </span>
        );
      case 'on_subjects':
        return (
          <span className="cfw-badge cfw-badge-on-subjects">
            <span className="cfw-badge-dot" />
            <span>ON SUBJECTS</span>
          </span>
        );
      case 'failed':
        return (
          <span className="cfw-badge cfw-badge-failed">
            <span className="cfw-badge-dot" />
            <span>FAILED / BROKEN</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="cfw-badge cfw-badge-draft">
            <span className="cfw-badge-dot" />
            <span>DRAFT</span>
          </span>
        );
    }
  };

  const renderSortIndicator = (key: keyof FixtureRecord | 'port_count') => {
    if (sortKey !== key) {
      return <ArrowUpDown size={11} style={{ opacity: 0.35, marginLeft: '4px' }} />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp size={11} style={{ color: '#00d8ff', marginLeft: '4px' }} />
    ) : (
      <ArrowDown size={11} style={{ color: '#00d8ff', marginLeft: '4px' }} />
    );
  };

  if (isLoading) {
    return (
      <div className="cfw-table-card">
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ color: '#00d8ff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            Loading commercial fixtures desk...
          </div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>
            Retrieving Baltic charter rates, laycan windows, and vessel rotations
          </div>
        </div>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="cfw-table-card">
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Ship size={44} style={{ color: '#00d8ff', opacity: 0.35, marginBottom: '14px' }} />
          <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
            No Fixtures Match Current Filters
          </h4>
          <p style={{ margin: '0 auto 16px', fontSize: '13px', color: '#94a3b8', maxWidth: '420px' }}>
            No commercial chartering records match your filter criteria or search query.
          </p>
          {onResetFilters && (
            <button
              type="button"
              className="cfw-btn cfw-btn-secondary"
              onClick={onResetFilters}
              style={{ margin: '0 auto' }}
            >
              <RotateCcw size={14} />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cfw-table-card">
      <div style={{ overflowX: 'auto' }}>
        <table className="cfw-table">
          <thead>
            <tr>
              {/* 1. Fixture Ref */}
              <th
                className="cfw-th cfw-th-sortable"
                onClick={() => handleSort('fixture_reference')}
                style={{ width: '12%' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  FIXTURE {renderSortIndicator('fixture_reference')}
                </div>
              </th>

              {/* 2. Status */}
              <th
                className="cfw-th cfw-th-sortable"
                onClick={() => handleSort('status')}
                style={{ width: '11%' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  STATUS {renderSortIndicator('status')}
                </div>
              </th>

              {/* 3. Vessel Particulars */}
              <th
                className="cfw-th cfw-th-sortable"
                onClick={() => handleSort('vessel_name')}
                style={{ width: '16%' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  VESSEL {renderSortIndicator('vessel_name')}
                </div>
              </th>

              {/* 4. Charterer & Form */}
              <th
                className="cfw-th cfw-th-sortable"
                onClick={() => handleSort('charterer')}
                style={{ width: '15%' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  CHARTERER &amp; FORM {renderSortIndicator('charterer')}
                </div>
              </th>

              {/* 5. Cargo & Tonnage */}
              <th
                className="cfw-th cfw-th-sortable"
                onClick={() => handleSort('commodity')}
                style={{ width: '14%' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  CARGO &amp; TONNAGE {renderSortIndicator('commodity')}
                </div>
              </th>

              {/* 6. Multi-Port Rotation */}
              <th
                className="cfw-th cfw-th-sortable"
                onClick={() => handleSort('port_count')}
                style={{ width: '16%' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  ROTATION {renderSortIndicator('port_count')}
                </div>
              </th>

              {/* 7. Commercial Rate & Laycan */}
              <th
                className="cfw-th cfw-th-sortable"
                onClick={() => handleSort('rate_value')}
                style={{ width: '16%' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  RATE &amp; LAYCAN {renderSortIndicator('rate_value')}
                </div>
              </th>

              {/* 8. Actions */}
              <th className="cfw-th" style={{ width: '80px', textAlign: 'right' }}>
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedFixtures.map((fixture) => {
              const firstPort = fixture.ports[0];
              const lastPort = fixture.ports[fixture.ports.length - 1];
              const intermediateCount = Math.max(0, fixture.ports.length - 2);

              return (
                <tr key={fixture.id} className="cfw-tr">
                  {/* 1. Fixture Reference & Date */}
                  <td className="cfw-td">
                    <div
                      style={{
                        color: '#00d8ff',
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em',
                        cursor: 'pointer',
                      }}
                      onClick={() => onOpenDetail(fixture)}
                      title="View Complete Fixture Particulars"
                    >
                      {fixture.fixture_reference}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>
                      Fixed: {new Date(fixture.fixture_date).toLocaleDateString()}
                    </div>
                  </td>

                  {/* 2. Status Badge */}
                  <td className="cfw-td">
                    <div>{renderStatusBadge(fixture.status)}</div>
                    {fixture.is_historical && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          color: '#64748b',
                          marginTop: '4px',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        Historical
                      </span>
                    )}
                  </td>

                  {/* 3. Vessel Particulars */}
                  <td className="cfw-td">
                    <div style={{ fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Ship size={14} style={{ color: '#00d8ff', flexShrink: 0 }} />
                      <Link
                        to={`/vessels?search=${encodeURIComponent(fixture.vessel_name)}`}
                        style={{ color: '#ffffff', textDecoration: 'none' }}
                        title="View vessel in fleet directory"
                      >
                        {fixture.vessel_name}
                      </Link>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>
                      IMO: {fixture.vessel_imo} • {fixture.vessel_type}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                      DWT: {fixture.vessel_dwt.toLocaleString()} MT
                    </div>
                  </td>

                  {/* 4. Charterer & Form */}
                  <td className="cfw-td">
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#ffffff' }}>
                      {fixture.charterer}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                      CP Form: <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{fixture.charter_party_form}</span>
                    </div>
                    {fixture.charterer_broker && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                        Broker: {fixture.charterer_broker}
                      </div>
                    )}
                  </td>

                  {/* 5. Cargo & Tonnage */}
                  <td className="cfw-td">
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>
                      {fixture.commodity}
                    </div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px', fontWeight: 500 }}>
                      <strong style={{ color: '#ffffff', fontWeight: 700 }}>
                        {fixture.quantity_tons.toLocaleString()} MT
                      </strong>{' '}
                      ({fixture.cargo_type})
                    </div>
                    {fixture.cargo_reference && (
                      <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px', fontFamily: 'monospace' }}>
                        {fixture.cargo_reference}
                      </div>
                    )}
                  </td>

                  {/* 6. Multi-Port Rotation */}
                  <td className="cfw-td">
                    <div className="cfw-route-flow">
                      {firstPort && (
                        <span className="cfw-route-chip cfw-route-chip-load" title={`Load Port: ${firstPort.port_name}`}>
                          [L] {firstPort.port_name}
                        </span>
                      )}

                      {intermediateCount > 0 && (
                        <>
                          <span className="cfw-route-arrow">→</span>
                          <span
                            className="cfw-route-chip cfw-route-chip-inter"
                            title={fixture.ports
                              .slice(1, -1)
                              .map((p) => `#${p.sequence} ${p.port_name} (${p.port_type})`)
                              .join(' → ')}
                          >
                            +{intermediateCount} port{intermediateCount > 1 ? 's' : ''}
                          </span>
                        </>
                      )}

                      {lastPort && lastPort !== firstPort && (
                        <>
                          <span className="cfw-route-arrow">→</span>
                          <span className="cfw-route-chip cfw-route-chip-discharge" title={`Discharge Port: ${lastPort.port_name}`}>
                            [D] {lastPort.port_name}
                          </span>
                        </>
                      )}
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      {fixture.ports.length} rotation point{fixture.ports.length > 1 ? 's' : ''}
                    </div>
                  </td>

                  {/* 7. Commercial Rate & Laycan */}
                  <td className="cfw-td">
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#00d8ff',
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {fixture.rate_formatted}
                    </div>

                    {fixture.demurrage_usd_day && (
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                        Dem: ${fixture.demurrage_usd_day.toLocaleString()} / day
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#64748b',
                        marginTop: '3px',
                      }}
                    >
                      <Calendar size={11} style={{ color: '#00d8ff' }} />
                      <span>
                        {fixture.laycan_start} to {fixture.laycan_end}
                      </span>
                    </div>
                  </td>

                  {/* 8. Actions */}
                  <td className="cfw-td" style={{ textAlign: 'right' }}>
                    <div className="cfw-action-btn-group">
                      {/* View Drawer */}
                      <button
                        type="button"
                        className="cfw-icon-btn"
                        onClick={() => onOpenDetail(fixture)}
                        title="View Complete Fixture Particulars"
                      >
                        <Eye size={13} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        className="cfw-icon-btn"
                        onClick={() => onOpenEdit(fixture)}
                        title="Edit Commercial Fixture"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Status Transition */}
                      <button
                        type="button"
                        className={`cfw-icon-btn ${
                          fixture.status === 'fully_fixed'
                            ? 'cfw-icon-btn-success'
                            : fixture.status === 'on_subjects'
                            ? 'cfw-icon-btn-warning'
                            : ''
                        }`}
                        onClick={() => onOpenStatusModal(fixture)}
                        title="Change Fixture Status Workflow"
                      >
                        <CheckCircle size={13} />
                      </button>

                      {/* Share Recap */}
                      <button
                        type="button"
                        className="cfw-icon-btn"
                        onClick={() => onOpenShare(fixture)}
                        title="Share / Generate Fixture Recap"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

