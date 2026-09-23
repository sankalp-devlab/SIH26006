import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVessels } from '../../hooks/useVessels';
import { MobilePositionUpdaterService } from '../../services/mobile/mobile-position-updater.service';
import {
  Search,
  Ship,
  Compass,
  ArrowRight,
  Radio,
  Ruler,
  Star,
  MapPin,
  Anchor,
} from 'lucide-react';
import type { Vessel } from '../../types/vessel';

export const MobileVesselsView: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useVessels(100);
  const vessels: Vessel[] = useMemo(() => data?.vessels || [], [data]);

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [watchlists, setWatchlists] = useState(() => MobilePositionUpdaterService.getWatchlists());
  const positionOverrides = useMemo(() => MobilePositionUpdaterService.getPositionUpdates(), []);

  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.imo_number && v.imo_number.toLowerCase().includes(q)) ||
        (v.vessel_type && v.vessel_type.toLowerCase().includes(q));

      const matchesType =
        selectedType === 'all' ||
        (v.vessel_type && v.vessel_type.toLowerCase().includes(selectedType.toLowerCase()));

      return matchesSearch && matchesType;
    });
  }, [vessels, search, selectedType]);

  const handleToggleWatchlist = (e: React.MouseEvent, vesselId: number) => {
    e.stopPropagation();
    const defaultList = watchlists[0]?.id || 'watchlist-crude';
    MobilePositionUpdaterService.toggleVesselInWatchlist(defaultList, vesselId);
    setWatchlists(MobilePositionUpdaterService.getWatchlists());
  };

  const isBookmarked = (vesselId: number): boolean => {
    return watchlists.some((w) => w.vesselIds.includes(vesselId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          color="#94a3b8"
          style={{ position: 'absolute', left: 14, top: 14 }}
        />
        <input
          type="text"
          placeholder="Search vessels by name, IMO or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mobile-input"
          style={{ paddingLeft: 42 }}
        />
      </div>

      {/* Filter Chips */}
      <div className="mobile-segmented-control">
        {[
          { id: 'all', label: 'All Classes' },
          { id: 'tanker', label: 'Crude Tankers' },
          { id: 'bulk', label: 'Dry Bulk' },
          { id: 'lng', label: 'LNG / Gas' },
          { id: 'container', label: 'Container' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setSelectedType(chip.id)}
            className={`mobile-segment-chip ${selectedType === chip.id ? 'active' : ''}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Result Count Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: '#94a3b8',
          padding: '0 4px',
        }}
      >
        <span>
          Showing <strong>{filteredVessels.length}</strong> active vessels
        </span>
        <span style={{ color: '#38bdf8' }}>Live AIS Telemetry</span>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mobile-card" style={{ height: 130, opacity: 0.5 }}>
              <div style={{ width: '50%', height: 16, background: '#334155', borderRadius: 4 }} />
              <div style={{ width: '80%', height: 12, background: '#1e293b', borderRadius: 4 }} />
              <div style={{ width: '30%', height: 20, background: '#334155', borderRadius: 6, marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredVessels.length === 0 && (
        <div
          className="mobile-card"
          style={{ textAlign: 'center', padding: '36px 16px', alignItems: 'center' }}
        >
          <Anchor size={40} color="#64748b" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>No vessels found</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 260, margin: '6px auto 14px' }}>
            No vessels match "{search}". Try searching for APOLLO GLORY, OCEAN TITAN, or clearing filters.
          </div>
          <button
            onClick={() => {
              setSearch('');
              setSelectedType('all');
            }}
            className="mobile-btn-secondary"
            style={{ width: 'auto', padding: '0 20px' }}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Vessel List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredVessels.map((v) => {
          const override = positionOverrides[v.id];
          const speed = override?.speedKnots ?? v.speed_laden_knots ?? 13.2;
          const heading = override?.heading ?? 90;
          const status = override?.status ?? v.status ?? 'underway';
          const isFav = isBookmarked(v.id);

          return (
            <div
              key={v.id}
              className="mobile-card"
              onClick={() => navigate(`/m/vessels/${v.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                    }}
                  >
                    <Ship size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      IMO {v.imo_number || '9845120'} • {v.vessel_type || 'Crude Oil Tanker'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleToggleWatchlist(e, v.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isFav ? '#fbbf24' : '#64748b',
                    padding: 4,
                  }}
                  aria-label="Toggle Watchlist"
                >
                  <Star size={18} fill={isFav ? '#fbbf24' : 'none'} />
                </button>
              </div>

              {/* Voyage & Destination Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.6)',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
                  <MapPin size={14} color="#38bdf8" />
                  <span>Destination: <strong>{v.id % 2 === 0 ? 'Rotterdam (NLRTM)' : 'Singapore (SGSIN)'}</strong></span>
                </div>
                <span style={{ color: '#94a3b8' }}>ETA: 4d 12h</span>
              </div>

              {/* Status & Telemetry Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`mobile-badge ${status === 'underway' ? 'mobile-badge-live' : 'mobile-badge-subs'}`}>
                    {status}
                  </span>
                  {override && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      • Field Override
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.76rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Compass size={13} color="#94a3b8" />
                    {heading}°
                  </span>
                  <span>
                    <strong style={{ color: '#f8fafc' }}>{speed}</strong> kts
                  </span>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: 8,
                  marginTop: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/m/updater?vesselId=${v.id}`);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      color: '#cbd5e1',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <Radio size={12} color="#34d399" />
                    Update Pos
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/m/distance?vesselId=${v.id}`);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      color: '#cbd5e1',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <Ruler size={12} color="#f59e0b" />
                    Distance
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.74rem',
                    color: '#38bdf8',
                    fontWeight: 600,
                  }}
                >
                  <span>Dossier</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
