import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  Clock,
  Tag
} from 'lucide-react';
import type { MarketSignal } from '../../../../types/valuations';

interface MarketSignalsFeedProps {
  signals: MarketSignal[];
  vesselName: string;
}

export const MarketSignalsFeed: React.FC<MarketSignalsFeedProps> = ({
  signals,
  vesselName,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredSignals = useMemo(() => {
    return signals.filter((sig) => {
      const matchSeverity = severityFilter === 'ALL' || sig.severity === severityFilter;
      const matchCategory = categoryFilter === 'ALL' || sig.category === categoryFilter;
      return matchSeverity && matchCategory;
    });
  }, [signals, severityFilter, categoryFilter]);

  const highSeverityCount = useMemo(
    () => signals.filter((s) => s.severity === 'HIGH').length,
    [signals]
  );

  const getSeverityBadge = (sev: MarketSignal['severity']) => {
    switch (sev) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            HIGH PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Info className="w-3 h-3" />
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Market & Asset Signals</h3>
            <p className="text-xs text-slate-400">
              Active anomaly detections, liquidity triggers, and commercial indicators for {vesselName}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2">
          {highSeverityCount > 0 && (
            <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-md text-xs font-mono font-semibold text-rose-400">
              {highSeverityCount} HIGH ALERT{highSeverityCount > 1 ? 'S' : ''}
            </span>
          )}
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-slate-400">
            {signals.length} ACTIVE SIGNALS
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Severity:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                severityFilter === sev
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Domain:</span>
          {(['ALL', 'valuation', 'market', 'demolition', 'depreciation'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-1 rounded-md capitalize transition font-medium ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-3 mt-3">
        {filteredSignals.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No signals match current filters</p>
            <p className="text-xs text-slate-500 mt-1">Adjust severity or category filters to view alerts</p>
          </div>
        ) : (
          filteredSignals.map((sig) => (
            <div
              key={sig.id}
              className="bg-slate-950/60 hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {getSeverityBadge(sig.severity)}
                  <span className="text-xs font-bold text-white tracking-wide">
                    {sig.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span className="capitalize">{sig.category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{sig.timestamp}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1">
                {sig.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
