/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Floating Storage Executive Summary KPI Strip
 */

import {
  Ship,
  Droplets,
  DollarSign,
  Clock,
  Compass,
} from 'lucide-react';
import type { FloatingStorageSummaryKPIs } from '../../../../types/floating-storage';

interface FloatingStorageSummaryStripProps {
  summary: FloatingStorageSummaryKPIs;
}

export function FloatingStorageSummaryStrip({ summary }: FloatingStorageSummaryStripProps) {
  const formatBbl = (val: number): string => {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}M bbl`;
    }
    return `${(val / 1_000).toFixed(0)}k bbl`;
  };

  const formatMt = (val: number): string => {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(2)}M MT`;
    }
    return `${(val / 1_000).toFixed(0)}k MT`;
  };

  const formatUsd = (val: number): string => {
    if (val >= 1_000_000_000) {
      return `$${(val / 1_000_000_000).toFixed(2)}B`;
    }
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(1)}M`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Card 1: Tracked Storage Vessels */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Storage Vessels</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Ship size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {summary.totalVessels}
            <span className="text-xs font-normal text-slate-400 ml-1.5">vessels</span>
          </div>
          <div className="text-xs text-amber-400/90 mt-1 flex items-center gap-1 font-medium">
            <span>Across {summary.activeAnchorageHubsCount} strategic anchorages</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Stored Volume */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Immobilized Volume</span>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Droplets size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-sky-400 tracking-tight">
            {formatBbl(summary.totalVolumeBbl)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Weight:</span>
            <span className="text-slate-200 font-semibold">{formatMt(summary.totalVolumeMt)}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Cargo Valuation */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Cargo Valuation</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatUsd(summary.totalImmobilizedValueUsd)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Asset status:</span>
            <span className="text-emerald-300 font-medium">Floating buffer</span>
          </div>
        </div>
      </div>

      {/* Card 4: Stationary Duration */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Avg Stationary Time</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-purple-300 tracking-tight">
            {summary.averageStationaryDays}
            <span className="text-xs font-normal text-slate-400 ml-1.5">days</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Primary mode:</span>
            <span className="text-purple-300 font-medium">{summary.dominantCargoType}</span>
          </div>
        </div>
      </div>

      {/* Card 5: Top Storage Hub & Grade */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Top Hub / Grade</span>
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Compass size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-base font-bold text-slate-100 truncate" title={summary.topStorageRegion}>
            {summary.topStorageRegion.split('&')[0].trim()}
          </div>
          <div className="text-xs text-amber-400/90 mt-1 flex items-center justify-between truncate">
            <span className="text-slate-400">Dominant:</span>
            <span className="font-semibold text-amber-300 truncate">{summary.dominantCrudeGrade}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
