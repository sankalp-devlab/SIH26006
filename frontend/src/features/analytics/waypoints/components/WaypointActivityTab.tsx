/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Waypoint Activity & Vessel Class Distribution Tab
 */

import {
  Ship,
  TrendingUp,
  Layers,
} from 'lucide-react';
import type {
  MaritimeWaypointRecord,
  WaypointLiveActivity,
  WaypointMode,
} from '../../../../types/waypoints';

interface WaypointActivityTabProps {
  topTransits: Array<{ waypoint: MaritimeWaypointRecord; activity: WaypointLiveActivity; value: number }>;
  topCongestion?: Array<{ waypoint: MaritimeWaypointRecord; activity: WaypointLiveActivity; value: number }>;
  vesselClassBreakdown: Array<{ vesselClass: string; totalActive: number; totalTransits: number; waitingCount: number; sharePct: number }>;
  modeBreakdown: Array<{ mode: WaypointMode; vesselCount: number; percentage: number }>;
  onSelectWaypoint: (id: string) => void;
  selectedWaypointId: string | null;
}

export function WaypointActivityTab({
  topTransits,
  vesselClassBreakdown,
  modeBreakdown,
  onSelectWaypoint,
  selectedWaypointId,
}: WaypointActivityTabProps) {
  const getModeColor = (mode: WaypointMode) => {
    if (mode === 'tanker') return '#f59e0b';
    if (mode === 'dry') return '#38bdf8';
    if (mode === 'lng') return '#c084fc';
    return '#10b981';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Panel 1: Transit Volume Rankings */}
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
            <TrendingUp size={16} color="#38bdf8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Top Chokepoints by 24h Transit Volume
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Daily AIS Runs</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {topTransits.map((item, idx) => {
            const isSelected = item.waypoint.id === selectedWaypointId;
            return (
              <div
                key={item.waypoint.id}
                onClick={() => onSelectWaypoint(item.waypoint.id)}
                style={{
                  padding: '0.65rem 0.85rem',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(51, 65, 85, 0.5)',
                      color: idx === 0 ? '#f59e0b' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                      {item.waypoint.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {item.waypoint.region} &bull; {item.waypoint.type}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                    {item.activity.transits24h}{' '}
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94a3b8' }}>transits</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {item.activity.activeVesselsInZone} vessels in zone
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel 2: Fleet Composition by Vessel Class */}
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
            <Ship size={16} color="#818cf8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Vessel Class Utilization
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Cross-Chokepoints Share</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {vesselClassBreakdown.slice(0, 6).map((item) => (
            <div key={item.vesselClass}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#f8fafc', fontWeight: 500 }}>{item.vesselClass}</span>
                <span style={{ color: '#94a3b8' }}>
                  <strong style={{ color: '#818cf8' }}>{item.totalActive}</strong> vessels ({item.sharePct}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${item.sharePct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 3: Maritime Sector Share */}
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
            <Layers size={16} color="#c084fc" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Maritime Sector Distribution
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Active Fleet Share</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modeBreakdown.map((item) => (
            <div key={item.mode}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#f8fafc', fontWeight: 600, textTransform: 'capitalize' }}>
                  {item.mode === 'dry' ? 'Dry Bulk' : item.mode.toUpperCase()}
                </span>
                <span style={{ color: getModeColor(item.mode), fontWeight: 700 }}>
                  {item.vesselCount} vessels ({item.percentage}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    background: getModeColor(item.mode),
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
