/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Waypoint Multi-Chokepoint Comparison Modal
 */

import { X, GitCompare, Check, AlertCircle } from 'lucide-react';
import type {
  MaritimeWaypointRecord,
  WaypointComparisonResult,
} from '../../../../types/waypoints';

interface WaypointComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparisonResult: WaypointComparisonResult;
  allWaypoints: MaritimeWaypointRecord[];
  selectedIds: string[];
  onToggleWaypoint: (id: string) => void;
  onClear: () => void;
}

export function WaypointComparisonModal({
  isOpen,
  onClose,
  comparisonResult,
  allWaypoints,
  selectedIds,
  onToggleWaypoint,
  onClear,
}: WaypointComparisonModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitCompare size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Strategic Chokepoints Side-by-Side Comparison
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.15rem 0 0 0' }}>
                Compare throughput capacity, queue delays, and operational geometry across major bottlenecks.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClear}
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid #334155',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick Chokepoint Selector Pills */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            background: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Toggle (2-4 nodes):
          </span>
          {allWaypoints.slice(0, 10).map((wp) => {
            const isSelected = selectedIds.includes(wp.id);
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => onToggleWaypoint(wp.id)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '16px',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 600 : 400,
                  background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                  color: isSelected ? '#a5b4fc' : '#94a3b8',
                  border: `1px solid ${isSelected ? '#818cf8' : '#334155'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {isSelected && <Check size={11} />}
                <span>{wp.name}</span>
              </button>
            );
          })}
        </div>

        {/* Comparison Content Table */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {comparisonResult.metrics.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.75rem auto' }} />
              <div>Please select at least 2 chokepoints above to begin side-by-side comparison.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>
                      Operational Metric
                    </th>
                    {comparisonResult.metrics.map((m) => (
                      <th
                        key={m.waypointId}
                        style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 700 }}
                      >
                        <div>{m.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 500 }}>
                          {m.type} &bull; {m.region}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 500 }}>24h Transits</td>
                    {comparisonResult.metrics.map((m) => (
                      <td key={m.waypointId} style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontWeight: 700 }}>
                        {m.transits24h} vessels
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 500 }}>Waiting Queue</td>
                    {comparisonResult.metrics.map((m) => (
                      <td key={m.waypointId} style={{ padding: '0.75rem 1rem', color: '#f59e0b', fontWeight: 700 }}>
                        {m.waitingVessels} vessels
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 500 }}>Median Wait Duration</td>
                    {comparisonResult.metrics.map((m) => (
                      <td key={m.waypointId} style={{ padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 600 }}>
                        {m.avgWaitHours} hours
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 500 }}>Congestion Score</td>
                    {comparisonResult.metrics.map((m) => (
                      <td key={m.waypointId} style={{ padding: '0.75rem 1rem', color: '#c084fc', fontWeight: 700 }}>
                        {m.congestionScore} / 100
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 500 }}>Primary Vessel Class</td>
                    {comparisonResult.metrics.map((m) => (
                      <td key={m.waypointId} style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                        {m.topVesselClass}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 500 }}>Max Draft Limit</td>
                    {comparisonResult.metrics.map((m) => (
                      <td key={m.waypointId} style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                        {m.maxDraft !== null ? `${m.maxDraft} m` : 'Deepwater Unrestricted'}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 500 }}>Transit Duration</td>
                    {comparisonResult.metrics.map((m) => (
                      <td key={m.waypointId} style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                        ~{m.transitHours} hours
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
