import { Link } from 'react-router-dom';
import {
  Compass,
  Sun,
  ShieldAlert,
  Clock,
  Building2,
  Navigation,
  ArrowRight,
  Activity,
  Anchor,
  Ship,
} from 'lucide-react';
import type { PortInsightPayload, PortCongestionSeverity } from '../../../types/port-insights';
import type { PortWorkspaceTab } from '../../../hooks/usePortInsights';

interface PortOverviewTabProps {
  payload: PortInsightPayload;
  onNavigateTab: (tab: PortWorkspaceTab) => void;
}

export const PortOverviewTab: React.FC<PortOverviewTabProps> = ({ payload, onNavigateTab }) => {
  const { port, weather, terminals, activities, lineups } = payload;
  const waitingCount = activities.filter((a) => a.status === 'waiting').length;
  const operatingCount = activities.filter((a) => a.status === 'operating').length;
  const arrivingCount = activities.filter((a) => a.status === 'arriving').length;
  const totalBerths = terminals.reduce((sum, t) => sum + (t.totalBerths ?? t.berths_total ?? 0), 0) || 10;

  const physicalSpecs = payload.physicalSpecs ?? {
    maxDraftMeters: Math.max(...terminals.map((t) => t.max_draft_m || 0), 18.0),
    maxLoaMeters: Math.max(...terminals.map((t) => t.max_loa_m || 0), 360),
    maxBeamMeters: 60,
    tidalRangeMeters: 3.5,
    waterDensity: 1.025,
    channelType: 'Deep-water approach channel',
    pilotageCompulsory: true,
    tugRequirement: true,
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
      summary: 'Favorable maritime conditions',
      windImpact: '12 kts NW',
      swellImpact: '1.2m wave height',
      visibilityImpact: '10 NM visibility',
    },
    overallBerthUtilizationPct: totalBerths > 0 ? (operatingCount / totalBerths) * 100 : 75,
  };

  const { congestion, waitingTimeStats, weatherImpact } = analytics;

  // Congestion Severity Badge
  const getSeverityBadge = (severity: PortCongestionSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badge: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.4)',
          text: '#f43f5e',
          bar: '#f43f5e',
          label: 'CRITICAL',
        };
      case 'HIGH':
        return {
          badge: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          text: '#f59e0b',
          bar: '#f59e0b',
          label: 'HIGH CONGESTION',
        };
      case 'MODERATE':
        return {
          badge: 'rgba(0, 216, 255, 0.15)',
          border: 'rgba(0, 216, 255, 0.4)',
          text: '#00d8ff',
          bar: '#00d8ff',
          label: 'MODERATE',
        };
      case 'LOW':
      default:
        return {
          badge: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          text: '#10b981',
          bar: '#10b981',
          label: 'NORMAL / FLUID',
        };
    }
  };

  const sevStyle = getSeverityBadge(congestion.severity);

  // SVG Trend Chart Data Points (Simulated 7-day trend curve)
  const trendPoints = [
    { day: 'Day -6', score: Math.max(10, congestion.indexScore - 8) },
    { day: 'Day -5', score: Math.max(10, congestion.indexScore - 4) },
    { day: 'Day -4', score: Math.max(10, congestion.indexScore - 12) },
    { day: 'Day -3', score: Math.max(10, congestion.indexScore + 6) },
    { day: 'Day -2', score: Math.max(10, congestion.indexScore + 2) },
    { day: 'Day -1', score: Math.max(10, congestion.indexScore - 2) },
    { day: 'Today', score: congestion.indexScore },
  ];

  const maxTrendScore = 100;
  const chartHeight = 110;
  const chartWidth = 380;

  const pointsString = trendPoints
    .map((p, idx) => {
      const x = (idx / (trendPoints.length - 1)) * (chartWidth - 40) + 20;
      const y = chartHeight - (p.score / maxTrendScore) * (chartHeight - 24) - 12;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="piw-overview-grid">
      {/* ============================================================
          LEFT COLUMN (1.15fr): Operations, Technical Specs, Terminals
          ============================================================ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Port Operations Summary */}
        <div className="piw-card">
          <div className="piw-card-header">
            <h3 className="piw-card-title">
              <Activity size={17} color="#00d8ff" />
              <span>Port Operations Summary</span>
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Live Operational Throughput</span>
          </div>

          <div className="piw-ops-grid">
            {/* Arrivals */}
            <div className="piw-ops-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                  Arrivals
                </span>
                <Ship size={13} color="#00d8ff" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#00d8ff', fontFamily: 'monospace' }}>
                {arrivingCount}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>inbound (72h)</span>
              <div style={{ width: '100%', height: 3, background: 'rgba(80,180,255,0.15)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ width: '70%', height: '100%', background: '#00d8ff' }} />
              </div>
            </div>

            {/* Anchorage */}
            <div className="piw-ops-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                  Anchorage
                </span>
                <Anchor size={13} color="#f59e0b" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                {waitingCount}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>awaiting berth</span>
              <div style={{ width: '100%', height: 3, background: 'rgba(80,180,255,0.15)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ width: `${Math.min(100, waitingCount * 25)}%`, height: '100%', background: '#f59e0b' }} />
              </div>
            </div>

            {/* Berths Occupied */}
            <div className="piw-ops-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                  Berths
                </span>
                <Building2 size={13} color="#38bdf8" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                {operatingCount} <span style={{ fontSize: '13px', color: '#64748b' }}>/ {totalBerths}</span>
              </span>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>
                {Math.round((operatingCount / totalBerths) * 100)}% active
              </span>
              <div style={{ width: '100%', height: 3, background: 'rgba(80,180,255,0.15)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ width: `${Math.round((operatingCount / totalBerths) * 100)}%`, height: '100%', background: '#38bdf8' }} />
              </div>
            </div>

            {/* Lineup Queue */}
            <div className="piw-ops-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                  Lineup
                </span>
                <Clock size={13} color="#c084fc" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>
                {lineups.length}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>forward vessels</span>
              <div style={{ width: '100%', height: 3, background: 'rgba(80,180,255,0.15)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ width: `${Math.min(100, lineups.length * 20)}%`, height: '100%', background: '#c084fc' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Port Technical & Physical Specifications */}
        <div className="piw-card">
          <div className="piw-card-header">
            <h3 className="piw-card-title">
              <Building2 size={17} color="#38bdf8" />
              <span>Port Technical & Physical Specifications</span>
            </h3>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              PUB 150 HARBOR
            </span>
          </div>

          <div className="piw-specs-grid">
            {/* Max Vessel Draft */}
            <div className="piw-spec-tile">
              <span className="piw-spec-lbl">MAX VESSEL DRAFT</span>
              <span className="piw-spec-val">{physicalSpecs.maxDraftMeters} m</span>
              <span className="piw-spec-sub">at Mean Low Water</span>
            </div>

            {/* Max Length (LOA) */}
            <div className="piw-spec-tile">
              <span className="piw-spec-lbl">MAX LENGTH (LOA)</span>
              <span className="piw-spec-val">{physicalSpecs.maxLoaMeters} m</span>
              <span className="piw-spec-sub">ultra-large class</span>
            </div>

            {/* Max Beam */}
            <div className="piw-spec-tile">
              <span className="piw-spec-lbl">MAX BEAM</span>
              <span className="piw-spec-val">{physicalSpecs.maxBeamMeters} m</span>
              <span className="piw-spec-sub">channel clearance</span>
            </div>

            {/* Tidal Range */}
            <div className="piw-spec-tile">
              <span className="piw-spec-lbl">TIDAL RANGE</span>
              <span className="piw-spec-val">{physicalSpecs.tidalRangeMeters} m</span>
              <span className="piw-spec-sub">semi-diurnal tide</span>
            </div>

            {/* Water Density */}
            <div className="piw-spec-tile">
              <span className="piw-spec-lbl">WATER DENSITY</span>
              <span className="piw-spec-val">{physicalSpecs.waterDensity}</span>
              <span className="piw-spec-sub">saline density g/cm³</span>
            </div>

            {/* Channel Configuration */}
            <div className="piw-spec-tile">
              <span className="piw-spec-lbl">CHANNEL CONFIG</span>
              <span className="piw-spec-val" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {physicalSpecs.channelType || 'Deep-water approach'}
              </span>
              <span className="piw-spec-sub">controlled navigation</span>
            </div>
          </div>

          {/* Operational Protocols */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(80,180,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <ShieldAlert size={15} color="#10b981" />
              <span>
                Compulsory Pilotage:{' '}
                <strong style={{ color: '#f1f5f9' }}>
                  {physicalSpecs.pilotageCompulsory ? 'Mandatory via VTS' : 'Optional'}
                </strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <ShieldAlert size={15} color="#00d8ff" />
              <span>
                Tug Assistance:{' '}
                <strong style={{ color: '#f1f5f9' }}>
                  {physicalSpecs.tugRequirement ? 'Required for >150m LOA' : 'Not required'}
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Cross-Module Link */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#061321',
              border: '1px solid rgba(80, 180, 255, 0.12)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginTop: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <Compass size={15} color="#00d8ff" />
              <span>Calculate exact nautical route and voyage plan from this port.</span>
            </div>
            <Link
              to={`/distance-calculator?origin=${encodeURIComponent(port.name)}`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Route From Here</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* 3. Operational Terminals */}
        <div className="piw-card">
          <div className="piw-card-header">
            <h3 className="piw-card-title">
              <Building2 size={17} color="#00d8ff" />
              <span>Operational Terminals ({terminals.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('terminals')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00d8ff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View Berths & Lineup</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {terminals.slice(0, 4).map((term) => (
              <div key={term.id} className="piw-item-row">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                    {term.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {term.terminalType || term.terminal_type || 'Multi-Purpose'} &bull; Max Draft{' '}
                    {term.maxDraftMeters ?? term.max_draft_m ?? 14}m
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: '#f1f5f9' }}>
                    {term.occupiedBerths ?? term.berths_occupied ?? 0} / {term.totalBerths ?? term.berths_total ?? 2} berths
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                    {((term.handlingRateTph ?? Math.round((term.handling_rate_mt_day || 0) / 24)) || 650).toLocaleString()} TPH
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          RIGHT COLUMN (0.85fr): Weather, Congestion, Live Vessels
          ============================================================ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Current Maritime Weather & Operational Advisory */}
        <div className="piw-card">
          <div className="piw-card-header">
            <h3 className="piw-card-title">
              <Sun size={17} color="#f59e0b" />
              <span>Current Maritime Weather</span>
            </h3>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              <span>{weatherImpact.impactLevel || 'OPTIMAL'}</span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.4 }}>
            {weatherImpact.advisoryNote || weatherImpact.summary || 'Favorable maritime conditions across berths.'}
          </p>

          {/* 4 Metric Tiles: Temp, Wind, Swell, Visibility */}
          <div className="piw-weather-strip">
            <div className="piw-weather-tile">
              <span className="piw-weather-lbl">AIR TEMP</span>
              <span className="piw-weather-val" style={{ color: '#f59e0b' }}>{weather.temperatureC}&deg;C</span>
            </div>

            <div className="piw-weather-tile">
              <span className="piw-weather-lbl">WIND</span>
              <span className="piw-weather-val" style={{ color: '#00d8ff' }}>{weather.windSpeedKnots} kn</span>
            </div>

            <div className="piw-weather-tile">
              <span className="piw-weather-lbl">SWELL</span>
              <span className="piw-weather-val" style={{ color: '#38bdf8' }}>{weather.waveHeightMeters} m</span>
            </div>

            <div className="piw-weather-tile">
              <span className="piw-weather-lbl">VISIBILITY</span>
              <span className="piw-weather-val" style={{ color: '#818cf8' }}>{weather.visibilityNm} NM</span>
            </div>
          </div>
        </div>

        {/* 2. Port Congestion & Turnaround + 7-Day Trend Line Chart */}
        <div className="piw-card">
          <div className="piw-card-header">
            <h3 className="piw-card-title">
              <Clock size={17} color="#f59e0b" />
              <span>Port Congestion & Turnaround</span>
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: sevStyle.badge,
                border: `1px solid ${sevStyle.border}`,
                color: sevStyle.text,
              }}
            >
              {congestion.severity}
            </span>
          </div>

          {/* Score & Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Congestion Index Score</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                {congestion.indexScore} <span style={{ fontSize: '13px', color: '#64748b' }}>/ 100</span>
              </span>
            </div>
            <div style={{ width: '100%', height: 7, background: 'rgba(80, 180, 255, 0.15)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${congestion.indexScore}%`,
                  height: '100%',
                  background: sevStyle.bar,
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
              <span>0 Normal</span>
              <span>35 Moderate</span>
              <span>60 High</span>
              <span>80+ Critical</span>
            </div>
          </div>

          {/* Anchorage Queue & Berth Occupancy Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: '#061321', border: '1px solid rgba(80, 180, 255, 0.1)', borderRadius: '8px', padding: '10px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Anchorage Queue
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                {waitingCount} vessels waiting
              </span>
            </div>

            <div style={{ background: '#061321', border: '1px solid rgba(80, 180, 255, 0.1)', borderRadius: '8px', padding: '10px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Berth Occupancy
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                {Math.round((operatingCount / totalBerths) * 100)}% occupied
              </span>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div style={{ marginTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
                7-Day Congestion Trend
              </span>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>
                Median wait: {waitingTimeStats.medianHours.toFixed(1)} hrs
              </span>
            </div>

            <div
              style={{
                background: '#061321',
                border: '1px solid rgba(80, 180, 255, 0.12)',
                borderRadius: '8px',
                padding: '12px',
                height: '140px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100px', overflow: 'visible' }}>
                {/* Horizontal Grid lines */}
                <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="rgba(80,180,255,0.08)" strokeDasharray="3,3" />
                <line x1="20" y1="55" x2={chartWidth - 20} y2="55" stroke="rgba(80,180,255,0.08)" strokeDasharray="3,3" />
                <line x1="20" y1="90" x2={chartWidth - 20} y2="90" stroke="rgba(80,180,255,0.08)" strokeDasharray="3,3" />

                {/* Polyline */}
                <polyline
                  fill="none"
                  stroke="#00d8ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />

                {/* Circles */}
                {trendPoints.map((p, idx) => {
                  const x = (idx / (trendPoints.length - 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - (p.score / maxTrendScore) * (chartHeight - 24) - 12;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#00d8ff"
                      stroke="#061321"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', padding: '0 4px' }}>
                <span>7 days ago</span>
                <span>4 days ago</span>
                <span style={{ color: '#00d8ff', fontWeight: 600 }}>Today ({congestion.indexScore})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Live Vessels at Port */}
        <div className="piw-card">
          <div className="piw-card-header">
            <h3 className="piw-card-title">
              <Navigation size={17} color="#10b981" />
              <span>Live Vessels at Port ({activities.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('activity')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00d8ff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Full Activity List</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="piw-item-row">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{act.vessel_name}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>({act.vessel_type})</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {act.cargo_type} &bull; {act.cargo_quantity_mt.toLocaleString()} MT
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background:
                        act.status === 'operating'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : act.status === 'waiting'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(0, 216, 255, 0.15)',
                      color:
                        act.status === 'operating'
                          ? '#10b981'
                          : act.status === 'waiting'
                          ? '#f59e0b'
                          : '#00d8ff',
                      border:
                        act.status === 'operating'
                          ? '1px solid rgba(16, 185, 129, 0.35)'
                          : act.status === 'waiting'
                          ? '1px solid rgba(245, 158, 11, 0.35)'
                          : '1px solid rgba(0, 216, 255, 0.35)',
                    }}
                  >
                    {act.status}
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                    {act.status === 'waiting' ? `${act.waiting_hours}h wait` : act.terminal_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
