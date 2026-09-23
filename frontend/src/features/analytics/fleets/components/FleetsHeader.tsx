/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleets Header & Enterprise Cascading Filter Bar
 */

import type { FC, ReactNode } from 'react';
import {
  Ship,
  Search,
  RotateCcw,
  RefreshCw,
  Download,
  Layers,
  MapPin,
  Globe2,
  BarChart3,
  GitCompare,
  Activity,
} from 'lucide-react';
import type {
  FleetFiltersState,
  FleetsTab,
  FleetVesselClass,
  FleetCargoCategory,
  FleetDeploymentStatus,
  FleetOwnerEntity,
  FleetOperatorEntity,
} from '../../../../types/fleets';

interface FleetsHeaderProps {
  activeTab: FleetsTab;
  onTabChange: (tab: FleetsTab) => void;
  filters: FleetFiltersState;
  onSearchChange: (search: string) => void;
  onOwnerChange: (ownerId: string | 'all') => void;
  onOperatorChange: (operatorId: string | 'all') => void;
  onVesselClassChange: (vesselClass: FleetVesselClass | 'all') => void;
  onCargoCategoryChange: (cargoCategory: FleetCargoCategory | 'all') => void;
  onRegionChange: (region: string | 'all') => void;
  onCountryChange: (country: string | 'all') => void;
  onStatusChange: (status: FleetDeploymentStatus | 'all') => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  ownersList: FleetOwnerEntity[];
  operatorsList: FleetOperatorEntity[];
  availableRegions: string[];
  availableCountries: string[];
  totalFilteredCount: number;
  totalFleetCount: number;
  isLoading: boolean;
}

const TABS: { id: FleetsTab; label: string; icon: ReactNode }[] = [
  { id: 'overview', label: 'Fleet Overview', icon: <Layers size={15} /> },
  { id: 'deployment', label: 'Geographic Deployment', icon: <MapPin size={15} /> },
  { id: 'composition', label: 'Fleet Composition', icon: <BarChart3 size={15} /> },
  { id: 'regional', label: 'Regional Comparison', icon: <Globe2 size={15} /> },
  { id: 'benchmarking', label: 'Fleet Benchmarking', icon: <GitCompare size={15} /> },
];

const VESSEL_CLASSES: FleetVesselClass[] = [
  'Capesize',
  'Panamax',
  'Supramax',
  'Handysize',
  'VLCC',
  'Suezmax',
  'Aframax',
  'MR Product Tanker',
  'LNG Carrier',
  'VLGC LPG Carrier',
];

const CARGO_CATEGORIES: FleetCargoCategory[] = [
  'Dry Bulk',
  'Crude Oil',
  'Clean Petroleum Products',
  'LNG Gas',
  'LPG Gas',
  'Chemicals',
];

const STATUS_OPTIONS: { id: FleetDeploymentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'underway', label: 'Underway' },
  { id: 'anchored', label: 'Anchored' },
  { id: 'loading', label: 'Loading' },
  { id: 'discharging', label: 'Discharging' },
  { id: 'in_repair', label: 'In Repair' },
];

export const FleetsHeader: FC<FleetsHeaderProps> = ({
  activeTab,
  onTabChange,
  filters,
  onSearchChange,
  onOwnerChange,
  onOperatorChange,
  onVesselClassChange,
  onCargoCategoryChange,
  onRegionChange,
  onCountryChange,
  onStatusChange,
  onResetFilters,
  onRefresh,
  onExportCsv,
  ownersList,
  operatorsList,
  availableRegions,
  availableCountries,
  totalFilteredCount,
  totalFleetCount,
  isLoading,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.ownerId !== 'all' ||
    filters.operatorId !== 'all' ||
    filters.vesselClass !== 'all' ||
    filters.cargoCategory !== 'all' ||
    filters.region !== 'all' ||
    filters.country !== 'all' ||
    filters.deploymentStatus !== 'all';

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-slate-100 backdrop-blur-md sticky top-0 z-30 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Ship className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Fleet Intelligence & Deployment
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  MODULE 19
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Activity size={12} className="animate-pulse" />
                  Live Fleet Radar
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive asset ownership, commercial operator pools, geographic deployment & comparative benchmarking
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
              title="Refresh Fleet Dataset"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition hover:text-white"
              title="Export Filtered Fleets as CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition"
                title="Reset All Filters"
              >
                <RotateCcw size={13} />
                <span>Reset ({totalFilteredCount}/{totalFleetCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 mt-4 overflow-x-auto scrollbar-none border-b border-slate-800/80">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* 1. Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vessel, IMO, port..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* 2. Beneficial Owner */}
          <div className="relative">
            <select
              value={filters.ownerId}
              onChange={(e) => onOwnerChange(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition truncate"
              title="Filter by Registered Asset Owner"
            >
              <option value="all">All Owners ({ownersList.length})</option>
              {ownersList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Commercial Operator */}
          <div className="relative">
            <select
              value={filters.operatorId}
              onChange={(e) => onOperatorChange(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition truncate"
              title="Filter by Commercial Operator / Charterer"
            >
              <option value="all">All Operators ({operatorsList.length})</option>
              {operatorsList.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Vessel Class */}
          <div className="relative">
            <select
              value={filters.vesselClass}
              onChange={(e) => onVesselClassChange(e.target.value as FleetVesselClass | 'all')}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition truncate"
            >
              <option value="all">All Classes</option>
              {VESSEL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Cargo Category */}
          <div className="relative">
            <select
              value={filters.cargoCategory}
              onChange={(e) => onCargoCategoryChange(e.target.value as FleetCargoCategory | 'all')}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition truncate"
            >
              <option value="all">All Cargoes</option>
              {CARGO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Region */}
          <div className="relative">
            <select
              value={filters.region}
              onChange={(e) => onRegionChange(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition truncate"
            >
              <option value="all">All Regions ({availableRegions.length})</option>
              {availableRegions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Country */}
          <div className="relative">
            <select
              value={filters.country}
              onChange={(e) => onCountryChange(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition truncate"
            >
              <option value="all">All Countries ({availableCountries.length})</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 8. Status */}
          <div className="relative">
            <select
              value={filters.deploymentStatus}
              onChange={(e) => onStatusChange(e.target.value as FleetDeploymentStatus | 'all')}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition truncate"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
