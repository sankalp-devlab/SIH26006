import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';

export interface HeroDataCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  footerTag?: string;
  chartType?: 'line' | 'bar' | 'progress';
  progressPercent?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function HeroDataCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  footerTag,
  chartType = 'line',
  progressPercent = 68,
  className = '',
  style,
}: HeroDataCardProps) {
  return (
    <div className={`hero-data-card ${className}`} style={style}>
      {/* Header row: title and optional trend pill */}
      <div className="card-header-row">
        <span className="card-title-text">{title}</span>
        {trend && (
          <span className={`card-trend-pill ${trendDirection === 'up' ? 'positive' : ''}`}>
            {trendDirection === 'up' && <TrendingUp size={12} />}
            {trend}
          </span>
        )}
      </div>

      {/* Metric value */}
      <div className="card-metric-value">{value}</div>

      {/* Animated Mini Chart Graphic */}
      <div className="card-sparkline-wrap">
        {chartType === 'line' && (
          <svg
            viewBox="0 0 100 24"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon
              points="0,20 12,18 24,14 36,16 48,10 60,12 72,6 84,9 100,2 100,24 0,24"
              fill={`url(#grad-${title.replace(/\s+/g, '')})`}
            />
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="0,20 12,18 24,14 36,16 48,10 60,12 72,6 84,9 100,2"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))',
              }}
            />
            <circle cx="100" cy="2" r="3" fill="#00f2fe" style={{ filter: 'drop-shadow(0 0 6px #00f2fe)' }} />
          </svg>
        )}

        {chartType === 'bar' && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%', width: '100%' }}>
            {[35, 50, 42, 65, 58, 80, 72, 90, 85, 100].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i >= 8 ? '#00f2fe' : 'rgba(56, 189, 248, 0.35)',
                  borderRadius: '2px',
                  boxShadow: i >= 8 ? '0 0 8px rgba(0, 242, 254, 0.6)' : 'none',
                  transition: 'height 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        {chartType === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', height: '100%', justifyContent: 'center' }}>
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7 0%, #00f2fe 100%)',
                  borderRadius: '999px',
                  boxShadow: '0 0 10px rgba(0, 242, 254, 0.5)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b' }}>
              <span>Capacity</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>{progressPercent}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tag */}
      {footerTag && (
        <div className="card-footer-tag">
          <Activity size={12} />
          <span>{footerTag}</span>
        </div>
      )}
    </div>
  );
}
