/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics Multi-Entity Comparison Modal
 */

import React, { useEffect } from 'react';
import {
  X,
  Scale,
  TrendingUp,
  Globe,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';
import type {
  FreightComparisonResult,
  FreightRateBenchmark,
  RegionalSupplyItem
} from '../../../../types/freight-analytics';

interface FreightComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison?: FreightComparisonResult;
  comparisonType: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa';
  comparisonTargetA: string;
  comparisonTargetB: string;
  onTypeChange: (type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa') => void;
  onTargetAChange: (id: string) => void;
  onTargetBChange: (id: string) => void;
  rates: FreightRateBenchmark[];
  regions: RegionalSupplyItem[];
}

export const FreightComparisonModal: React.FC<FreightComparisonModalProps> = ({
  isOpen,
  onClose,
  comparison,
  comparisonType,
  comparisonTargetA,
  comparisonTargetB,
  onTypeChange,
  onTargetAChange,
  onTargetBChange,
  rates,
  regions
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-white tracking-tight">
                Freight Market Intelligence Benchmark Comparison
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Side-by-side normalized operational metrics, rate spreads, and commercial liquidity analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Comparison Mode Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'route', label: 'Route vs Route', icon: TrendingUp },
              { id: 'region', label: 'Region vs Region', icon: Globe },
              { id: 'spot_vs_ffa', label: 'Physical Spot vs Paper FFA', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = comparisonType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTypeChange(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Entity Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1.5">
                Benchmark Entity A
              </label>
              {comparisonType === 'route' || comparisonType === 'spot_vs_ffa' ? (
                <select
                  value={comparisonTargetA}
                  onChange={(e) => onTargetAChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {rates.map((r) => (
                    <option key={r.route_code} value={r.route_code}>
                      {r.route_code}: {r.route_name} (${r.rate_value})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={comparisonTargetA}
                  onChange={(e) => onTargetAChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {regions.map((reg) => (
                    <option key={reg.region_id} value={reg.region_id}>
                      {reg.region_name} ({reg.share_pct}% share)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1.5">
                Benchmark Entity B
              </label>
              {comparisonType === 'route' ? (
                <select
                  value={comparisonTargetB}
                  onChange={(e) => onTargetBChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {rates.map((r) => (
                    <option key={r.route_code} value={r.route_code}>
                      {r.route_code}: {r.route_name} (${r.rate_value})
                    </option>
                  ))}
                </select>
              ) : comparisonType === 'spot_vs_ffa' ? (
                <div className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2.5">
                  Forward Curve Derivative Benchmark (Prompt M0)
                </div>
              ) : (
                <select
                  value={comparisonTargetB}
                  onChange={(e) => onTargetBChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {regions.map((reg) => (
                    <option key={reg.region_id} value={reg.region_id}>
                      {reg.region_name} ({reg.share_pct}% share)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Comparison Results Table */}
          {comparison ? (
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Metric Dimension</th>
                    <th className="py-3 px-4 text-right">{comparison.entity_a_label}</th>
                    <th className="py-3 px-4 text-right">{comparison.entity_b_label}</th>
                    <th className="py-3 px-4 text-right">Variance / Delta</th>
                    <th className="py-3 px-4 text-center">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {comparison.metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {m.name} {m.unit && <span className="text-[10px] text-slate-400">({m.unit})</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {m.value_a.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-300">
                        {m.value_b.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        m.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {m.delta >= 0 ? `+${m.delta.toLocaleString()}` : m.delta.toLocaleString()}
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({m.delta_pct >= 0 ? `+${m.delta_pct}%` : `${m.delta_pct}%`})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.advantage === 'entity_a'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : m.advantage === 'entity_b'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {m.advantage === 'entity_a' ? 'Entity A' : m.advantage === 'entity_b' ? 'Entity B' : 'Par'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Calculating analytical comparison metrics...
            </div>
          )}

          {/* Analytical Commentary */}
          {comparison && comparison.analytical_commentary.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Info size={14} className="text-cyan-400" />
                Analytical Commentary & Commercial Implications
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {comparison.analytical_commentary.map((comm, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{comm}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Benchmarked against Baltic Exchange standard fixture parameters</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
