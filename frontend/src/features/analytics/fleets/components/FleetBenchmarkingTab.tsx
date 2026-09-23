/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleet Benchmarking & Comparative Intelligence Tab
 * Canonical Enterprise Design System Refactor
 */

import { useMemo } from 'react';
import type { FC } from 'react';
import {
  GitCompare,
  Ship,
  Scale,
  Clock,
} from 'lucide-react';
import type {
  FleetBenchmarkResult,
  FleetOwnerEntity,
  FleetOperatorEntity,
} from '../../../../types/fleets';

interface FleetBenchmarkingTabProps {
  benchmarkResult: FleetBenchmarkResult;
  benchmarkType: 'owner' | 'operator' | 'region';
  benchmarkEntityA: string;
  benchmarkEntityB: string;
  onBenchmarkTypeChange: (type: 'owner' | 'operator' | 'region') => void;
  onBenchmarkEntityAChange: (id: string) => void;
  onBenchmarkEntityBChange: (id: string) => void;
  ownersList: FleetOwnerEntity[];
  operatorsList: FleetOperatorEntity[];
  availableRegions: string[];
}

export const FleetBenchmarkingTab: FC<FleetBenchmarkingTabProps> = ({
  benchmarkResult,
  benchmarkType,
  benchmarkEntityA,
  benchmarkEntityB,
  onBenchmarkTypeChange,
  onBenchmarkEntityAChange,
  onBenchmarkEntityBChange,
  ownersList,
  operatorsList,
  availableRegions,
}) => {
  const { entityA, entityB, dwtDelta, vesselDelta, ageDelta } = benchmarkResult;

  const entityOptions = useMemo(() => {
    if (benchmarkType === 'owner') {
      return ownersList.map((o) => ({ id: o.id, label: o.name }));
    }
    if (benchmarkType === 'operator') {
      return operatorsList.map((op) => ({ id: op.id, label: op.name }));
    }
    return availableRegions.map((r) => ({ id: r, label: r }));
  }, [benchmarkType, ownersList, operatorsList, availableRegions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* 1. Control & Entity Selector Bar */}
      <div className="fi-bench-control-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(34, 211, 238, 0.12)', border: '1px solid rgba(34, 211, 238, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ol-cyan, #22D3EE)' }}>
            <GitCompare size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-primary, #F1F5F9)' }}>
              Comparative Fleet Benchmarking Engine
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
              Direct side-by-side capacity, efficiency, class profile & operational comparison
            </p>
          </div>
        </div>

        {/* Dimension & Entity Selectors */}
        <div className="fi-bench-selectors">
          {/* Dimension Selector */}
          <div className="fi-bench-dimension-toggle">
            <button
              onClick={() => {
                onBenchmarkTypeChange('owner');
                onBenchmarkEntityAChange('own-euronav');
                onBenchmarkEntityBChange('own-frontline');
              }}
              className={`fi-bench-toggle-btn ${benchmarkType === 'owner' ? 'active' : ''}`}
            >
              Owners
            </button>
            <button
              onClick={() => {
                onBenchmarkTypeChange('operator');
                onBenchmarkEntityAChange('op-cargill');
                onBenchmarkEntityBChange('op-vitol');
              }}
              className={`fi-bench-toggle-btn ${benchmarkType === 'operator' ? 'active' : ''}`}
            >
              Operators
            </button>
            <button
              onClick={() => {
                onBenchmarkTypeChange('region');
                onBenchmarkEntityAChange('Middle East Gulf & Red Sea');
                onBenchmarkEntityBChange('Southeast Asia');
              }}
              className={`fi-bench-toggle-btn ${benchmarkType === 'region' ? 'active' : ''}`}
            >
              Regions
            </button>
          </div>

          {/* Entity A Selector */}
          <select
            value={benchmarkEntityA}
            onChange={(e) => onBenchmarkEntityAChange(e.target.value)}
            className="fi-bench-select"
            style={{ borderColor: 'rgba(34, 211, 238, 0.4)', color: 'var(--ol-cyan, #22D3EE)' }}
          >
            {entityOptions.map((opt) => (
              <option key={`a-${opt.id}`} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ol-text-muted, #64748B)' }}>
            VS
          </span>

          {/* Entity B Selector */}
          <select
            value={benchmarkEntityB}
            onChange={(e) => onBenchmarkEntityBChange(e.target.value)}
            className="fi-bench-select"
            style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#C084FC' }}
          >
            {entityOptions.map((opt) => (
              <option key={`b-${opt.id}`} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Key Delta Highlights */}
      <div className="fi-delta-grid">
        {/* DWT Delta */}
        <div className="fi-delta-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ol-text-muted, #64748B)' }}>
            <span>Deadweight Tonnage Delta</span>
            <Scale size={16} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
          </div>
          <div className="fi-delta-metric">
            {dwtDelta >= 0 ? `+${(dwtDelta / 1000).toLocaleString()}k` : `${(dwtDelta / 1000).toLocaleString()}k`} DWT
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
            {dwtDelta >= 0 ? `${entityA.entityName} holds more lift capacity` : `${entityB.entityName} holds more lift capacity`}
          </p>
        </div>

        {/* Vessel Count Delta */}
        <div className="fi-delta-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ol-text-muted, #64748B)' }}>
            <span>Fleet Count Delta</span>
            <Ship size={16} style={{ color: '#C084FC' }} />
          </div>
          <div className="fi-delta-metric">
            {vesselDelta >= 0 ? `+${vesselDelta}` : vesselDelta} vessels
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
            {vesselDelta === 0 ? 'Equal vessel counts' : `Net fleet difference in scope`}
          </p>
        </div>

        {/* Age Delta */}
        <div className="fi-delta-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ol-text-muted, #64748B)' }}>
            <span>Average Fleet Age Delta</span>
            <Clock size={16} style={{ color: '#F59E0B' }} />
          </div>
          <div className="fi-delta-metric">
            {ageDelta > 0 ? `+${ageDelta} yrs` : `${ageDelta} yrs`}
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
            {ageDelta < 0
              ? `${entityA.entityName} has younger tonnage`
              : `${entityB.entityName} has younger tonnage`}
          </p>
        </div>
      </div>

      {/* 3. Side-by-Side Detailed Profile Cards */}
      <div className="fi-grid-2col">
        {/* Entity A Card */}
        <div className="fi-bench-profile-card fi-bench-profile-a">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(100, 190, 240, 0.1)' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ol-cyan, #22D3EE)', display: 'block' }}>
                Benchmark Entity A ({benchmarkType.toUpperCase()})
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                {entityA.entityName}
              </h3>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: '4px', background: 'rgba(34, 211, 238, 0.12)', color: 'var(--ol-cyan, #22D3EE)', border: '1px solid rgba(34, 211, 238, 0.25)', fontSize: '11px', fontWeight: 700 }}>
              {entityA.vesselCount} vessels
            </span>
          </div>

          <div className="fi-drawer-stat-grid">
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Total DWT</span>
              <span className="fi-drawer-stat-value">{(entityA.totalDwt / 1_000_000).toFixed(2)}M DWT</span>
            </div>
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Avg Vessel Sizing</span>
              <span className="fi-drawer-stat-value">{(entityA.avgDwt / 1000).toLocaleString()}k DWT</span>
            </div>
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Average Age</span>
              <span className="fi-drawer-stat-value" style={{ color: '#F59E0B' }}>{entityA.avgAgeYears} yrs</span>
            </div>
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Underway Deployment</span>
              <span className="fi-drawer-stat-value" style={{ color: '#10B981' }}>{entityA.underwayPct}%</span>
            </div>
          </div>

          <div style={{ background: 'var(--ol-surface-secondary, #0B1D2E)', borderRadius: '6px', border: '1px solid rgba(100, 190, 240, 0.08)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Dominant Class:</span>
              <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{entityA.dominantVesselClass}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Primary Cargo:</span>
              <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{entityA.dominantCargoCategory}</strong>
            </div>
          </div>

          {/* Class Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(100, 190, 240, 0.1)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ol-text-secondary, #94A3B8)' }}>
              Fleet Class Composition
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entityA.classBreakdown.map((cls) => (
                <div key={cls.vesselClass} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    <span>{cls.vesselClass}</span>
                    <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {cls.count} ({cls.pct}%)
                    </span>
                  </div>
                  <div className="fi-progress-track">
                    <div className="fi-progress-fill fi-progress-blue" style={{ width: `${cls.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Entity B Card */}
        <div className="fi-bench-profile-card fi-bench-profile-b">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(100, 190, 240, 0.1)' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C084FC', display: 'block' }}>
                Benchmark Entity B ({benchmarkType.toUpperCase()})
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                {entityB.entityName}
              </h3>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.12)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.25)', fontSize: '11px', fontWeight: 700 }}>
              {entityB.vesselCount} vessels
            </span>
          </div>

          <div className="fi-drawer-stat-grid">
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Total DWT</span>
              <span className="fi-drawer-stat-value">{(entityB.totalDwt / 1_000_000).toFixed(2)}M DWT</span>
            </div>
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Avg Vessel Sizing</span>
              <span className="fi-drawer-stat-value">{(entityB.avgDwt / 1000).toLocaleString()}k DWT</span>
            </div>
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Average Age</span>
              <span className="fi-drawer-stat-value" style={{ color: '#F59E0B' }}>{entityB.avgAgeYears} yrs</span>
            </div>
            <div className="fi-drawer-stat-box">
              <span className="fi-drawer-stat-label">Underway Deployment</span>
              <span className="fi-drawer-stat-value" style={{ color: '#10B981' }}>{entityB.underwayPct}%</span>
            </div>
          </div>

          <div style={{ background: 'var(--ol-surface-secondary, #0B1D2E)', borderRadius: '6px', border: '1px solid rgba(100, 190, 240, 0.08)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Dominant Class:</span>
              <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{entityB.dominantVesselClass}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Primary Cargo:</span>
              <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{entityB.dominantCargoCategory}</strong>
            </div>
          </div>

          {/* Class Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(100, 190, 240, 0.1)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ol-text-secondary, #94A3B8)' }}>
              Fleet Class Composition
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entityB.classBreakdown.map((cls) => (
                <div key={cls.vesselClass} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    <span>{cls.vesselClass}</span>
                    <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {cls.count} ({cls.pct}%)
                    </span>
                  </div>
                  <div className="fi-progress-track">
                    <div className="fi-progress-fill fi-progress-purple" style={{ width: `${cls.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
