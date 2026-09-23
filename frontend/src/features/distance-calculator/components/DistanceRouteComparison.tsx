/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Route Alternative Sensitivity Comparison Matrix
 */

import {
  Compass,
  ShieldCheck,
  ShieldAlert,
  Fuel,
  Leaf,
  DollarSign,
  ArrowRight,
  Clock,
  Ruler,
} from 'lucide-react';
import type { RouteAlternativeOption, RoutePreference } from '../../../types/distance-calculator';

interface DistanceRouteComparisonProps {
  alternatives: RouteAlternativeOption[];
  activePreference: RoutePreference;
  onSelectPreference: (preference: RoutePreference) => void;
}

export function DistanceRouteComparison({
  alternatives,
  activePreference,
  onSelectPreference,
}: DistanceRouteComparisonProps) {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} style={{ color: '#38bdf8' }} />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
            Maritime Corridor Alternatives Comparison
          </h2>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          Compare Distance, Transit Days, Fuel & Geopolitical Security
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {alternatives.map((alt) => {
          const isSelected = activePreference === alt.preference;

          return (
            <div
              key={alt.id}
              style={{
                background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'rgba(10, 25, 47, 0.6)',
                border: `1.5px solid ${isSelected ? '#0284c7' : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: isSelected ? '0 0 16px rgba(2, 132, 199, 0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                      {alt.name}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                      {alt.description}
                    </p>
                  </div>
                  {isSelected && (
                    <span
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Primary Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    margin: '14px 0',
                    padding: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Ruler size={11} /> Distance
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {alt.total_distance_nm.toLocaleString()} <span style={{ fontSize: '10px' }}>NM</span>
                    </div>
                    {alt.delta_distance_nm !== 0 && (
                      <div style={{ fontSize: '10px', color: alt.delta_distance_nm > 0 ? '#f87171' : '#34d399' }}>
                        {alt.delta_distance_nm > 0 ? `+${alt.delta_distance_nm.toLocaleString()}` : alt.delta_distance_nm} NM
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> Transit Time
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                      {alt.adjusted_sea_days} <span style={{ fontSize: '10px' }}>Days</span>
                    </div>
                    {alt.delta_days !== 0 && (
                      <div style={{ fontSize: '10px', color: alt.delta_days > 0 ? '#f87171' : '#34d399' }}>
                        {alt.delta_days > 0 ? `+${alt.delta_days}` : alt.delta_days} d
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Fuel size={12} /> Fuel Consumption:
                    </span>
                    <span style={{ fontWeight: 600 }}>{alt.fuel_burn_mt.toLocaleString()} MT</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Leaf size={12} /> Carbon Emissions:
                    </span>
                    <span style={{ fontWeight: 600 }}>{alt.co2_emissions_mt.toLocaleString()} MT</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={12} /> Canal Tolls:
                    </span>
                    <span style={{ fontWeight: 600, color: alt.canal_cost_usd > 0 ? '#fbbf24' : '#34d399' }}>
                      {alt.canal_cost_usd > 0 ? `$${alt.canal_cost_usd.toLocaleString()}` : '$0 (Bypasses Canal)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Security Risk:</span>
                    {alt.has_piracy_risk ? (
                      <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <ShieldAlert size={12} /> HIGH RISK ZONE
                      </span>
                    ) : (
                      <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <ShieldCheck size={12} /> PIRACY SAFE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => onSelectPreference(alt.preference)}
                disabled={isSelected}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #0284c7' : '1px solid rgba(148, 163, 184, 0.2)',
                  background: isSelected ? 'rgba(2, 132, 199, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                  color: isSelected ? '#38bdf8' : '#f8fafc',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isSelected ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isSelected ? 'Currently Selected' : 'Apply This Corridor'}
                {!isSelected && <ArrowRight size={13} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
