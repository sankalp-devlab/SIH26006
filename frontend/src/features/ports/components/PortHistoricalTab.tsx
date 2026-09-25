/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights Historical Calls Tab
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  BarChart2,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import type { PortHistoricalVisit, PortDateRange } from '../../../types/port-insights';

interface PortHistoricalTabProps {
  historicalVisits: PortHistoricalVisit[];
  dateRange: PortDateRange;
  onDateRangeChange: (range: PortDateRange) => void;
  portName: string;
}

export const PortHistoricalTab: React.FC<PortHistoricalTabProps> = ({
  historicalVisits,
  dateRange,
  onDateRangeChange,
  portName: _portName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'turnaround' | 'cargo'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    let list = historicalVisits.filter((v) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.vessel_name.toLowerCase().includes(q) ||
        (v.cargo_type || v.cargo_handled || '').toLowerCase().includes(q) ||
        v.terminal_name.toLowerCase().includes(q) ||
        v.vessel_type.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (sortField === 'date') {
        const tA = new Date(a.arrival_date).getTime();
        const tB = new Date(b.arrival_date).getTime();
        return sortAsc ? tA - tB : tB - tA;
      }
      if (sortField === 'turnaround') {
        const aHours = a.turnaround_hours ?? (a.turnaround_days ? a.turnaround_days * 24 : 0);
        const bHours = b.turnaround_hours ?? (b.turnaround_days ? b.turnaround_days * 24 : 0);
        return sortAsc ? aHours - bHours : bHours - aHours;
      }
      if (sortField === 'cargo') {
        const aVol = a.cargo_volume_mt ?? a.quantity_mt ?? 0;
        const bVol = b.cargo_volume_mt ?? b.quantity_mt ?? 0;
        return sortAsc ? aVol - bVol : bVol - aVol;
      }
      return 0;
    });

    return list;
  }, [historicalVisits, searchQuery, sortField, sortAsc]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    if (filteredVisits.length === 0) {
      return { totalCalls: 0, avgTurnaround: 0, totalCargo: 0, avgWait: 0 };
    }
    const totalCalls = filteredVisits.length;
    const totalTurnaround = filteredVisits.reduce((acc, v) => acc + (v.turnaround_hours ?? (v.turnaround_days ? v.turnaround_days * 24 : 0)), 0);
    const totalCargo = filteredVisits.reduce((acc, v) => acc + (v.cargo_volume_mt ?? v.quantity_mt ?? 0), 0);
    const totalWait = filteredVisits.reduce((acc, v) => acc + (v.waiting_hours || 0), 0);

    return {
      totalCalls,
      avgTurnaround: totalTurnaround / totalCalls,
      totalCargo,
      avgWait: totalWait / totalCalls,
    };
  }, [filteredVisits]);

  // SVG Histogram Generation
  const chartHeight = 110;
  const chartWidth = 600;
  const simulatedMonthlyVolumes = [24, 28, 22, 35, 30, 42, 38, 45, 40, 52, 48, filteredVisits.length || 36];
  const maxVolume = Math.max(...simulatedMonthlyVolumes, 55);

  const ranges: PortDateRange[] = ['today', '7d', '30d', '90d'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Date Range Selectors */}
      <div className="piw-card">
        <div className="piw-section-header-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="piw-section-heading">
            <Calendar size={18} color="var(--ol-accent-light)" />
            <div>
              <span>Historical Port Calls & Turnaround Analytics</span>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 400 }}>
                Archived voyages, cargo tonnage discharged, and berth dwell times
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#050e1a', padding: '3px', borderRadius: '6px', border: '1px solid rgba(80, 180, 255, 0.15)' }}>
            {ranges.map((rng) => (
              <button
                key={rng}
                type="button"
                onClick={() => onDateRangeChange(rng)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: dateRange === rng ? 'rgba(0, 216, 255, 0.2)' : 'transparent',
                  color: dateRange === rng ? '#00d8ff' : '#94a3b8',
                }}
              >
                {rng.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Key Aggregate Summary Metrics */}
        <div className="piw-historical-kpis">
          <div className="piw-stat-card">
            <span className="piw-stat-card-label">Total Port Calls</span>
            <div className="piw-stat-card-val" style={{ color: '#ffffff' }}>
              {stats.totalCalls}
            </div>
            <span className="piw-stat-card-sub">within selected window</span>
          </div>

          <div className="piw-stat-card">
            <span className="piw-stat-card-label">Avg Turnaround Time</span>
            <div className="piw-stat-card-val" style={{ color: '#00d8ff' }}>
              {stats.avgTurnaround.toFixed(1)} hrs
            </div>
            <span className="piw-stat-card-sub">berth to unberth duration</span>
          </div>

          <div className="piw-stat-card">
            <span className="piw-stat-card-label">Total Cargo Handled</span>
            <div className="piw-stat-card-val" style={{ color: '#34d399' }}>
              {(stats.totalCargo / 1000).toFixed(1)}k MT
            </div>
            <span className="piw-stat-card-sub">discharged & loaded</span>
          </div>

          <div className="piw-stat-card">
            <span className="piw-stat-card-label">Avg Anchorage Waiting</span>
            <div className="piw-stat-card-val" style={{ color: '#fbbf24' }}>
              {stats.avgWait.toFixed(1)} hrs
            </div>
            <span className="piw-stat-card-sub">prior to pilot boarding</span>
          </div>
        </div>

        {/* 3. Monthly Vessel Call Volume Chart */}
        <div className="piw-chart-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
              <BarChart2 size={15} color="#00d8ff" />
              <span>Vessel Call Volume Distribution</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
              Calls / Period
            </span>
          </div>

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '90px', overflow: 'visible' }}>
            {simulatedMonthlyVolumes.map((vol, idx) => {
              const barWidth = (chartWidth - 60) / simulatedMonthlyVolumes.length - 8;
              const x = 30 + idx * ((chartWidth - 60) / simulatedMonthlyVolumes.length);
              const barH = (vol / maxVolume) * (chartHeight - 30);
              const y = chartHeight - barH - 15;

              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx={3}
                    fill={idx === simulatedMonthlyVolumes.length - 1 ? '#00d8ff' : '#0284c7'}
                    opacity={idx === simulatedMonthlyVolumes.length - 1 ? 0.9 : 0.65}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {vol}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
            <span>Historical Past (W1 - W11)</span>
            <span style={{ color: '#00d8ff', fontWeight: 600 }}>Current Interval (W12)</span>
          </div>
        </div>
      </div>

      {/* 4. Filterable Historical Call Log Table */}
      <div className="piw-card">
        <div className="piw-section-header-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="piw-search-container">
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search historical calls by vessel, cargo, terminal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="piw-search-input"
              style={{ width: '280px' }}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Showing <strong style={{ color: '#ffffff' }}>{filteredVisits.length}</strong> recorded calls
          </div>
        </div>

        <div className="piw-table-card">
          <div className="piw-table-wrapper">
            <table className="piw-table">
              <thead>
                <tr>
                  <th
                    onClick={() => {
                      setSortField('date');
                      setSortAsc(!sortAsc);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <button type="button">
                      <span>Call Dates</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th>Vessel & IMO</th>
                  <th>Class / DWT</th>
                  <th>Terminal</th>
                  <th
                    onClick={() => {
                      setSortField('cargo');
                      setSortAsc(!sortAsc);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <button type="button">
                      <span>Cargo Handled</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th
                    onClick={() => {
                      setSortField('turnaround');
                      setSortAsc(!sortAsc);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <button type="button">
                      <span>Turnaround (hrs)</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th>Anchorage Wait</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No historical port visits found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px' }}>
                        <div style={{ color: '#ffffff' }}>Arr: {new Date(v.arrival_date).toLocaleDateString()}</div>
                        <div style={{ color: '#64748b' }}>
                          Dep: {new Date(v.departure_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{v.vessel_name}</div>
                        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', display: 'block' }}>
                          IMO {v.imo}
                        </span>
                      </td>
                      <td>
                        <div style={{ color: '#cbd5e1' }}>{v.vessel_type}</div>
                        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                          {(v.dwt ?? 55000).toLocaleString()} DWT
                        </span>
                      </td>
                      <td style={{ color: '#cbd5e1' }}>{v.terminal_name}</td>
                      <td>
                        <div style={{ color: '#e2e8f0' }}>{v.cargo_type || v.cargo_handled}</div>
                        <span style={{ fontSize: '10px', color: '#34d399', fontFamily: 'var(--font-mono, monospace)' }}>
                          {(v.cargo_volume_mt ?? v.quantity_mt ?? 0).toLocaleString()} MT
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#00d8ff' }}>
                        {(v.turnaround_hours ?? (v.turnaround_days ? v.turnaround_days * 24 : 0)).toFixed(1)} hrs
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono, monospace)', color: '#fbbf24' }}>
                        {v.waiting_hours ? `${v.waiting_hours.toFixed(1)} hrs` : 'Direct Berth'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
