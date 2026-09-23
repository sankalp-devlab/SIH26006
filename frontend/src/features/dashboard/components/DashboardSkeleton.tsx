import { Compass, Ship, Anchor, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';

export function DashboardSkeleton() {
  return (
    <div className="cc-skeleton-wrapper" aria-label="Loading dashboard intelligence..." role="status">
      {/* Skeleton KPI Strip */}
      <div className="cc-skeleton-kpi-grid">
        {[
          { icon: Ship, label: 'TOTAL MONITORED FLEET' },
          { icon: Compass, label: 'LIVE AIS COVERAGE' },
          { icon: Anchor, label: 'GLOBAL SEAPORTS' },
          { icon: TrendingUp, label: 'FREIGHT SPOT COMPOSITE' },
          { icon: ShieldAlert, label: 'HIGH-RISK CHOKEPOINTS' },
          { icon: BarChart3, label: 'COMMODITY TON-MILES' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="cc-skeleton-card">
              <div className="cc-skeleton-card-header">
                <div className="cc-skeleton-icon-box">
                  <Icon size={14} className="opacity-40" />
                </div>
                <span className="cc-skeleton-label">{item.label}</span>
              </div>
              <div className="cc-skeleton-val-shimmer" />
              <div className="cc-skeleton-sub-shimmer" />
            </div>
          );
        })}
      </div>

      {/* Skeleton Main Grid (Map + Market Intelligence) */}
      <div className="cc-skeleton-main-grid">
        <div className="cc-skeleton-map-panel">
          <div className="cc-skeleton-panel-header">
            <div className="cc-skeleton-title-shimmer" style={{ width: '180px' }} />
            <div className="cc-skeleton-pill-shimmer" style={{ width: '110px' }} />
          </div>
          <div className="cc-skeleton-map-canvas">
            <div className="cc-skeleton-radar-center">
              <Compass size={40} className="cc-loading-compass-spin opacity-30" />
              <div className="cc-skeleton-radar-text">Acquiring Fleet Coordinates...</div>
            </div>
          </div>
        </div>

        <div className="cc-skeleton-intelligence-panel">
          <div className="cc-skeleton-panel-header">
            <div className="cc-skeleton-title-shimmer" style={{ width: '160px' }} />
            <div className="cc-skeleton-pill-shimmer" style={{ width: '80px' }} />
          </div>
          <div className="cc-skeleton-intel-content">
            <div className="cc-skeleton-block-shimmer" style={{ height: '70px' }} />
            <div className="cc-skeleton-block-shimmer" style={{ height: '50px' }} />
            <div className="cc-skeleton-block-shimmer" style={{ height: '110px' }} />
            <div className="cc-skeleton-block-shimmer" style={{ height: '80px' }} />
          </div>
        </div>
      </div>

      {/* Skeleton Secondary Analytics Grid */}
      <div className="cc-skeleton-analytics-grid">
        {[1, 2, 3, 4].map((panelIdx) => (
          <div key={panelIdx} className="cc-skeleton-panel">
            <div className="cc-skeleton-panel-header">
              <div className="cc-skeleton-title-shimmer" style={{ width: '140px' }} />
              <div className="cc-skeleton-pill-shimmer" style={{ width: '70px' }} />
            </div>
            <div className="cc-skeleton-table-rows">
              <div className="cc-skeleton-row-shimmer" style={{ height: '24px', opacity: 0.6 }} />
              <div className="cc-skeleton-row-shimmer" style={{ height: '32px' }} />
              <div className="cc-skeleton-row-shimmer" style={{ height: '32px' }} />
              <div className="cc-skeleton-row-shimmer" style={{ height: '32px' }} />
              <div className="cc-skeleton-row-shimmer" style={{ height: '32px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
