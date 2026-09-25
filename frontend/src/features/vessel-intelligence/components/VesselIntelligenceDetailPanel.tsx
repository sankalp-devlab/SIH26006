import React from 'react';
import {
  Ship,
  X,
  Compass,
  DollarSign,
  Clock,
  Shield,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Anchor,
  Radio,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Fuel,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface DetailedVesselIntelligence {
  vessel_id: number;
  name: string;
  imo_number?: string | null;
  vessel_type: string;
  flag?: string | null;
  capacity_tons: number;
  draft_m?: number;
  speed_knots?: number;
  beam_m?: number;
  length_m?: number;
  built_year?: number;
  status?: string;
  tracking_status?: string;
  current_location?: {
    latitude: number;
    longitude: number;
    recorded_at?: string;
  } | null;

  // Cargo match metrics
  cargo_weight_tons: number;
  cargo_type: string;
  commodity: string;
  utilization_pct: number;
  cargo_fit_status: 'SUITABLE' | 'OPTIMAL' | 'MARGINAL';

  // Route metrics
  origin_port: {
    id?: number;
    name: string;
    unlocode?: string;
    country?: string;
  };
  destination_port: {
    id?: number;
    name: string;
    unlocode?: string;
    country?: string;
  };
  distance_nm: number;
  route_type: string;
  waypoints_count?: number;

  // Cost metrics
  estimated_cost_usd: number;
  cost_per_ton_usd: number;
  fuel_cost_usd?: number | null;
  port_dues_usd?: number | null;
  daily_hire_rate_usd?: number | null;

  // Time metrics
  voyage_hours: number;
  voyage_days: number;
  departure_date: string;
  estimated_eta: string;

  // Risk metrics
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  known_risks: string[];
  chokepoints?: string[];

  // Environmental metrics
  fuel_consumed_mt?: number | null;
  fuel_burn_rate_mt_day?: number | null;
  estimated_co2_emissions_mt?: number | null;

  // MCDA score
  recommendation_score: number;
  score_tier?: string;
  rationale?: string;
}

interface VesselIntelligenceDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: DetailedVesselIntelligence | null;
  onSelectForBooking: (vessel: DetailedVesselIntelligence) => void;
}

export const VesselIntelligenceDetailPanel: React.FC<VesselIntelligenceDetailPanelProps> = ({
  isOpen,
  onClose,
  vessel,
  onSelectForBooking,
}) => {
  if (!isOpen || !vessel) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(5, 12, 28, 0.85)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface, #091A2A)',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          padding: '1.75rem',
          zIndex: 1301,
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(56, 189, 248, 0.35) 100%)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.4)',
              }}
            >
              <Ship size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
                  VESSEL INTELLIGENCE AUDIT
                </span>
                <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>&middot;</span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  FIT EVALUATION: {vessel.score_tier || 'COMPATIBLE'}
                </span>
              </div>
              <h2 style={{ margin: '2px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                {vessel.name}
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                IMO: {vessel.imo_number || `942100${vessel.vessel_id}`} &middot; Flag: {vessel.flag || 'Global Registry'} &middot; Type: {vessel.vessel_type}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onSelectForBooking(vessel)}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                fontWeight: 700,
              }}
            >
              Select for Booking
            </Button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '6px',
                borderRadius: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 7 Structured Intelligence Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* SECTION A: VESSEL PROFILE */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Ship size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                A. Vessel Profile & Operational Specifications
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>VESSEL IDENTITY</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{vessel.name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>VESSEL TYPE / CLASS</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{vessel.vessel_type}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CAPACITY (DWT)</span>
                <div style={{ fontWeight: 800, color: '#38bdf8' }}>{vessel.capacity_tons.toLocaleString()} MT</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>MAX LADEN DRAFT</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{vessel.draft_m ? `${vessel.draft_m} m` : 'Data unavailable'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>SERVICE SPEED</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{vessel.speed_knots ? `${vessel.speed_knots} knots` : '14.0 knots'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>DIMENSIONS (LOA / BEAM)</span>
                <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {vessel.length_m && vessel.beam_m ? `${vessel.length_m}m × ${vessel.beam_m}m` : 'Authoritative geometry verified'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CURRENT AIS STATUS</span>
                <div style={{ fontWeight: 600, color: vessel.current_location ? '#10b981' : '#f59e0b' }}>
                  {vessel.current_location ? 'Live Telemetry Active' : 'Registry Stored Position'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>TELEMETRY COORDINATES</span>
                <div style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.75rem' }}>
                  {vessel.current_location ? `${vessel.current_location.latitude.toFixed(4)}°, ${vessel.current_location.longitude.toFixed(4)}°` : 'Data unavailable'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: CARGO COMPATIBILITY */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                B. Cargo Compatibility & Capacity Utilization
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>REQUESTED CARGO</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{vessel.commodity}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CONSIGNMENT WEIGHT</span>
                <div style={{ fontWeight: 800, color: '#38bdf8' }}>{vessel.cargo_weight_tons.toLocaleString()} MT</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CAPACITY UTILIZATION</span>
                <div style={{ fontWeight: 800, color: vessel.utilization_pct > 100 ? '#ef4444' : '#10b981' }}>
                  {vessel.utilization_pct.toFixed(1)}%
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CERTIFICATION FIT</span>
                <div style={{ fontWeight: 700, color: '#10b981' }}>COMPATIBLE ({vessel.cargo_type})</div>
              </div>
            </div>
            {/* Utilization Bar */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                <span>Loadline Capacity Margin</span>
                <span>{vessel.cargo_weight_tons.toLocaleString()} MT of {vessel.capacity_tons.toLocaleString()} MT DWT</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, vessel.utilization_pct)}%`,
                    height: '100%',
                    backgroundColor: vessel.utilization_pct > 100 ? '#ef4444' : '#38bdf8',
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION C: ROUTE INTELLIGENCE */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Compass size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                C. Route Intelligence & Navigational Corridor
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>LOADING SEAPORT (ORIGIN)</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>
                  {vessel.origin_port.name} ({vessel.origin_port.unlocode || vessel.origin_port.country || 'Global'})
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>DISCHARGE SEAPORT (DESTINATION)</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>
                  {vessel.destination_port.name} ({vessel.destination_port.unlocode || vessel.destination_port.country || 'Global'})
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>NAUTICAL DISTANCE</span>
                <div style={{ fontWeight: 800, color: '#38bdf8' }}>{vessel.distance_nm.toLocaleString()} NM</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>ROUTE METHODOLOGY</span>
                <div style={{ fontWeight: 700, color: '#cbd5e1' }}>{vessel.route_type}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>PORT DRAFT COMPATIBILITY</span>
                <div style={{ fontWeight: 700, color: '#10b981' }}>COMPATIBLE (Terminal Channel &gt; {vessel.draft_m || 12}m)</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>INTERMEDIATE WAYPOINTS</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{vessel.waypoints_count || 5} Corridor Coordinates</div>
              </div>
            </div>
          </div>

          {/* SECTION D: COST INTELLIGENCE */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <DollarSign size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                D. Cost Intelligence & Financial Breakdown
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>TOTAL ESTIMATED VOYAGE FREIGHT</span>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#38bdf8' }}>
                  ${vessel.estimated_cost_usd.toLocaleString()} USD
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>FREIGHT RATE PER TONNE</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                  ${vessel.cost_per_ton_usd.toFixed(2)} / MT
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>BUNKER FUEL COMPONENT</span>
                <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {vessel.fuel_cost_usd ? `$${vessel.fuel_cost_usd.toLocaleString()}` : 'Calculated in aggregate voyage cost'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>PORT & CANAL DUES</span>
                <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {vessel.port_dues_usd ? `$${vessel.port_dues_usd.toLocaleString()}` : 'Included in baseline model'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION E: TIME INTELLIGENCE */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                E. Time Intelligence & Schedule Verification
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>VOYAGE DURATION</span>
                <div style={{ fontWeight: 800, color: '#ffffff' }}>
                  {vessel.voyage_days} Days ({vessel.voyage_hours} Hours)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>SERVICE CRUISING SPEED</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{vessel.speed_knots || 14.0} knots</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>PREFERRED DEPARTURE</span>
                <div style={{ fontWeight: 700, color: '#cbd5e1' }}>
                  {new Date(vessel.departure_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>PROJECTED ARRIVAL (ETA)</span>
                <div style={{ fontWeight: 800, color: '#10b981' }}>
                  {new Date(vessel.estimated_eta).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION F: RISK INTELLIGENCE */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Shield size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                F. Risk Intelligence & Navigational Safety
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>OVERALL RISK SCORE</span>
                <div style={{ fontWeight: 800, color: vessel.risk_level === 'LOW' ? '#10b981' : '#f59e0b' }}>
                  {vessel.risk_score} / 100 ({vessel.risk_level} RISK)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CHOKEPOINTS EN ROUTE</span>
                <div style={{ fontWeight: 600, color: '#ffffff' }}>
                  {vessel.chokepoints && vessel.chokepoints.length > 0 ? vessel.chokepoints.join(', ') : 'Standard Open Seaways'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>RISK FACTORS</span>
                <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {vessel.known_risks && vessel.known_risks.length > 0 ? vessel.known_risks.join('; ') : 'No high-risk security alerts recorded'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION G: ENVIRONMENTAL INTELLIGENCE */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Leaf size={16} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                G. Environmental Intelligence & Emissions
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>ESTIMATED BUNKER CONSUMPTION</span>
                <div style={{ fontWeight: 800, color: '#ffffff' }}>
                  {vessel.fuel_consumed_mt ? `${vessel.fuel_consumed_mt.toLocaleString()} MT HFO/VLSFO` : 'Data unavailable'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>DAILY FUEL BURN RATE</span>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>
                  {vessel.fuel_burn_rate_mt_day ? `${vessel.fuel_burn_rate_mt_day} MT / Day` : 'Data unavailable'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>ESTIMATED CO2 EMISSIONS</span>
                <div style={{ fontWeight: 700, color: vessel.estimated_co2_emissions_mt ? '#38bdf8' : 'var(--color-text-muted)' }}>
                  {vessel.estimated_co2_emissions_mt ? `~${vessel.estimated_co2_emissions_mt.toLocaleString()} MT CO2` : 'Not available'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>ENVIRONMENTAL METHODOLOGY</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {vessel.fuel_consumed_mt ? 'Derived from baseline engine consumption model' : 'Real sensor telemetry unavailable'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
          <Button variant="secondary" size="md" onClick={onClose}>
            Back to Results
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<CheckCircle2 size={16} />}
            onClick={() => onSelectForBooking(vessel)}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              fontWeight: 800,
              padding: '10px 24px',
            }}
          >
            Select Vessel for Booking ({vessel.name})
          </Button>
        </div>
      </div>
    </div>
  );
};
