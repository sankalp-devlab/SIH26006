/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Favourites Tab
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Pin,
  Trash2,
  ExternalLink,
  Search,
  Ship,
  Anchor,
  Navigation,
  FileText,
  Database,
  LineChart,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import type { WorkspaceEntityType } from '../../../types/personalization';

export const FavouritesTab: React.FC = () => {
  const navigate = useNavigate();
  const { favourites, removeFavourite, togglePinFavourite } = useWorkspace();

  const [selectedType, setSelectedType] = useState<WorkspaceEntityType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredFavourites = useMemo(() => {
    return favourites.filter((f) => {
      const matchType = selectedType === 'all' || f.entityType === selectedType;
      const matchSearch =
        !search.trim() ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        (f.subtitle && f.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [favourites, selectedType, search]);

  const getEntityIcon = (type: WorkspaceEntityType) => {
    switch (type) {
      case 'vessel':
        return <Ship size={16} color="#38bdf8" />;
      case 'port':
        return <Anchor size={16} color="#34d399" />;
      case 'route':
        return <Navigation size={16} color="#f59e0b" />;
      case 'fixture':
        return <FileText size={16} color="#818cf8" />;
      case 'query':
        return <Database size={16} color="#ec4899" />;
      case 'report':
        return <LineChart size={16} color="#a855f7" />;
      default:
        return <Star size={16} color="#e2e8f0" />;
    }
  };

  const TYPE_OPTIONS: { id: WorkspaceEntityType | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Items', count: favourites.length },
    { id: 'vessel', label: 'Vessels', count: favourites.filter((f) => f.entityType === 'vessel').length },
    { id: 'port', label: 'Ports', count: favourites.filter((f) => f.entityType === 'port').length },
    { id: 'route', label: 'Routes', count: favourites.filter((f) => f.entityType === 'route').length },
    { id: 'fixture', label: 'Fixtures', count: favourites.filter((f) => f.entityType === 'fixture').length },
    { id: 'query', label: 'Queries', count: favourites.filter((f) => f.entityType === 'query').length },
    { id: 'report', label: 'Reports', count: favourites.filter((f) => f.entityType === 'report').length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Type Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedType(opt.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: selectedType === opt.id ? 600 : 400,
                background:
                  selectedType === opt.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedType === opt.id ? '#38bdf8' : '#94a3b8',
                border:
                  selectedType === opt.id
                    ? '1px solid rgba(56, 189, 248, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label} ({opt.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 260 }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search favourites or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 32, fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Grid of Favourite Cards */}
      {filteredFavourites.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--card-bg, #111827)',
            borderRadius: 10,
            border: '1px dashed rgba(255, 255, 255, 0.12)',
          }}
        >
          <Star size={36} color="#64748b" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h4 style={{ margin: '0 0 6px', color: '#e2e8f0', fontSize: '0.95rem' }}>No favourites matched</h4>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
            Star vessels, ports, routes, queries, or fixtures across the platform to pin them into your personal workspace.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filteredFavourites.map((fav) => (
            <div
              key={fav.id}
              style={{
                background: 'var(--card-bg, #111827)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getEntityIcon(fav.entityType)}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#64748b',
                          fontWeight: 600,
                        }}
                      >
                        {fav.entityType}
                      </span>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.92rem',
                          color: '#f8fafc',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(fav.path)}
                      >
                        {fav.title}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => togglePinFavourite(fav.id)}
                      title={fav.pinned ? 'Unpin from fast access' : 'Pin to fast access'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: fav.pinned ? '#f59e0b' : '#64748b',
                      }}
                    >
                      <Pin size={15} fill={fav.pinned ? '#f59e0b' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFavourite(fav.id)}
                      title="Remove favourite"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: '#64748b',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subtitle & Badge */}
                {fav.subtitle && (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
                    {fav.subtitle}
                  </div>
                )}

                {/* Tags */}
                {fav.tags && fav.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                    {fav.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {fav.notes && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginTop: 8,
                      fontStyle: 'italic',
                    }}
                  >
                    "{fav.notes}"
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Saved {new Date(fav.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(fav.path)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Open Resource <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
