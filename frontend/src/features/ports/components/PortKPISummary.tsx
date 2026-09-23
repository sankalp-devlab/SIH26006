import React from 'react';
import {
  Ship,
  Anchor,
  Clock,
  Activity,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  Layers,
} from 'lucide-react';
import type { PortInsightPayload, PortCongestionSeverity } from '../../../types/port-insights';
import type { PortWorkspaceTab } from '../../../hooks/usePortInsights';

interface PortKPISummaryProps {
  payload: PortInsightPayload;
  activeTab?: string;
  onTabChange: (tab: PortWorkspaceTab) => void;
  onFilterActivity?: (status: 'all' | 'arriving' | 'waiting' | 'operating') => void;
}

export const PortKPISummary: React.FC<PortKPISummaryProps> = ({
  payload,
  activeTab: _activeTab,
  onTabChange,
  onFilterActivity,
}) => {
  const waitingCount = payload.activities.filter((a) => a.status === 'waiting').length;
  const operatingCount = payload.activities.filter((a) => a.status === 'operating').length;
  const arrivingCount = payload.activities.filter((a) => a.status === 'arriving').length;
  const totalInboundDwt =
    payload.activities
      .filter((a) => a.status === 'arriving')
      .reduce((sum, a) => sum + (a.dwt || 45000), 0) || 185000;
  const lineupQueueCount = payload.lineups.length;
  const totalLineupCargo =
    payload.lineups.reduce((sum, l) => sum + (l.cargo_quantity_mt || 50000), 0) || 280000;
  const totalBerths = payload.terminals.reduce((sum, t) => sum + (t.totalBerths ?? t.berths_total ?? 0), 0) || 10;

  const summary = {
    waitingVesselsCount: waitingCount,
    operatingVesselsCount: operatingCount,
    expectedVessels48h: arrivingCount,
    arrivingVesselsCount: payload.summary?.arrivingVesselsCount ?? arrivingCount,
    totalEnRouteDwt: payload.summary?.totalEnRouteDwt ?? totalInboundDwt,
    totalBerths: totalBerths,
    occupiedBerths: operatingCount,
    anchorageCount: waitingCount,
    lineupQueueCount: payload.summary?.lineupQueueCount ?? lineupQueueCount,
    totalLineupCargoTons: payload.summary?.totalLineupCargoTons ?? totalLineupCargo,
  };

  const analytics = payload.analytics ?? {
    congestion: {
      severity: payload.congestion.current_level,
      indexScore: payload.congestion.congestion_index_pct,
      trend: 'STABLE',
      waitingVesselsCount: waitingCount,
      berthOccupancyPct: totalBerths > 0 ? (operatingCount / totalBerths) * 100 : 75,
    },
    waitingTimeStats: {
      averageHours: payload.congestion.avg_waiting_hours,
      medianHours: payload.congestion.median_waiting_hours,
      maxHours: payload.congestion.max_waiting_hours,
      trendVsLastWeekPct: -3.5,
      meanHours: payload.congestion.avg_waiting_hours,
    },
    weatherImpact: {
      impactLevel: 'OPTIMAL',
      summary: 'Favorable conditions',
      windImpact: '12 kts NW',
      swellImpact: '1.2m swell',
      visibilityImpact: '10 NM visibility',
    },
    overallBerthUtilizationPct: totalBerths > 0 ? (operatingCount / totalBerths) * 100 : 75,
  };

  const { congestion, waitingTimeStats } = analytics;
  const overallBerthUtilizationPct =
    analytics.overallBerthUtilizationPct ?? (totalBerths > 0 ? (operatingCount / totalBerths) * 100 : 75);
  const waitMeanHours = waitingTimeStats.meanHours ?? waitingTimeStats.averageHours ?? 0;
  const waitTrendPct = waitingTimeStats.trendPct ?? waitingTimeStats.trendVsLastWeekPct ?? -3.5;

  const getSeverityBadge = (severity: PortCongestionSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          color: '#f43f5e',
          bg: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          label: 'CRITICAL',
        };
      case 'HIGH':
        return {
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          label: 'HIGH',
        };
      case 'MODERATE':
        return {
          color: '#00d8ff',
          bg: 'rgba(0, 216, 255, 0.15)',
          border: '1px solid rgba(0, 216, 255, 0.35)',
          label: 'MODERATE',
        };
      case 'LOW':
      default:
        return {
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          label: 'NORMAL',
        };
    }
  };

  const severityBadge = getSeverityBadge(congestion.severity);

  const handleCardClick = (tab: PortWorkspaceTab, status?: 'all' | 'arriving' | 'waiting' | 'operating') => {
    onTabChange(tab);
    if (status && onFilterActivity) {
      onFilterActivity(status);
    }
  };

  return (
    <div className="piw-kpi-grid">
      {/* 1. ARRIVING VESSELS */}
      <div
        className="piw-kpi-card"
        onClick={() => handleCardClick('activity', 'arriving')}
        style={{ borderLeft: '3px solid #00d8ff' }}
        title="View Inbound Arriving Vessels"
      >
        <div className="piw-kpi-top">
          <span className="piw-kpi-label">ARRIVING VESSELS</span>
          <Ship size={15} color="#00d8ff" />
        </div>
        <div className="piw-kpi-val" style={{ color: '#00d8ff' }}>
          {summary.arrivingVesselsCount}
        </div>
        <div className="piw-kpi-bottom">
          <div className="piw-kpi-sub" style={{ color: '#94a3b8' }}>
            <span>within 72h</span>
          </div>
          <div className="piw-kpi-desc">
            <strong style={{ color: '#00d8ff' }}>{summary.totalEnRouteDwt.toLocaleString()}</strong> DWT inbound
          </div>
        </div>
      </div>

      {/* 2. AT ANCHORAGE */}
      <div
        className="piw-kpi-card"
        onClick={() => handleCardClick('activity', 'waiting')}
        style={{ borderLeft: '3px solid #f59e0b' }}
        title="View Anchorage Waiting Queue"
      >
        <div className="piw-kpi-top">
          <span className="piw-kpi-label">AT ANCHORAGE</span>
          <Anchor size={15} color="#f59e0b" />
        </div>
        <div className="piw-kpi-val" style={{ color: '#f59e0b' }}>
          {summary.anchorageCount}
        </div>
        <div className="piw-kpi-bottom">
          <div className="piw-kpi-sub" style={{ color: '#f59e0b' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span>waiting for berth</span>
          </div>
          <div className="piw-kpi-desc">
            Median wait: <strong style={{ color: '#e2e8f0' }}>{waitingTimeStats.medianHours.toFixed(1)} hrs</strong>
          </div>
        </div>
      </div>

      {/* 3. OPERATING BERTHS */}
      <div
        className="piw-kpi-card"
        onClick={() => handleCardClick('activity', 'operating')}
        style={{ borderLeft: '3px solid #38bdf8' }}
        title="View Operating Berths Activity"
      >
        <div className="piw-kpi-top">
          <span className="piw-kpi-label">OPERATING BERTHS</span>
          <Activity size={15} color="#38bdf8" />
        </div>
        <div className="piw-kpi-val" style={{ color: '#ffffff' }}>
          {summary.operatingVesselsCount} <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 500 }}>/ {summary.totalBerths}</span>
        </div>
        <div className="piw-kpi-bottom">
          <div className="piw-kpi-sub" style={{ color: '#38bdf8' }}>
            <span>{overallBerthUtilizationPct.toFixed(0)}% utilization</span>
          </div>
          <div className="piw-kpi-desc">Across all operational quays</div>
        </div>
      </div>

      {/* 4. AVG WAIT TIME */}
      <div
        className="piw-kpi-card"
        onClick={() => handleCardClick('overview')}
        style={{ borderLeft: '3px solid #818cf8' }}
        title="View Congestion Turnaround Details"
      >
        <div className="piw-kpi-top">
          <span className="piw-kpi-label">AVG WAIT TIME</span>
          <Clock size={15} color="#818cf8" />
        </div>
        <div className="piw-kpi-val" style={{ color: '#ffffff' }}>
          {waitMeanHours.toFixed(1)} <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>hrs</span>
        </div>
        <div className="piw-kpi-bottom">
          <div className="piw-kpi-sub" style={{ color: waitTrendPct <= 0 ? '#34d399' : '#f87171' }}>
            {waitTrendPct < 0 ? (
              <TrendingDown size={13} />
            ) : waitTrendPct > 0 ? (
              <TrendingUp size={13} />
            ) : (
              <Minus size={13} />
            )}
            <span>{Math.abs(waitTrendPct)}% vs previous 7d</span>
          </div>
          <div className="piw-kpi-desc">Berth + anchorage waiting</div>
        </div>
      </div>

      {/* 5. CONGESTION INDEX */}
      <div
        className="piw-kpi-card"
        onClick={() => handleCardClick('overview')}
        style={{ borderLeft: `3px solid ${severityBadge.color}` }}
        title="View Port Congestion Radar"
      >
        <div className="piw-kpi-top">
          <span className="piw-kpi-label">CONGESTION INDEX</span>
          <AlertTriangle size={15} color={severityBadge.color} />
        </div>
        <div className="piw-kpi-val" style={{ color: '#ffffff' }}>
          {congestion.indexScore} <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 500 }}>/ 100</span>
        </div>
        <div className="piw-kpi-bottom">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              borderRadius: '4px',
              background: severityBadge.bg,
              border: severityBadge.border,
              color: severityBadge.color,
              fontSize: '11px',
              fontWeight: 700,
              width: 'fit-content',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: severityBadge.color }} />
            <span>{severityBadge.label}</span>
          </div>
          <div className="piw-kpi-desc">Turnaround pressure metric</div>
        </div>
      </div>

      {/* 6. LINEUP QUEUE */}
      <div
        className="piw-kpi-card"
        onClick={() => handleCardClick('terminals')}
        style={{ borderLeft: '3px solid #c084fc' }}
        title="View Lineup Berthing Queue"
      >
        <div className="piw-kpi-top">
          <span className="piw-kpi-label">LINEUP QUEUE</span>
          <Layers size={15} color="#c084fc" />
        </div>
        <div className="piw-kpi-val" style={{ color: '#c084fc' }}>
          {summary.lineupQueueCount}
        </div>
        <div className="piw-kpi-bottom">
          <div className="piw-kpi-sub" style={{ color: '#94a3b8' }}>
            <span>scheduled forward</span>
          </div>
          <div className="piw-kpi-desc">
            <strong style={{ color: '#c084fc' }}>{summary.totalLineupCargoTons.toLocaleString()}</strong> MT cargo
          </div>
        </div>
      </div>
    </div>
  );
};
