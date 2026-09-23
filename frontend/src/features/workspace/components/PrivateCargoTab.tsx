/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Private Cargo Tracking Tab
 *
 * Strict user-level privacy: Private cargo records are NEVER merged with global trade flows.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShieldCheck,
  Plus,
  Trash2,
  Anchor,
  Ship,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import type { CargoTrackingStatus } from '../../../types/personalization';

interface PrivateCargoTabProps {
  onOpenAddCargo: () => void;
}

export const PrivateCargoTab: React.FC<PrivateCargoTabProps> = ({ onOpenAddCargo }) => {
  const navigate = useNavigate();
  const { privateCargo, updatePrivateCargo, deletePrivateCargo } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<CargoTrackingStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredCargo = privateCargo.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch =
      !search.trim() ||
      c.cargoName.toLowerCase().includes(search.toLowerCase()) ||
      c.cargoType.toLowerCase().includes(search.toLowerCase()) ||
      c.originPort.toLowerCase().includes(search.toLowerCase()) ||
      c.destinationPort.toLowerCase().includes(search.toLowerCase()) ||
      (c.associatedVesselName && c.associatedVesselName.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Privacy Guarantee Header Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(52, 211, 153, 0.08) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 10,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#f8fafc' }}>
              Confidential Private Cargo Tracking Workbench
            </h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
              These cargo records belong exclusively to your user profile and workspace. They are
              never published to public AIS manifests, commodity dashboards, or peer operators.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenAddCargo}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={14} /> Track New Cargo
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'in_transit', 'planned', 'discharging', 'completed', 'cancelled'] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: '0.78rem',
                  textTransform: 'capitalize',
                  background:
                    statusFilter === status
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: statusFilter === status ? '#38bdf8' : '#94a3b8',
                  border:
                    statusFilter === status
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                }}
              >
                {status.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search cargo, port, or vessel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 30, fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Cargo Records Table */}
      {filteredCargo.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--card-bg, #111827)',
            borderRadius: 10,
            border: '1px dashed rgba(255, 255, 255, 0.12)',
          }}
        >
          <Package size={36} color="#64748b" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h4 style={{ margin: '0 0 6px', color: '#e2e8f0', fontSize: '0.95rem' }}>
            No private cargo records found
          </h4>
          <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.82rem' }}>
            Track client parcels, voyage refs, bills of lading, and delivery itineraries privately.
          </p>
          <button type="button" className="btn btn-primary" onClick={onOpenAddCargo}>
            Add First Private Cargo
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '12px 16px' }}>Cargo / Commodity</th>
                <th style={{ padding: '12px 16px' }}>Volume</th>
                <th style={{ padding: '12px 16px' }}>Voyage Route</th>
                <th style={{ padding: '12px 16px' }}>Assigned Vessel</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>ETA</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCargo.map((cargo) => (
                <tr
                  key={cargo.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{cargo.cargoName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {cargo.cargoType} · Ref: {cargo.voyageRef || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                    {cargo.volume.toLocaleString()} {cargo.unit}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0' }}>
                      <Anchor size={12} color="#38bdf8" />
                      <span>{cargo.originPort} → {cargo.destinationPort}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {cargo.associatedVesselName ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#38bdf8',
                          cursor: cargo.associatedVesselId ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (cargo.associatedVesselId) {
                            navigate(`/vessels/${cargo.associatedVesselId}`);
                          }
                        }}
                      >
                        <Ship size={13} />
                        <span>{cargo.associatedVesselName}</span>
                        {cargo.associatedVesselId && <ExternalLink size={10} />}
                      </div>
                    ) : (
                      <span style={{ color: '#64748b' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={cargo.status}
                      onChange={(e) =>
                        updatePrivateCargo(cargo.id, {
                          status: e.target.value as CargoTrackingStatus,
                        })
                      }
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f8fafc',
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      <option value="planned">Planned</option>
                      <option value="in_transit">In Transit</option>
                      <option value="discharging">Discharging</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                    {cargo.estimatedArrival
                      ? new Date(cargo.estimatedArrival).toLocaleDateString()
                      : 'TBD'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete private cargo "${cargo.cargoName}"?`)) {
                          deletePrivateCargo(cargo.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                      title="Delete private cargo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
