/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Rates & Corridor Intelligence Tab
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  FileText,
  Sliders,
  Calendar
} from 'lucide-react';
import type { FreightRateBenchmark } from '../../../../types/freight-analytics';

interface FreightRatesTabProps {
  rates: FreightRateBenchmark[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  onOpenComparison: (type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa', a: string, b: string) => void;
}

export const FreightRatesTab: React.FC<FreightRatesTabProps> = ({
  rates,
  selectedRouteCode,
  onSelectRoute,
  onOpenComparison
}) => {
  const navigate = useNavigate();
  const activeRoute = rates.find(r => r && r.route_code === selectedRouteCode) || rates[0];

  if (!activeRoute) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
        Select a freight corridor to view rate analytics.
      </div>
    );
  }

  const formatBasis = (basis: string) => {
    switch (basis) {
      case 'per_mt': return '$/Metric Ton';
      case 'per_day_tce': return '$/Day TCE';
      case 'worldscale': return 'WorldScale (WS)';
      case 'lumpsum': return 'LumpSum / FEU';
      default: return basis;
    }
  };

  return (
    <div className="space-y-6">
      {/* Route Deep-Dive Header Card */}
      {activeRoute && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeRoute.route_code}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  {activeRoute.segment.replace('_', ' ')} • {activeRoute.vessel_class}
                </span>
                <span className="text-xs text-slate-400">
                  Last Fixture: {activeRoute.last_fixture_date}
                </span>
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
                {activeRoute.route_name}
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Commodity: <strong className="text-slate-200">{activeRoute.commodity}</strong></span>
                <span>Corridor: <strong className="text-slate-200">{activeRoute.origin_port} → {activeRoute.destination_port}</strong></span>
                <span>Distance: <strong className="text-cyan-400">{activeRoute.distance_nm.toLocaleString()} NM</strong></span>
              </div>
            </div>

            {/* Current Benchmark Value */}
            <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4 self-start lg:self-auto">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Benchmark</div>
                <div className="text-2xl font-bold text-white mt-0.5">
                  ${activeRoute.rate_value.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">
                  {formatBasis(activeRoute.rate_basis)}
                </div>
              </div>

              <div className="border-l border-slate-800 pl-4 space-y-1">
                <div className={`flex items-center gap-0.5 text-xs font-bold ${
                  activeRoute.change_1d_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {activeRoute.change_1d_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {activeRoute.change_1d_pct > 0 ? `+${activeRoute.change_1d_pct}%` : `${activeRoute.change_1d_pct}%`} 1D
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-bold ${
                  activeRoute.change_30d_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {activeRoute.change_30d_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {activeRoute.change_30d_pct > 0 ? `+${activeRoute.change_30d_pct}%` : `${activeRoute.change_30d_pct}%`} 30D
                </div>
              </div>
            </div>
          </div>

          {/* 52-Week Range Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>52-Week Low: <strong className="text-slate-200">${activeRoute.low_52w}</strong></span>
              <span className="font-medium text-slate-300">52-Week Assessment Range</span>
              <span>52-Week High: <strong className="text-slate-200">${activeRoute.high_52w}</strong></span>
            </div>
            {(() => {
              const range = activeRoute.high_52w - activeRoute.low_52w || 1;
              const posPct = Math.max(0, Math.min(100, ((activeRoute.rate_value - activeRoute.low_52w) / range) * 100));
              return (
                <div className="w-full bg-slate-800 h-2.5 rounded-full relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 h-full rounded-full"
                    style={{ width: `${posPct}%` }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Actions & Module Linkages */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenComparison('route', activeRoute.route_code, 'C3')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sliders size={13} className="text-cyan-400" />
                Compare Against C3
              </button>

              <button
                onClick={() => onOpenComparison('spot_vs_ffa', activeRoute.route_code, 'Prompt')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <TrendingUp size={13} className="text-amber-400" />
                Spot vs FFA Spread
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/voyage-calculator')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Calculator size={13} />
                Calculate Voyage TCE
              </button>
              <button
                onClick={() => navigate('/fixtures')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileText size={13} />
                View Fixtures
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corridors Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              All Monitored Freight Corridors & Benchmark Rates
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete cross-segment maritime freight index matrix with multi-basis unit specifications
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {rates.length} Corridors Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pr-4">Code</th>
                <th className="pb-3 px-3">Route / Trade Lane</th>
                <th className="pb-3 px-3">Cargo</th>
                <th className="pb-3 px-3">Vessel Class</th>
                <th className="pb-3 px-3 text-right">Distance</th>
                <th className="pb-3 px-3 text-right">Current Rate</th>
                <th className="pb-3 px-3">Basis</th>
                <th className="pb-3 px-3 text-right">1D %</th>
                <th className="pb-3 px-3 text-right">30D %</th>
                <th className="pb-3 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rates.map((r) => {
                const isSelected = r.route_code === selectedRouteCode;
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRoute(r.route_code)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-500/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                        {r.route_code}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{r.route_name}</div>
                      <div className="text-[10px] text-slate-400">{r.origin_port.split(',')[0]} → {r.destination_port.split(',')[0]}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {r.commodity}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {r.vessel_class}
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-400 font-medium">
                      {r.distance_nm.toLocaleString()} NM
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white text-sm">
                      ${r.rate_value.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {formatBasis(r.rate_basis)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center font-bold ${
                        r.change_1d_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {r.change_1d_pct >= 0 ? `+${r.change_1d_pct}%` : `${r.change_1d_pct}%`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center font-bold ${
                        r.change_30d_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {r.change_30d_pct >= 0 ? `+${r.change_30d_pct}%` : `${r.change_30d_pct}%`}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRoute(r.route_code);
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Observations Log */}
      {activeRoute && activeRoute.historical_series.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <Calendar size={16} className="text-cyan-400" />
              Observed Fixture Log: {activeRoute.route_code}
            </h3>
            <span className="text-xs text-slate-400">
              Verified Commercial Settlements
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {activeRoute.historical_series.map((obs, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{obs.date}</div>
                <div className="text-base font-bold text-white mt-1">
                  ${obs.rate.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Volume: {obs.volume_kt ? `${obs.volume_kt.toLocaleString()} KT` : 'Benchmark'}
                </div>
                <div className="mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Observed Fixture
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
