/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 27: Mobile Port Insights & Congestion Radar View
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  Clock,
  Ship,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wind,
  Fuel,
  Building2,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { usePortInsights } from '../../hooks/usePortInsights';
import { MobileBottomSheet } from '../../components/mobile/MobileBottomSheet';
import type { PortVesselActivity, PortTerminalDetail } from '../../types/port-insights';

export const MobilePortsView: React.FC = () => {
  const navigate = useNavigate();
  const {
    ports,
    activePort,
    payload,
    isLoading,
    handleSelectPort,
    handleRefresh,
  } = usePortInsights();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<PortVesselActivity | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<PortTerminalDetail | null>(null);
  const [activeSegment, setActiveSegment] = useState<'radar' | 'lineups' | 'terminals'>('radar');

  // Filtered ports for selector
  const filteredPorts = useMemo(() => {
    if (!searchQuery.trim()) return ports.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return ports.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        (p.unlocode && p.unlocode.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [ports, searchQuery]);

  // Congestion level color styling
  const getCongestionBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'LOW CONGESTION',
        };
      case 'moderate':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'MODERATE DELAYS',
        };
      case 'high':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'HIGH CONGESTION',
        };
      case 'critical':
      default:
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'CRITICAL BOTTLENECK',
        };
    }
  };

  if (isLoading || !payload) {
    return (
      <div className="mobile-loading">
        <div className="mobile-spinner" />
        <p>Loading maritime port radar...</p>
      </div>
    );
  }

  const congestion = payload.congestion;
  const badge = getCongestionBadge(congestion.current_level);

  return (
    <div className="mobile-page-container">
      {/* Search & Benchmark Selector */}
      <div className="mb-4">
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search port (Singapore, Rotterdam, Houston...)"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Quick Port Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {filteredPorts.map((p) => {
            const isSelected = activePort?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPort(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Port Hero Card */}
      {activePort && (
        <div className="mobile-card mb-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{activePort.name}</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {activePort.unlocode || 'PORT'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <span>{activePort.country}</span>
                {activePort.latitude && activePort.longitude && (
                  <span>
                    • {activePort.latitude.toFixed(2)}°, {activePort.longitude.toFixed(2)}°
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="mobile-icon-btn p-2 rounded-lg text-slate-400 hover:text-white"
              title="Refresh radar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Congestion Level Pill */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
              <span className="font-mono text-slate-200 ml-1 font-bold">
                {congestion.congestion_index_pct}%
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              {congestion.vessels_in_anchorage} in queue • {congestion.vessels_at_berth} berthing
            </div>
          </div>
        </div>
      )}

      {/* Segment Switcher */}
      <div className="mobile-tabs-container mb-4">
        {[
          { id: 'radar', label: 'Congestion & Weather' },
          { id: 'lineups', label: `Lineups (${payload.activities.length})` },
          { id: 'terminals', label: `Terminals (${payload.terminals.length})` },
        ].map((seg) => (
          <button
            key={seg.id}
            type="button"
            onClick={() => setActiveSegment(seg.id as any)}
            className={`mobile-tab-btn ${activeSegment === seg.id ? 'active' : ''}`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Segment 1: Radar & Weather */}
      {activeSegment === 'radar' && (
        <div className="space-y-4">
          {/* Key Congestion KPIs */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="mobile-card p-3">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Avg Anchorage Wait
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {congestion.avg_waiting_hours.toFixed(1)}
                <span className="text-xs text-slate-400 font-sans ml-1">hrs</span>
              </div>
              <span className="text-[10px] text-slate-500">Median: {congestion.median_waiting_hours.toFixed(1)}h</span>
            </div>

            <div className="mobile-card p-3">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                Vessels in Anchorage
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {congestion.vessels_in_anchorage}
                <span className="text-xs text-slate-400 font-sans ml-1">vessels</span>
              </div>
              <span className="text-[10px] text-slate-500">{congestion.vessels_expected_48h} inbound (48h)</span>
            </div>

            <div className="mobile-card p-3">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Berth Occupancy
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {congestion.vessels_at_berth}
                <span className="text-xs text-slate-400 font-sans ml-1">operating</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Peak wait: {congestion.max_waiting_hours.toFixed(1)} hrs
              </span>
            </div>

            <div className="mobile-card p-3">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Congestion Index
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {congestion.congestion_index_pct}
                <span className="text-xs text-slate-400 font-sans ml-0.5">%</span>
              </div>
              <span className="text-[10px] text-slate-500">Rating: {congestion.current_level}</span>
            </div>
          </div>

          {/* Bunker Fuel Benchmark */}
          {payload.bunkers.length > 0 && (
            <div className="mobile-card">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                Live Bunker Pricing ($/MT)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {payload.bunkers.map((b) => (
                  <div key={b.fuel_type} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="block text-[10px] font-medium text-slate-400">{b.fuel_type}</span>
                    <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                      ${b.price_usd_mt}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        (b.delta_usd ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(b.delta_usd ?? 0) >= 0 ? `+${b.delta_usd ?? 0}` : b.delta_usd}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maritime Weather Conditions */}
          {payload.weather && (
            <div className="mobile-card">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Harbour Weather & Sea State
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Wind Velocity</span>
                  <span className="font-semibold text-white">
                    {payload.weather.wind_speed_knots} kts • {payload.weather.wind_direction}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Wave / Swell Height</span>
                  <span className="font-semibold text-white">{payload.weather.wave_height_m} meters</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Air Temperature</span>
                  <span className="font-semibold text-white">{payload.weather.temperature_c}°C</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Visibility / Condition</span>
                  <span className="font-semibold text-white">{payload.weather.condition}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Segment 2: Vessel Lineups & Operations */}
      {activeSegment === 'lineups' && (
        <div className="space-y-2">
          {payload.activities.length === 0 ? (
            <div className="mobile-empty-state">
              <Ship className="w-8 h-8 text-slate-600 mb-2" />
              <p>No active vessel operations reported</p>
            </div>
          ) : (
            payload.activities.map((act) => (
              <div
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className="mobile-card p-3 active:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{act.vessel_name}</span>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                          act.status === 'operating'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : act.status === 'waiting'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1">
                      {act.vessel_type} • DWT {act.dwt?.toLocaleString() || 'N/A'} • {act.cargo_type || 'Crude/Bulk'}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Berth: {act.berth || act.terminal_name || 'Anchorage A'}</span>
                      {act.waiting_hours > 0 && <span>• Waiting: {act.waiting_hours} hrs</span>}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-2" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Segment 3: Terminals */}
      {activeSegment === 'terminals' && (
        <div className="space-y-2.5">
          {payload.terminals.map((term) => (
            <div
              key={term.id}
              onClick={() => setSelectedTerminal(term)}
              className="mobile-card p-3.5 cursor-pointer active:bg-slate-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{term.name}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {term.terminal_type} • Max Draft {term.max_draft_m}m • Max LOA {term.max_loa_m}m
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-cyan-400">{term.utilization_pct}%</span>
                  <span className="block text-[9px] text-slate-500">Utilization</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    term.utilization_pct > 80
                      ? 'bg-rose-500'
                      : term.utilization_pct > 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(term.utilization_pct, 100)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  Berths: {term.berths_occupied} / {term.berths_total} occupied
                </span>
                <span>{term.waiting_vessels_count} vessels waiting</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Detail Modal */}
      <MobileBottomSheet
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.vessel_name || 'Vessel Activity'}
      >
        {selectedActivity && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Vessel Details</span>
                <span className="text-sm font-bold text-white">{selectedActivity.vessel_name}</span>
                <span className="text-xs text-slate-400 block">{selectedActivity.vessel_type}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedActivity(null);
                  navigate(`/m/vessels/${selectedActivity.vessel_id}`);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                Open Dossier <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Status</span>
                <span className="font-semibold text-white uppercase">{selectedActivity.status}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Assigned Terminal</span>
                <span className="font-semibold text-white">{selectedActivity.terminal_name || 'General Quay'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Waiting Time</span>
                <span className="font-semibold text-amber-400 font-mono">{selectedActivity.waiting_hours} hrs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Cargo Operation</span>
                <span className="font-semibold text-white">{selectedActivity.cargo_type || 'Bulk/Crude'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const vid = selectedActivity.vessel_id;
                setSelectedActivity(null);
                navigate(`/m/updater?vesselId=${vid}`);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            >
              Update Telemetry for {selectedActivity.vessel_name}
            </button>
          </div>
        )}
      </MobileBottomSheet>

      {/* Terminal Detail Modal */}
      <MobileBottomSheet
        isOpen={!!selectedTerminal}
        onClose={() => setSelectedTerminal(null)}
        title={selectedTerminal?.name || 'Terminal'}
      >
        {selectedTerminal && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">Terminal Specifications</span>
              <h3 className="text-sm font-bold text-white mt-0.5">{selectedTerminal.name}</h3>
              <p className="text-slate-400 text-xs mt-1">Cargo specialization: {selectedTerminal.terminal_type}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Berths</span>
                <span className="font-mono font-bold text-white">{selectedTerminal.berths_total} berths</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Occupied Berths</span>
                <span className="font-mono font-bold text-cyan-400">{selectedTerminal.berths_occupied} occupied</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Max Allowable Draft</span>
                <span className="font-mono font-bold text-white">{selectedTerminal.max_draft_m} m</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Max Vessel LOA</span>
                <span className="font-mono font-bold text-white">{selectedTerminal.max_loa_m} m</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">Queued Vessels</span>
              <div className="text-sm font-mono font-bold text-white mt-1">
                {selectedTerminal.waiting_vessels_count} vessels waiting at anchor
              </div>
            </div>
          </div>
        )}
      </MobileBottomSheet>
    </div>
  );
};
