/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Forward Freight Agreements (FFA) & Spot-vs-FFA Spread Tab
 */

import React from 'react';
import {
  Activity,
  Scale,
  Calendar,
  Info
} from 'lucide-react';
import type {
  FFACurveItem,
  SpotFFASpread,
  FreightRateBenchmark
} from '../../../../types/freight-analytics';

interface FFASpotSpreadTabProps {
  ffaCurves: FFACurveItem[];
  spotSpreads: SpotFFASpread[];
  rates: FreightRateBenchmark[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  onOpenComparison: (type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa', a: string, b: string) => void;
}

export const FFASpotSpreadTab: React.FC<FFASpotSpreadTabProps> = ({
  ffaCurves,
  spotSpreads,
  rates,
  selectedRouteCode,
  onSelectRoute,
  onOpenComparison
}) => {
  const activeCurveRoute = selectedRouteCode || (rates[0]?.route_code ?? 'C5');

  // Filter curves for currently active route
  const currentCurves = ffaCurves.filter(
    c => c && c.route_code && c.route_code.toLowerCase() === activeCurveRoute.toLowerCase()
  );
  const displayCurves = currentCurves.length > 0 ? currentCurves : ffaCurves;

  const currentRate = rates.find(
    r => r && r.route_code && r.route_code.toLowerCase() === activeCurveRoute.toLowerCase()
  ) || rates[0];

  if (!currentRate) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
        Select a market route to view forward freight agreement (FFA) curves and paper spreads.
      </div>
    );
  }

  // Render pure SVG Forward Curve comparison chart
  const renderForwardCurveChart = () => {
    if (displayCurves.length < 2) {
      return (
        <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
          Insufficient forward contracts available for route {activeCurveRoute}
        </div>
      );
    }

    const forwardRates = displayCurves.map(c => c.forward_rate_usd);
    const spotRates = displayCurves.map(c => c.spot_equivalent_usd);
    const allVals = [...forwardRates, ...spotRates];
    const min = Math.min(...allVals) * 0.95;
    const max = Math.max(...allVals) * 1.05;
    const range = max - min || 1;

    const width = 620;
    const height = 200;
    const padding = 40;

    const pointsForward = displayCurves.map((c, idx) => {
      const x = padding + (idx / (displayCurves.length - 1)) * (width - padding * 2);
      const y = height - padding - ((c.forward_rate_usd - min) / range) * (height - padding * 2);
      return { x, y, ...c };
    });

    const spotY = height - padding - ((currentRate.rate_value - min) / range) * (height - padding * 2);

    const pathForward = pointsForward.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[550px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 select-none">
            {/* Grid */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />

            {/* Horizontal Spot Benchmark Line */}
            <line
              x1={padding}
              y1={spotY}
              x2={width - padding}
              y2={spotY}
              stroke="#38bdf8"
              strokeWidth="1.75"
              strokeDasharray="4 4"
            />
            <text x={width - padding + 5} y={spotY + 4} fill="#38bdf8" fontSize="10">
              Spot (${currentRate.rate_value})
            </text>

            {/* FFA Forward Curve Line */}
            <path d={pathForward} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points & Labels */}
            {pointsForward.map((p, idx) => (
              <g key={idx} className="group">
                <circle cx={p.x} cy={p.y} r="5" fill="#020617" stroke="#f59e0b" strokeWidth="2" />
                <title>{`${p.contract_period}: $${p.forward_rate_usd.toLocaleString()} (Spread: $${p.spread_usd})`}</title>
                <text x={p.x} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  {p.contract_period}
                </text>
                <text x={p.x} y={p.y - 10} fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">
                  ${p.forward_rate_usd}
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
      {/* Overview Cards & Structure Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wide">Market Forward Structure</span>
            <Activity size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-2">
            Contango Dominant
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prompt and deferred contracts trade at a premium to prompt spot fixtures (+2.1% to +9.8% forward spread).
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wide">Open Paper Interest</span>
            <Calendar size={15} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-2">
            118,500 Lots
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strong commercial liquidity across dry bulk Capesize (C5/C3) and tanker VLCC (TD3C) forward curves.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wide">Hedging Spread Arbitrage</span>
            <Scale size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight mt-2">
            +$0.50 / MT Avg
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Importers and charterers actively forward-covering Q4 tonnage against canal diversion risks.
          </p>
        </div>
      </div>

      {/* Main Curve Visualizer & Selected Corridor Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left (7/12): Forward Curve SVG Plot */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                  <Activity size={16} className="text-amber-400" />
                  Forward Curve: {activeCurveRoute} vs Physical Spot
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between physical spot rate and forward paper derivative contract periods
                </p>
              </div>

              {/* Corridor Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['C5', 'TD3C', 'P1A'].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      onSelectRoute(code);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      activeCurveRoute === code
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs mb-3">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-3 h-0.5 bg-amber-400 rounded" /> FFA Forward Curve
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-3 h-0.5 border-b border-dashed border-cyan-400" /> Current Physical Spot
              </span>
            </div>

            {renderForwardCurveChart()}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Info size={13} className="text-slate-500" />
              Settlement basis: Baltic Exchange benchmark settlement methodology
            </span>
            <button
              onClick={() => onOpenComparison('spot_vs_ffa', activeCurveRoute, 'Prompt')}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              Analyze Spread Arbitrage →
            </button>
          </div>
        </div>

        {/* Right (5/12): Contract Periods Breakdown Table */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                {activeCurveRoute} FFA Contracts Matrix
              </h3>
              <span className="text-xs text-slate-400">
                {displayCurves.length} Expiries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-2.5">Period</th>
                    <th className="pb-2.5 text-right">Forward USD</th>
                    <th className="pb-2.5 text-right">Spread USD</th>
                    <th className="pb-2.5 text-right">Spread %</th>
                    <th className="pb-2.5 text-center">Structure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayCurves.map((c) => {
                    const isPositive = c.spread_usd >= 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 pr-2">
                          <div className="font-semibold text-slate-200">{c.contract_period}</div>
                          <div className="text-[10px] text-slate-500">Exp: {c.settlement_date}</div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-white">
                          ${c.forward_rate_usd.toLocaleString()}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? `+$${c.spread_usd}` : `-$${Math.abs(c.spread_usd)}`}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? `+${c.spread_pct}%` : `${c.spread_pct}%`}
                        </td>
                        <td className="py-2.5 pl-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.market_structure === 'contango'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {c.market_structure}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Open Interest: <strong className="text-slate-200">{displayCurves.reduce((acc, c) => acc + c.open_interest_lots, 0).toLocaleString()} lots</strong> across prompt/deferred curves.
          </div>
        </div>
      </div>

      {/* Spot vs FFA Cross-Corridor Spreads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <Scale size={16} className="text-cyan-400" />
              Cross-Corridor Spot vs FFA Spread Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Basis spread and forward curve premium comparisons across benchmark trade routes
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pr-3">Route Code</th>
                <th className="pb-3 px-3">Trade Lane</th>
                <th className="pb-3 px-3">Vessel Class</th>
                <th className="pb-3 px-3 text-right">Physical Spot</th>
                <th className="pb-3 px-3 text-right">Prompt FFA</th>
                <th className="pb-3 px-3 text-right">M+1 FFA</th>
                <th className="pb-3 px-3 text-right">Q1 FFA</th>
                <th className="pb-3 px-3 text-right">Basis Spread</th>
                <th className="pb-3 px-3 text-right">Premium %</th>
                <th className="pb-3 pl-3 text-center">Structure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {spotSpreads.map((s) => {
                const isContango = s.state === 'contango';
                return (
                  <tr key={s.route_code} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 pr-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-white border border-slate-700">
                        {s.route_code}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {s.route_name}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {s.vessel_class}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      ${s.spot_rate.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      ${s.ffa_prompt.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      ${s.ffa_m1.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      ${s.ffa_q1.toLocaleString()}
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold ${s.basis_spread >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.basis_spread >= 0 ? `+$${s.basis_spread}` : `-$${Math.abs(s.basis_spread)}`}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${s.premium_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.premium_pct >= 0 ? `+${s.premium_pct}%` : `${s.premium_pct}%`}
                    </td>
                    <td className="py-3 pl-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isContango
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : s.state === 'backwardation'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {s.state}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
