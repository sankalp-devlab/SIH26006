import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface IntelligenceKpiCardProps {
  label: string;
  metric: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  delta?: string | number;
  deltaDirection?: 'up' | 'down' | 'neutral';
  deltaLabel?: string;
  subtext?: string;
  badge?: string;
  badgeColor?: 'cyan' | 'green' | 'amber' | 'red' | 'blue';
  onClick?: () => void;
  isLoading?: boolean;
}

export const IntelligenceKpiCard: React.FC<IntelligenceKpiCardProps> = ({
  label,
  metric,
  icon,
  delta,
  deltaDirection = 'neutral',
  deltaLabel,
  subtext,
  badge,
  badgeColor = 'cyan',
  onClick,
  isLoading = false,
}) => {
  const renderKpiIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as React.ComponentType<{ size?: number; className?: string }>;
    return <IconComp size={16} className="ol-kpi-icon" />;
  };

  return (
    <div
      className="ol-kpi-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Top Section: Label + Icon / Badge */}
      <div className="ol-kpi-top">
        <span className="ol-kpi-label">{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {badge && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: badgeColor === 'green' ? 'var(--ol-green-subtle)' : badgeColor === 'amber' ? 'var(--ol-amber-subtle)' : badgeColor === 'red' ? 'var(--ol-red-subtle)' : 'var(--ol-cyan-subtle)',
                color: badgeColor === 'green' ? 'var(--ol-green)' : badgeColor === 'amber' ? 'var(--ol-amber)' : badgeColor === 'red' ? 'var(--ol-red)' : 'var(--ol-cyan)',
                border: '1px solid currentColor',
              }}
            >
              {badge}
            </span>
          )}
          {renderKpiIcon()}
        </div>
      </div>

      {/* Middle Section: Primary Metric */}
      <div className="ol-kpi-metric">
        {isLoading ? (
          <div
            style={{
              width: '90px',
              height: '32px',
              backgroundColor: 'var(--ol-surface-secondary)',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite',
            }}
          />
        ) : (
          metric ?? 'Unavailable'
        )}
      </div>

      {/* Bottom Section: Delta / Supporting Text */}
      <div className="ol-kpi-bottom">
        {delta !== undefined ? (
          <div className={`ol-kpi-delta ${deltaDirection === 'up' ? 'positive' : deltaDirection === 'down' ? 'negative' : 'neutral'}`}>
            {deltaDirection === 'up' && <TrendingUp size={13} />}
            {deltaDirection === 'down' && <TrendingDown size={13} />}
            {deltaDirection === 'neutral' && <Minus size={13} />}
            <span>{delta}</span>
            {deltaLabel && <span style={{ color: 'var(--ol-text-muted)', fontWeight: 500 }}>{deltaLabel}</span>}
          </div>
        ) : (
          <span style={{ color: 'var(--ol-text-muted)' }}>{subtext || '—'}</span>
        )}

        {delta !== undefined && subtext && (
          <span style={{ color: 'var(--ol-text-muted)', fontSize: '11px' }}>{subtext}</span>
        )}
      </div>
    </div>
  );
};

export interface IntelligenceKpiGridProps {
  columns?: 4 | 5;
  children: React.ReactNode;
}

export const IntelligenceKpiGrid: React.FC<IntelligenceKpiGridProps> = ({
  columns = 4,
  children,
}) => {
  return (
    <div className={`ol-kpi-grid ol-kpi-grid-${columns}`}>
      {children}
    </div>
  );
};
