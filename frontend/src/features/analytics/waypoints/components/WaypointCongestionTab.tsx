/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Waypoint Congestion, Queue Durations & Bottleneck Risk Tab
 */

import {
  Clock,
  Activity,
} from 'lucide-react';
import type {
  MaritimeWaypointRecord,
  WaypointLiveActivity,
} from '../../../../types/waypoints';

interface WaypointCongestionTabProps {
  topCongestion: Array<{ waypoint: MaritimeWaypointRecord; activity: WaypointLiveActivity; value: number }>;
  topWaiting: Array<{ waypoint: MaritimeWaypointRecord; activity: WaypointLiveActivity; value: number }>;
  onSelectWaypoint: (id: string) => void;
  selectedWaypointId: string | null;
}

export function WaypointCongestionTab({
  topCongestion,
  topWaiting,
  onSelectWaypoint,
  selectedWaypointId,
}: WaypointCongestionTabProps) {
  const getCongestionColor = (score: number) => {
    if (score >= 75) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 35) return '#eab308';
    return '#10b981';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Panel 1: Critical Congestion Rankings */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="#ef4444" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Chokepoints Ranked by Bottleneck Delay Index
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Index /100</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {topCongestion.map((item) => {
            const isSelected = item.waypoint.id === selectedWaypointId;
            const color = getCongestionColor(item.activity.congestionScore);
            return (
              <div
                key={item.waypoint.id}
                onClick={() => onSelectWaypoint(item.waypoint.id)}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                      {item.waypoint.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: `${color}22`,
                        color,
                      }}
                    >
                      {item.activity.congestionLevel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    Median Queue: <strong style={{ color: '#f59e0b' }}>{item.activity.medianWaitingHours}h</strong> &bull;{' '}
                    Waiting: {item.activity.waitingVessels} vessels
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color }}>
                    {item.activity.congestionScore}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>score</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel 2: Waiting Queue Anchoring Matrix */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="#f59e0b" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Anchorage Queue & Waiting Durations
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Queued Fleet</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {topWaiting.map((item) => {
            const isSelected = item.waypoint.id === selectedWaypointId;
            return (
              <div
                key={item.waypoint.id}
                onClick={() => onSelectWaypoint(item.waypoint.id)}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                    {item.waypoint.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {item.waypoint.physicalConstraints.locksRequired ? 'Lock Canal' : 'Open Navigational Waterway'} &bull;{' '}
                    Cap: {item.waypoint.physicalConstraints.nominalDailyCapacity}/day
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f59e0b' }}>
                    {item.activity.waitingVessels}{' '}
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94a3b8' }}>vessels</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
                    ~{item.activity.medianWaitingHours}h wait
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
