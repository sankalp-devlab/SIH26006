/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Multi-Cargo Parcels Management & Capacity Allocation
 */

import React from 'react';
import { Package, Plus, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import type {
  VoyageCargoItem,
  VoyageCalculationRecord,
  VoyageEconomicsResult,
  FreightRateType,
} from '../../../types/voyage-calculator';
import type { Port } from '../../../types/port';

interface VoyageCargoSectionProps {
  voyage: VoyageCalculationRecord;
  ports: Port[];
  result: VoyageEconomicsResult;
  onAddCargo: () => void;
  onUpdateCargo: (index: number, partial: Partial<VoyageCargoItem>) => void;
  onRemoveCargo: (index: number) => void;
}

export const VoyageCargoSection: React.FC<VoyageCargoSectionProps> = ({
  voyage,
  ports,
  result,
  onAddCargo,
  onUpdateCargo,
  onRemoveCargo,
}) => {
  const capacityPct = result.capacity_utilization_pct;
  const isOverloaded = result.is_overloaded;

  return (
    <div className="voyage-panel-card">
      {/* Section Header */}
      <div className="voyage-panel-header">
        <div>
          <div className="voyage-panel-title">
            <Package size={17} style={{ color: 'var(--voyage-cyan)' }} />
            <span>Multi-Cargo Parcels & Allocation ({voyage.cargoes.length} Consignment{voyage.cargoes.length > 1 ? 's' : ''})</span>
          </div>
          <p className="voyage-panel-desc">
            Configure individual cargo parcels with independent freight terms, commission rates, and load/discharge ports.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onAddCargo}
          style={{ height: '34px', fontSize: '12px', gap: '6px' }}
        >
          <Plus size={14} style={{ color: 'var(--voyage-cyan)' }} />
          <span>Add Cargo Parcel</span>
        </button>
      </div>

      {/* Capacity Allocation Progress Bar */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--voyage-surface-secondary)',
          borderRadius: '8px',
          border: `1px solid ${isOverloaded ? 'var(--voyage-red)' : 'var(--voyage-border)'}`,
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isOverloaded ? (
              <AlertTriangle size={15} style={{ color: 'var(--voyage-red)' }} />
            ) : (
              <ShieldCheck size={15} style={{ color: 'var(--voyage-green)' }} />
            )}
            <span style={{ fontWeight: 600, color: 'var(--voyage-text)' }}>Vessel Deadweight Utilization:</span>
            <span style={{ color: 'var(--voyage-text-secondary)' }}>
              <strong style={{ color: 'var(--voyage-text)' }}>{result.total_allocated_cargo_mt.toLocaleString()} MT</strong> allocated of{' '}
              <strong>{voyage.vessel_dwt.toLocaleString()} MT</strong> DWT
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontWeight: 700,
                color: isOverloaded ? 'var(--voyage-red)' : 'var(--voyage-cyan)',
              }}
            >
              {capacityPct}% Capacity
            </span>
            {isOverloaded ? (
              <span className="badge badge-danger">OVERLOADED</span>
            ) : (
              <span className="badge badge-success">WITHIN LIMITS</span>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div
          style={{
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, capacityPct)}%`,
              backgroundColor: isOverloaded ? 'var(--voyage-red)' : 'var(--voyage-cyan)',
              boxShadow: isOverloaded ? '0 0 8px var(--voyage-red)' : '0 0 8px var(--voyage-cyan)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Cargo Parcels List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {voyage.cargoes.map((cargo, index) => {
          const cargoEcon = result.cargo_results[index] || {
            gross_revenue: 0,
            commission_amount: 0,
            net_revenue: 0,
            load_days: 0,
            discharge_days: 0,
            total_port_days: 0,
          };

          return (
            <div
              key={cargo.id}
              style={{
                backgroundColor: 'var(--voyage-surface-secondary)',
                border: '1px solid var(--voyage-border)',
                borderRadius: '10px',
                padding: '16px 18px',
                position: 'relative',
              }}
            >
              {/* Card Header */}
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
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 217, 255, 0.15)',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      color: 'var(--voyage-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    className="voyage-dark-input"
                    style={{ height: '34px', fontSize: '13px', fontWeight: 600, width: '220px' }}
                    value={cargo.name}
                    onChange={(e) => onUpdateCargo(index, { name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="voyage-dark-input"
                    style={{ height: '34px', fontSize: '12px', width: '220px' }}
                    placeholder="Commodity (e.g. Escravos Crude Oil)"
                    value={cargo.commodity}
                    onChange={(e) => onUpdateCargo(index, { commodity: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--voyage-green)' }}>
                    Net Freight: ${cargoEcon.net_revenue.toLocaleString()}
                  </span>

                  {voyage.cargoes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveCargo(index)}
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
                      title="Remove this cargo parcel"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid 1: Commercial Rates & Tonnage */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Quantity (MT) *
                  </label>
                  <input
                    type="number"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '36px', fontSize: '13px', fontWeight: 600 }}
                    value={cargo.quantity_mt}
                    onChange={(e) => onUpdateCargo(index, { quantity_mt: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Freight Basis
                  </label>
                  <select
                    className="voyage-dark-select"
                    style={{ width: '100%', height: '36px', fontSize: '12px' }}
                    value={cargo.freight_rate_type}
                    onChange={(e) => onUpdateCargo(index, { freight_rate_type: e.target.value as FreightRateType })}
                  >
                    <option value="per_mt">Freight ($/MT)</option>
                    <option value="lumpsum">Lumpsum ($)</option>
                    <option value="worldscale">Worldscale (WS)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {cargo.freight_rate_type === 'worldscale' ? 'WS Rate (Points)' : 'Freight Rate ($)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '36px', fontSize: '13px', fontWeight: 600 }}
                    value={cargo.freight_rate}
                    onChange={(e) => onUpdateCargo(index, { freight_rate: Number(e.target.value) })}
                  />
                </div>

                {cargo.freight_rate_type === 'worldscale' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      WS Flat Rate ($/MT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="voyage-dark-input"
                      style={{ width: '100%', height: '36px', fontSize: '13px' }}
                      value={cargo.worldscale_flat_rate || 22.5}
                      onChange={(e) => onUpdateCargo(index, { worldscale_flat_rate: Number(e.target.value) })}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                    value={cargo.commission_pct}
                    onChange={(e) => onUpdateCargo(index, { commission_pct: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Grid 2: Routing Ports & Operations Speeds */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  backgroundColor: 'rgba(6, 19, 33, 0.6)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--voyage-border)',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
                    Load Port
                  </label>
                  <select
                    className="voyage-dark-select"
                    style={{ width: '100%', height: '34px', fontSize: '12px' }}
                    value={cargo.load_port_id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const p = ports.find((item) => item.id === id);
                      onUpdateCargo(index, { load_port_id: id, load_port_name: p?.name || '' });
                    }}
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
                    Load Rate (MT/day)
                  </label>
                  <input
                    type="number"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '34px', fontSize: '12px' }}
                    value={cargo.load_rate_mt_day}
                    onChange={(e) => onUpdateCargo(index, { load_rate_mt_day: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
                    Discharge Port
                  </label>
                  <select
                    className="voyage-dark-select"
                    style={{ width: '100%', height: '34px', fontSize: '12px' }}
                    value={cargo.discharge_port_id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const p = ports.find((item) => item.id === id);
                      onUpdateCargo(index, { discharge_port_id: id, discharge_port_name: p?.name || '' });
                    }}
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
                    Discharge Rate (MT/day)
                  </label>
                  <input
                    type="number"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '34px', fontSize: '12px' }}
                    value={cargo.discharge_rate_mt_day}
                    onChange={(e) => onUpdateCargo(index, { discharge_rate_mt_day: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Parcel Bottom Summary Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  fontSize: '12px',
                  color: 'var(--voyage-text-secondary)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  Est. Port Time: <strong style={{ color: 'var(--voyage-text)' }}>{cargoEcon.load_days}d</strong> load +{' '}
                  <strong style={{ color: 'var(--voyage-text)' }}>{cargoEcon.discharge_days}d</strong> discharge ={' '}
                  <strong style={{ color: 'var(--voyage-amber)' }}>{cargoEcon.total_port_days}d</strong> total port days
                </div>
                <div>
                  Gross: <strong style={{ color: 'var(--voyage-text)' }}>${cargoEcon.gross_revenue.toLocaleString()}</strong> | Comm: -
                  <strong style={{ color: 'var(--voyage-amber)' }}>${cargoEcon.commission_amount.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
