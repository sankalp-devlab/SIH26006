/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Summary Strip (5 Pillars of Commercial Intelligence)
 */

import React from 'react';
import {
  Ship,
  Package,
  DollarSign,
  Anchor,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import type {
  MarketSupplyMetrics,
  MarketDemandMetrics,
  MarketCongestionMetrics,
  MarketVesselAvailabilityMetrics,
  RouteFreightDetails
} from '../../../../types/market-insights';

interface MarketSummaryStripProps {
  supply?: MarketSupplyMetrics;
  demand?: MarketDemandMetrics;
  freight?: RouteFreightDetails | null;
  congestion?: MarketCongestionMetrics;
  availability?: MarketVesselAvailabilityMetrics;
  isLoading: boolean;
}

export const MarketSummaryStrip: React.FC<MarketSummaryStripProps> = ({
  supply,
  demand,
  freight,
  congestion,
  availability,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 p-4 lg:px-6 bg-slate-950">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse p-4" />
        ))}
      </div>
    );
  }

  const renderDelta = (delta: number, suffix = '%') => {
    if (delta > 0) {
      return (
        <span className="flex items-center text-xs font-semibold text-emerald-400">
          <ArrowUpRight size={14} /> +{delta}{suffix}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="flex items-center text-xs font-semibold text-rose-400">
          <ArrowDownRight size={14} /> {delta}{suffix}
        </span>
      );
    }
    return (
      <span className="flex items-center text-xs font-semibold text-slate-400">
        <Minus size={14} /> 0.0{suffix}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 p-4 lg:px-6 bg-slate-950 border-b border-slate-800/80">
      {/* 1. Supply Pillar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Fleet Supply</span>
          <Ship size={16} className="text-cyan-400" />
        </div>
        <div className="my-1">
          <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {supply ? supply.total_fleet_vessels.toLocaleString() : '12,450'}
            <span className="text-xs font-normal text-slate-400 ml-1">vessels</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {supply ? `${Math.round(supply.total_fleet_dwt / 1000000)}M MT DWT (${supply.fleet_utilization_pct}% Utilized)` : '880M MT DWT'}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
          <span className="text-slate-500">Supply Growth</span>
          {renderDelta(supply?.supply_change_pct ?? 1.85)}
        </div>
      </div>

      {/* 2. Demand Pillar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Cargo Demand</span>
          <Package size={16} className="text-emerald-400" />
        </div>
        <div className="my-1">
          <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {demand ? `${(demand.total_cargo_demand_mt / 1000000).toFixed(1)}M` : '48.5M'}
            <span className="text-xs font-normal text-slate-400 ml-1">MT</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {demand ? `${demand.reported_fixtures_count} fixtures (${demand.ton_mile_demand_billion_nm}B Ton-NM)` : '342 fixtures'}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
          <span className="text-slate-500">Demand Change</span>
          {renderDelta(demand?.demand_change_pct ?? 6.4)}
        </div>
      </div>

      {/* 3. Freight Pillar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Freight Benchmark</span>
          <DollarSign size={16} className="text-amber-400" />
        </div>
        <div className="my-1">
          <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            ${freight ? freight.current_rate.toLocaleString() : '24.80'}
            <span className="text-xs font-normal text-slate-400 ml-1">
              {freight ? freight.benchmark_unit : '$/MT'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {freight ? `${freight.route_code} Corridor Rate` : 'Corridor Benchmark'}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
          <span className="text-slate-500">1D / 30D Delta</span>
          <div className="flex items-center gap-1">
            {renderDelta(freight?.change_1d_pct ?? 2.12)}
          </div>
        </div>
      </div>

      {/* 4. Congestion Pillar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Port Congestion</span>
          <Anchor size={16} className="text-rose-400" />
        </div>
        <div className="my-1">
          <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {congestion ? `${congestion.avg_waiting_time_hours}h` : '65.8h'}
            <span className="text-xs font-normal text-slate-400 ml-1">avg wait</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {congestion ? `${congestion.waiting_vessels_count} vessels waiting at anchor` : '231 vessels in queue'}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
          <span className="text-slate-500">Congestion Index</span>
          <span className="font-semibold text-rose-400">
            {congestion ? `${congestion.global_congestion_index_pct}%` : '63%'}
          </span>
        </div>
      </div>

      {/* 5. Vessel Availability Pillar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Vessel Availability</span>
          <Compass size={16} className="text-indigo-400" />
        </div>
        <div className="my-1">
          <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {availability ? availability.open_prompt : 312}
            <span className="text-xs font-normal text-slate-400 ml-1">prompt open</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {availability ? `+${availability.open_next_10d} open next 10 days` : '+584 open next 10 days'}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
          <span className="text-slate-500">Availability Trend</span>
          <span className={`font-semibold capitalize ${
            availability?.availability_trend === 'tightening' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {availability?.availability_trend ?? 'tightening'}
          </span>
        </div>
      </div>
    </div>
  );
};
