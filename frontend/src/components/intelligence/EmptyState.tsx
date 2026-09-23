import React from 'react';
import { Database, RotateCcw } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'No records match the current filter selection or timeframe.',
  icon: Icon = Database,
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--ol-surface-primary)',
        border: '1px solid var(--ol-border)',
        borderRadius: 'var(--ol-radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--ol-surface-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ol-cyan)',
        }}
      >
        <Icon size={24} />
      </div>
      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 650, color: 'var(--ol-text-primary)' }}>
        {title}
      </h4>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--ol-text-muted)', maxWidth: '420px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="ol-btn ol-btn-secondary ol-btn-sm"
          style={{ marginTop: '8px' }}
        >
          <RotateCcw size={13} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
