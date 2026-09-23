import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  icon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {icon}
      {children}
    </span>
  );
}
