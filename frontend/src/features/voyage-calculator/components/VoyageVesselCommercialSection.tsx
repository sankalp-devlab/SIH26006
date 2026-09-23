/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Vessel & Commercial Particulars Section
 */

import { Ship, DollarSign, Gauge } from 'lucide-react';
import type { VoyageCalculationRecord, VoyageEconomicsResult } from '../../../types/voyage-calculator';

interface VesselOption {
  id: number;
  name: string;
  vessel_type?: string | null;
  capacity_tons?: number | null;
  speed_laden_knots?: number | null;
  speed_ballast_knots?: number | null;
  fuel_laden_mt_day?: number | null;
  fuel_ballast_mt_day?: number | null;
}

interface VoyageVesselCommercialSectionProps {
  voyage: VoyageCalculationRecord;
  vessels: VesselOption[];
  result?: VoyageEconomicsResult;
  onSelectVessel: (vesselId: number) => void;
  onUpdate: (partial: Partial<VoyageCalculationRecord>) => void;
}

export const VoyageVesselCommercialSection: React.FC<VoyageVesselCommercialSectionProps> = ({
  voyage,
  vessels,
  result,
  onSelectVessel,
  onUpdate,
}) => {
  const applySpeedPreset = (laden: number, ballast: number) => {
    onUpdate({
      speed_laden_knots: laden,
      speed_ballast_knots: ballast,
      legs: voyage.legs.map((l) => ({
        ...l,
        speed_knots: l.leg_type === 'laden' ? laden : ballast,
      })),
    });
  };

  return (
    <div className="voyage-panel-card">
      <div className="voyage-panel-header">
        <div>
          <div className="voyage-panel-title">
            <Ship size={17} style={{ color: 'var(--voyage-cyan)' }} />
            <span>Vessel Economics & Commercial Specifications</span>
          </div>
          <p className="voyage-panel-desc">
            Assign registered fleet tonnage, steaming consumption profiles, and charter hire commercial assumptions.
          </p>
        </div>

        {/* Steaming Speed Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--voyage-text-muted)' }}>
            Speed Presets:
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '4px 10px', height: '30px' }}
            onClick={() => applySpeedPreset(11.5, 12.5)}
          >
            Eco (11.5 kts)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '4px 10px', height: '30px' }}
            onClick={() => applySpeedPreset(13.0, 14.0)}
          >
            Design (13.0 kts)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '4px 10px', height: '30px' }}
            onClick={() => applySpeedPreset(14.5, 15.5)}
          >
            Full (14.5 kts)
          </button>
        </div>
      </div>

      {/* Two-Column Technical / Commercial Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* COLUMN 1: Technical & Steaming Parameters */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--voyage-cyan)',
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--voyage-border)',
            }}
          >
            <Gauge size={14} />
            <span>Technical Vessel Particulars</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Fleet Registry Vessel *
              </label>
              <select
                className="voyage-dark-select"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
                value={voyage.vessel_id}
                onChange={(e) => onSelectVessel(Number(e.target.value))}
              >
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.vessel_type || 'Commercial'}) • DWT: {(v.capacity_tons || 0).toLocaleString()} MT
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Deadweight (DWT MT)
                </label>
                <input
                  type="number"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.vessel_dwt}
                  onChange={(e) => onUpdate({ vessel_dwt: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Vessel Type / Class
                </label>
                <input
                  type="text"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.vessel_type}
                  onChange={(e) => onUpdate({ vessel_type: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Speed Laden (knots)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.speed_laden_knots}
                  onChange={(e) => onUpdate({ speed_laden_knots: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Speed Ballast (knots)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.speed_ballast_knots}
                  onChange={(e) => onUpdate({ speed_ballast_knots: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Fuel Laden (MT/day)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.fuel_laden_mt_day}
                  onChange={(e) => onUpdate({ fuel_laden_mt_day: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Fuel Ballast (MT/day)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.fuel_ballast_mt_day}
                  onChange={(e) => onUpdate({ fuel_ballast_mt_day: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Commercial Charter Terms & Assumptions */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--voyage-amber)',
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--voyage-border)',
            }}
          >
            <DollarSign size={14} />
            <span>Commercial Charter Terms</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Daily Time Charter Hire Rate (USD / day)
              </label>
              <input
                type="number"
                className="voyage-dark-input"
                style={{ width: '100%', height: '38px', fontSize: '14px', fontWeight: 600 }}
                value={voyage.daily_hire_usd}
                onChange={(e) => onUpdate({ daily_hire_usd: Number(e.target.value) })}
                placeholder="0 if owned vessel, e.g. 15000 if chartered-in"
              />
              <span style={{ fontSize: '11px', color: 'var(--voyage-text-secondary)', display: 'block', marginTop: '3px' }}>
                {voyage.daily_hire_usd > 0
                  ? `Chartered-In Tonnage: $${(voyage.daily_hire_usd * (result?.total_voyage_days || 0)).toLocaleString()} estimated hire cost across voyage`
                  : 'Owned Tonnage (Zero charter hire deduction)'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Ballast Bonus (USD $)
                </label>
                <input
                  type="number"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.ballast_bonus_usd}
                  onChange={(e) => onUpdate({ ballast_bonus_usd: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Weather Margin (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.weather_margin_pct}
                  onChange={(e) => onUpdate({ weather_margin_pct: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Port Idle Fuel (MT/day)
                </label>
                <input
                  type="number"
                  step="0.2"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.fuel_port_idle_mt_day}
                  onChange={(e) => onUpdate({ fuel_port_idle_mt_day: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Port Working Fuel (MT/day)
                </label>
                <input
                  type="number"
                  step="0.2"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  value={voyage.fuel_port_working_mt_day}
                  onChange={(e) => onUpdate({ fuel_port_working_mt_day: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
