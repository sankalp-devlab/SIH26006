import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

export interface DataAnnotationProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'info';
  subtext?: string;
  icon?: LucideIcon;
  className?: string;
  style?: React.CSSProperties;
}

export function DataAnnotation({
  label,
  value,
  change,
  changeType = 'neutral',
  subtext,
  icon: Icon,
  className = '',
  style,
}: DataAnnotationProps) {
  const renderValue = () => {
    if (value.includes('/')) {
      const parts = value.split('/');
      return (
        <span className="annotation-value-text">
          {parts[0].trim()}{' '}
          <span className="annotation-value-unit">/{parts[1].trim()}</span>
        </span>
      );
    }
    if (value.endsWith(' kn')) {
      const val = value.replace(' kn', '');
      return (
        <span className="annotation-value-text">
          {val}
          <span className="annotation-value-unit"> kn</span>
        </span>
      );
    }
    return <span className="annotation-value-text">{value}</span>;
  };

  return (
    <div className={`maritime-data-annotation ${className}`} style={style} role="region" aria-label={`${label}: ${value}`}>
      <div className="annotation-header">
        <span className="annotation-label">{label}</span>
        {change && (
          <span className={`annotation-change-badge ${changeType}`}>
            {changeType === 'positive' && <TrendingUp size={11} aria-hidden="true" />}
            {changeType === 'negative' && <TrendingDown size={11} aria-hidden="true" />}
            {changeType === 'neutral' && <Minus size={11} aria-hidden="true" />}
            <span>{change}</span>
          </span>
        )}
      </div>

      <div className="annotation-body">
        <div className="annotation-value">{renderValue()}</div>
        {Icon && (
          <div className="annotation-icon" aria-hidden="true">
            <Icon size={16} />
          </div>
        )}
      </div>

      {subtext && (
        <div className="annotation-subtext">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
