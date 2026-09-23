/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Multi-Port Voyage Legs & Route Navigation Section
 */

import React from 'react';
import {
  Navigation,
  Plus,
  Trash2,
  Shield,
  ArrowRight,
  Compass,
  Clock,
  Fuel,
  Leaf,
} from 'lucide-react';
import type {
  VoyageLegItem,
  VoyageCalculationRecord,
  VoyageEconomicsResult,
  VoyageLegType,
  FuelType,
  CanalType,
} from '../../../types/voyage-calculator';
import type { Port } from '../../../types/port';

interface VoyageLegsSectionProps {
  voyage: VoyageCalculationRecord;
  ports: Port[];
  result: VoyageEconomicsResult;
  onAddLeg: () => void;
  onUpdateLeg: (index: number, partial: Partial<VoyageLegItem>) => void;
  onToggleManualDistance: (index: number) => void;
  onRemoveLeg: (index: number) => void;
}

export const VoyageLegsSection: React.FC<VoyageLegsSectionProps> = ({
  voyage,
  ports,
  result,
  onAddLeg,
  onUpdateLeg,
  onToggleManualDistance,
  onRemoveLeg,
}) => {
  const handleCanalChange = (index: number, canal: CanalType) => {
    let cost = 0;
    if (canal === 'suez') cost = 320000;
    else if (canal === 'panama') cost = 260000;
    else if (canal === 'kiel') cost = 15000;

    onUpdateLeg(index, { canal, canal_cost: cost });
  };

  return (
    <div className="voyage-panel-card">
      {/* Section Header */}
      <div className="voyage-panel-header">
        <div>
          <div className="voyage-panel-title">
            <Navigation size={17} style={{ color: 'var(--voyage-cyan)' }} />
            <span>Passage Legs & Route Timeline ({voyage.legs.length} Leg{voyage.legs.length > 1 ? 's' : ''})</span>
          </div>
          <p className="voyage-panel-desc">
            Model ordered sea passages, distance overrides, SECA emission control zones, canal passages, and steaming speeds.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onAddLeg}
          style={{ height: '34px', fontSize: '12px', gap: '6px' }}
        >
          <Plus size={14} style={{ color: 'var(--voyage-cyan)' }} />
          <span>Add Passage Leg</span>
        </button>
      </div>

      {/* Visual Route Timeline Ribbon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'var(--voyage-surface-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--voyage-border)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          fontSize: '12px',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
          Route Timeline:
        </span>
        {voyage.legs.map((leg, idx) => (
          <React.Fragment key={leg.id}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: leg.leg_type === 'laden' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                color: leg.leg_type === 'laden' ? 'var(--voyage-cyan)' : 'var(--voyage-text-secondary)',
                fontWeight: 600,
                border: `1px solid ${leg.leg_type === 'laden' ? 'rgba(0, 217, 255, 0.3)' : 'var(--voyage-border)'}`,
              }}
            >
              <span style={{ fontSize: '10px', opacity: 0.7 }}>LEG {String(idx + 1).padStart(2, '0')}</span>
              <span>{leg.origin_port_name.replace(/ Port| Terminal| Anchorage/gi, '')}</span>
              <ArrowRight size={11} style={{ opacity: 0.6 }} />
              <span>{leg.destination_port_name.replace(/ Port| Terminal| Anchorage/gi, '')}</span>
              <span style={{ color: 'var(--voyage-text-muted)', fontSize: '11px' }}>({leg.distance_nm} NM)</span>
              {leg.is_seca && (
                <span style={{ fontSize: '9px', color: 'var(--voyage-green)', fontWeight: 800 }}>SECA</span>
              )}
              {leg.canal !== 'none' && (
                <span style={{ fontSize: '9px', color: 'var(--voyage-violet)', fontWeight: 800 }}>{leg.canal.toUpperCase()}</span>
              )}
            </span>
            {idx < voyage.legs.length - 1 && (
              <ArrowRight size={13} style={{ color: 'var(--voyage-text-muted)', opacity: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* List of Structured Voyage-Leg Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {voyage.legs.map((leg, index) => {
          const legEcon = result.leg_results[index] || {
            sea_hours: 0,
            sea_days: 0,
            fuel_consumed_mt: 0,
            fuel_cost_usd: 0,
            canal_cost_usd: 0,
            co2_tons: 0,
            ets_cost_usd: 0,
          };

          const legNum = String(index + 1).padStart(2, '0');

          return (
            <div
              key={leg.id}
              style={{
                backgroundColor: 'var(--voyage-surface-secondary)',
                border: '1px solid var(--voyage-border)',
                borderRadius: '10px',
                padding: '16px 18px',
                position: 'relative',
              }}
            >
              {/* Leg Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--voyage-border)',
                  paddingBottom: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* LEG NUMBER BADGE */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      backgroundColor: leg.leg_type === 'laden' ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: leg.leg_type === 'laden' ? 'var(--voyage-cyan)' : 'var(--voyage-text-secondary)',
                      border: `1px solid ${leg.leg_type === 'laden' ? 'rgba(0, 217, 255, 0.4)' : 'var(--voyage-border)'}`,
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                    }}
                  >
                    LEG {legNum}
                  </span>

                  {/* Origin Port Select */}
                  <select
                    className="voyage-dark-select"
                    style={{ height: '34px', fontSize: '12px', minWidth: '180px' }}
                    value={leg.origin_port_id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const p = ports.find((item) => item.id === id);
                      onUpdateLeg(index, {
                        origin_port_id: id,
                        origin_port_name: p?.name || '',
                        origin_country: p?.country || '',
                        origin_lat: p?.latitude || 0,
                        origin_lng: p?.longitude || 0,
                      });
                    }}
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.country})
                      </option>
                    ))}
                  </select>

                  <ArrowRight size={14} style={{ color: 'var(--voyage-text-muted)' }} />

                  {/* Destination Port Select */}
                  <select
                    className="voyage-dark-select"
                    style={{ height: '34px', fontSize: '12px', minWidth: '180px' }}
                    value={leg.destination_port_id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const p = ports.find((item) => item.id === id);
                      onUpdateLeg(index, {
                        destination_port_id: id,
                        destination_port_name: p?.name || '',
                        destination_country: p?.country || '',
                        destination_lat: p?.latitude || 0,
                        destination_lng: p?.longitude || 0,
                      });
                    }}
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.country})
                      </option>
                    ))}
                  </select>

                  {/* Leg Type Selector */}
                  <select
                    className="voyage-dark-select"
                    style={{
                      height: '34px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: leg.leg_type === 'laden' ? 'var(--voyage-cyan)' : 'var(--voyage-text-secondary)',
                    }}
                    value={leg.leg_type}
                    onChange={(e) => onUpdateLeg(index, { leg_type: e.target.value as VoyageLegType })}
                  >
                    <option value="laden">Laden (With Cargo)</option>
                    <option value="ballast">Ballast (Repositioning)</option>
                  </select>
                </div>

                {/* Delete Leg Button */}
                {voyage.legs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveLeg(index)}
                    style={{
                      background: 'rgba(255, 77, 85, 0.1)',
                      border: '1px solid rgba(255, 77, 85, 0.25)',
                      color: 'var(--voyage-red)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '5px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove this leg"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Leg Parameters Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                {/* Distance & Manual Override */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase' }}>
                      Distance (NM) *
                    </label>
                    <button
                      type="button"
                      onClick={() => onToggleManualDistance(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11px',
                        color: leg.is_distance_manual ? 'var(--voyage-amber)' : 'var(--voyage-cyan)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        textDecoration: 'underline',
                      }}
                      title={leg.is_distance_manual ? 'Reset to automatic calculation' : 'Enable manual distance override'}
                    >
                      {leg.is_distance_manual ? 'Reset Auto' : 'Manual Edit'}
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      className="voyage-dark-input"
                      style={{
                        width: '100%',
                        height: '36px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderColor: leg.is_distance_manual ? 'var(--voyage-amber)' : undefined,
                      }}
                      value={leg.distance_nm}
                      onChange={(e) =>
                        onUpdateLeg(index, {
                          distance_nm: Number(e.target.value),
                          is_distance_manual: true,
                        })
                      }
                    />
                    {leg.is_distance_manual && (
                      <span
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '10px',
                          color: 'var(--voyage-amber)',
                          fontWeight: 700,
                        }}
                      >
                        MANUAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Speed (knots) */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Steaming Speed (kts)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                    value={leg.speed_knots}
                    onChange={(e) => onUpdateLeg(index, { speed_knots: Number(e.target.value) })}
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Fuel Grade
                  </label>
                  <select
                    className="voyage-dark-select"
                    style={{ width: '100%', height: '36px', fontSize: '12px' }}
                    value={leg.fuel_type}
                    onChange={(e) => onUpdateLeg(index, { fuel_type: e.target.value as FuelType })}
                  >
                    <option value="VLSFO">VLSFO 0.5%</option>
                    <option value="MGO">MGO 0.1%</option>
                    <option value="LSMGO">LSMGO 0.1%</option>
                    <option value="HFO">HFO 3.5%</option>
                    <option value="LNG">LNG Dual-Fuel</option>
                  </select>
                </div>

                {/* SECA Zone Toggle */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    SECA / ECA Zone
                  </label>
                  <button
                    type="button"
                    onClick={() => onUpdateLeg(index, { is_seca: !leg.is_seca })}
                    style={{
                      width: '100%',
                      height: '36px',
                      borderRadius: '8px',
                      border: `1px solid ${leg.is_seca ? 'rgba(32, 201, 138, 0.4)' : 'var(--voyage-border)'}`,
                      backgroundColor: leg.is_seca ? 'rgba(32, 201, 138, 0.12)' : 'var(--voyage-surface)',
                      color: leg.is_seca ? 'var(--voyage-green)' : 'var(--voyage-text-secondary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Shield size={14} />
                    <span>{leg.is_seca ? 'SECA Active (LSMGO)' : 'Non-SECA Area'}</span>
                  </button>
                </div>

                {/* Canal Passage */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Canal Transit
                  </label>
                  <select
                    className="voyage-dark-select"
                    style={{ width: '100%', height: '36px', fontSize: '12px' }}
                    value={leg.canal}
                    onChange={(e) => handleCanalChange(index, e.target.value as CanalType)}
                  >
                    <option value="none">None (Open Ocean)</option>
                    <option value="suez">Suez Canal ($320k)</option>
                    <option value="panama">Panama Canal ($260k)</option>
                    <option value="kiel">Kiel Canal ($15k)</option>
                    <option value="custom">Custom Toll</option>
                  </select>
                </div>

                {leg.canal !== 'none' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Canal Toll Cost ($)
                    </label>
                    <input
                      type="number"
                      className="voyage-dark-input"
                      style={{ width: '100%', height: '36px', fontSize: '13px' }}
                      value={leg.canal_cost}
                      onChange={(e) => onUpdateLeg(index, { canal_cost: Number(e.target.value) })}
                    />
                  </div>
                )}
              </div>

              {/* Leg Computed Metrics Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(6, 19, 33, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid var(--voyage-border)',
                  fontSize: '12px',
                  color: 'var(--voyage-text-secondary)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} style={{ color: 'var(--voyage-cyan)' }} />
                  <span>Steaming: <strong style={{ color: 'var(--voyage-text)' }}>{legEcon.sea_days} Sea Days</strong> ({legEcon.sea_hours} hrs)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Fuel size={13} style={{ color: 'var(--voyage-amber)' }} />
                  <span>Fuel Consumed: <strong style={{ color: 'var(--voyage-amber)' }}>{legEcon.fuel_consumed_mt} MT</strong> (${legEcon.fuel_cost_usd.toLocaleString()})</span>
                </div>
                {legEcon.canal_cost_usd > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={13} style={{ color: 'var(--voyage-violet)' }} />
                    <span>Canal Toll: <strong style={{ color: 'var(--voyage-violet)' }}>${legEcon.canal_cost_usd.toLocaleString()}</strong></span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Leaf size={13} style={{ color: 'var(--voyage-green)' }} />
                  <span>Emissions: <strong style={{ color: 'var(--voyage-text)' }}>{legEcon.co2_tons} MT CO₂</strong>{' '}
                    {legEcon.ets_cost_usd > 0 && <span style={{ color: 'var(--voyage-green)' }}>(ETS: ${legEcon.ets_cost_usd.toLocaleString()})</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
