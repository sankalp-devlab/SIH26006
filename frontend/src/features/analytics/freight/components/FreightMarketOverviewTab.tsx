/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Market Overview Tab
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Compass,
  Anchor,
  AlertTriangle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import type {
  FreightRateBenchmark,
  MarketDriverFactor,
  VesselSupplyBreakdown
} from '../../../../types/freight-analytics';

interface FreightMarketOverviewTabProps {
  rates: FreightRateBenchmark[];
  drivers: MarketDriverFactor[];
  supply?: VesselSupplyBreakdown;
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  onOpenComparison: (type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa', a: string, b: string) => void;
}

export const FreightMarketOverviewTab: React.FC<FreightMarketOverviewTabProps> = ({
  rates,
  drivers,
  supply: _supply,
  selectedRouteCode,
  onSelectRoute,
  onOpenComparison
}) => {
  const navigate = useNavigate();
  const activeBenchmark = rates.find(r => r && r.route_code === selectedRouteCode) || rates[0];

  if (!activeBenchmark) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
        Select a benchmark freight corridor to view rate history and trajectory.
      </div>
    );
  }

  // Helper to render pure SVG sparklines
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = isPositive ? '#10b981' : '#f43f5e';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  // Helper to render interactive historical area chart for selected route
  const renderHistoricalAreaChart = () => {
    if (!activeBenchmark || !activeBenchmark.historical_series || activeBenchmark.historical_series.length < 2) {
      return (
        <div className="flex items-center justify-center h-52 text-slate-500 text-xs">
          Insufficient time-series observations for route {selectedRouteCode}
        </div>
      );
    }

    const series = activeBenchmark.historical_series;
    const values = series.map(s => s.rate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 600;
    const height = 180;
    const padding = 30;

    const points = series.map((s, idx) => {
      const x = padding + (idx / (series.length - 1)) * (width - padding * 2);
      const y = height - padding - ((s.rate - min) / range) * (height - padding * 2);
      return { x, y, ...s };
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />

            {/* Y-axis labels */}
            <text x={padding - 6} y={padding + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
              ${max.toLocaleString()}
            </text>
            <text x={padding - 6} y={(padding + height - padding) / 2 + 3} fill="#64748b" fontSize="10" textAnchor="end">
              ${((max + min) / 2).toFixed(1)}
            </text>
            <text x={padding - 6} y={height - padding + 3} fill="#94a3b8" fontSize="10" textAnchor="end">
              ${min.toLocaleString()}
            </text>

            {/* Shaded Area */}
            <path d={areaD} fill="url(#rateGradient)" />

            {/* Trajectory Line */}
            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#020617"
                  stroke="#10b981"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />
                {/* Tooltip on hover */}
                <title>{`${p.date}: $${p.rate.toLocaleString()} (${activeBenchmark.rate_basis})`}</title>
                <text
                  x={p.x}
                  y={height - 10}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="middle"
                >
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
      {/* Top Section: Benchmark Corridors Table + Selected Route Trajectory */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Col (7/12): Canonical Baltic & Spot Rates Table */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  Benchmark Freight Corridors
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time fixture settlements and canonical Baltic route assessments
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {rates.length} Corridors
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-2.5">Corridor / Route</th>
                    <th className="pb-2.5">Segment / Class</th>
                    <th className="pb-2.5 text-right">Current Rate</th>
                    <th className="pb-2.5 text-right">1D Change</th>
                    <th className="pb-2.5 text-center">30D Trend</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rates.map((route) => {
                    const isSelected = route.route_code === selectedRouteCode;
                    const isPositive = route.change_1d_pct >= 0;

                    return (
                      <tr
                        key={route.id}
                        onClick={() => onSelectRoute(route.route_code)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {route.route_code}
                            </span>
                            <div className="truncate max-w-[170px]">
                              <div className="font-semibold text-slate-200 truncate">{route.route_name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{route.commodity}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-slate-300">
                          <div className="font-medium">{route.vessel_class}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{route.segment.replace('_', ' ')}</div>
                        </td>

                        <td className="py-3 px-2 text-right">
                          <div className="font-bold text-white">
                            ${route.rate_value.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {route.rate_basis === 'per_mt' ? '$/MT' : route.rate_basis === 'per_day_tce' ? '$/Day TCE' : route.rate_basis}
                          </div>
                        </td>

                        <td className="py-3 px-2 text-right">
                          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            {route.change_1d_pct > 0 ? `+${route.change_1d_pct}%` : `${route.change_1d_pct}%`}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center">
                          {renderSparkline(route.sparkline_30d, route.change_30d_pct >= 0)}
                        </td>

                        <td className="py-3 pl-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRoute(route.route_code);
                            }}
                            className={`p-1.5 rounded transition-colors ${
                              isSelected ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Inspect Trajectory"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Click any corridor to view detailed historical trajectory</span>
            <button
              onClick={() => onOpenComparison('route', rates[0]?.route_code || 'C5', rates[1]?.route_code || 'C3')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Compare Top Corridors <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Right Col (5/12): Historical Progression for Selected Route */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeBenchmark.route_code}
                </span>
                <h3 className="text-sm font-semibold text-white truncate">
                  {activeBenchmark.route_name}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {activeBenchmark.distance_nm.toLocaleString()} NM
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Historical rate progression (USD / {activeBenchmark.rate_basis})
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 mb-4 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Latest Rate</div>
                <div className="text-sm font-bold text-white mt-0.5">${activeBenchmark.rate_value.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">30D Change</div>
                <div className={`text-sm font-bold mt-0.5 ${activeBenchmark.change_30d_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeBenchmark.change_30d_pct >= 0 ? '+' : ''}{activeBenchmark.change_30d_pct}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">52W High / Low</div>
                <div className="text-xs font-medium text-slate-300 mt-0.5">
                  ${activeBenchmark.high_52w} / ${activeBenchmark.low_52w}
                </div>
              </div>
            </div>

            {/* SVG Area Chart */}
            {renderHistoricalAreaChart()}
          </div>

          {/* Cross-Module Operational Shortcuts */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cross-Module Operational Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/voyage-calculator')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                title="Model TCE & Profit on Voyage Calculator (Module 11)"
              >
                <Calculator size={13} className="text-cyan-400" />
                <span>Voyage Calc</span>
              </button>

              <button
                onClick={() => navigate('/distance-calculator')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                title="Check Chokepoints in Distance Calculator (Module 12)"
              >
                <Compass size={13} className="text-emerald-400" />
                <span>Distance Router</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Geopolitical & Port Chokepoints Driving Freight Rates */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              Active Market Drivers & Chokepoint Friction
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Canal restrictions, geopolitics, and port congestion absorbing effective vessel supply
            </p>
          </div>
          <button
            onClick={() => navigate('/ports')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <Anchor size={13} /> View Port Congestion (Module 13)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => {
            const isCritical = driver.impact_level === 'CRITICAL';
            const isHigh = driver.impact_level === 'HIGH';

            return (
              <div
                key={driver.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 truncate">
                      {driver.location}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isHigh
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {driver.impact_level} IMPACT
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white leading-snug mb-1.5">
                    {driver.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {driver.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Delay Impact</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">+{driver.delay_impact_days} Days</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Freight Premium</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">+{driver.freight_premium_pct}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Ton-Mile Demand</div>
                    <div className="text-xs font-bold text-cyan-400 mt-0.5">+{driver.ton_mile_expansion_pct}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
