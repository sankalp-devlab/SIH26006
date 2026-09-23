/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleet Regional Deployment & Hierarchical Grouping Tab
 * Canonical Enterprise Design System Refactor
 */

import { useState } from 'react';
import type { FC } from 'react';
import {
  Globe2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Layers,
} from 'lucide-react';
import type {
  RegionalDeploymentRecord,
  FleetVesselRecord,
} from '../../../../types/fleets';

interface FleetRegionalTabProps {
  regionalBreakdown: RegionalDeploymentRecord[];
  vessels: FleetVesselRecord[];
  onSelectVessel: (vessel: FleetVesselRecord) => void;
}

export const FleetRegionalTab: FC<FleetRegionalTabProps> = ({
  regionalBreakdown,
  vessels,
  onSelectVessel,
}) => {
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    'Middle East Gulf & Red Sea': true,
    'Southeast Asia': true,
  });

  const toggleRegion = (reg: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [reg]: !prev[reg],
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Regional Comparison Matrix Table */}
      <div className="fi-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(100, 190, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe2 size={18} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-primary, #F1F5F9)' }}>
              Global Oceanic Basins Comparison Matrix
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
            {regionalBreakdown.length} Basins Monitored
          </span>
        </div>

        <div className="fi-table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
          <table className="fi-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Oceanic Basin / Region</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Vessel Count</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Total DWT</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Fleet Share</th>
                <th style={{ width: '160px' }}>Dominant Class</th>
                <th style={{ width: '180px' }}>Primary Operator</th>
                <th>Active Coastal States</th>
              </tr>
            </thead>
            <tbody>
              {regionalBreakdown.map((r) => (
                <tr key={r.region}>
                  <td style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <MapPin size={13} style={{ color: 'var(--ol-cyan, #22D3EE)', flexShrink: 0 }} />
                      <span>{r.region}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--ol-cyan, #22D3EE)' }}>
                    {r.vesselCount}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {(r.totalDwt / 1000).toLocaleString()}k DWT
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {r.sharePct}%
                  </td>
                  <td>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.12)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: '11px', fontWeight: 600 }}>
                      {r.topVesselClass}
                    </span>
                  </td>
                  <td style={{ color: 'var(--ol-text-secondary, #94A3B8)', fontWeight: 500 }}>
                    {r.topOperator}
                  </td>
                  <td style={{ color: 'var(--ol-text-muted, #64748B)', fontSize: '11px' }}>
                    {r.countries.map((c) => `${c.country} (${c.count})`).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Hierarchical Groupings (Region → Country → Vessels) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
          <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ol-text-primary, #F1F5F9)' }}>
            Hierarchical Regional Deployment (Region → Country → Fleet)
          </h4>
        </div>

        <div className="fi-accordion-container">
          {regionalBreakdown.map((r) => {
            const isExpanded = !!expandedRegions[r.region];
            const regionVessels = vessels.filter((v) => v.deployment.region === r.region);

            return (
              <div key={r.region} className="fi-accordion-item">
                {/* Region Accordion Header */}
                <div
                  onClick={() => toggleRegion(r.region)}
                  className="fi-accordion-header"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--ol-cyan, #22D3EE)', display: 'flex', alignItems: 'center' }}>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                          {r.region}
                        </span>
                        <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(34, 211, 238, 0.12)', color: 'var(--ol-cyan, #22D3EE)', border: '1px solid rgba(34, 211, 238, 0.25)', fontSize: '10.5px', fontWeight: 700 }}>
                          {r.vesselCount} ships
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                        Dominant: <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{r.topVesselClass}</strong> • Primary Operator:{' '}
                        <strong style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>{r.topOperator}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {(r.totalDwt / 1000).toLocaleString()}k DWT
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
                      {r.sharePct}% Global Share
                    </div>
                  </div>
                </div>

                {/* Expanded Region Body: Countries and Vessels */}
                {isExpanded && (
                  <div className="fi-accordion-body">
                    {r.countries.map((countryRecord) => {
                      const countryVessels = regionVessels.filter(
                        (v) => v.deployment.country === countryRecord.country
                      );

                      return (
                        <div key={countryRecord.country} className="fi-country-card">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(100, 190, 240, 0.08)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={13} style={{ color: '#10B981' }} />
                              {countryRecord.country}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
                              {countryRecord.count} vessels stationed / en route
                            </span>
                          </div>

                          <div className="fi-vessel-chips-grid">
                            {countryVessels.map((v) => (
                              <div
                                key={v.id}
                                onClick={() => onSelectVessel(v)}
                                className="fi-vessel-mini-card"
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {v.name}
                                    </span>
                                    <span className={`fi-badge ${v.deployment.status === 'underway' ? 'fi-badge-underway' : 'fi-badge-anchored'}`} style={{ fontSize: '9.5px', padding: '2px 5px' }}>
                                      {v.deployment.status}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                                    {v.vesselClass} • {v.dwt.toLocaleString()} DWT
                                  </div>
                                </div>

                                <div style={{ paddingTop: '6px', borderTop: '1px solid rgba(100, 190, 240, 0.08)', fontSize: '10.5px', color: 'var(--ol-text-secondary, #94A3B8)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Op: <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{v.operatorName}</strong>
                                  </div>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Dest: <strong style={{ color: 'var(--ol-cyan, #22D3EE)' }}>{v.deployment.destinationPort}</strong> (ETA: {v.deployment.eta})
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
