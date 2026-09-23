/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleets Executive Summary KPI Strip
 */

import type { FC } from 'react';
import {
  Ship,
  Building2,
  Navigation,
  Clock,
  Globe2,
} from 'lucide-react';
import type { FleetSummaryKPIs } from '../../../../types/fleets';

interface FleetsSummaryStripProps {
  summary: FleetSummaryKPIs;
  totalFleetCount: number;
}

export const FleetsSummaryStrip: FC<FleetsSummaryStripProps> = ({
  summary,
  totalFleetCount,
}) => {
  const dwtFormatted = (summary.totalDwt / 1_000_000).toFixed(2);
  const filterCoveragePct = Math.round((summary.totalVessels / (totalFleetCount || 1)) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/80">
      {/* 1. Fleet Sizing & DWT */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Monitored Fleet</span>
          <Ship size={16} className="text-blue-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {summary.totalVessels}
          </span>
          <span className="text-xs text-slate-400">vessels</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs border-t border-slate-800/60 pt-1.5">
          <span className="text-slate-400">Total DWT:</span>
          <span className="font-semibold text-blue-400">{dwtFormatted}M DWT</span>
        </div>
      </div>

      {/* 2. Commercial Entities */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Commercial Entities</span>
          <Building2 size={16} className="text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {summary.activeOwnersCount}
          </span>
          <span className="text-xs text-slate-400">Owners / {summary.activeOperatorsCount} Pools</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs border-t border-slate-800/60 pt-1.5">
          <span className="text-slate-400">Structure:</span>
          <span className="font-semibold text-purple-300">Owner ≠ Operator</span>
        </div>
      </div>

      {/* 3. Operational Deployment */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Active Underway</span>
          <Navigation size={16} className="text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">
            {summary.underwayPct}%
          </span>
          <span className="text-xs text-slate-400">at sea</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs border-t border-slate-800/60 pt-1.5">
          <span className="text-slate-400">Stationary/Port:</span>
          <span className="font-semibold text-amber-400">
            {(100 - summary.underwayPct).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 4. Fleet Age Profile */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Fleet Age & Class</span>
          <Clock size={16} className="text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {summary.avgFleetAgeYears}
          </span>
          <span className="text-xs text-slate-400">yrs avg age</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs border-t border-slate-800/60 pt-1.5">
          <span className="text-slate-400">Dominant Class:</span>
          <span className="font-semibold text-amber-300 truncate max-w-[120px]">
            {summary.dominantVesselClass}
          </span>
        </div>
      </div>

      {/* 5. Geographic Scope */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Global Reach</span>
          <Globe2 size={16} className="text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {summary.monitoredRegionsCount}
          </span>
          <span className="text-xs text-slate-400">Oceanic Basins</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs border-t border-slate-800/60 pt-1.5">
          <span className="text-slate-400">Filter Scope:</span>
          <span className="font-semibold text-cyan-300">{filterCoveragePct}% of fleet</span>
        </div>
      </div>
    </div>
  );
};
