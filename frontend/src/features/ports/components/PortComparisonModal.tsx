/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Comparison Modal (Side-by-Side Analysis)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  GitCompare,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import type { Port } from '../../../types/port';
import type { PortInsightPayload, PortComparisonResult } from '../../../types/port-insights';

interface PortComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  ports: Port[];
  portA: PortInsightPayload;
  portB: PortInsightPayload;
  comparisonResult: PortComparisonResult;
  onSelectPortB: (portId: number) => void;
}

export const PortComparisonModal: React.FC<PortComparisonModalProps> = ({
  isOpen,
  onClose,
  ports,
  portA,
  portB,
  comparisonResult,
  onSelectPortB,
}) => {
  if (!isOpen) return null;

  const { delta, winner, comparisonNotes } = comparisonResult;

  const getPayloadSpecs = (p: PortInsightPayload) => p.physicalSpecs ?? {
    maxDraftMeters: Math.max(...p.terminals.map((t) => t.max_draft_m || 0), 18.0),
    maxLoaMeters: Math.max(...p.terminals.map((t) => t.max_loa_m || 0), 360),
    maxBeamMeters: 60,
    tidalRangeMeters: 3.5,
    waterDensity: 1.025,
    channelType: 'Deep-water approach channel',
    pilotageCompulsory: true,
    tugRequirement: true,
  };

  const getPayloadAnalytics = (p: PortInsightPayload) => p.analytics ?? {
    congestion: {
      severity: p.congestion.current_level,
      indexScore: p.congestion.congestion_index_pct,
      trend: 'STABLE',
      waitingVesselsCount: p.congestion.vessels_in_anchorage,
      berthOccupancyPct: 75,
    },
    waitingTimeStats: {
      averageHours: p.congestion.avg_waiting_hours,
      medianHours: p.congestion.median_waiting_hours,
      maxHours: p.congestion.max_waiting_hours,
      trendVsLastWeekPct: -3.5,
      meanHours: p.congestion.avg_waiting_hours,
    },
    weatherImpact: {
      impactLevel: 'OPTIMAL' as const,
      summary: 'Favorable maritime conditions',
      windImpact: '12 kts NW',
      swellImpact: '1.2m wave height',
      visibilityImpact: '10 NM visibility',
    },
    overallBerthUtilizationPct: 75,
  };

  const specsA = getPayloadSpecs(portA);
  const specsB = getPayloadSpecs(portB);
  const analyticsA = getPayloadAnalytics(portA);
  const analyticsB = getPayloadAnalytics(portB);
  const bunkersA = portA.bunkers || portA.bunkerPrices || [];
  const bunkersB = portB.bunkers || portB.bunkerPrices || [];
  const costsA = portA.costs || portA.portCosts || [];
  const costsB = portB.costs || portB.portCosts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-950/80 p-2 border border-cyan-800/60 text-cyan-400">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Comparative Port Intelligence Analysis
              </h2>
              <p className="text-xs text-slate-400">
                Side-by-side operational turnaround, congestion indices, and cost benchmarking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Port Selectors Header Strip */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Port A (Active) */}
          <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/20 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              PORT A (CURRENT FOCUS)
            </span>
            <div className="text-xl font-bold text-slate-100">{portA.port.name}</div>
            <div className="text-xs text-slate-400">
              {portA.port.country} • {portA.port.unlocode}
            </div>
          </div>

          {/* Port B (Compare Selector) */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              PORT B (BENCHMARK HUB)
            </span>
            <div className="flex items-center justify-between">
              <select
                value={portB.port.id}
                onChange={(e) => onSelectPortB(Number(e.target.value))}
                aria-label="Select benchmark port"
                className="w-full text-sm font-semibold bg-slate-900 border border-slate-700 rounded-lg text-slate-100 py-1 px-2.5 focus:outline-none focus:border-cyan-500"
              >
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.country || 'Global'})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {portB.port.unlocode} • {portB.port.port_type}
            </div>
          </div>
        </div>

        {/* Operational Verdict Banner */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-950/60 p-2 text-emerald-400 border border-emerald-800/40 mt-0.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Operational Recommendation & Advantage
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {winner === 'TIED'
                  ? 'Both maritime hubs exhibit comparable turnarounds and operational congestion characteristics.'
                  : winner === 'PORT_A'
                  ? `${portA.port.name} provides lower congestion, faster anchorage turnaround, or superior berth clearance.`
                  : `${portB.port.name} provides lower congestion, faster turnaround, or lower bunker acquisition costs.`}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {comparisonNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="inline-block rounded bg-slate-800/80 px-2 py-0.5 text-slate-300 border border-slate-700/60"
                  >
                    • {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Metrics Table */}
        <div className="rounded-xl border border-slate-800 overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Metric / Dimension</th>
                <th className="py-3 px-4 text-cyan-400">{portA.port.name}</th>
                <th className="py-3 px-4 text-slate-300">{portB.port.name}</th>
                <th className="py-3 px-4 text-right">Variance (A vs B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {/* Congestion Score */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-medium text-slate-300">Congestion Index</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">
                  {analyticsA.congestion.indexScore} / 100
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">
                  {analyticsB.congestion.indexScore} / 100
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold">
                  <span
                    className={
                      delta.congestionScore < 0
                        ? 'text-emerald-400'
                        : delta.congestionScore > 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }
                  >
                    {delta.congestionScore > 0 ? `+${delta.congestionScore}` : delta.congestionScore} pts
                  </span>
                </td>
              </tr>

              {/* Waiting Time */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-medium text-slate-300">Avg Waiting Time</td>
                <td className="py-3 px-4 font-mono">
                  {(analyticsA.waitingTimeStats.meanHours ?? analyticsA.waitingTimeStats.averageHours).toFixed(1)} hrs
                </td>
                <td className="py-3 px-4 font-mono">
                  {(analyticsB.waitingTimeStats.meanHours ?? analyticsB.waitingTimeStats.averageHours).toFixed(1)} hrs
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold">
                  <span
                    className={
                      delta.meanWaitHours < 0
                        ? 'text-emerald-400'
                        : delta.meanWaitHours > 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }
                  >
                    {delta.meanWaitHours > 0
                      ? `+${delta.meanWaitHours.toFixed(1)}`
                      : delta.meanWaitHours.toFixed(1)}{' '}
                    hrs
                  </span>
                </td>
              </tr>

              {/* Berth Occupancy */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-medium text-slate-300">Berth Occupancy</td>
                <td className="py-3 px-4 font-mono">
                  {(analyticsA.overallBerthUtilizationPct ?? 75).toFixed(0)}%
                </td>
                <td className="py-3 px-4 font-mono">
                  {(analyticsB.overallBerthUtilizationPct ?? 75).toFixed(0)}%
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  <span>
                    {delta.berthOccupancyPct > 0
                      ? `+${delta.berthOccupancyPct.toFixed(0)}%`
                      : `${delta.berthOccupancyPct.toFixed(0)}%`}
                  </span>
                </td>
              </tr>

              {/* Max Draft */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-medium text-slate-300">Max Allowable Draft</td>
                <td className="py-3 px-4 font-mono">{specsA.maxDraftMeters} m</td>
                <td className="py-3 px-4 font-mono">{specsB.maxDraftMeters} m</td>
                <td className="py-3 px-4 text-right font-mono text-slate-300">
                  {specsA.maxDraftMeters - specsB.maxDraftMeters > 0
                    ? `+${(specsA.maxDraftMeters - specsB.maxDraftMeters).toFixed(1)} m`
                    : `${(specsA.maxDraftMeters - specsB.maxDraftMeters).toFixed(1)} m`}
                </td>
              </tr>

              {/* Bunker VLSFO Price */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-medium text-slate-300">Bunker VLSFO Price</td>
                <td className="py-3 px-4 font-mono">
                  ${bunkersA[0]?.price_per_mt_usd ?? bunkersA[0]?.price_usd_mt ?? 610} / MT
                </td>
                <td className="py-3 px-4 font-mono">
                  ${bunkersB[0]?.price_per_mt_usd ?? bunkersB[0]?.price_usd_mt ?? 610} / MT
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold">
                  <span
                    className={
                      delta.bunkerPriceDeltaUsd < 0
                        ? 'text-emerald-400'
                        : delta.bunkerPriceDeltaUsd > 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }
                  >
                    {delta.bunkerPriceDeltaUsd > 0
                      ? `+$${delta.bunkerPriceDeltaUsd.toFixed(0)}`
                      : `-$${Math.abs(delta.bunkerPriceDeltaUsd).toFixed(0)}`}
                  </span>
                </td>
              </tr>

              {/* Estimated DA Cost */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-medium text-slate-300">Standard Call DA Estimate</td>
                <td className="py-3 px-4 font-mono text-slate-100">
                  ${costsA.reduce((acc, c) => acc + (c.standard_amount_usd ?? c.rate_usd ?? 0), 0).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-mono text-slate-100">
                  ${costsB.reduce((acc, c) => acc + (c.standard_amount_usd ?? c.rate_usd ?? 0), 0).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold">
                  <span
                    className={
                      delta.daCostDeltaUsd < 0
                        ? 'text-emerald-400'
                        : delta.daCostDeltaUsd > 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }
                  >
                    {delta.daCostDeltaUsd > 0
                      ? `+$${delta.daCostDeltaUsd.toLocaleString()}`
                      : `-$${Math.abs(delta.daCostDeltaUsd).toLocaleString()}`}
                  </span>
                </td>
              </tr>

              {/* Weather Status */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-medium text-slate-300">Weather & Advisory</td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-200">
                    {analyticsA.weatherImpact.impactLevel}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {(portA.weather.wind_speed_knots ?? portA.weather.windSpeedKnots ?? 0)} kn, {(portA.weather.wave_height_m ?? portA.weather.waveHeightMeters ?? 0)}m wave
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-200">
                    {analyticsB.weatherImpact.impactLevel}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {(portB.weather.wind_speed_knots ?? portB.weather.windSpeedKnots ?? 0)} kn, {(portB.weather.wave_height_m ?? portB.weather.waveHeightMeters ?? 0)}m wave
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-[11px] text-slate-400">
                  {analyticsA.weatherImpact.impactLevel === analyticsB.weatherImpact.impactLevel
                    ? 'Equivalent'
                    : 'Disparate'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <Link
            to={`/distance-calculator?origin=${encodeURIComponent(portA.port.name)}&destination=${encodeURIComponent(portB.port.name)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
          >
            <Compass className="h-4 w-4" />
            Calculate Nautical Route Between {portA.port.name} & {portB.port.name}
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
