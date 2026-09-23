import React from 'react';

export type BadgeVariant =
  | 'live'
  | 'active'
  | 'warning'
  | 'alert'
  | 'neutral'
  | 'positive'
  | 'negative';

export interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  pulse = false,
}) => {
  let badgeClass = 'ol-badge-neutral';
  if (variant === 'live' || variant === 'positive') badgeClass = 'ol-badge-live';
  if (variant === 'active') badgeClass = 'ol-badge-active';
  if (variant === 'warning') badgeClass = 'ol-badge-warning';
  if (variant === 'alert' || variant === 'negative') badgeClass = 'ol-badge-alert';

  return (
    <span className={`ol-badge ${badgeClass}`}>
      {pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
