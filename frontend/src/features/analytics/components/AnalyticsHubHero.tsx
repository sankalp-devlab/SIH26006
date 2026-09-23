import { useState } from 'react';
import {
  RefreshCw,
  Download,
  Sparkles,
} from 'lucide-react';
import { AnalyticsBreadcrumb } from './AnalyticsBreadcrumb';

interface AnalyticsHubHeroProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

type DateRange = '7D' | '30D' | '90D' | '1Y';

export function AnalyticsHubHero({ onRefresh, onExport }: AnalyticsHubHeroProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('30D');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const kpis = [
    {
      label: 'FREIGHT MARKET',
      val: '$38,420',
      sub: 'Average TCE',
      delta: '+5.7%',
      isPositive: true,
      sparkline: '0,13 8,11 16,12 24,9 32,7 40,8 48,3',
      color: '#38bdf8',
    },
    {
      label: 'MARKET MOMENTUM',
      val: '87 / 100',
      sub: 'Bullish Phase',
      delta: '+4.8%',
      isPositive: true,
      sparkline: '0,14 8,12 16,10 24,9 32,7 40,5 48,2',
      color: '#34d399',
    },
    {
      label: 'TRADE VOLUME',
      val: '12.4M tons',
      sub: '30D Throughput',
      delta: '+4.2%',
      isPositive: true,
      sparkline: '0,12 8,13 16,11 24,10 32,8 40,6 48,3',
      color: '#a855f7',
    },
    {
      label: 'FLEET UTILIZATION',
      val: '91.8%',
      sub: 'Effective Capacity',
      delta: '+2.4%',
      isPositive: true,
      sparkline: '0,11 8,10 16,12 24,8 32,7 40,5 48,2',
      color: '#34d399',
    },
    {
      label: 'PORT ACTIVITY',
      val: '120 calls',
      sub: 'Major Hubs',
      delta: '+3.8%',
      isPositive: true,
      sparkline: '0,13 8,12 16,10 24,9 32,8 40,5 48,3',
      color: '#fbbf24',
    },
  ];

  return (
    <div>
      {/* Top Header & Breadcrumbs */}
      <AnalyticsBreadcrumb />

      <div className="hub-hero">
        <div className="hub-hero-top">
          <div className="hub-hero-title-area">
            <div className="hub-hero-badge">
              <Sparkles size={13} color="#38bdf8" />
              <span>MARITIME INTELLIGENCE COMMAND</span>
            </div>
            <h1 className="hub-hero-title">
              Maritime Intelligence Center
            </h1>
            <p className="hub-hero-subtitle">
              Analyze freight markets, trade flows, fleet dynamics and commercial signals across 13 dedicated domains.
            </p>
          </div>

          <div className="hub-hero-actions">
            <div className="hub-time-pill hub-mono">
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>LIVE</span>
              <span style={{ color: '#64748b', margin: '0 4px' }}>&middot;</span>
              <span>Updated 2m ago</span>
            </div>

            {/* Date Range Selector */}
            <div style={{ display: 'flex', background: 'rgba(2, 10, 18, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '4px', padding: '2px' }}>
              {(['7D', '30D', '90D', '1Y'] as DateRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRange(r)}
                  style={{
                    background: selectedRange === r ? '#0284c7' : 'transparent',
                    color: selectedRange === r ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '3px 7px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="hub-action-btn"
              onClick={handleRefresh}
              title="Refresh intelligence feeds"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'animate-spin' : ''}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="hub-action-btn"
              onClick={onExport}
              title="Export Intelligence Summary"
            >
              <Download size={13} color="#38bdf8" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 5 Executive KPI Cards */}
        <div className="hub-kpi-grid">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="hub-kpi-card">
              <div>
                <div className="hub-kpi-label">{kpi.label}</div>
                <div className="hub-kpi-val hub-mono">{kpi.val}</div>
              </div>

              <div className="hub-kpi-footer">
                <div>
                  <div style={{ fontSize: '0.625rem', color: '#64748b' }}>{kpi.sub}</div>
                  <div
                    className="hub-mono"
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: kpi.isPositive ? '#34d399' : '#f87171',
                      marginTop: '1px',
                    }}
                  >
                    {kpi.delta}
                  </div>
                </div>

                <svg className="hub-sparkline" viewBox="0 0 48 16" aria-hidden="true">
                  <path d={`M${kpi.sparkline}`} stroke={kpi.color} />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
