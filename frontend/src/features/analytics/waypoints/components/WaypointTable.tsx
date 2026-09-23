/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: 34-Waypoint Canonical Registry Table
 */

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  GitCompare,
} from 'lucide-react';
import type {
  MaritimeWaypointRecord,
  WaypointLiveActivity,
} from '../../../../types/waypoints';

interface WaypointTableProps {
  waypoints: MaritimeWaypointRecord[];
  activities: Record<string, WaypointLiveActivity>;
  selectedWaypointId: string | null;
  onSelectWaypoint: (id: string) => void;
  comparisonIds: string[];
  onToggleCompare: (id: string) => void;
}

type SortField = 'name' | 'type' | 'region' | 'transits' | 'waiting' | 'waitHours' | 'congestion';
type SortOrder = 'asc' | 'desc';

export function WaypointTable({
  waypoints,
  activities,
  selectedWaypointId,
  onSelectWaypoint,
  comparisonIds,
  onToggleCompare,
}: WaypointTableProps) {
  const [sortField, setSortField] = useState<SortField>('transits');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedWaypoints = useMemo(() => {
    const list = [...waypoints];
    list.sort((a, b) => {
      const actA = activities[a.id];
      const actB = activities[b.id];

      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === 'type') {
        valA = a.type;
        valB = b.type;
      } else if (sortField === 'region') {
        valA = a.region;
        valB = b.region;
      } else if (sortField === 'transits') {
        valA = actA ? actA.transits24h : 0;
        valB = actB ? actB.transits24h : 0;
      } else if (sortField === 'waiting') {
        valA = actA ? actA.waitingVessels : 0;
        valB = actB ? actB.waitingVessels : 0;
      } else if (sortField === 'waitHours') {
        valA = actA ? actA.medianWaitingHours : 0;
        valB = actB ? actB.medianWaitingHours : 0;
      } else if (sortField === 'congestion') {
        valA = actA ? actA.congestionScore : 0;
        valB = actB ? actB.congestionScore : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [waypoints, activities, sortField, sortOrder]);

  const getCongestionColor = (score: number) => {
    if (score >= 75) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 35) return '#eab308';
    return '#10b981';
  };

  const getSecurityColor = (rating: string) => {
    if (rating === 'EXTREME') return '#ef4444';
    if (rating === 'HIGH') return '#f97316';
    if (rating === 'MEDIUM') return '#eab308';
    return '#10b981';
  };

  return (
    <div
      style={{
        background: 'var(--color-bg-surface, #0f172a)',
        border: '1px solid var(--color-border-subtle, #1e293b)',
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
          34-Chokepoints Registry & Operational Telemetry ({sortedWaypoints.length} matching)
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
          Click any chokepoint row to launch detailed specifications & cross-module links
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid #334155' }}>
              <th
                onClick={() => handleSort('name')}
                style={{ padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Chokepoint / Country</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('type')}
                style={{ padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Type</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('region')}
                style={{ padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Oceanic Region</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('transits')}
                style={{ padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>24h Transits</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('waiting')}
                style={{ padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Queue (Vessels)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('waitHours')}
                style={{ padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Median Wait</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('congestion')}
                style={{ padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Congestion</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>
                Security Risk
              </th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>
                Compare
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedWaypoints.map((wp) => {
              const act = activities[wp.id];
              const isSelected = wp.id === selectedWaypointId;
              const isCompared = comparisonIds.includes(wp.id);
              const congestionColor = getCongestionColor(act ? act.congestionScore : 0);
              const securityColor = getSecurityColor(wp.securityRiskRating);

              return (
                <tr
                  key={wp.id}
                  onClick={() => onSelectWaypoint(wp.id)}
                  style={{
                    borderBottom: '1px solid #1e293b',
                    background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{wp.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{wp.country}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#1e293b',
                        color: '#94a3b8',
                        border: '1px solid #334155',
                      }}
                    >
                      {wp.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                    {wp.region}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#38bdf8' }}>
                    {act ? act.transits24h : 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#f59e0b' }}>
                    {act ? act.waitingVessels : 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                    {act ? `${act.medianWaitingHours}h` : 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontWeight: 700,
                        color: congestionColor,
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: congestionColor }} />
                      {act ? `${act.congestionScore}/100` : 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${securityColor}22`,
                        color: securityColor,
                      }}
                    >
                      {wp.securityRiskRating}
                    </span>
                  </td>
                  <td
                    style={{ padding: '0.75rem 1rem', textAlign: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare(wp.id);
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        background: isCompared ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                        border: `1px solid ${isCompared ? '#818cf8' : '#334155'}`,
                        borderRadius: '6px',
                        padding: '0.25rem 0.5rem',
                        color: isCompared ? '#a5b4fc' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                      }}
                    >
                      <GitCompare size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
