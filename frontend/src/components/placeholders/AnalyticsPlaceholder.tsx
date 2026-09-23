import { BarChart3, TrendingUp, Cpu } from 'lucide-react';

export interface AnalyticsPlaceholderProps {
  height?: string;
  title?: string;
  description?: string;
}

export function AnalyticsPlaceholder({
  height = '320px',
  title = 'AI Maritime Analytics & Predictive Intelligence',
  description = 'XGBoost cost prediction models, dynamic ETA regression, fuel consumption forecasting, and port congestion risk scoring will be integrated in subsequent modules.',
}: AnalyticsPlaceholderProps) {
  return (
    <div
      className="blueprint-placeholder"
      style={{
        height,
        backgroundImage:
          'linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="blueprint-badge">MODULE 12+ READY</div>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#ecfdf5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--color-status-success)',
          border: '1px solid #a7f3d0',
        }}
      >
        <BarChart3 size={28} />
      </div>
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          maxWidth: '520px',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginTop: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Cpu size={14} color="var(--color-status-info)" /> XGBoost Cost Engine
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <TrendingUp size={14} color="var(--color-status-success)" /> AIS ETA Estimator
        </span>
      </div>
    </div>
  );
}
