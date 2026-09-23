/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Tags Tab
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Ship, Package, Star } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

const TAG_COLORS = ['#38bdf8', '#34d399', '#f59e0b', '#ef4444', '#818cf8', '#ec4899', '#a855f7'];

export const TagsTab: React.FC = () => {
  const navigate = useNavigate();
  const { tags, favourites, vesselLists, privateCargo, createTag, deleteTag } =
    useWorkspace();

  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#38bdf8');
  const [tagDesc, setTagDesc] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string>(tags[0]?.id || '');

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    const newTag = createTag(tagName.trim(), tagColor, tagDesc.trim() || undefined);
    setTagName('');
    setTagDesc('');
    setSelectedTagId(newTag.id);
  };

  const selectedTag = tags.find((t) => t.id === selectedTagId) || tags[0];

  // Get tagged items for selected tag
  const matchingFavourites = favourites.filter((f) =>
    f.tags.some((t) => t.toLowerCase() === selectedTag?.name.toLowerCase())
  );
  const matchingLists = vesselLists.filter((l) =>
    l.tags.some((t) => t.toLowerCase() === selectedTag?.name.toLowerCase())
  );
  const matchingCargo = privateCargo.filter((c) =>
    c.tags.some((t) => t.toLowerCase() === selectedTag?.name.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
      {/* Left: Tag Manager */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Create Tag Card */}
        <div
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: '0.92rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} color="#38bdf8" /> Create New Tag
          </h3>
          <form onSubmit={handleCreateTag} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Tag Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. High Consumption, Priority"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTagColor(c)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: tagColor === c ? '2px solid #ffffff' : 'none',
                      cursor: 'pointer',
                      transform: tagColor === c ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Description (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Flagged for bunker audit"
                value={tagDesc}
                onChange={(e) => setTagDesc(e.target.value)}
                style={{ width: '100%', fontSize: '0.82rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!tagName.trim()}
              style={{ fontSize: '0.8rem', padding: '6px 12px', marginTop: 4 }}
            >
              Add Tag
            </button>
          </form>
        </div>

        {/* Existing Tags List */}
        <div
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#94a3b8' }}>
            All Tags ({tags.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tags.map((t) => {
              const isSelected = selectedTag?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTagId(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: t.color,
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: isSelected ? '#38bdf8' : '#e2e8f0', fontWeight: isSelected ? 600 : 400 }}>
                      #{t.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete tag "${t.name}"?`)) deleteTag(t.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Tag Associations & Drill-down */}
      <div
        style={{
          background: 'var(--card-bg, #111827)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: 20,
        }}
      >
        {!selectedTag ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            Select a tag to inspect tagged maritime resources.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: selectedTag.color,
                }}
              />
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
                #{selectedTag.name}
              </h2>
              {selectedTag.description && (
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  — {selectedTag.description}
                </span>
              )}
            </div>

            {/* Tagged Favourites */}
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} /> Tagged Favourites ({matchingFavourites.length})
              </h4>
              {matchingFavourites.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>No favourites carry this tag.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {matchingFavourites.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9' }}>
                          {f.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 8 }}>
                          ({f.entityType})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        onClick={() => navigate(f.path)}
                      >
                        Open <ExternalLink size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tagged Fleets */}
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ship size={14} /> Tagged Fleet Pools ({matchingLists.length})
              </h4>
              {matchingLists.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>No fleet pools carry this tag.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {matchingLists.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9' }}>
                        {l.name} ({l.vesselCount} vessels)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Color: {l.color}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tagged Private Cargo */}
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={14} /> Tagged Private Cargo Records ({matchingCargo.length})
              </h4>
              {matchingCargo.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>No private cargoes carry this tag.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {matchingCargo.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#34d399' }}>
                          {c.cargoName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 8 }}>
                          {c.volume.toLocaleString()} {c.unit} ({c.status})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
