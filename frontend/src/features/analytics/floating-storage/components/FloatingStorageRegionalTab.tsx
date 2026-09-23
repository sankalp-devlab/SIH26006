import {
  MapPin,
  Compass,
  Ship,
  ExternalLink,
} from 'lucide-react';
import type {
  RegionalStorageAggregation,
  FloatingStorageRegion,
} from '../../../../types/floating-storage';

interface FloatingStorageRegionalTabProps {
  regionalAggregations: RegionalStorageAggregation[];
  onSelectRegionFilter: (region: FloatingStorageRegion) => void;
}

export function FloatingStorageRegionalTab({
  regionalAggregations,
  onSelectRegionFilter,
}: FloatingStorageRegionalTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Intro Header */}
      <div className="fs-card">
        <h3 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Compass size={16} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
          <span>Global Strategic Offshore Lightering &amp; Floating Storage Hubs</span>
        </h3>
        <p className="fs-section-subtitle" style={{ margin: '4px 0 0 0', maxWidth: '850px' }}>
          Analytical surveillance across the seven primary global offshore anchorage clusters where deep-draft VLCC, Suezmax, and product tankers perform ship-to-ship (STS) transfers, bunker blending, and long-term commodity contango storage.
        </p>
      </div>

      {/* 7 Hub Cards Grid */}
      <div className="fs-grid-3col">
        {regionalAggregations.map((hub) => (
          <div
            key={hub.region}
            className="fs-card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(100, 190, 240, 0.1)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    <MapPin size={14} style={{ color: 'var(--ol-amber, #F59E0B)', flexShrink: 0 }} />
                    <span>{hub.region}</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px', display: 'block' }}>
                    Primary: <strong style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>{hub.topCargoType}</strong>
                  </span>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      color: 'var(--ol-amber, #F59E0B)',
                    }}
                  >
                    {hub.sharePct}% Global
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                className="fs-subcard"
                style={{
                  margin: '12px 0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  padding: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--ol-text-muted, #64748B)', fontWeight: 600 }}>
                    Vessels
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ol-text-primary, #F1F5F9)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Ship size={13} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
                    {hub.vesselCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--ol-text-muted, #64748B)', fontWeight: 600 }}>
                    Volume (BBL)
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ol-cyan, #22D3EE)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                    {(hub.totalVolumeBbl / 1_000_000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--ol-text-muted, #64748B)', fontWeight: 600 }}>
                    Avg Stationary
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#C084FC', marginTop: '2px' }}>
                    {hub.avgStationaryDays.toFixed(0)} days
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--ol-text-muted, #64748B)', fontWeight: 600 }}>
                    Total Value
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ol-emerald, #10B981)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                    ${(hub.totalValueUsd / 1_000_000).toFixed(0)}M
                  </div>
                </div>
              </div>

              {/* Dominant Grade */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Benchmark Grade:</span>
                <span style={{ fontWeight: 700, color: 'var(--ol-amber, #F59E0B)' }}>{hub.topCrudeGrade}</span>
              </div>

              {/* Specific Anchorage Clusters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px', borderTop: '1px solid rgba(100, 190, 240, 0.08)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ol-text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Anchorage Zones:
                </div>
                {hub.anchorages.map((anc) => (
                  <div
                    key={anc.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11.5px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(4, 14, 25, 0.7)',
                      border: '1px solid rgba(100, 190, 240, 0.08)',
                    }}
                  >
                    <span style={{ color: 'var(--ol-text-secondary, #94A3B8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }} title={anc.name}>
                      {anc.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono, monospace)', fontSize: '11px' }}>
                      <span style={{ color: 'var(--ol-amber, #F59E0B)', fontWeight: 700 }}>{anc.count}v</span>
                      <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>({(anc.volumeBbl / 1_000_000).toFixed(1)}M)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Action Button (No White Default Button!) */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(100, 190, 240, 0.1)' }}>
              <button
                type="button"
                onClick={() => onSelectRegionFilter(hub.region)}
                className="fs-btn fs-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Filter Vessels in {hub.region.split('&')[0]}</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

