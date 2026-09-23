/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Market Summary KPI Strip
 */

import React from 'react';
import {
  Ship,
  TrendingUp,
  Anchor,
  Clock,
  Activity,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { FreightMarketSummary, VesselSupplyBreakdown } from '../../../../types/freight-analytics';

interface FreightMarketSummaryStripProps {
  summary?: FreightMarketSummary;
  supply?: VesselSupplyBreakdown;
  isLoading: boolean;
}

export const FreightMarketSummaryStrip: React.FC<FreightMarketSummaryStripProps> = ({
  summary,
  supply,
  isLoading
}) => {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 p-4 lg:px-6 bg-slate-950/60 border-b border-slate-800/80 animate-pulse">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 h-24" />
        ))}
      </div>
    );
  }

  const formatDwt = (dwt: number) => {
    if (dwt >= 1_000_000_000) return `${(dwt / 1_000_000_000).toFixed(1)}B DWT`;
    if (dwt >= 1_000_000) return `${(dwt / 1_000_000).toFixed(1)}M DWT`;
    return `${dwt.toLocaleString()} DWT`;
  };

  const cards = [
    {
      id: 'vessel-supply',
      title: 'Commercial Supply',
      value: (supply?.total_vessels ?? summary.total_vessels_tracked).toLocaleString(),
      subValue: formatDwt(supply?.total_dwt_mt ?? summary.active_commercial_supply_dwt),
      badge: '+1.8% 30d',
      isPositive: true,
      icon: Ship,
      color: 'text-cyan-400'
    },
    {
      id: 'freight-rate',
      title: 'Benchmark Rate',
      value: `$${summary.benchmark_freight_rate_usd.toLocaleString()}`,
      subValue: 'Baltic Weighted Avg',
      badge: `${summary.rate_change_pct >= 0 ? '+' : ''}${summary.rate_change_pct}% 1d`,
      isPositive: summary.rate_change_pct >= 0,
      icon: TrendingUp,
      color: 'text-emerald-400'
    },
    {
      id: 'ffa-spread',
      title: 'Spot vs FFA Spread',
      value: `${summary.ffa_spot_spread_usd >= 0 ? '+$' : '-$'}${Math.abs(summary.ffa_spot_spread_usd).toLocaleString()}`,
      subValue: summary.market_sentiment.toUpperCase(),
      badge: summary.market_sentiment === 'contango' ? 'Contango' : 'Backwardation',
      isPositive: summary.market_sentiment === 'contango',
      icon: Activity,
      color: 'text-amber-400'
    },
    {
      id: 'congestion-index',
      title: 'Congestion Index',
      value: `${summary.global_congestion_index_pct}%`,
      subValue: `${(supply?.waiting_anchorage_count ?? 148).toLocaleString()} at anchor`,
      badge: 'Elevated',
      isPositive: false,
      icon: Anchor,
      color: 'text-rose-400'
    },
    {
      id: 'waiting-time',
      title: 'Anchorage Wait',
      value: `${summary.avg_anchorage_wait_hours} hrs`,
      subValue: 'Median dwell time',
      badge: `${summary.wait_change_hours >= 0 ? '+' : ''}${summary.wait_change_hours}h 7d`,
      isPositive: summary.wait_change_hours <= 0,
      icon: Clock,
      color: 'text-blue-400'
    },
    {
      id: 'fleet-utilization',
      title: 'Fleet Utilization',
      value: `${supply?.supply_utilization_pct ?? 82.4}%`,
      subValue: 'Commercial operating',
      badge: 'Tight',
      isPositive: true,
      icon: Compass,
      color: 'text-indigo-400'
    },
    {
      id: 'ton-mile',
      title: 'Chokepoint Demand',
      value: '+28.4%',
      subValue: 'Ton-Mile Cape expansion',
      badge: 'Suez Rerouting',
      isPositive: true,
      icon: AlertTriangle,
      color: 'text-purple-400'
    },
    {
      id: 'market-sentiment',
      title: 'Market Structure',
      value: summary.market_sentiment === 'contango' ? 'Contango' : summary.market_sentiment === 'backwardation' ? 'Backwardation' : 'Balanced',
      subValue: 'Paper Curve Bias',
      badge: 'Bullish Bias',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-teal-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 p-4 lg:px-6 bg-slate-950/60 border-b border-slate-800/80">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-lg p-3 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium tracking-wide uppercase truncate">
                {card.title}
              </span>
              <Icon size={14} className={card.color} />
            </div>

            <div className="my-1.5">
              <div className="text-base lg:text-lg font-bold text-white tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {card.subValue}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              {card.isPositive ? (
                <span className="text-emerald-400 flex items-center font-medium">
                  <ArrowUpRight size={11} />
                  {card.badge}
                </span>
              ) : (
                <span className="text-rose-400 flex items-center font-medium">
                  <ArrowDownRight size={11} />
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
