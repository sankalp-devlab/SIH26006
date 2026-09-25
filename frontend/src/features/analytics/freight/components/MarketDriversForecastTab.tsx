/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Market Drivers, Chokepoints & Predictive Forecast Tab
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  Compass,
  Anchor,
  ShieldAlert,
  Info
} from 'lucide-react';
import type {
  MarketDriverFactor,
  FreightForecastPoint,
  FreightRateBenchmark
} from '../../../../types/freight-analytics';

interface MarketDriversForecastTabProps {
  drivers: MarketDriverFactor[];
  forecast: FreightForecastPoint[];
  rates: FreightRateBenchmark[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
}

export const MarketDriversForecastTab: React.FC<MarketDriversForecastTabProps> = ({
  drivers,
  forecast,
  rates,
  selectedRouteCode,
  onSelectRoute
}) => {
  const navigate = useNavigate();
  const activeRoute = rates.find(r => r && r.route_code === selectedRouteCode) || rates[0];

  if (!activeRoute) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
        Select a freight corridor to view predictive forecasting.
      </div>
    );
  }

  // Render SVG Predictive Forecast Chart with confidence interval envelope
  const renderForecastConfidenceChart = () => {
    if (!forecast || forecast.length < 2) {
      return (
        <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
          Loading predictive forecast models for {selectedRouteCode}...
        </div>
      );
    }

    const currentVal = activeRoute.rate_value;
    const allPoints = [
      { horizon: 'Current', projected_rate_usd: currentVal, confidence_lower_usd: currentVal, confidence_upper_usd: currentVal },
      ...forecast
    ];

    const maxVal = Math.max(...allPoints.map(p => p.confidence_upper_usd)) * 1.05;
    const minVal = Math.min(...allPoints.map(p => p.confidence_lower_usd)) * 0.95;
    const range = maxVal - minVal || 1;

    const width = 640;
    const height = 220;
    const padding = 40;

    const coords = allPoints.map((p, idx) => {
      const x = padding + (idx / (allPoints.length - 1)) * (width - padding * 2);
      const yProj = height - padding - ((p.projected_rate_usd - minVal) / range) * (height - padding * 2);
      const yUpper = height - padding - ((p.confidence_upper_usd - minVal) / range) * (height - padding * 2);
      const yLower = height - padding - ((p.confidence_lower_usd - minVal) / range) * (height - padding * 2);
      return { x, yProj, yUpper, yLower, ...p };
    });

    const pathProj = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yProj.toFixed(1)}`).join(' ');

    // Confidence envelope polygon: forward upper line + reverse lower line
    const upperLine = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yUpper.toFixed(1)}`).join(' ');
    const lowerLineRev = [...coords].reverse().map(c => `L ${c.x.toFixed(1)} ${c.yLower.toFixed(1)}`).join(' ');
    const envelopeD = `${upperLine} ${lowerLineRev} Z`;

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[550px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none">
            <defs>
              <linearGradient id="forecastEnvelopeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />

            {/* Confidence Envelope Shading */}
            <path d={envelopeD} fill="url(#forecastEnvelopeGradient)" />

            {/* Upper & Lower Bound Dashed Lines */}
            <path
              d={coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yUpper.toFixed(1)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.25"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />
            <path
              d={coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yLower.toFixed(1)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.25"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />

            {/* Central Projected Line */}
            <path d={pathProj} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points & Labels */}
            {coords.map((c, idx) => (
              <g key={idx} className="group">
                <circle
                  cx={c.x}
                  cy={c.yProj}
                  r={idx === 0 ? 5 : 4}
                  fill={idx === 0 ? '#38bdf8' : '#020617'}
                  stroke={idx === 0 ? '#38bdf8' : '#10b981'}
                  strokeWidth="2"
                />
                <title>{`${c.horizon}: $${c.projected_rate_usd.toLocaleString()} (Range: $${c.confidence_lower_usd} - $${c.confidence_upper_usd})`}</title>
                <text x={c.x} y={height - 12} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  {c.horizon}
                </text>
                <text x={c.x} y={c.yProj - 10} fill="#10b981" fontSize="10" textAnchor="middle" fontWeight="bold">
                  ${c.projected_rate_usd}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Forecast Header & Route Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <TrendingUp size={12} /> FORWARD RATE PROJECTION
              </span>
              <span className="text-xs text-slate-400">
                Statistical Extrapolation & Ton-Mile Demand Projections
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
              Predictive Freight Rate Horizon: {activeRoute.route_name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Forward multi-horizon projections (7d to 90d) modeling seasonal ton-mile expansion, chokepoint queuing, and fleet availability.
            </p>
          </div>

          {/* Quick Route Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 self-start lg:self-auto">
            <span className="text-xs text-slate-400 font-medium pl-2">Select Corridor:</span>
            {rates.slice(0, 4).map((r) => (
              <button
                key={r.route_code}
                onClick={() => onSelectRoute(r.route_code)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  selectedRouteCode === r.route_code
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.route_code}
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Chart Card */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-3 h-0.5 bg-emerald-400 rounded" /> Modeled Baseline Projection
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-3 h-2 bg-emerald-500/20 border border-emerald-500/40 rounded-sm" /> 95% Statistical Confidence Band
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Current Observed Spot
              </span>
            </div>

            <div className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Unit: USD / {activeRoute.rate_basis}
            </div>
          </div>

          {renderForecastConfidenceChart()}

          {/* Notice: Explicit distinction between observed and forecast */}
          <div className="mt-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center gap-2 text-xs text-slate-400">
            <Info size={14} className="text-purple-400 shrink-0" />
            <span>
              <strong>Market Notice:</strong> Projections represent quantitative risk modeling derived from historical volatility and canal transit friction. Observed historical data is strictly separated from forward modeled estimates.
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Horizon Projections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {forecast.map((pt) => (
          <div key={pt.horizon} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-white uppercase">{pt.horizon} Horizon</span>
                <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {pt.confidence_score_pct}% Confidence
                </span>
              </div>

              <div className="my-2">
                <div className="text-xl font-bold text-white">
                  ${pt.projected_rate_usd.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Range: ${pt.confidence_lower_usd} – ${pt.confidence_upper_usd}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
              {pt.driver_summary}
            </div>
          </div>
        ))}
      </div>

      {/* Market Drivers & Chokepoint Delays Deep-Dive */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" />
              Strategic Chokepoint Friction & Route Deviation Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live impact assessments of canal rerouting, freshwater draft caps, and anchorage dwell times
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/distance-calculator')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <Compass size={13} /> Distance Calculator (M12)
            </button>
            <button
              onClick={() => navigate('/ports')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 ml-2"
            >
              <Anchor size={13} /> Port Insights (M13)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle size={14} className={driver.impact_level === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'} />
                    {driver.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    driver.impact_level === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {driver.impact_level}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {driver.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] text-slate-400 font-medium">Corridors Affected:</span>
                  {driver.affected_routes.map((rt, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold">
                      {rt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center bg-slate-900/50 rounded-lg p-2">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Transit Added</div>
                  <div className="text-xs font-bold text-white mt-0.5">+{driver.delay_impact_days} Days</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Freight Premium</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">+{driver.freight_premium_pct}%</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Ton-Mile Shift</div>
                  <div className="text-xs font-bold text-cyan-400 mt-0.5">+{driver.ton_mile_expansion_pct}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
