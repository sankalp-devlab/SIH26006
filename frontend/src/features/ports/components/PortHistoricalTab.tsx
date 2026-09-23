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
  const chartHeight = 100;
  const chartWidth = 500;
  const simulatedMonthlyVolumes = [24, 28, 22, 35, 30, 42, 38, 45, 40, 52, 48, filteredVisits.length || 36];
  const maxVolume = Math.max(...simulatedMonthlyVolumes, 55);

  return (
    <div className="space-y-6">
      {/* 1. Header & Date Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="font-semibold text-slate-100">
              Historical Port Calls & Turnaround Analytics
            </h3>
            <p className="text-xs text-slate-400">
              Archived voyages, cargo tonnage discharged, and berth dwell times
            </p>
          </div>
        </div>

        {/* Date Range Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          {(['7d', '30d', '90d', '1y'] as PortDateRange[]).map((rng) => (
            <button
              key={rng}
              onClick={() => onDateRangeChange(rng)}
              className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-colors ${
                dateRange === rng
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Aggregate Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Port Calls</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {stats.totalCalls}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">within selected window</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">Avg Turnaround Time</span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {stats.avgTurnaround.toFixed(1)} hrs
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">berth to unberth duration</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Cargo Handled</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {(stats.totalCargo / 1000).toFixed(1)}k MT
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">discharged & loaded</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 uppercase font-semibold">Avg Anchorage Waiting</span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {stats.avgWait.toFixed(1)} hrs
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">prior to pilot boarding</span>
        </div>
      </div>

      {/* 3. Monthly Vessel Call Volume Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            <h4 className="font-semibold text-sm text-slate-200">
              Vessel Call Volume Distribution
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Calls / Period</span>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-24 overflow-visible">
            {simulatedMonthlyVolumes.map((vol, idx) => {
              const barWidth = (chartWidth - 60) / simulatedMonthlyVolumes.length - 8;
              const x = 30 + idx * ((chartWidth - 60) / simulatedMonthlyVolumes.length);
              const barH = (vol / maxVolume) * (chartHeight - 30);
              const y = chartHeight - barH - 15;

              return (
                <g key={idx} className="group">
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx={3}
                    className="fill-cyan-600/70 hover:fill-cyan-400 transition-colors"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className="text-[8px] fill-slate-400 font-mono"
                  >
                    {vol}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between text-[10px] text-slate-400 px-4 mt-1 border-t border-slate-800/80 pt-1.5">
            <span>Historical Past (W1 - W11)</span>
            <span className="text-cyan-400 font-semibold">Current Interval (W12)</span>
          </div>
        </div>
      </div>

      {/* 4. Filterable Historical Call Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search historical calls by vessel, cargo, terminal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filteredVisits.length}</strong> recorded calls
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => {
                    setSortField('date');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-cyan-400 select-none"
                >
                  <div className="flex items-center gap-1">
                    Call Dates
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Vessel & IMO</th>
                <th className="py-3 px-3">Class / DWT</th>
                <th className="py-3 px-3">Terminal</th>
                <th
                  onClick={() => {
                    setSortField('cargo');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-cyan-400 select-none"
                >
                  <div className="flex items-center gap-1">
                    Cargo Handled
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('turnaround');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-cyan-400 select-none"
                >
                  <div className="flex items-center gap-1">
                    Turnaround (hrs)
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Anchorage Wait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No historical port visits found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>Arr: {new Date(v.arrival_date).toLocaleDateString()}</div>
                      <div className="text-slate-400">
                        Dep: {new Date(v.departure_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {v.vessel_name}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">
                        IMO {v.imo}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div>{v.vessel_type}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(v.dwt ?? 55000).toLocaleString()} DWT
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{v.terminal_name}</td>
                    <td className="py-3 px-3">
                      <div>{v.cargo_type || v.cargo_handled}</div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {(v.cargo_volume_mt ?? v.quantity_mt ?? 0).toLocaleString()} MT
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-cyan-300">
                      {(v.turnaround_hours ?? (v.turnaround_days ? v.turnaround_days * 24 : 0)).toFixed(1)} hrs
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-300">
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
  );
};
