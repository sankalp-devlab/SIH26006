/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Mobile Workspace View (Module 27 Integration)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  ArrowRight,
  ShieldCheck,
  Pin,
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { AddPrivateCargoModal } from '../workspace/components/AddPrivateCargoModal';
import { CreateVesselListModal } from '../workspace/components/CreateVesselListModal';

type MobileTab = 'favourites' | 'fleets' | 'cargo' | 'queries';

export const MobileWorkspaceView: React.FC = () => {
  const navigate = useNavigate();
  const {
    favourites,
    vesselLists,
    privateCargo,
    savedQueries,
    createPrivateCargo,
    createVesselList,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<MobileTab>('favourites');
  const [isAddCargoOpen, setIsAddCargoOpen] = useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Mobile Privacy Header */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>
            Personal Workspace
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsCreateListOpen(true)}
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            + Fleet
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddCargoOpen(true)}
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            + Cargo
          </button>
        </div>
      </div>

      {/* Mobile Tab Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.03)',
          padding: 4,
          borderRadius: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('favourites')}
          style={{
            padding: '6px 4px',
            border: 'none',
            borderRadius: 6,
            background: activeTab === 'favourites' ? '#38bdf8' : 'transparent',
            color: activeTab === 'favourites' ? '#0f172a' : '#94a3b8',
            fontWeight: activeTab === 'favourites' ? 700 : 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Favs ({favourites.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fleets')}
          style={{
            padding: '6px 4px',
            border: 'none',
            borderRadius: 6,
            background: activeTab === 'fleets' ? '#38bdf8' : 'transparent',
            color: activeTab === 'fleets' ? '#0f172a' : '#94a3b8',
            fontWeight: activeTab === 'fleets' ? 700 : 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Fleets ({vesselLists.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cargo')}
          style={{
            padding: '6px 4px',
            border: 'none',
            borderRadius: 6,
            background: activeTab === 'cargo' ? '#38bdf8' : 'transparent',
            color: activeTab === 'cargo' ? '#0f172a' : '#94a3b8',
            fontWeight: activeTab === 'cargo' ? 700 : 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Cargo ({privateCargo.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('queries')}
          style={{
            padding: '6px 4px',
            border: 'none',
            borderRadius: 6,
            background: activeTab === 'queries' ? '#38bdf8' : 'transparent',
            color: activeTab === 'queries' ? '#0f172a' : '#94a3b8',
            fontWeight: activeTab === 'queries' ? 700 : 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Queries ({savedQueries.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'favourites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {favourites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b', fontSize: '0.82rem' }}>
              No favourites saved yet.
            </div>
          ) : (
            favourites.map((fav) => (
              <div
                key={fav.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--card-bg, #111827)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1 }} onClick={() => navigate(fav.path)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#64748b' }}>
                      {fav.entityType}
                    </span>
                    {fav.pinned && <Pin size={10} color="#f59e0b" fill="#f59e0b" />}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#f1f5f9', marginTop: 2 }}>
                    {fav.title}
                  </div>
                  {fav.subtitle && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>
                      {fav.subtitle}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(fav.path)}
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'fleets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vesselLists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b', fontSize: '0.82rem' }}>
              No custom fleet lists created.
            </div>
          ) : (
            vesselLists.map((list) => (
              <div
                key={list.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--card-bg, #111827)',
                  borderLeft: `4px solid ${list.color || '#38bdf8'}`,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc' }}>
                    {list.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                    {list.vesselCount} vessels enrolled · {list.tags.join(', ') || 'Custom Pool'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/m/lists')}
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  Open
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'cargo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {privateCargo.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b', fontSize: '0.82rem' }}>
              No private cargo tracked.
            </div>
          ) : (
            privateCargo.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--card-bg, #111827)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#34d399' }}>
                    {c.cargoName}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      textTransform: 'capitalize',
                    }}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {c.volume.toLocaleString()} {c.unit} · {c.originPort} → {c.destinationPort}
                </div>
                {c.associatedVesselName && (
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ship size={12} /> {c.associatedVesselName}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'queries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {savedQueries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b', fontSize: '0.82rem' }}>
              No queries bookmarked.
            </div>
          ) : (
            savedQueries.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--card-bg, #111827)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9' }}>
                    {q.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {q.dataset} · {q.mode}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(q.shareableUrl || '/data-query')}
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  Run ↗
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <AddPrivateCargoModal
        isOpen={isAddCargoOpen}
        onClose={() => setIsAddCargoOpen(false)}
        onSave={createPrivateCargo}
      />

      <CreateVesselListModal
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        onCreate={createVesselList}
      />
    </div>
  );
};

export default MobileWorkspaceView;
