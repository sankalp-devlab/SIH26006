/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator Hero KPI Metric Cards
 */

import React from 'react';
import {
  Ruler,
  Clock,
  Calendar,
  Fuel,
  Leaf,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import type { DistanceCalculationResult } from '../../../types/distance-calculator';

interface DistanceKPISummaryProps {
  result: DistanceCalculationResult;
}

export function DistanceKPISummary({ result }: DistanceKPISummaryProps) {
  const formattedEta = React.useMemo(() => {
    try {
      const d = new Date(result.estimated_arrival_time);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return result.estimated_arrival_time;
    }
  }, [result.estimated_arrival_time]);

  const formattedDep = React.useMemo(() => {
    try {
      const d = new Date(result.departure_time);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return result.departure_time;
    }
  }, [result.departure_time]);

  const secaPct = Math.round(
    (result.seca_distance_nm / (result.total_distance_nm || 1)) * 100
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      {result.is_manually_modified && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#fbbf24',
          }}
        >
          <AlertTriangle size={15} />
          <span>
            <strong>MANUALLY MODIFIED ROUTE:</strong> Distance or intermediate waypoints have custom overrides applied.
          </span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Card 1: Total Distance */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Total Distance
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
              {result.total_distance_nm.toLocaleString()} <span style={{ fontSize: '12px', color: '#94a3b8' }}>NM</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
              Open: {result.non_seca_distance_nm.toLocaleString()} | Canal: {result.canal_distance_nm} NM
            </div>
          </div>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
            }}
          >
            <Ruler size={18} />
          </div>
        </div>

        {/* Card 2: Voyage Duration */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Steaming Duration
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
              {result.adjusted_sea_days} <span style={{ fontSize: '12px', color: '#94a3b8' }}>Days</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
              Base: {result.base_sea_days}d (+{result.weather_margin_pct}% margin)
            </div>
          </div>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(148, 163, 184, 0.1)',
              color: '#cbd5e1',
            }}
          >
            <Clock size={18} />
          </div>
        </div>

        {/* Card 3: Estimated Arrival (ETA) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Estimated Arrival (ETA)
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', marginTop: '6px' }}>
              {formattedEta}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Dep: {formattedDep}
            </div>
          </div>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(52, 211, 153, 0.12)',
              color: '#34d399',
            }}
          >
            <Calendar size={18} />
          </div>
        </div>

        {/* Card 4: Bunker Fuel */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Fuel Implication
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>
              {result.fuel_implications.total_fuel_mt.toLocaleString()}{' '}
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>MT</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
              Cost: ${result.fuel_implications.total_fuel_cost_usd.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(251, 191, 36, 0.12)',
              color: '#fbbf24',
            }}
          >
            <Fuel size={18} />
          </div>
        </div>

        {/* Card 5: IMO Carbon & EU ETS */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              CO2 Emissions
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#c084fc', marginTop: '4px' }}>
              {result.emission_implications.co2_total_mt.toLocaleString()}{' '}
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>MT</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
              EU ETS: €{result.emission_implications.eu_ets_cost_eur.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#c084fc',
            }}
          >
            <Leaf size={18} />
          </div>
        </div>

        {/* Card 6: SECA Exposure */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              SECA Exposure
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
              {result.seca_distance_nm.toLocaleString()}{' '}
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>NM</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
              {secaPct}% of route (Mandatory LSMGO)
            </div>
          </div>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
            }}
          >
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
