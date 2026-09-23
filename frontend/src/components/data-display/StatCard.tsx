import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  theme?: 'blue' | 'emerald' | 'amber' | 'purple';
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  theme = 'blue',
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {isLoading ? (
            <span
              style={{
                display: 'inline-block',
                width: '80px',
                height: '32px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
              }}
            />
          ) : (
            value
          )}
        </div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
      <div className={`stat-icon-wrapper stat-icon-${theme}`}>{icon}</div>
    </div>
  );
}
