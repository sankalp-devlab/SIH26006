import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';

export interface IntelligenceHeaderAction {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export interface IntelligencePageHeaderProps {
  moduleBadge?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  onRefresh?: () => void;
  isRefetching?: boolean;
  onExportCsv?: () => void;
  actions?: IntelligenceHeaderAction[];
  children?: React.ReactNode;
}

export const IntelligencePageHeader: React.FC<IntelligencePageHeaderProps> = ({
  moduleBadge,
  eyebrow = 'MARITIME INTELLIGENCE',
  title,
  subtitle,
  backTo = '/analytics',
  backLabel = 'Analytics Hub',
  onRefresh,
  isRefetching = false,
  onExportCsv,
  actions = [],
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 1. Top Navigation Row with Return Button */}
      <div className="ol-top-breadcrumb-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="ol-back-btn"
          >
            <ArrowLeft size={14} />
            <span>← Back to {backLabel}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--ol-green)', display: 'inline-block' }} />
            Telemetry Live
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ol-border)' }}>|</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted)' }}>
            UTC {new Date().toISOString().slice(11, 16)}
          </span>
        </div>
      </div>

      {/* 2. Standardized Executive Header Card */}
      <div className="ol-page-header-card">
        <div className="ol-page-header-left">
          <div className="ol-eyebrow">
            {moduleBadge && <span className="ol-badge-tag">{moduleBadge}</span>}
            <span>{eyebrow}</span>
          </div>
          <h1 className="ol-page-title">{title}</h1>
          {subtitle && <p className="ol-page-subtitle">{subtitle}</p>}
        </div>

        <div className="ol-page-actions">
          {actions.map((act, idx) => {
            const variantClass = act.variant ? `ol-btn-${act.variant}` : 'ol-btn-secondary';
            const renderActionIcon = () => {
              if (!act.icon) return null;
              if (React.isValidElement(act.icon)) return act.icon;
              const Icon = act.icon as React.ComponentType<{ size?: number; className?: string }>;
              return <Icon size={14} className={act.loading ? 'animate-spin' : ''} />;
            };
            return (
              <button
                key={idx}
                type="button"
                onClick={act.onClick}
                disabled={act.disabled || act.loading}
                className={`ol-btn ${variantClass}`}
              >
                {renderActionIcon()}
                <span>{act.label}</span>
              </button>
            );
          })}

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="ol-btn ol-btn-secondary"
              title="Export datasets to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefetching}
              className="ol-btn ol-btn-secondary"
              title="Refresh live telemetry"
            >
              <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
              <span>{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
