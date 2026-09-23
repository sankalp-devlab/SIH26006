import React from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no active records matching your criteria.',
  icon = <PackageOpen className="feedback-icon" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="feedback-state">
      {icon}
      <h4 className="feedback-title">{title}</h4>
      <p className="feedback-desc">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
