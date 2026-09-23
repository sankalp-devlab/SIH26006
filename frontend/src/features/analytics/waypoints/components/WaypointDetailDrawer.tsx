/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Waypoint Detailed Specification & Cross-Module Drawer
 */

import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowUpRight,
} from 'lucide-react';
import type {
  MaritimeWaypointRecord,
  WaypointLiveActivity,
} from '../../../../types/waypoints';

interface WaypointDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  waypoint: MaritimeWaypointRecord | null;
  activity: WaypointLiveActivity | null;
}

export function WaypointDetailDrawer({
  isOpen,
  onClose,
  waypoint,
  activity,
}: WaypointDetailDrawerProps) {
  const navigate = useNavigate();

  if (!isOpen || !waypoint) return null;

  const constraints = waypoint.physicalConstraints;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#0f172a',
          borderLeft: '1px solid #334155',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: '#0f172a',
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {waypoint.type}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {waypoint.region} &bull; {waypoint.country}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '0.35rem 0 0 0' }}>
              {waypoint.name}
            </h2>
          </div>

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

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>24h Transit Volume</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
                {activity ? activity.transits24h : 'N/A'}{' '}
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>vessels</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                7d avg: {activity ? activity.transits7dAvg : 'N/A'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Waiting Queue</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.2rem' }}>
                {activity ? activity.waitingVessels : 'N/A'}{' '}
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>vessels</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                Median wait: {activity ? `${activity.medianWaitingHours}h` : 'N/A'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Congestion Score</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#c084fc', marginTop: '0.2rem' }}>
                {activity ? `${activity.congestionScore}/100` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                Level: {activity ? activity.congestionLevel : 'N/A'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Security Risk Rating</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.35rem' }}>
                {waypoint.securityRiskRating}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                IMO / Maritime Security Watch
              </div>
            </div>
          </div>

          {/* Section: Geographic & Coordinate Details */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Geographic Coordinates
            </h3>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Latitude:</span>
                <strong style={{ color: '#f8fafc' }}>{waypoint.latitude.toFixed(4)}° N/S</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Longitude:</span>
                <strong style={{ color: '#f8fafc' }}>{waypoint.longitude.toFixed(4)}° E/W</strong>
              </div>
            </div>
          </div>

          {/* Section: Physical Dimensions & Constraints */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Physical Dimensions & Navigational Limits
            </h3>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Max Permissible Draft:</span>
                <strong>{constraints.maxDraftMeters !== null ? `${constraints.maxDraftMeters} m` : 'Unrestricted Deepwater'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Max Beam / Width:</span>
                <strong>{constraints.maxBeamMeters !== null ? `${constraints.maxBeamMeters} m` : 'Open Waterway'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Max Vessel Length:</span>
                <strong>{constraints.maxLengthMeters !== null ? `${constraints.maxLengthMeters} m` : 'Unrestricted'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Air Draft Clearance:</span>
                <strong>{constraints.maxAirDraftMeters !== null ? `${constraints.maxAirDraftMeters} m` : 'No Overhead Structures'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Transit Duration:</span>
                <strong style={{ color: '#38bdf8' }}>~{constraints.transitDurationHours} hours</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Nominal Daily Capacity:</span>
                <strong>{constraints.nominalDailyCapacity} transits/day</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Locks / Toll Required:</span>
                <strong>
                  {constraints.locksRequired ? 'Locks Required' : 'Open Channel'} &bull;{' '}
                  {constraints.tollRequired ? 'Toll Canal' : 'Free High Seas'}
                </strong>
              </div>
            </div>
          </div>

          {/* Section: Strategic Context */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Strategic Geopolitical Context
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0, padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid #1e293b' }}>
              {waypoint.strategicContext}
            </p>
          </div>

          {/* Section: Cross-Module Integration Actions */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Cross-Module Intelligence Linkage
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Module 13 Link */}
              <button
                type="button"
                onClick={() => navigate('/ports')}
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Port Insights (Module 13)</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Nearest Port: {waypoint.relatedPorts[0]?.name} ({waypoint.relatedPorts[0]?.distanceNm} nm)
                  </div>
                </div>
                <ArrowUpRight size={15} color="#38bdf8" />
              </button>

              {/* Module 16 Link */}
              <button
                type="button"
                onClick={() => navigate('/flows')}
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Trade Flows & Corridors (Module 16)</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Linked trade lane: {waypoint.relatedFlows.tradeLaneCodes[0] || 'Global Flow'}
                  </div>
                </div>
                <ArrowUpRight size={15} color="#38bdf8" />
              </button>

              {/* Module 5 Link */}
              <button
                type="button"
                onClick={() => navigate('/analytics/market')}
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Market Insights (Module 5)</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Market Route: {waypoint.relatedMarkets.marketRoutes[0] || 'C3 / TD3'}
                  </div>
                </div>
                <ArrowUpRight size={15} color="#38bdf8" />
              </button>

              {/* Module 12 Link */}
              <button
                type="button"
                onClick={() => navigate('/distance-calculator')}
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Distance & Canal Calculator (Module 12)</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Compute bunker consumption & transit tolls
                  </div>
                </div>
                <ArrowUpRight size={15} color="#38bdf8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
