/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Vessel Supply & Operational Fleet Intelligence Tab
 */

import React, { useState } from 'react';
import {
  Ship,
  Globe,
  Anchor,
  Compass,
  Layers,
  PieChart,
  BarChart2,
  Scale
} from 'lucide-react';
import type {
  VesselSupplyBreakdown
} from '../../../../types/freight-analytics';

interface VesselSupplyTabProps {
  supply?: VesselSupplyBreakdown;
  onOpenComparison: (type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa', a: string, b: string) => void;
}

export const VesselSupplyTab: React.FC<VesselSupplyTabProps> = ({
  supply,
  onOpenComparison
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('pacific');

  if (!supply) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading commercial vessel supply data...
      </div>
    );
  }

  const selectedRegion = supply.regional_distribution.find(r => r.region_id === selectedRegionId) || supply.regional_distribution[0];

  const formatDwt = (dwt: number) => {
    if (dwt >= 1_000_000_000) return `${(dwt / 1_000_000_000).toFixed(2)}B DWT`;
    if (dwt >= 1_000_000) return `${(dwt / 1_000_000).toFixed(1)}M DWT`;
    return `${dwt.toLocaleString()} DWT`;
  };

  // Render SVG Historical Supply Progression Chart
  const renderHistoricalSupplyChart = () => {
    const trend = supply.historical_trend;
    if (!trend || trend.length < 2) return null;

    const maxDwt = Math.max(...trend.map(t => t.total_supply_dwt));
    const width = 640;
    const height = 200;
    const padding = 35;

    const pointsTotal = trend.map((t, idx) => {
      const x = padding + (idx / (trend.length - 1)) * (width - padding * 2);
      const y = height - padding - (t.total_supply_dwt / maxDwt) * (height - padding * 2);
      return { x, y, ...t };
    });

    const pointsActive = trend.map((t, idx) => {
      const x = padding + (idx / (trend.length - 1)) * (width - padding * 2);
      const y = height - padding - (t.active_supply_dwt / maxDwt) * (height - padding * 2);
      return { x, y, ...t };
    });

    const pathTotal = pointsTotal.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const pathActive = pointsActive.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[550px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 select-none">
            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />

            {/* Total Fleet Line */}
            <path d={pathTotal} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Active Commercial Line */}
            <path d={pathActive} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

            {/* Points & Labels */}
            {pointsTotal.map((p, idx) => (
              <g key={idx} className="group">
                <circle cx={p.x} cy={p.y} r="4" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
                <circle cx={pointsActive[idx].x} cy={pointsActive[idx].y} r="4" fill="#020617" stroke="#10b981" strokeWidth="2" />
                <text x={p.x} y={height - 10} fill="#64748b" fontSize="10" textAnchor="middle">
                  {p.date.slice(5)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 4 Operational Supply Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Laden / Operating */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-emerald-400">Laden / Operating</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Ship size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {supply.laden_operating_count.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {formatDwt(supply.laden_operating_dwt)} under contract
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Committed Fleet Share:</span>
            <span className="font-semibold text-slate-200">54.0%</span>
          </div>
        </div>

        {/* Ballast / Open Repositioning */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-cyan-400">Ballast / Open Availability</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Compass size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {supply.ballast_open_count.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {formatDwt(supply.ballast_open_dwt)} available within 10d
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Open Fleet Share:</span>
            <span className="font-semibold text-slate-200">28.0%</span>
          </div>
        </div>

        {/* Waiting at Anchorage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-amber-400">Waiting at Anchorage</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Anchor size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {supply.waiting_anchorage_count.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {formatDwt(supply.waiting_anchorage_dwt)} locked in congestion
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Congestion Share:</span>
            <span className="font-semibold text-slate-200">12.0%</span>
          </div>
        </div>

        {/* Inactive / Drydock */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Inactive / Drydock</span>
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
              <Layers size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {supply.inactive_drydock_count.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {formatDwt(supply.inactive_drydock_dwt)} out of commercial service
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Commercial Utilization:</span>
            <span className="font-semibold text-emerald-400">{supply.supply_utilization_pct}%</span>
          </div>
        </div>
      </div>

      {/* Regional Supply Distribution Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left (7/12): Regional Breakdown Table */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                  <Globe size={16} className="text-cyan-400" />
                  Regional Fleet Supply Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Geographical deployment, open tonnage, and operational load port queues
                </p>
              </div>
              <button
                onClick={() => onOpenComparison('region', 'pacific', 'atlantic')}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
              >
                <Scale size={13} /> Compare Regions
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-2.5">Region</th>
                    <th className="pb-2.5 text-right">Vessels</th>
                    <th className="pb-2.5 text-right">Supply DWT</th>
                    <th className="pb-2.5 text-right">Share %</th>
                    <th className="pb-2.5 text-right">Ballast</th>
                    <th className="pb-2.5 text-right">Waiting</th>
                    <th className="pb-2.5 text-center">Congestion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {supply.regional_distribution.map((reg) => {
                    const isSelected = reg.region_id === selectedRegionId;
                    return (
                      <tr
                        key={reg.region_id}
                        onClick={() => setSelectedRegionId(reg.region_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/10 hover:bg-cyan-500/15' : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-3 pr-2 font-semibold text-slate-200">
                          {reg.region_name}
                        </td>
                        <td className="py-3 px-2 text-right text-slate-300 font-medium">
                          {reg.vessel_count.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right text-slate-300">
                          {formatDwt(reg.supply_dwt)}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-white">
                          {reg.share_pct}%
                        </td>
                        <td className="py-3 px-2 text-right text-cyan-400 font-medium">
                          {reg.ballast_count.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right text-amber-400 font-medium">
                          {reg.waiting_count.toLocaleString()}
                        </td>
                        <td className="py-3 pl-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            reg.avg_congestion_pct > 55
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : reg.avg_congestion_pct > 40
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {reg.avg_congestion_pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Select a region to inspect operational load ports & routes</span>
            <span className="text-slate-300 font-medium">{supply.regional_distribution.length} Operating Basins Tracked</span>
          </div>
        </div>

        {/* Right (5/12): Region Deep-Dive Card */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Region Focus
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedRegion.region_name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                {selectedRegion.share_pct}% of Global Supply
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800 rounded-lg p-3 my-4 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Tonnage</div>
                <div className="text-sm font-bold text-white mt-0.5">{formatDwt(selectedRegion.supply_dwt)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Ballasters</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">{selectedRegion.ballast_count}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Queue At Anchor</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{selectedRegion.waiting_count}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Key Strategic Ports:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedRegion.key_ports.map((port, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {port}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Primary Trading Corridors:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedRegion.primary_routes.map((rt, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                      Route {rt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Regional Supply Trend (30d):</span>
              <span className={`font-bold ${selectedRegion.trend_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedRegion.trend_pct >= 0 ? `+${selectedRegion.trend_pct}%` : `${selectedRegion.trend_pct}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Supply Breakdown & Historical Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left (6/12): Segment & Vessel Class Capacity */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2 mb-1">
            <BarChart2 size={16} className="text-emerald-400" />
            Supply by Vessel Class & Segment
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Commercial capacity, prompt vessel availability, and market daily earnings
          </p>

          <div className="space-y-3">
            {supply.segment_distribution.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.vessel_class}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({item.segment})</span>
                  </div>
                  <div className="font-bold text-emerald-400">
                    ${item.avg_daily_earnings_usd.toLocaleString()}/day
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${item.share_pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 text-[11px] text-slate-400">
                  <div>Capacity: <span className="text-slate-200 font-medium">{formatDwt(item.total_dwt)}</span></div>
                  <div className="text-center">Vessels: <span className="text-slate-200 font-medium">{item.vessel_count}</span></div>
                  <div className="text-right">Open 10d: <span className="text-cyan-400 font-bold">{item.open_next_10d} ships</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (6/12): Historical Supply Progression Chart */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <PieChart size={16} className="text-cyan-400" />
                6-Month Fleet Capacity Evolution
              </h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block rounded" /> Total Fleet
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-0.5 bg-emerald-400 inline-block rounded" /> Active Supply
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Monthly time-series balance between total fleet deadweight and active commercial deployment
            </p>

            {renderHistoricalSupplyChart()}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Historical baseline: 6 months continuous AIS observation</span>
            <span className="text-emerald-400 font-medium">+6.4% Total Fleet Expansion</span>
          </div>
        </div>
      </div>
    </div>
  );
};
