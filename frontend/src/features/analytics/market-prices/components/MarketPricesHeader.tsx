import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Star,
  RefreshCw,
  GitCompare,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileCode,
  Radio,
  Zap,
} from 'lucide-react';
import type { MaritimeRouteSpec, DataFreshnessStatus } from '../../../../types/market-prices';

interface MarketPricesHeaderProps {
  routes: MaritimeRouteSpec[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  recentRouteCodes: string[];
  favoriteRouteCodes: string[];
  onToggleFavorite: (code: string) => void;
  freshnessStatus: DataFreshnessStatus;
  lastUpdated: string;
  isLive: boolean;
  onToggleLive: (live: boolean) => void;
  onRefresh: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  onExportSpotCsv: () => void;
  onExportFfaCsv: () => void;
  onExportCurveCsv: () => void;
  onExportHistoryCsv: () => void;
  onExportReportJson: () => void;
  isLoading?: boolean;
}

export const MarketPricesHeader: React.FC<MarketPricesHeaderProps> = ({
  routes,
  selectedRouteCode,
  onSelectRoute,
  recentRouteCodes,
  favoriteRouteCodes,
  onToggleFavorite,
  freshnessStatus,
  lastUpdated,
  isLive,
  onToggleLive,
  onRefresh,
  compareCount,
  onOpenCompare,
  onExportSpotCsv,
  onExportFfaCsv,
  onExportCurveCsv,
  onExportHistoryCsv,
  onExportReportJson,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const activeRoute = routes.find((r) => r.routeCode === selectedRouteCode) || routes[0];
  const isFavorite = favoriteRouteCodes.includes(selectedRouteCode);

  const filteredRoutes = routes.filter(
    (r) =>
      r.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vesselClass.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Top Bar: Title, Live/Simulated Toggle, Refresh, Compare, Export */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  MARKET PRICES v2
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  MODULE 23
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SPOT + FFA UNIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Spot freight rates, forward FFA expectations and historical market intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                freshnessStatus === 'LIVE_SIGNAL_API'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            ></span>
            <span className="font-mono text-slate-300">
              {freshnessStatus === 'LIVE_SIGNAL_API' ? 'LIVE SIGNAL API' : 'CANONICAL BENCHMARK'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">{lastUpdated}</span>
          </div>

          {/* Live / Demo Mode Toggle */}
          <button
            onClick={() => onToggleLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isLive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Live API vs Canonical Benchmark Simulation"
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-spin' : ''}`} />
            <span>{isLive ? 'LIVE STREAM' : 'SIMULATED'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
            title="Refresh market feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Compare Modal Button */}
          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-medium transition"
          >
            <GitCompare className="w-3.5 h-3.5 text-blue-400" />
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-mono">
                {compareCount}
              </span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isExportOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs text-slate-300 animate-fade-in"
                onMouseLeave={() => setIsExportOpen(false)}
              >
                <button
                  onClick={() => {
                    onExportSpotCsv();
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export Spot Prices (CSV)</span>
                </button>
                <button
                  onClick={() => {
                    onExportFfaCsv();
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  <span>Export FFA Contracts (CSV)</span>
                </button>
                <button
                  onClick={() => {
                    onExportCurveCsv();
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  <span>Export Forward Curve (CSV)</span>
                </button>
                <button
                  onClick={() => {
                    onExportHistoryCsv();
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Export Historical Series (CSV)</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    onExportReportJson();
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                >
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>Full Market Report (JSON)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Route Search, Autocomplete & Quick Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3">
        {/* Route Selector with Autocomplete */}
        <div className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search by route code (TD3C, C5), class, or ports..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-24 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-mono"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">
                {activeRoute.routeCode}
              </span>
              <button
                onClick={() => onToggleFavorite(selectedRouteCode)}
                className="p-1 text-slate-400 hover:text-amber-400 transition"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isFavorite ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div
              className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 divide-y divide-slate-800/60"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              {filteredRoutes.map((r) => (
                <button
                  key={r.routeCode}
                  onClick={() => {
                    onSelectRoute(r.routeCode);
                    setIsDropdownOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                    r.routeCode === selectedRouteCode
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">
                        {r.routeCode}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-950 rounded text-slate-400 border border-slate-800 font-semibold">
                        {r.vesselClass}
                      </span>
                      <span className="text-[10px] text-slate-500">{r.marketSegment}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                      {r.routeName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {r.distanceNm.toLocaleString()} NM
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Route Switcher Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Recents:
          </span>
          {recentRouteCodes.map((code) => {
            const isSelected = code === selectedRouteCode;
            return (
              <button
                key={code}
                onClick={() => onSelectRoute(code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
