import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Activity,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import type {
  SpotPriceRecord,
  RouteForwardCurve,
  RouteVolatilityMetrics,
} from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface MarketPricesKpiBarProps {
  spot: SpotPriceRecord;
  curve: RouteForwardCurve;
  volatility: RouteVolatilityMetrics;
}

export const MarketPricesKpiBar: React.FC<MarketPricesKpiBarProps> = ({
  spot,
  curve,
  volatility,
}) => {
  const isSpot1dUp = spot.change1dPct >= 0;
  const isSpot7dUp = spot.change7dPct >= 0;
  const isSpot30dUp = spot.change30dPct >= 0;
  const isContango = curve.curveStructure === 'Contango';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      {/* 1. Current Spot Rate */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>SPOT RATE</span>
          <Zap className="w-3 h-3 text-amber-400" />
        </div>
        <div className="my-1.5">
          <div className="text-base font-mono font-bold text-white group-hover:text-blue-400 transition">
            {formatFreightRate(spot.rateTceUsdPerDay, spot.rateUnit)}
          </div>
          <div
            className={`flex items-center gap-1 text-[11px] font-mono font-semibold ${
              isSpot1dUp ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isSpot1dUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {isSpot1dUp ? '+' : ''}
              {spot.change1dPct}% 1D
            </span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 truncate">
          {spot.routeCode} • {spot.vesselClass}
        </div>
      </div>

      {/* 2. Front-Month FFA */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>FRONT FFA</span>
          <Calendar className="w-3 h-3 text-blue-400" />
        </div>
        <div className="my-1.5">
          <div className="text-base font-mono font-bold text-white group-hover:text-blue-400 transition">
            {formatFreightRate(curve.frontMonthFfaUsdPerDay, '$/day')}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Prompt Maturity
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Mid Settlement Quote
        </div>
      </div>

      {/* 3. Spot vs FFA Spread */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>SPOT / FFA SPREAD</span>
          <Scale className="w-3 h-3 text-purple-400" />
        </div>
        <div className="my-1.5">
          <div
            className={`text-base font-mono font-bold ${
              curve.spotVsFfaSpreadUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {curve.spotVsFfaSpreadUsd >= 0 ? '+' : ''}
            ${Math.round(curve.spotVsFfaSpreadUsd).toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {curve.spotVsFfaSpreadPct >= 0 ? '+' : ''}
            {curve.spotVsFfaSpreadPct}%
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Spot - Front Month
        </div>
      </div>

      {/* 4. Curve Structure State */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>CURVE STRUCTURE</span>
          <Layers className="w-3 h-3 text-cyan-400" />
        </div>
        <div className="my-1.5">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isContango
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : curve.curveStructure === 'Backwardation'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}
          >
            {curve.curveStructure}
          </span>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Slope: {curve.curveSlopeAnnualizedPct >= 0 ? '+' : ''}
            {curve.curveSlopeAnnualizedPct}%
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          {isContango ? 'Forward Premium' : 'Prompt Premium'}
        </div>
      </div>

      {/* 5. 7-Day Spot Movement */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>7-DAY TREND</span>
          {isSpot7dUp ? (
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-rose-400" />
          )}
        </div>
        <div className="my-1.5">
          <div
            className={`text-base font-mono font-bold ${
              isSpot7dUp ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isSpot7dUp ? '+' : ''}
            {spot.change7dPct}%
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Weekly Delta
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Rolling 7D Basis
        </div>
      </div>

      {/* 6. 30-Day Momentum */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>30-DAY MOVE</span>
          {isSpot30dUp ? (
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-rose-400" />
          )}
        </div>
        <div className="my-1.5">
          <div
            className={`text-base font-mono font-bold ${
              isSpot30dUp ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isSpot30dUp ? '+' : ''}
            {spot.change30dPct}%
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Monthly Delta
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Monthly Momentum
        </div>
      </div>

      {/* 7. 30D Rolling Volatility */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>VOLATILITY (30D)</span>
          <Activity className="w-3 h-3 text-amber-400" />
        </div>
        <div className="my-1.5">
          <div className="text-base font-mono font-bold text-amber-400">
            {volatility.volatility30dPct}%
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            StdDev: ${volatility.standardDeviation30d.toLocaleString()}
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Historical Volatility
        </div>
      </div>

      {/* 8. 52-Week Range */}
      <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span>52-WEEK RANGE</span>
          <TrendingUp className="w-3 h-3 text-slate-400" />
        </div>
        <div className="my-1.5">
          <div className="text-xs font-mono font-bold text-slate-200">
            H: ${Math.round(spot.high52wUsd / 1000)}k
          </div>
          <div className="text-xs font-mono text-slate-400">
            L: ${Math.round(spot.low52wUsd / 1000)}k
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  5,
                  ((spot.rateTceUsdPerDay - spot.low52wUsd) /
                    (spot.high52wUsd - spot.low52wUsd || 1)) *
                    100
                )
              )}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
