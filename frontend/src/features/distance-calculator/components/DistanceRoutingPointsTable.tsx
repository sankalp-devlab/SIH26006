/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator Ordered Routing Points Table & Manual Adjustment
 */

import React, { useState } from 'react';
import {
  ListOrdered,
  Plus,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react';
import type { DistanceCalculationResult, RoutingPoint } from '../../../types/distance-calculator';

interface DistanceRoutingPointsTableProps {
  result: DistanceCalculationResult;
  isManual: boolean;
  onSetManualDistance: (distanceNm: number) => void;
  onResetManualDistance: () => void;
  onAddCustomWaypoint: (wp: RoutingPoint) => void;
  onRemoveCustomWaypoint: (id: string) => void;
}

export function DistanceRoutingPointsTable({
  result,
  isManual,
  onSetManualDistance,
  onResetManualDistance,
  onAddCustomWaypoint,
  onRemoveCustomWaypoint,
}: DistanceRoutingPointsTableProps) {
  const [manualInput, setManualInput] = useState(String(result.total_distance_nm));
  const [isAddingWp, setIsAddingWp] = useState(false);
  const [wpName, setWpName] = useState('');
  const [wpLat, setWpLat] = useState('');
  const [wpLng, setWpLng] = useState('');

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(manualInput);
    if (val > 0) {
      onSetManualDistance(val);
    }
  };

  const handleAddWpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpName || !wpLat || !wpLng) return;

    const newWp: RoutingPoint = {
      id: `custom-wp-${Date.now()}`,
      name: wpName.trim(),
      category: 'custom',
      latitude: Number(wpLat),
      longitude: Number(wpLng),
      leg_distance_nm: 0,
      cumulative_distance_nm: 0,
      is_seca: false,
      is_manual: true,
    };

    onAddCustomWaypoint(newWp);
    setWpName('');
    setWpLat('');
    setWpLng('');
    setIsAddingWp(false);
  };

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header & Mode Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListOrdered size={18} style={{ color: '#38bdf8' }} />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
            Ordered Routing Waypoints ({result.points.length})
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: isManual ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isManual ? '#fbbf24' : '#34d399',
              border: `1px solid ${isManual ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            {isManual ? 'MANUALLY MODIFIED ROUTE' : 'AUTOMATIC CORRIDOR ROUTE'}
          </span>

          <button
            type="button"
            onClick={() => setIsAddingWp(!isAddingWp)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={13} />
            Add Waypoint
          </button>
        </div>
      </div>

      {/* Manual Override Control Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'rgba(10, 25, 47, 0.6)',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <form onSubmit={handleApplyOverride} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
            Manual Distance Override:
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              min="10"
              max="35000"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              style={{
                width: '120px',
                background: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                padding: '5px 8px',
                fontSize: '12px',
                color: '#f8fafc',
                outline: 'none',
              }}
            />
            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#64748b' }}>NM</span>
          </div>

          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              background: '#0284c7',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Check size={12} />
            Apply
          </button>
        </form>

        {isManual && (
          <button
            type="button"
            onClick={onResetManualDistance}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} />
            Reset to Auto
          </button>
        )}
      </div>

      {/* Inline Add Waypoint Form */}
      {isAddingWp && (
        <form
          onSubmit={handleAddWpSubmit}
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto',
            gap: '8px',
            alignItems: 'end',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
              Waypoint Name
            </label>
            <input
              type="text"
              placeholder="e.g. Cape Town Anchorage"
              value={wpName}
              onChange={(e) => setWpName(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
              Latitude (°N)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="-33.9"
              value={wpLat}
              onChange={(e) => setWpLat(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
              Longitude (°E)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="18.4"
              value={wpLng}
              onChange={(e) => setWpLng(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '6px 14px',
              background: '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              height: '32px',
            }}
          >
            Insert
          </button>
        </form>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#cbd5e1' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', textAlign: 'left', color: '#94a3b8' }}>
              <th style={{ padding: '8px 10px' }}>#</th>
              <th style={{ padding: '8px 10px' }}>Waypoint / Chokepoint</th>
              <th style={{ padding: '8px 10px' }}>Category</th>
              <th style={{ padding: '8px 10px' }}>Coordinates</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Leg (NM)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Cumulative (NM)</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Zone</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {result.points.map((pt, idx) => (
              <tr
                key={pt.id}
                style={{
                  borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                }}
              >
                <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: '#f8fafc' }}>
                  {pt.name}
                  {pt.is_manual && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: '#fbbf24' }}>
                      [CUSTOM]
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background:
                        pt.category === 'canal'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : pt.category === 'chokepoint'
                          ? 'rgba(56, 189, 248, 0.15)'
                          : pt.category === 'origin' || pt.category === 'destination'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(148, 163, 184, 0.15)',
                      color:
                        pt.category === 'canal'
                          ? '#fbbf24'
                          : pt.category === 'chokepoint'
                          ? '#38bdf8'
                          : pt.category === 'origin' || pt.category === 'destination'
                          ? '#34d399'
                          : '#cbd5e1',
                    }}
                  >
                    {pt.category}
                  </span>
                </td>
                <td style={{ padding: '8px 10px', color: '#94a3b8' }}>
                  {pt.latitude.toFixed(2)}°N, {pt.longitude.toFixed(2)}°E
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                  {idx === 0 ? '—' : `${pt.leg_distance_nm.toLocaleString()} NM`}
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>
                  {pt.cumulative_distance_nm.toLocaleString()} NM
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                  {pt.is_seca ? (
                    <span
                      style={{
                        background: 'rgba(192, 132, 252, 0.15)',
                        color: '#c084fc',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      SECA (0.10%)
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '11px' }}>Open Sea</span>
                  )}
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                  {pt.category === 'custom' ? (
                    <button
                      type="button"
                      onClick={() => onRemoveCustomWaypoint(pt.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                      title="Remove custom waypoint"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <span style={{ color: '#475569', fontSize: '11px' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
