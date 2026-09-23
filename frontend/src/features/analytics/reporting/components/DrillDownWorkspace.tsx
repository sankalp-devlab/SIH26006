import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Ship,
  X,
  DollarSign,
  TrendingUp,
  Clock,
  Compass,
} from 'lucide-react';
import type {
  DrillDownContext,
  DrillDownFilterState,
  DetailedTransactionRecord,
  FixtureCommercialStatus,
} from '../../../../types/reporting';

interface DrillDownWorkspaceProps {
  context: DrillDownContext;
  onBackToDashboard: () => void;
  records: DetailedTransactionRecord[];
  filters: DrillDownFilterState;
  onFilterChange: (key: keyof DrillDownFilterState, value: any) => void;
  onResetFilters: () => void;
  selectedRecord: DetailedTransactionRecord | null;
  onSelectRecord: (record: DetailedTransactionRecord | null) => void;
}

const STATUS_OPTIONS: { id: 'all' | FixtureCommercialStatus; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'Completed', label: 'Completed' },
  { id: 'In-Transit', label: 'In-Transit' },
  { id: 'Discharging', label: 'Discharging' },
  { id: 'Fixed', label: 'Fixed' },
];

/* ── Shared inline style tokens ── */
const S = {
  card: {
    backgroundColor: 'var(--ol-surface-primary)',
    border: '1px solid var(--ol-border)',
    borderRadius: 'var(--ol-radius-lg)',
    boxShadow: 'var(--ol-shadow-sm)',
    boxSizing: 'border-box' as const,
  },
  inputBase: {
    width: '100%',
    height: '36px',
    backgroundColor: 'var(--ol-surface-secondary)',
    border: '1px solid rgba(100,190,240,0.18)',
    borderRadius: 'var(--ol-radius-md)',
    fontSize: '12px',
    color: 'var(--ol-text-primary)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
};

export const DrillDownWorkspace: React.FC<DrillDownWorkspaceProps> = ({
  context,
  onBackToDashboard,
  records,
  filters,
  onFilterChange,
  onResetFilters,
  selectedRecord,
  onSelectRecord,
}) => {
  const [sortField, setSortField] = useState<keyof DetailedTransactionRecord>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const cargoSubTypes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => { if (r.cargoSubType) set.add(r.cargoSubType); });
    return Array.from(set).sort();
  }, [records]);

  const handleSort = (field: keyof DetailedTransactionRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortAsc ? aVal - bVal : bVal - aVal;
      return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }, [records, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage]);

  const avgTce = records.length ? Math.round(records.reduce((acc, r) => acc + r.tceRate, 0) / records.length) : 0;
  const totalVolume = records.reduce((acc, r) => acc + r.cargoVolume, 0);

  const isLevel2Filtered =
    filters.status !== 'all' ||
    filters.cargoSubType !== 'all' ||
    filters.minTce > 0 ||
    filters.searchTerm.trim().length > 0;

  const statusColors: Record<FixtureCommercialStatus, { color: string; bg: string; border: string }> = {
    Completed:   { color: 'var(--ol-green)', bg: 'var(--ol-green-subtle)', border: 'rgba(32,201,138,0.25)' },
    'In-Transit': { color: 'var(--ol-cyan)',  bg: 'var(--ol-cyan-subtle)',  border: 'rgba(0,217,255,0.25)' },
    Discharging: { color: 'var(--ol-amber)', bg: 'var(--ol-amber-subtle)', border: 'rgba(255,176,32,0.25)' },
    Fixed:       { color: '#818cf8',          bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.25)' },
  };

  const ciiColors: Record<string, string> = {
    A: 'var(--ol-green)',
    B: '#2dd4bf',
    C: 'var(--ol-amber)',
    D: '#fb923c',
    E: 'var(--ol-red)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>

      {/* 1. Breadcrumb & Back Navigation */}
      <div style={{
        ...S.card,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '14px 18px',
        borderColor: 'rgba(0,217,255,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', flexWrap: 'wrap' }}>
          <button
            id="btn-back-to-dashboard-crumb"
            onClick={onBackToDashboard}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ol-text-muted)', fontWeight: 600, fontSize: '12px', padding: 0, fontFamily: 'inherit' }}
          >
            Executive Dashboard
          </button>
          <ChevronRight size={13} style={{ color: 'var(--ol-border)' }} />
          <span style={{ color: 'var(--ol-text-muted)' }}>Visualization Drill-Down</span>
          <ChevronRight size={13} style={{ color: 'var(--ol-border)' }} />
          <span style={{
            color: 'var(--ol-cyan)',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--ol-cyan-subtle)',
            border: '1px solid rgba(0,217,255,0.2)',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }} title={context.label}>
            {context.label}
          </span>
        </div>

        <button
          id="btn-back-to-dashboard"
          onClick={onBackToDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: 'var(--ol-radius-md)',
            backgroundColor: 'var(--ol-surface-elevated)',
            border: '1px solid var(--ol-border)',
            color: 'var(--ol-text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={13} style={{ color: 'var(--ol-cyan)' }} />
          Back to Macro Dashboard
        </button>
      </div>

      {/* 2. Context Summary Banner – 4 mini KPI cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {[
          {
            label: 'Active Drill-Down Scope',
            primary: <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ol-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }} title={context.label}>{context.label}</span>,
            sub: context.datePeriod ? `Period: ${context.datePeriod}` : 'Aggregated Scope',
            subColor: 'var(--ol-cyan)',
          },
          {
            label: 'Ledger Transaction Count',
            primary: <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ol-text-primary)' }}>{records.length} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--ol-text-muted)' }}>fixtures</span></span>,
            sub: 'Matching secondary criteria',
            subColor: 'var(--ol-text-muted)',
          },
          {
            label: 'Drill-Down Average TCE',
            primary: <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ol-cyan)' }}>${avgTce.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--ol-text-muted)' }}>/day</span></span>,
            sub: 'Net voyage earnings',
            subColor: 'var(--ol-text-muted)',
          },
          {
            label: 'Lifted Cargo Payload',
            primary: <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ol-green)' }}>{totalVolume > 1_000_000 ? `${(totalVolume / 1_000_000).toFixed(2)}M MT` : `${(totalVolume / 1_000).toFixed(0)}k MT`}</span>,
            sub: 'Empirical payload carried',
            subColor: 'var(--ol-text-muted)',
          },
        ].map(({ label, primary, sub, subColor }) => (
          <div key={label} style={{ ...S.card, padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--ol-text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            {primary}
            <div style={{ fontSize: '11px', color: subColor, marginTop: '4px' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* 3. Level 2 Secondary Filter Bar */}
      <div style={{ ...S.card, padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '1px solid var(--ol-border)',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--ol-green)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Level 2 Secondary Filters (Drill-Down Narrowing)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ol-text-muted)' }}>(Further narrows fixtures within isolated scope)</span>
          </div>
          {isLevel2Filtered && (
            <button
              id="btn-reset-drill-filters"
              onClick={onResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--ol-text-muted)',
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ol-green)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ol-text-muted)')}
            >
              <RotateCcw size={13} />
              Reset Level 2 Filters
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Search input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ol-text-muted)', marginBottom: '6px' }}>
              Search Vessel / Charterer / Port
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ol-text-muted)', pointerEvents: 'none' }} />
              <input
                id="input-drill-search"
                type="text"
                placeholder="e.g. APOLLO, Shell, Ningbo..."
                value={filters.searchTerm}
                onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                style={{ ...S.inputBase, paddingLeft: '32px', paddingRight: '12px' }}
              />
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ol-text-muted)', marginBottom: '6px' }}>Commercial Status</label>
            <div style={{ position: 'relative' }}>
              <select
                id="select-drill-status"
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value as any)}
                style={{ ...S.inputBase, padding: '0 32px 0 10px', appearance: 'none', cursor: 'pointer' }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <ChevronRight size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--ol-text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Cargo sub-type */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ol-text-muted)', marginBottom: '6px' }}>Cargo Specification / Grade</label>
            <div style={{ position: 'relative' }}>
              <select
                id="select-drill-cargo"
                value={filters.cargoSubType}
                onChange={(e) => onFilterChange('cargoSubType', e.target.value)}
                style={{ ...S.inputBase, padding: '0 32px 0 10px', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Cargo Grades</option>
                {cargoSubTypes.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <ChevronRight size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--ol-text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Min TCE slider */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--ol-text-muted)', marginBottom: '6px' }}>Min TCE Threshold ($/day)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                id="range-drill-tce"
                type="range"
                min="0" max="100000" step="5000"
                value={filters.minTce}
                onChange={(e) => onFilterChange('minTce', parseInt(e.target.value, 10))}
                style={{ flex: 1, accentColor: 'var(--ol-green)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-green)', minWidth: '50px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {filters.minTce > 0 ? `$${(filters.minTce / 1000).toFixed(0)}k+` : 'Any'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Detailed Dataset Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--ol-border)',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 650, color: 'var(--ol-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ship size={15} style={{ color: 'var(--ol-cyan)' }} />
              Empirical Fixture Ledger &amp; Transaction Records
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
              Showing {sortedRecords.length} audited commercial fixtures for this drill-down slice
            </p>
          </div>
          <span style={{
            fontSize: '12px',
            color: 'var(--ol-text-muted)',
            fontWeight: 600,
            backgroundColor: 'var(--ol-surface-secondary)',
            padding: '4px 10px',
            borderRadius: 'var(--ol-radius-sm)',
            border: '1px solid var(--ol-border)',
          }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Table — horizontally scrollable inside wrapper */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--ol-surface-secondary)', borderBottom: '1px solid var(--ol-border)' }}>
                {[
                  { label: 'Date', field: 'date', align: 'left', width: '90px' },
                  { label: 'Vessel / Class', field: 'vesselName', align: 'left', width: '160px' },
                  { label: 'Corridor Route', field: null, align: 'left', width: '140px' },
                  { label: 'Cargo Grade', field: null, align: 'left', width: '110px' },
                  { label: 'Spot TCE ($/day)', field: 'tceRate', align: 'right', width: '120px' },
                  { label: 'Payload (MT)', field: 'cargoVolume', align: 'right', width: '110px' },
                  { label: 'Charterer', field: null, align: 'left', width: '110px' },
                  { label: 'Status', field: null, align: 'center', width: '100px' },
                  { label: 'CII', field: null, align: 'center', width: '50px' },
                  { label: 'Inspect', field: null, align: 'right', width: '60px' },
                ].map(({ label, field, align, width }) => (
                  <th
                    key={label}
                    onClick={field ? () => handleSort(field as keyof DetailedTransactionRecord) : undefined}
                    style={{
                      padding: '10px 14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--ol-text-muted)',
                      textAlign: align as any,
                      cursor: field ? 'pointer' : 'default',
                      whiteSpace: 'nowrap',
                      width,
                      minWidth: width,
                    }}
                  >
                    {label}
                    {field && sortField === field && (
                      <span style={{ marginLeft: '4px', color: 'var(--ol-cyan)' }}>{sortAsc ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: 'var(--ol-text-muted)' }}>
                    <div>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>No transactions match the active Level 2 secondary filters.</p>
                      <button
                        onClick={onResetFilters}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--ol-radius-md)',
                          backgroundColor: 'var(--ol-surface-elevated)',
                          border: '1px solid var(--ol-border)',
                          color: 'var(--ol-cyan)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                        }}
                      >
                        Reset Secondary Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const sc = statusColors[r.commercialStatus] || { color: 'var(--ol-text-muted)', bg: 'var(--ol-surface-secondary)', border: 'var(--ol-border)' };
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelectRecord(r)}
                      style={{ borderBottom: '1px solid rgba(100,190,240,0.07)', cursor: 'pointer', transition: 'background-color 0.12s ease' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(0,217,255,0.03)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono,monospace)', fontSize: '11px', color: 'var(--ol-text-muted)', whiteSpace: 'nowrap' }}>{r.date}</td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ol-text-primary)', fontSize: '12px' }}>{r.vesselName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--ol-text-muted)' }}>{r.vesselClass} · IMO {r.vesselImo}</div>
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ol-text-secondary)', fontSize: '12px' }}>{r.routeCode}</div>
                        <div style={{ fontSize: '10px', color: 'var(--ol-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>{r.originPort} → {r.destinationPort}</div>
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ol-text-secondary)', fontSize: '12px' }}>{r.cargoSubType}</div>
                        <div style={{ fontSize: '10px', color: 'var(--ol-text-muted)' }}>{r.cargo}</div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--ol-cyan)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        ${r.tceRate.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--ol-text-secondary)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {r.cargoVolume.toLocaleString()} MT
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--ol-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                        {r.charterer}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: sc.color,
                          backgroundColor: sc.bg,
                          border: `1px solid ${sc.border}`,
                        }}>
                          {r.commercialStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: ciiColors[r.ciiRating] || 'var(--ol-text-muted)' }}>{r.ciiRating}</span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectRecord(r); }}
                          title="Inspect fixture details"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--ol-text-muted)',
                            padding: '4px',
                            borderRadius: 'var(--ol-radius-sm)',
                            transition: 'color 0.12s ease',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ol-cyan)')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ol-text-muted)')}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderTop: '1px solid var(--ol-border)',
            backgroundColor: 'var(--ol-surface-secondary)',
            fontSize: '12px',
          }}>
            <button
              id="btn-prev-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--ol-radius-md)',
                backgroundColor: 'var(--ol-surface-elevated)',
                border: '1px solid var(--ol-border)',
                color: 'var(--ol-text-secondary)',
                fontSize: '12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1,
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              Previous
            </button>
            <div style={{ color: 'var(--ol-text-muted)' }}>
              Page <span style={{ fontWeight: 700, color: 'var(--ol-text-primary)' }}>{currentPage}</span> of {totalPages}
            </div>
            <button
              id="btn-next-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--ol-radius-md)',
                backgroundColor: 'var(--ol-surface-elevated)',
                border: '1px solid var(--ol-border)',
                color: 'var(--ol-text-secondary)',
                fontSize: '12px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1,
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* 5. Row Inspector Modal */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: 'var(--ol-surface-primary)',
            border: '1px solid rgba(0,217,255,0.3)',
            borderRadius: 'var(--ol-radius-xl)',
            padding: '24px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: 'var(--ol-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ol-border)', paddingBottom: '14px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{ padding: '8px', borderRadius: 'var(--ol-radius-md)', backgroundColor: 'var(--ol-cyan-subtle)', color: 'var(--ol-cyan)', border: '1px solid rgba(0,217,255,0.2)', flexShrink: 0 }}>
                  <Ship size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ol-text-primary)' }}>{selectedRecord.vesselName}</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
                    {selectedRecord.id} · IMO {selectedRecord.vesselImo} · {selectedRecord.vesselClass}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ol-text-muted)', padding: '4px', borderRadius: 'var(--ol-radius-sm)', flexShrink: 0, fontFamily: 'inherit' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ol-text-primary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ol-text-muted)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { icon: <Clock size={11} style={{ color: 'var(--ol-cyan)' }} />, label: 'Fixture Date', value: selectedRecord.date, valueColor: 'var(--ol-text-primary)' },
                { icon: <DollarSign size={11} style={{ color: 'var(--ol-green)' }} />, label: 'Spot TCE Rate', value: `$${selectedRecord.tceRate.toLocaleString()} /day`, valueColor: 'var(--ol-green)' },
                { icon: <TrendingUp size={11} style={{ color: '#818cf8' }} />, label: 'Cargo Volume', value: `${selectedRecord.cargoVolume.toLocaleString()} MT`, valueColor: 'var(--ol-text-primary)' },
                { icon: <Compass size={11} style={{ color: 'var(--ol-amber)' }} />, label: 'Route & Corridor', value: `${selectedRecord.routeCode} · ${selectedRecord.originPort} → ${selectedRecord.destinationPort}`, valueColor: 'var(--ol-text-primary)' },
                { icon: null, label: 'Commodity Sub-Type', value: `${selectedRecord.cargoSubType} · ${selectedRecord.cargo}`, valueColor: 'var(--ol-text-primary)' },
                { icon: null, label: 'Charterer', value: selectedRecord.charterer, valueColor: 'var(--ol-text-primary)' },
                { icon: null, label: 'Speed & Duration', value: `${selectedRecord.speedKnots} kts · ${selectedRecord.durationDays} days`, valueColor: 'var(--ol-text-primary)' },
                { icon: null, label: 'Bunker Burn Cost', value: `$${selectedRecord.bunkerCostPerDay.toLocaleString()} /day`, valueColor: 'var(--ol-text-primary)' },
                { icon: null, label: 'CII Rating & CO₂', value: `Rating ${selectedRecord.ciiRating} · ${selectedRecord.totalCo2Mt} MT`, valueColor: 'var(--ol-cyan)' },
              ].map(({ icon, label, value, valueColor }) => (
                <div key={label} style={{
                  backgroundColor: 'var(--ol-surface-secondary)',
                  borderRadius: 'var(--ol-radius-md)',
                  padding: '10px 12px',
                  border: '1px solid var(--ol-border)',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--ol-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {icon}
                    {label}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: valueColor, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                onClick={() => onSelectRecord(null)}
                className="ol-btn ol-btn-secondary ol-btn-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
