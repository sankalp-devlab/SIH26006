/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Insights Header & Intelligent Cascading Selectors
 */

import React from 'react';
import {
  LineChart,
  Ship,
  Sliders,
  RefreshCw,
  Download,
  RotateCcw,
  Star
} from 'lucide-react';
import type {
  MarketFilterState,
  MarketSector,
  MarketVesselClass,
  MarketTimeHorizon,
  MarketRoute
} from '../../../../types/market-insights';

interface MarketInsightsHeaderProps {
  filters: MarketFilterState;
  availableRoutes: MarketRoute[];
  hasActiveFilters: boolean;
  watchlistCount: number;
  isRefetching: boolean;
  onSelectSector: (sector: MarketSector | 'all') => void;
  onSelectVesselClass: (vesselClass: MarketVesselClass) => void;
  onSelectRoute: (routeCode: string) => void;
  onFilterChange: <K extends keyof MarketFilterState>(key: K, value: MarketFilterState[K]) => void;
  onResetFilters: () => void;
  onOpenComparison: () => void;
  onOpenWatchlist: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
}

export const MarketInsightsHeader: React.FC<MarketInsightsHeaderProps> = ({
  filters,
  availableRoutes,
  hasActiveFilters,
  watchlistCount,
  isRefetching,
  onSelectSector,
  onSelectVesselClass,
  onSelectRoute,
  onFilterChange,
  onResetFilters,
  onOpenComparison,
  onOpenWatchlist,
  onExportCsv,
  onRefresh
}) => {
  const timeHorizons: { id: MarketTimeHorizon; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '1Y' }
  ];

  // Dry Vessel Classes
  const dryClasses: MarketVesselClass[] = ['Capesize', 'Panamax', 'Supramax', 'Handysize'];
  // Tanker Vessel Classes
  const tankerClasses: MarketVesselClass[] = ['VLCC', 'Aframax', 'MR'];

  const displayedClasses = filters.sector === 'dry'
    ? dryClasses
    : filters.sector === 'tanker'
    ? tankerClasses
    : [...dryClasses, ...tankerClasses];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 lg:px-6 py-4 space-y-4">
      {/* Top Banner: Module Identification, Status & Core Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MODULE 5
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Market & Route Analytics
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LineChart size={24} className="text-cyan-400" />
            Market Insights Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated market-specific commercial intelligence for Dry Bulk & Tankers: Supply, Demand, Freight, Congestion, and Corridor Signals.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Watchlist Toggle */}
          <button
            onClick={onOpenWatchlist}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Open Watchlist"
          >
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span>Watchlist</span>
            {watchlistCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Comparison Modal Trigger */}
          <button
            onClick={onOpenComparison}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Side-by-Side Comparison"
          >
            <Sliders size={14} className="text-cyan-400" />
            <span>Compare</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            title="Export CSV Dataset"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefetching}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw size={14} className={isRefetching ? 'animate-spin text-emerald-400' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              title="Reset Filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Cascading Filter Controls: Sector -> Vessel Class -> Route -> Time Horizon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80">
        {/* 1. Market Sector (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Ship size={12} className="text-cyan-400" />
            Market Sector
          </label>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['all', 'dry', 'tanker'] as const).map((sec) => {
              const active = filters.sector === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onSelectSector(sec)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all capitalize ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sec === 'all' ? 'All Sectors' : sec === 'dry' ? 'Dry Bulk' : 'Tanker'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Vessel Class (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Vessel Class
          </label>
          <select
            value={filters.vesselClass}
            onChange={(e) => onSelectVesselClass(e.target.value as MarketVesselClass)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Vessel Classes</option>
            {displayedClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Structured Route (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Benchmark Corridor / Route
          </label>
          <select
            value={filters.routeCode}
            onChange={(e) => onSelectRoute(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Corridors ({availableRoutes.length})</option>
            {availableRoutes.map((r) => (
              <option key={r.route_code} value={r.route_code}>
                {r.route_code} — {r.route_name.split('(')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Time Horizon (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Observation Period
          </label>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {timeHorizons.map((h) => {
              const active = filters.timeHorizon === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onFilterChange('timeHorizon', h.id)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded transition-all ${
                    active
                      ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
