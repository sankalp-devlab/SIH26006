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
        <div className="annotation-value">{value}</div>
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
