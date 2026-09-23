/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleet Composition & Structural Breakdown Tab
 * Canonical Enterprise Design System Refactor
 */

import { useMemo } from 'react';
import type { FC } from 'react';
import {
  Layers,
  Fuel,
  Building2,
  Briefcase,
  Flag,
  Clock,
} from 'lucide-react';
import type {
  FleetVesselRecord,
  FleetVesselClass,
  FleetCargoCategory,
} from '../../../../types/fleets';

interface FleetCompositionTabProps {
  vessels: FleetVesselRecord[];
  classBreakdown: Array<{ vesselClass: FleetVesselClass; vesselCount: number; totalDwt: number; sharePct: number }>;
  cargoBreakdown: Array<{ cargoCategory: FleetCargoCategory; vesselCount: number; totalDwt: number; sharePct: number }>;
  ownerBreakdown: Array<{ ownerId: string; ownerName: string; ownerCountry: string; vesselCount: number; totalDwt: number; sharePct: number }>;
  operatorBreakdown: Array<{ operatorId: string; operatorName: string; operatorCountry: string; vesselCount: number; totalDwt: number; sharePct: number }>;
}

export const FleetCompositionTab: FC<FleetCompositionTabProps> = ({
  vessels,
  classBreakdown,
  cargoBreakdown,
  ownerBreakdown,
  operatorBreakdown,
}) => {
  // Age distribution calculation
  const ageBuckets = useMemo(() => {
    let tier1 = 0; // 0-5 years (Eco modern)
    let tier2 = 0; // 6-12 years (Mid-life prime)
    let tier3 = 0; // 13+ years (Vintage / Demolition candidates)
    vessels.forEach((v) => {
      const age = Math.max(0, 2026 - v.yearBuilt);
      if (age <= 5) tier1++;
      else if (age <= 12) tier2++;
      else tier3++;
    });
    const total = vessels.length || 1;
    return [
      { label: 'Modern Eco (0–5 yrs)', count: tier1, pct: Math.round((tier1 / total) * 100), colorClass: 'fi-progress-emerald' },
      { label: 'Prime Mid-Life (6–12 yrs)', count: tier2, pct: Math.round((tier2 / total) * 100), colorClass: 'fi-progress-blue' },
      { label: 'Vintage / Demolition (13+ yrs)', count: tier3, pct: Math.round((tier3 / total) * 100), colorClass: 'fi-progress-amber' },
    ];
  }, [vessels]);

  // Flag registry calculation
  const flagDistribution = useMemo(() => {
    const map = new Map<string, number>();
    vessels.forEach((v) => {
      map.set(v.flag, (map.get(v.flag) || 0) + 1);
    });
    const list: Array<{ flag: string; count: number; pct: number }> = [];
    const total = vessels.length || 1;
    map.forEach((cnt, fl) => {
      list.push({ flag: fl, count: cnt, pct: Math.round((cnt / total) * 100) });
    });
    return list.sort((a, b) => b.count - a.count);
  }, [vessels]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top Row: Vessel Class vs Cargo Capability */}
      <div className="fi-grid-2col">
        {/* 1. Vessel Class Distribution */}
        <div className="fi-card">
          <div className="fi-card-header">
            <div className="fi-card-title">
              <Layers size={17} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <span>Vessel Class Distribution</span>
            </div>
            <span className="fi-card-meta">{classBreakdown.length} Classes Monitored</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {classBreakdown.map((item) => (
              <div key={item.vesselClass} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {item.vesselClass}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    <span>{item.vesselCount} vessels</span>
                    <span style={{ color: 'rgba(100, 190, 240, 0.2)' }}>|</span>
                    <span style={{ color: 'var(--ol-cyan, #22D3EE)', fontWeight: 600 }}>
                      {(item.totalDwt / 1000).toLocaleString()}k DWT
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', minWidth: '32px', textAlign: 'right' }}>
                      {item.sharePct}%
                    </span>
                  </div>
                </div>
                <div className="fi-progress-track">
                  <div
                    className="fi-progress-fill fi-progress-blue"
                    style={{ width: `${item.sharePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Cargo Capability Distribution */}
        <div className="fi-card">
          <div className="fi-card-header">
            <div className="fi-card-title">
              <Fuel size={17} style={{ color: '#F59E0B' }} />
              <span>Cargo Capability Distribution</span>
            </div>
            <span className="fi-card-meta">{cargoBreakdown.length} Sectors Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cargoBreakdown.map((item) => (
              <div key={item.cargoCategory} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {item.cargoCategory}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    <span>{item.vesselCount} vessels</span>
                    <span style={{ color: 'rgba(100, 190, 240, 0.2)' }}>|</span>
                    <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                      {(item.totalDwt / 1000).toLocaleString()}k DWT
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', minWidth: '32px', textAlign: 'right' }}>
                      {item.sharePct}%
                    </span>
                  </div>
                </div>
                <div className="fi-progress-track">
                  <div
                    className="fi-progress-fill fi-progress-amber"
                    style={{ width: `${item.sharePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Beneficial Owners vs Commercial Operators */}
      <div className="fi-grid-2col">
        {/* 3. Beneficial Asset Owners */}
        <div className="fi-card">
          <div className="fi-card-header">
            <div className="fi-card-title">
              <Building2 size={17} style={{ color: '#A855F7' }} />
              <span>Beneficial Asset Owners</span>
            </div>
            <span className="fi-card-meta">{ownerBreakdown.length} Holding Entities</span>
          </div>

          <div className="fi-entity-list">
            {ownerBreakdown.map((item) => (
              <div key={item.ownerId} className="fi-entity-row">
                <div>
                  <div className="fi-entity-name">{item.ownerName}</div>
                  <div className="fi-entity-country">{item.ownerCountry}</div>
                </div>
                <div>
                  <div className="fi-entity-stat-primary" style={{ color: '#C084FC' }}>
                    {item.vesselCount} ships ({item.sharePct}%)
                  </div>
                  <div className="fi-entity-stat-sub">
                    {(item.totalDwt / 1000).toLocaleString()}k DWT
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Commercial Operators & Charterers */}
        <div className="fi-card">
          <div className="fi-card-header">
            <div className="fi-card-title">
              <Briefcase size={17} style={{ color: '#10B981' }} />
              <span>Commercial Operators & Charterers</span>
            </div>
            <span className="fi-card-meta">{operatorBreakdown.length} Operating Pools</span>
          </div>

          <div className="fi-entity-list">
            {operatorBreakdown.map((item) => (
              <div key={item.operatorId} className="fi-entity-row">
                <div>
                  <div className="fi-entity-name">{item.operatorName}</div>
                  <div className="fi-entity-country">{item.operatorCountry}</div>
                </div>
                <div>
                  <div className="fi-entity-stat-primary" style={{ color: '#34D399' }}>
                    {item.vesselCount} ships ({item.sharePct}%)
                  </div>
                  <div className="fi-entity-stat-sub">
                    {(item.totalDwt / 1000).toLocaleString()}k DWT
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Age Profile & Flag Administrations */}
      <div className="fi-grid-2col">
        {/* 5. Age Distribution Profile */}
        <div className="fi-card">
          <div className="fi-card-header">
            <div className="fi-card-title">
              <Clock size={17} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <span>Fleet Age & Modernity Profile</span>
            </div>
            <span className="fi-card-meta">Baseline 2026 Fleet Standard</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ageBuckets.map((bucket) => (
              <div key={bucket.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {bucket.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--ol-text-secondary, #94A3B8)', fontSize: '11px' }}>
                      {bucket.count} vessels
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {bucket.pct}%
                    </span>
                  </div>
                </div>
                <div className="fi-progress-track" style={{ height: '8px' }}>
                  <div
                    className={`fi-progress-fill ${bucket.colorClass}`}
                    style={{ width: `${bucket.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Flag Administrations */}
        <div className="fi-card">
          <div className="fi-card-header">
            <div className="fi-card-title">
              <Flag size={17} style={{ color: '#F43F5E' }} />
              <span>Flag State Administrations</span>
            </div>
            <span className="fi-card-meta">{flagDistribution.length} Flags Registered</span>
          </div>

          <div className="fi-flag-grid">
            {flagDistribution.map((item) => (
              <div key={item.flag} className="fi-flag-pill">
                <div className="fi-flag-name" title={item.flag}>{item.flag}</div>
                <div className="fi-flag-stats">
                  <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #22D3EE)' }}>
                    {item.count} ships
                  </span>
                  <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>
                    {item.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
