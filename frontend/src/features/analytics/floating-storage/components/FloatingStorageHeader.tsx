/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Floating Storage Header & Multi-Dimensional Filter Bar
 */

import type { ReactNode } from 'react';
import {
  Anchor,
  Search,
  RotateCcw,
  RefreshCw,
  Download,
  Globe2,
  Clock,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import type {
  FloatingStorageFiltersState,
  FloatingStorageTab,
  FloatingStorageCargoType,
  CrudeGradeName,
  FloatingStorageRegion,
} from '../../../../types/floating-storage';
import type { FleetVesselClass } from '../../../../types/fleets';
import {
  CRUDE_GRADES_LIST,
  FLOATING_STORAGE_REGIONS_LIST,
} from '../../../../services/floating-storage/floating-storage.data';

interface FloatingStorageHeaderProps {
  activeTab: FloatingStorageTab;
  onTabChange: (tab: FloatingStorageTab) => void;
  filters: FloatingStorageFiltersState;
  onFilterChange: <K extends keyof FloatingStorageFiltersState>(
    key: K,
    value: FloatingStorageFiltersState[K]
  ) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  totalFilteredCount: number;
  totalVesselsCount: number;
  isLoading: boolean;
}

const TABS: { id: FloatingStorageTab; label: string; icon: ReactNode }[] = [
  { id: 'overview', label: 'Overview & Fleet Registry', icon: <Anchor size={15} /> },
  { id: 'map', label: 'Offshore Geospatial Map', icon: <Globe2 size={15} /> },
  { id: 'volume', label: 'Volume & Grades Analytics', icon: <TrendingUp size={15} /> },
  { id: 'regional', label: 'Regional Hub Matrix', icon: <MapPin size={15} /> },
  { id: 'historical', label: 'Historical Benchmarks', icon: <Clock size={15} /> },
];

const CARGO_OPTIONS: { value: FloatingStorageCargoType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Cargo Types' },
  { value: 'Crude Oil', label: 'Crude Oil' },
  { value: 'Clean Petroleum Products', label: 'Clean Petroleum Products (CPP)' },
  { value: 'Dirty Petroleum Products / Fuel Oil', label: 'Fuel Oil / Bunker Storage (DPP)' },
  { value: 'LNG Gas', label: 'LNG Gas' },
  { value: 'LPG Gas', label: 'LPG Gas' },
  { value: 'Chemicals', label: 'Chemicals / Specialty' },
];

const VESSEL_CLASSES: { value: FleetVesselClass | 'all'; label: string }[] = [
  { value: 'all', label: 'All Vessel Classes' },
  { value: 'VLCC', label: 'VLCC (200k - 320k DWT)' },
  { value: 'Suezmax', label: 'Suezmax (120k - 200k DWT)' },
  { value: 'Aframax', label: 'Aframax (80k - 120k DWT)' },
  { value: 'Panamax', label: 'Panamax (60k - 80k DWT)' },
  { value: 'Handysize', label: 'Handysize (< 60k DWT)' },
  { value: 'Capesize', label: 'Capesize (Bulk)' },
];

const STATIONARY_DAYS_OPTIONS = [
  { value: 0, label: 'Any Duration (≥ 0d)' },
  { value: 3, label: 'Stationary ≥ 3 Days' },
  { value: 7, label: 'Stationary ≥ 7 Days (Standard)' },
  { value: 14, label: 'Stationary ≥ 14 Days (Extended)' },
  { value: 30, label: 'Stationary ≥ 30 Days (Long-term)' },
];

export function FloatingStorageHeader({
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  onExportCsv,
  totalFilteredCount,
  totalVesselsCount,
  isLoading,
}: FloatingStorageHeaderProps) {
  const isCrudeSelected = filters.cargoType === 'Crude Oil' || filters.cargoType === 'all';

  return (
    <header className="space-y-4 pb-2 border-b border-slate-800">
      {/* Top Banner & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
              M20
            </span>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              Floating Storage Intelligence
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AIS TELEMETRY ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time offshore immobilized capacity surveillance, contango arbitrage monitoring, and lightering tracking across 7 global strategic hubs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">Tracked:</span>
            <span className="text-amber-400 font-bold">{totalFilteredCount}</span>
            <span className="text-slate-500">/ {totalVesselsCount} vessels</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50 cursor-pointer"
            title="Refresh AIS Observations"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-amber-400' : ''} />
            Sync
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/80 transition cursor-pointer"
            title="Export observation data to CSV"
          >
            <Download size={13} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Cascading Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 backdrop-blur-sm">
        {/* Search */}
        <div className="relative">
          <label htmlFor="fs-search-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Search Vessel / IMO
          </label>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="fs-search-input"
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Vessel, IMO, Hub..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Cargo Type Filter */}
        <div>
          <label htmlFor="fs-cargo-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Cargo Type
          </label>
          <select
            id="fs-cargo-select"
            value={filters.cargoType}
            onChange={(e) => onFilterChange('cargoType', e.target.value as FloatingStorageCargoType | 'all')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CARGO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Crude Grade Filter (Cascades with Cargo Type) */}
        <div>
          <label htmlFor="fs-grade-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Crude Benchmark Grade
          </label>
          <select
            id="fs-grade-select"
            value={filters.crudeGrade}
            disabled={!isCrudeSelected}
            onChange={(e) => onFilterChange('crudeGrade', e.target.value as CrudeGradeName | 'all')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="all">
              {isCrudeSelected ? 'All Crude Grades' : 'N/A (Non-Crude)'}
            </option>
            {CRUDE_GRADES_LIST.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label htmlFor="fs-region-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Offshore Hub Region
          </label>
          <select
            id="fs-region-select"
            value={filters.region}
            onChange={(e) => onFilterChange('region', e.target.value as FloatingStorageRegion | 'all')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All 7 Strategic Hubs</option>
            {FLOATING_STORAGE_REGIONS_LIST.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Stationary Days */}
        <div>
          <label htmlFor="fs-stationary-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Min Duration
          </label>
          <select
            id="fs-stationary-select"
            value={filters.minStationaryDays}
            onChange={(e) => onFilterChange('minStationaryDays', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {STATIONARY_DAYS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vessel Class */}
        <div>
          <label htmlFor="fs-class-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Vessel Class
          </label>
          <select
            id="fs-class-select"
            value={filters.vesselClass}
            onChange={(e) => onFilterChange('vesselClass', e.target.value as FleetVesselClass | 'all')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {VESSEL_CLASSES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Live vs Historical State */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Observation Mode
          </label>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => onFilterChange('dataState', 'live')}
              className={`flex-1 py-1 text-center rounded text-[11px] font-semibold transition cursor-pointer ${
                filters.dataState === 'live'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('dataState', 'historical')}
              className={`flex-1 py-1 text-center rounded text-[11px] font-semibold transition cursor-pointer ${
                filters.dataState === 'historical'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hist
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
