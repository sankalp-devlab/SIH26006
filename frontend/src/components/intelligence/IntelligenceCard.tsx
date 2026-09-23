import React from 'react';

export interface IntelligenceCardProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  badge?: string;
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  headerActions,
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`ol-card ${className}`} style={style}>
      {(title || headerActions) && (
        <div className="ol-card-header">
          <div>
            {title && (
              <h3 className="ol-card-title">
                {Icon && <Icon size={16} style={{ color: 'var(--ol-cyan)' }} />}
                <span>{title}</span>
                {badge && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 217, 255, 0.1)',
                      color: 'var(--ol-cyan)',
                      border: '1px solid rgba(0, 217, 255, 0.25)',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </h3>
            )}
            {subtitle && <p className="ol-card-subtitle">{subtitle}</p>}
          </div>

          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      {children}
    </div>
  );
};
