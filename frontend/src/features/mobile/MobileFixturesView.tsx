import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FixturesService } from '../../services/fixtures/fixtures.service';
import {
  Search,
  MapPin,
  Bell,
  AlertCircle,
} from 'lucide-react';
import type { FixtureRecord, FixtureStatus } from '../../types/fixture';

export const MobileFixturesView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const deepLinkedFixtureId = searchParams.get('fixtureId');

  const allFixtures: FixtureRecord[] = useMemo(() => {
    return FixturesService.getStoredFixtures();
  }, []);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFixture, setSelectedFixture] = useState<FixtureRecord | null>(null);
  const [missingObjectNotice, setMissingObjectNotice] = useState<string | null>(null);

  useEffect(() => {
    if (deepLinkedFixtureId && allFixtures.length > 0) {
      const match = allFixtures.find((f) => f.id === deepLinkedFixtureId);
      if (match) {
        setSelectedFixture(match);
      } else {
        setMissingObjectNotice(`Fixture ${deepLinkedFixtureId} was not found or is no longer available.`);
      }
    }
  }, [deepLinkedFixtureId, allFixtures]);

  const filteredFixtures = useMemo(() => {
    return allFixtures.filter((f) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.fixture_reference.toLowerCase().includes(q) ||
        f.vessel_name.toLowerCase().includes(q) ||
        f.charterer.toLowerCase().includes(q) ||
        f.commodity.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === 'all' || f.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [allFixtures, search, selectedStatus]);

  // Counts for tabs
  const onSubsCount = allFixtures.filter((f) => f.status === 'on_subjects').length;
  const fixedCount = allFixtures.filter((f) => f.status === 'fully_fixed').length;
  const failedCount = allFixtures.filter((f) => f.status === 'failed').length;

  const getStatusBadge = (status: FixtureStatus) => {
    switch (status) {
      case 'on_subjects':
        return <span className="mobile-badge mobile-badge-subs">On Subjects</span>;
      case 'fully_fixed':
        return <span className="mobile-badge mobile-badge-live">Fully Fixed</span>;
      case 'failed':
        return <span className="mobile-badge mobile-badge-failed">Failed</span>;
      case 'draft':
      default:
        return <span className="mobile-badge mobile-badge-info">Draft</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Live Market Alert Notification Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 12,
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          fontSize: '0.78rem',
          color: '#fde68a',
        }}
      >
        <Bell size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
        <div>
          <strong>Live Market Alert:</strong> {onSubsCount} fixtures currently on subjects. 1 recent failed subject reported on stem delay.
        </div>
      </div>

      {/* Missing Object Warning Banner */}
      {missingObjectNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.78rem',
            color: '#fca5a5',
          }}
        >
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{missingObjectNotice}</div>
          <button
            onClick={() => setMissingObjectNotice(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          color="#94a3b8"
          style={{ position: 'absolute', left: 14, top: 14 }}
        />
        <input
          type="text"
          placeholder="Search fixtures by vessel, charterer, commodity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mobile-input"
          style={{ paddingLeft: 42 }}
        />
      </div>

      {/* Filter Segmented Control */}
      <div className="mobile-segmented-control">
        {[
          { id: 'all', label: `All (${allFixtures.length})` },
          { id: 'on_subjects', label: `On Subs (${onSubsCount})` },
          { id: 'fully_fixed', label: `Fixed (${fixedCount})` },
          { id: 'failed', label: `Failed (${failedCount})` },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setSelectedStatus(chip.id)}
            className={`mobile-segment-chip ${selectedStatus === chip.id ? 'active' : ''}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Fixtures Feed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredFixtures.map((f) => {
          const loadPort = f.ports.find((p) => p.port_type === 'load')?.port_name || 'Ras Tanura';
          const dischPort = f.ports.find((p) => p.port_type === 'discharge')?.port_name || 'Rotterdam';
          const isExpanded = selectedFixture?.id === f.id;

          return (
            <div
              key={f.id}
              className="mobile-card"
              onClick={() => setSelectedFixture(isExpanded ? null : f)}
              style={{ cursor: 'pointer' }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                      {f.fixture_reference}
                    </span>
                    {getStatusBadge(f.status)}
                  </div>
                  <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc', marginTop: 3 }}>
                    {f.vessel_name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>
                    {f.rate_formatted}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Commercial Rate</div>
                </div>
              </div>

              {/* Cargo & Charterer Strip */}
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.6)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ color: '#cbd5e1' }}>
                  Commodity: <strong>{f.commodity}</strong> ({(f.quantity_tons / 1000).toFixed(0)}k MT)
                </div>
                <div style={{ color: '#94a3b8' }}>
                  Charterer: <strong style={{ color: '#f8fafc' }}>{f.charterer}</strong>
                </div>
              </div>

              {/* Ports Corridor */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} color="#38bdf8" />
                  <span>{loadPort} → <strong>{dischPort}</strong></span>
                </div>
                <div>
                  Laycan: {f.laycan_start ? new Date(f.laycan_start).toLocaleDateString() : 'Prompt'}
                </div>
              </div>

              {/* Expandable Details Drill-down */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: 10,
                    marginTop: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ color: '#cbd5e1' }}>
                    <strong>Demurrage:</strong> ${f.demurrage_usd_day?.toLocaleString() || '25,000'}/day • <strong>Commission:</strong> {f.commission_percent || 2.5}%
                  </div>
                  {f.notes && (
                    <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      "{f.notes}"
                    </div>
                  )}
                  {f.history?.length && (
                    <div style={{ marginTop: 4, borderTop: '1px dashed rgba(255, 255, 255, 0.06)', paddingTop: 6 }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Chartering Audit History</div>
                      {f.history.map((h, i) => (
                        <div key={i} style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                          • {h.action} ({new Date(h.timestamp).toLocaleDateString()}): {h.note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
