/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics Header & Action Toolbar
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  RefreshCw,
  Download,
  Scale,
  ArrowLeft,
} from 'lucide-react';
import { AnalyticsBreadcrumb } from '../../components/AnalyticsBreadcrumb';

interface FreightAnalyticsHeaderProps {
  onOpenComparison: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
  isRefetching: boolean;
}

export const FreightAnalyticsHeader: React.FC<FreightAnalyticsHeaderProps> = ({
  onOpenComparison,
  onExportCsv,
  onRefresh,
  isRefetching,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 1. Breadcrumb + Back Navigation Row */}
      <div className="freight-top-nav">
        <AnalyticsBreadcrumb currentModule="Freight Analytics" moduleBadge="M14" />
        <button
          type="button"
          onClick={() => navigate('/analytics')}
          className="freight-back-btn"
          title="Return to Analytics Hub"
        >
          <ArrowLeft size={14} />
          <span>Analytics Hub</span>
        </button>
      </div>

      {/* 2. Main Page Header Card */}
      <div className="freight-header-card">
        {/* Left: Eyebrow, Title & Subtitle */}
        <div className="freight-header-left">
          <div className="freight-eyebrow">
            <span className="freight-eyebrow-badge">Module 14 · Freight Intelligence</span>
            <span className="freight-sub-badge">Baltic & Physical Benchmarks</span>
          </div>

          <h1 className="freight-title">
            <TrendingUp size={24} style={{ color: 'var(--freight-cyan)' }} />
            <span>Freight Analytics & Market Intelligence</span>
          </h1>

          <p className="freight-subtitle">
            Global maritime freight benchmarks, vessel supply balance, FFA curves and corridor-level market intelligence.
          </p>
        </div>

        {/* Right: Global Actions Toolbar */}
        <div className="freight-header-actions">
          {/* Compare Modal Button */}
          <button
            type="button"
            onClick={onOpenComparison}
            className="freight-action-btn"
            title="Open side-by-side corridor or regional comparison"
          >
            <Scale size={14} style={{ color: 'var(--freight-cyan)' }} />
            <span>Compare</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={onExportCsv}
            className="freight-action-btn"
            title="Download active market data in CSV format"
          >
            <Download size={14} style={{ color: 'var(--freight-green)' }} />
            <span>Export CSV</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefetching}
            className="freight-action-btn primary"
            title="Refresh market feeds"
          >
            <RefreshCw
              size={14}
              className={isRefetching ? 'animate-spin' : ''}
              style={{
                animation: isRefetching ? 'spin 1s linear infinite' : undefined,
              }}
            />
            <span>{isRefetching ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
