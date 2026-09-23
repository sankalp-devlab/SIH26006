import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Ship,
  AlertTriangle,
  Eye,
  Share2,
} from 'lucide-react';
import type { CargoRecord, CargoZone } from '../../../types/cargo';

interface CargoZoneGroupingProps {
  cargos: CargoRecord[];
  onOpenDetail: (cargo: CargoRecord) => void;
  onOpenVesselMatch: (cargo: CargoRecord) => void;
  onOpenShare: (cargo: CargoRecord) => void;
}

interface ZoneMeta {
  zone: CargoZone;
  description: string;
  majorHubs: string[];
}

const ZONE_METAS: ZoneMeta[] = [
  {
    zone: 'Zone A - Arabian Gulf',
    description: 'Middle East crude tankers, bunker trades, and petrochemical corridors',
    majorHubs: ['Ras Tanura', 'Fujairah', 'Jebel Ali'],
  },
  {
    zone: 'Zone B - Bay of Bengal',
    description: 'Indian subcontinent bulk mineral, coal, and container feeder corridors',
    majorHubs: ['JNPT Mumbai', 'Paradip', 'Chennai', 'Chittagong'],
  },
  {
    zone: 'Zone C - Far East',
    description: 'Major trans-Pacific and Southeast Asia dry bulk and container corridors',
    majorHubs: ['Singapore Hub', 'Shanghai Yangshan', 'Qingdao', 'Port Hedland'],
  },
  {
    zone: 'Zone D - Med & Europe',
    description: 'North Sea, Baltic, and Mediterranean refined product and industrial trades',
    majorHubs: ['Rotterdam Maasvlakte', 'Antwerp Gateway', 'Piraeus'],
  },
  {
    zone: 'Zone E - Atlantic & Americas',
    description: 'West Africa bauxite, South American iron ore, and grain corridors',
    majorHubs: ['Port Kamsar', 'Ponta da Madeira', 'Vancouver Pacific'],
  },
];

export const CargoZoneGrouping: React.FC<CargoZoneGroupingProps> = ({
  cargos,
  onOpenDetail,
  onOpenVesselMatch,
  onOpenShare,
}) => {
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  const toggleZone = (zoneName: string) => {
    setCollapsedZones((prev) => ({
      ...prev,
      [zoneName]: !prev[zoneName],
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {ZONE_METAS.map(({ zone, description, majorHubs }) => {
        const zoneCargos = cargos.filter((c) => c.zone === zone);
        const isCollapsed = !!collapsedZones[zone];
        const totalWeight = zoneCargos.reduce((a, b) => a + (b.weight_tons || 0), 0);
        const matchedCount = zoneCargos.filter((c) => !!c.matched_vessel).length;
        const warningCount = zoneCargos.filter((c) => c.validation_status !== 'valid').length;

        return (
          <div
            key={zone}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
            }}
          >
            {/* Zone Collapsible Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-bg-surface-alt)',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => toggleZone(zone)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: 'var(--color-brand-accent)' }}>
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {zone}
                    </h3>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {zoneCargos.length} {zoneCargos.length === 1 ? 'Consignment' : 'Consignments'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {description} · Hubs: {majorHubs.join(', ')}
                  </div>
                </div>
              </div>

              {/* Zone Aggregated Metrics */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total DWT</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                    {totalWeight.toLocaleString()} MT
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Vessel Matches</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#10b981' }}>
                    {matchedCount}/{zoneCargos.length}
                  </div>
                </div>

                {warningCount > 0 && (
                  <span
                    className="badge badge-warning"
                    style={{ fontSize: '0.6875rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <AlertTriangle size={11} /> {warningCount} Review
                  </span>
                )}
              </div>
            </div>

            {/* Zone Cargo Cards Content */}
            {!isCollapsed && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)' }}>
                {zoneCargos.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    No active consignments registered in this corridor zone.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {zoneCargos.map((cargo) => (
                      <div
                        key={cargo.id}
                        style={{
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: '6px',
                          padding: '0.875rem',
                          backgroundColor: '#fafbfc',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease',
                        }}
                        onClick={() => onOpenDetail(cargo)}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand-accent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
                      >
                        <div>
                          {/* Card Top: Ref & Badges */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-brand-accent)' }}>
                              {cargo.reference_number}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {cargo.validation_status === 'valid' ? (
                                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Valid</span>
                              ) : (
                                <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>Review</span>
                              )}
                              <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>{cargo.source.toUpperCase()}</span>
                            </div>
                          </div>

                          {/* Shipper & Commodity */}
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                            {cargo.shipper}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {cargo.commodity}
                          </div>

                          {/* Route */}
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '6px 8px',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid var(--color-border-subtle)',
                              fontSize: '0.75rem',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{cargo.origin_port.name}</span>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>→</span>
                            <span style={{ fontWeight: 600 }}>{cargo.destination_port.name}</span>
                          </div>

                          {/* Weight & Laycan */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                            <span>Tonnage: <strong style={{ color: 'var(--color-text-primary)' }}>{cargo.weight_tons.toLocaleString()} MT</strong></span>
                            <span>Laycan: {new Date(cargo.ready_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div
                          style={{
                            borderTop: '1px solid var(--color-border-subtle)',
                            paddingTop: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ fontSize: '0.6875rem' }}>
                            {cargo.matched_vessel ? (
                              <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Ship size={12} /> {cargo.matched_vessel.vessel_name}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)' }}>Open / Unmatched</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{ padding: '2px 6px', fontSize: '0.6875rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenShare(cargo);
                              }}
                              title="Share Recap"
                            >
                              <Share2 size={12} />
                            </button>
                            {!cargo.matched_vessel && (
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '0.6875rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenVesselMatch(cargo);
                                }}
                              >
                                Match
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{ padding: '2px 6px', fontSize: '0.6875rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDetail(cargo);
                              }}
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </div>
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
  );
};
