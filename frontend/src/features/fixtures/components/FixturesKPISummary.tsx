import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import type { FixtureAnalyticsSummary, FixtureFiltersState } from '../../../types/fixture';

interface FixturesKPISummaryProps {
  analytics: FixtureAnalyticsSummary;
  filters?: FixtureFiltersState;
  onFilterChange?: (filters: FixtureFiltersState) => void;
  onFilterByStatus?: (status: string) => void;
  onFilterByLaycanAlerts?: () => void;
}

export const FixturesKPISummary: React.FC<FixturesKPISummaryProps> = ({
  analytics,
  filters,
  onFilterChange,
  onFilterByStatus,
  onFilterByLaycanAlerts,
}) => {
  const formatTonnage = (tons: number) => {
    if (tons >= 1000000) return `${(tons / 1000000).toFixed(2)}M MT`;
    if (tons >= 1000) return `${(tons / 1000).toFixed(1)}k MT`;
    return `${tons} MT`;
  };

  const isOnSubjectsFiltered = filters?.status === 'on_subjects';
  const isFullyFixedFiltered = filters?.status === 'fully_fixed';
  const isLaycanFiltered = filters?.laycanRange === 'next_7_days';

  return (
    <div className="cfw-kpi-grid">
      {/* 1. ACTIVE FIXTURES */}
      <div
        className="cfw-kpi-card"
        style={{
          borderTop: '2px solid #00d8ff',
        }}
        onClick={() => {
          if (onFilterByStatus) {
            onFilterByStatus('all');
          } else if (onFilterChange && filters) {
            onFilterChange({ ...filters, status: 'all' });
          }
        }}
        title="Reset status filter to view all active fixtures"
      >
        <div className="cfw-kpi-top">
          <span className="cfw-kpi-label">ACTIVE FIXTURES</span>
          <div
            className="cfw-kpi-icon"
            style={{
              backgroundColor: 'rgba(0, 216, 255, 0.1)',
              color: '#00d8ff',
            }}
          >
            <FileText size={18} />
          </div>
        </div>

        <div className="cfw-kpi-val" style={{ color: '#00d8ff' }}>
          {analytics.activeCount}
        </div>

        <div className="cfw-kpi-bottom">
          <div className="cfw-kpi-sub">
            <span>Volume:</span>
            <strong>{formatTonnage(analytics.totalAgreedTonnageMT)}</strong>
          </div>
          <div className="cfw-kpi-desc">Total committed ocean freight</div>
        </div>
      </div>

      {/* 2. ON SUBJECTS */}
      <div
        className={`cfw-kpi-card ${isOnSubjectsFiltered ? 'selected' : ''}`}
        style={{
          borderTop: '2px solid #ffb020',
        }}
        onClick={() => {
          const newStatus = filters?.status === 'on_subjects' ? 'all' : 'on_subjects';
          if (onFilterByStatus) {
            onFilterByStatus(newStatus);
          } else if (onFilterChange && filters) {
            onFilterChange({
              ...filters,
              status: newStatus,
            });
          }
        }}
        title="Click to filter On Subjects fixtures"
      >
        <div className="cfw-kpi-top">
          <span className="cfw-kpi-label" style={{ color: '#ffb020' }}>ON SUBJECTS</span>
          <div
            className="cfw-kpi-icon"
            style={{
              backgroundColor: 'rgba(255, 176, 32, 0.12)',
              color: '#ffb020',
            }}
          >
            <Clock size={18} />
          </div>
        </div>

        <div className="cfw-kpi-val" style={{ color: '#ffb020' }}>
          {analytics.onSubjectsCount}
        </div>

        <div className="cfw-kpi-bottom">
          <div className="cfw-kpi-sub" style={{ color: '#fde68a' }}>
            Subject to stem & inspection clearance
          </div>
          <div className="cfw-kpi-desc">Pending commercial conditions</div>
        </div>
      </div>

      {/* 3. FULLY FIXED */}
      <div
        className={`cfw-kpi-card ${isFullyFixedFiltered ? 'selected' : ''}`}
        style={{
          borderTop: '2px solid #22c98a',
        }}
        onClick={() => {
          const newStatus = filters?.status === 'fully_fixed' ? 'all' : 'fully_fixed';
          if (onFilterByStatus) {
            onFilterByStatus(newStatus);
          } else if (onFilterChange && filters) {
            onFilterChange({
              ...filters,
              status: newStatus,
            });
          }
        }}
        title="Click to filter Fully Fixed contracts"
      >
        <div className="cfw-kpi-top">
          <span className="cfw-kpi-label" style={{ color: '#22c98a' }}>FULLY FIXED</span>
          <div
            className="cfw-kpi-icon"
            style={{
              backgroundColor: 'rgba(34, 201, 138, 0.12)',
              color: '#22c98a',
            }}
          >
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="cfw-kpi-val" style={{ color: '#22c98a' }}>
          {analytics.fullyFixedCount}
        </div>

        <div className="cfw-kpi-bottom">
          <div className="cfw-kpi-sub" style={{ color: '#a7f3d0' }}>
            Clean fixtures finalized & signed
          </div>
          <div className="cfw-kpi-desc">Executed charter party contracts</div>
        </div>
      </div>

      {/* 4. AVG CHARTER RATE */}
      <div
        className="cfw-kpi-card"
        style={{
          borderTop: '2px solid #2f8cff',
        }}
        title="Fleet-wide average time-charter rate benchmark"
      >
        <div className="cfw-kpi-top">
          <span className="cfw-kpi-label">AVG CHARTER RATE</span>
          <div
            className="cfw-kpi-icon"
            style={{
              backgroundColor: 'rgba(47, 140, 255, 0.12)',
              color: '#2f8cff',
            }}
          >
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="cfw-kpi-val" style={{ color: '#00d8ff' }}>
          ${analytics.averageRatePerDayUSD.toLocaleString()}
        </div>

        <div className="cfw-kpi-bottom">
          <div className="cfw-kpi-sub">
            Per day time-charter equivalent
          </div>
          <div className="cfw-kpi-desc">Current fixture index benchmark</div>
        </div>
      </div>

      {/* 5. LAYCAN ALERTS */}
      <div
        className={`cfw-kpi-card ${isLaycanFiltered ? 'selected' : ''}`}
        style={{
          borderTop: analytics.urgentLaycanAlertsCount > 0 ? '2px solid #ef4444' : '2px solid rgba(80, 180, 255, 0.25)',
        }}
        onClick={() => {
          if (onFilterByLaycanAlerts) {
            onFilterByLaycanAlerts();
          } else if (onFilterChange && filters) {
            onFilterChange({
              ...filters,
              laycanRange: filters.laycanRange === 'next_7_days' ? 'all' : 'next_7_days',
            });
          }
        }}
        title="Filter fixtures with impending laycan dates"
      >
        <div className="cfw-kpi-top">
          <span className="cfw-kpi-label" style={{ color: analytics.urgentLaycanAlertsCount > 0 ? '#ef4444' : '#94a3b8' }}>
            LAYCAN ALERTS
          </span>
          <div
            className="cfw-kpi-icon"
            style={{
              backgroundColor: analytics.urgentLaycanAlertsCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(80, 180, 255, 0.1)',
              color: analytics.urgentLaycanAlertsCount > 0 ? '#ef4444' : '#94a3b8',
            }}
          >
            <AlertTriangle size={18} />
          </div>
        </div>

        <div
          className="cfw-kpi-val"
          style={{
            color: analytics.urgentLaycanAlertsCount > 0 ? '#ef4444' : '#ffffff',
          }}
        >
          {analytics.urgentLaycanAlertsCount}
        </div>

        <div className="cfw-kpi-bottom">
          <div
            className="cfw-kpi-sub"
            style={{
              color: analytics.urgentLaycanAlertsCount > 0 ? '#fca5a5' : '#94a3b8',
            }}
          >
            {analytics.urgentLaycanAlertsCount > 0 ? 'Canceling within 72 hours' : 'No immediate laycan risk'}
          </div>
          <div className="cfw-kpi-desc">
            {analytics.urgentLaycanAlertsCount > 0 ? 'Immediate action required' : 'All vessel laycans within tolerance'}
          </div>
        </div>
      </div>
    </div>
  );
};

