import React from 'react';
import {
  Package,
  ShieldCheck,
  Ship,
  Copy,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import type { CargoAnalyticsSummary, CargoFiltersState } from '../../../types/cargo';

interface CargoKPISummaryProps {
  analytics: CargoAnalyticsSummary;
  filters: CargoFiltersState;
  onFilterChange: (filters: CargoFiltersState) => void;
  onSelectDuplicatesView: () => void;
}

export const CargoKPISummary: React.FC<CargoKPISummaryProps> = ({
  analytics,
  filters,
  onFilterChange,
  onSelectDuplicatesView,
}) => {
  const formatTons = (tons: number) => {
    if (tons >= 1000000) return `${(tons / 1000000).toFixed(2)}M MT`;
    if (tons >= 1000) return `${(tons / 1000).toFixed(1)}k MT`;
    return `${tons.toLocaleString()} MT`;
  };

  const isValidationFiltered = filters.validationStatus !== 'all';
  const isMatchedFiltered = filters.vesselMatchStatus === 'matched';
  const isPrivateFiltered = filters.scope === 'private';

  const validPct = analytics.activeCount > 0 
    ? Math.round((analytics.validatedCount / analytics.activeCount) * 100) 
    : 100;
  const matchPct = analytics.matchRatePercent ?? 0;

  return (
    <div className="ciw-kpi-grid">
      {/* 1. Total Freight Demands */}
      <div
        className="ciw-kpi-card"
        style={{
          borderTop: '2px solid #00d8ff',
        }}
        onClick={() => onFilterChange({ ...filters, status: 'all', validationStatus: 'all', scope: 'all' })}
        title="Click to view all active freight demands"
      >
        <div className="ciw-kpi-top">
          <span className="ciw-kpi-label">Total Freight Demands</span>
          <div
            className="ciw-kpi-icon"
            style={{ backgroundColor: 'rgba(0, 216, 255, 0.12)', color: '#00d8ff' }}
          >
            <Package size={15} />
          </div>
        </div>

        <div>
          <div className="ciw-kpi-val">{analytics.activeCount}</div>
        </div>

        <div className="ciw-kpi-bottom">
          <div className="ciw-kpi-sub" style={{ color: '#00d8ff' }}>
            <span>Aggregated Volume</span>
          </div>
          <div className="ciw-kpi-desc">
            {formatTons(analytics.totalWeightMT)}
          </div>
        </div>
      </div>

      {/* 2. Validation Health */}
      <div
        className="ciw-kpi-card"
        style={{
          borderTop: `2px solid ${analytics.needsValidationCount > 0 ? '#f59e0b' : '#10b981'}`,
          backgroundColor: isValidationFiltered ? 'rgba(245, 158, 11, 0.08)' : undefined,
        }}
        onClick={() => {
          onFilterChange({
            ...filters,
            validationStatus: filters.validationStatus === 'incomplete' ? 'all' : 'incomplete',
          });
        }}
        title="Click to filter incomplete or review consignments"
      >
        <div className="ciw-kpi-top">
          <span className="ciw-kpi-label">Validation Health</span>
          <div
            className="ciw-kpi-icon"
            style={{
              backgroundColor: analytics.needsValidationCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: analytics.needsValidationCount > 0 ? '#f59e0b' : '#10b981',
            }}
          >
            <ShieldCheck size={15} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="ciw-kpi-val">
              {analytics.validatedCount}/{analytics.activeCount}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
              {validPct}% Valid
            </span>
          </div>
          <div className="ciw-progress-bar">
            <div
              className="ciw-progress-fill"
              style={{
                width: `${validPct}%`,
                backgroundColor: analytics.needsValidationCount > 0 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
        </div>

        <div className="ciw-kpi-bottom">
          <div
            className="ciw-kpi-desc"
            style={{
              color: analytics.needsValidationCount > 0 ? '#f59e0b' : '#94a3b8',
            }}
          >
            {analytics.needsValidationCount > 0
              ? `${analytics.needsValidationCount} require operational review`
              : 'All consignments verified'}
          </div>
        </div>
      </div>

      {/* 3. Fleet Allocation Rate */}
      <div
        className="ciw-kpi-card"
        style={{
          borderTop: '2px solid #38bdf8',
          backgroundColor: isMatchedFiltered ? 'rgba(56, 189, 248, 0.08)' : undefined,
        }}
        onClick={() => {
          onFilterChange({
            ...filters,
            vesselMatchStatus: filters.vesselMatchStatus === 'matched' ? 'all' : 'matched',
          });
        }}
        title="Click to toggle matched fleet inquiries"
      >
        <div className="ciw-kpi-top">
          <span className="ciw-kpi-label">Fleet Allocation</span>
          <div
            className="ciw-kpi-icon"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}
          >
            <Ship size={15} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="ciw-kpi-val">{matchPct}%</span>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
              {analytics.matchedCount} matched
            </span>
          </div>
          <div className="ciw-progress-bar">
            <div
              className="ciw-progress-fill"
              style={{
                width: `${matchPct}%`,
                backgroundColor: '#38bdf8',
              }}
            />
          </div>
        </div>

        <div className="ciw-kpi-bottom">
          <div className="ciw-kpi-desc">
            {analytics.unmatchedCount} open chartering inquiries
          </div>
        </div>
      </div>

      {/* 4. Near-Duplicate Inquiries */}
      <div
        className="ciw-kpi-card"
        style={{
          borderTop: `2px solid ${analytics.duplicateClustersCount > 0 ? '#a855f7' : 'rgba(80, 180, 255, 0.2)'}`,
        }}
        onClick={onSelectDuplicatesView}
        title="Inspect multi-broker duplicate inquiry clusters"
      >
        <div className="ciw-kpi-top">
          <span className="ciw-kpi-label">Near-Duplicate Inquiries</span>
          <div
            className="ciw-kpi-icon"
            style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}
          >
            <Copy size={15} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="ciw-kpi-val">
              {analytics.duplicateClustersCount} {analytics.duplicateClustersCount === 1 ? 'Cluster' : 'Clusters'}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#c084fc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
              }}
            >
              Review <ArrowUpRight size={11} />
            </span>
          </div>
        </div>

        <div className="ciw-kpi-bottom">
          <div className="ciw-kpi-desc">
            Multi-broker inquiry overlap detected
          </div>
        </div>
      </div>

      {/* 5. Private Lineup Fixtures */}
      <div
        className="ciw-kpi-card"
        style={{
          borderTop: '2px solid #818cf8',
          backgroundColor: isPrivateFiltered ? 'rgba(129, 140, 248, 0.08)' : undefined,
        }}
        onClick={() => {
          onFilterChange({
            ...filters,
            scope: filters.scope === 'private' ? 'all' : 'private',
          });
        }}
        title="Toggle Private Company Lineup filter"
      >
        <div className="ciw-kpi-top">
          <span className="ciw-kpi-label">Private Lineup</span>
          <div
            className="ciw-kpi-icon"
            style={{ backgroundColor: 'rgba(129, 140, 248, 0.12)', color: '#818cf8' }}
          >
            <Lock size={15} />
          </div>
        </div>

        <div>
          <div className="ciw-kpi-val">{analytics.privateCount}</div>
        </div>

        <div className="ciw-kpi-bottom">
          <div className="ciw-kpi-desc">
            Company-specific confidential parcels
          </div>
        </div>
      </div>
    </div>
  );
};

