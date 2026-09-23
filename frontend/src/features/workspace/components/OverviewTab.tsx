/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Overview Tab Launchpad
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Database,
  ShieldCheck,
  ArrowRight,
  Pin,
  Package,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { Badge } from '../../../components/ui/Badge';

interface OverviewTabProps {
  onSelectTab: (tab: string) => void;
  onOpenAddCargo: () => void;
  onOpenCreateList: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onSelectTab,
  onOpenAddCargo,
  onOpenCreateList,
}) => {
  const navigate = useNavigate();
  const { favourites, vesselLists, savedQueries, privateCargo, togglePinFavourite } = useWorkspace();

  const pinnedFavs = favourites.filter((f) => f.pinned);
  const activeCargo = privateCargo.filter((c) => c.status === 'in_transit' || c.status === 'planned');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Privacy Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.08) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 10,
          padding: '14px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>
              Encrypted User-Specific Maritime Workspace
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Your favourites, custom lists, private cargo parcels, and query bookmarks are preserved locally
              and isolated from global platform datasets.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenCreateList}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            + New Fleet Pool
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddCargo}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            + Track Private Cargo
          </button>
        </div>
      </div>

      {/* Grid of Two Columns: Pinned & Fleet Pools */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pinned Favourites */}
        <div
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pin size={16} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f1f5f9' }}>Pinned Fast Access</h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('favourites')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View all ({favourites.length}) <ArrowRight size={13} />
            </button>
          </div>

          {pinnedFavs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
              No pinned favourites yet. Pin critical vessels, ports, or queries for rapid access.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pinnedFavs.slice(0, 4).map((fav) => (
                <div
                  key={fav.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => navigate(fav.path)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#38bdf8' }}>
                        {fav.title}
                      </span>
                      {fav.badge && (
                        <Badge variant="info" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                          {fav.badge}
                        </Badge>
                      )}
                    </div>
                    {fav.subtitle && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                        {fav.subtitle}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => togglePinFavourite(fav.id)}
                      title="Unpin favourite"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <Pin size={14} color="#f59e0b" fill="#f59e0b" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => navigate(fav.path)}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Vessel Lists / Fleets */}
        <div
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ship size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f1f5f9' }}>Saved Fleet Pools</h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('vessel_lists')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Manage ({vesselLists.length}) <ArrowRight size={13} />
            </button>
          </div>

          {vesselLists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
              No custom fleet lists created. Organize your vessels into targeted pools.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vesselLists.slice(0, 3).map((list) => (
                <div
                  key={list.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: `4px solid ${list.color || '#38bdf8'}`,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f1f5f9' }}>
                      {list.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                      {list.vesselCount} Vessels assigned · {list.tags.join(', ') || 'General Fleet'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => onSelectTab('vessel_lists')}
                  >
                    View Fleet
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid of Two Columns: Active Private Cargo & Saved Queries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Active Private Cargo */}
        <div
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={16} color="#34d399" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f1f5f9' }}>
                Active Private Cargo Shipments
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('private_cargo')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              All Cargoes ({privateCargo.length}) <ArrowRight size={13} />
            </button>
          </div>

          {activeCargo.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
              No private cargoes in transit. Track parcels, delivery schedules, and vessel linkages.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeCargo.slice(0, 3).map((cargo) => (
                <div
                  key={cargo.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#34d399' }}>
                        {cargo.cargoName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background:
                            cargo.status === 'in_transit'
                              ? 'rgba(52, 211, 153, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          color: cargo.status === 'in_transit' ? '#34d399' : '#f59e0b',
                        }}
                      >
                        {cargo.status === 'in_transit' ? 'In Transit' : 'Planned'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 3 }}>
                      {cargo.volume.toLocaleString()} {cargo.unit} · {cargo.originPort} → {cargo.destinationPort}
                      {cargo.associatedVesselName && ` · via ${cargo.associatedVesselName}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => onSelectTab('private_cargo')}
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Queries Quick Launch */}
        <div
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={16} color="#818cf8" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f1f5f9' }}>Saved Queries</h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('saved_queries')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              All ({savedQueries.length}) <ArrowRight size={13} />
            </button>
          </div>

          {savedQueries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
              No queries saved yet. Save workbench configurations from Module 24.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedQueries.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9' }}>
                    {q.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                    {q.dataset} · {q.mode}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      onClick={() => navigate(q.shareableUrl || '/data-query')}
                    >
                      Run Query ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
