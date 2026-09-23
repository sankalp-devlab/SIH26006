/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights Terminals & Lineup Tab
 */

import React, { useState } from 'react';
import {
  Building2,
  Layers,
} from 'lucide-react';
import type { PortTerminalDetail, PortLineupItem } from '../../../types/port-insights';

interface PortTerminalsTabProps {
  terminals: PortTerminalDetail[];
  lineups: PortLineupItem[];
}

export const PortTerminalsTab: React.FC<PortTerminalsTabProps> = ({ terminals, lineups }) => {
  const [selectedTerminal, setSelectedTerminal] = useState<string>('all');

  const filteredLineups = selectedTerminal === 'all'
    ? lineups
    : lineups.filter((l) => l.terminal_name === selectedTerminal);

  return (
    <div className="space-y-6">
      {/* 1. Marine Terminals Grid */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="text-blue-400" size={18} />
            <h3 className="font-bold text-slate-100 text-base">
              Terminal Infrastructure & Berth Occupancy
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {terminals.length} Specialized Marine Terminals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {terminals.map((term) => {
            const occupied = term.occupiedBerths ?? term.berths_occupied ?? 0;
            const total = term.totalBerths ?? term.berths_total ?? 1;
            const occupancyPct = Math.round((occupied / Math.max(1, total)) * 100);
            const isNearFull = occupancyPct >= 80;
            const maxDraft = term.maxDraftMeters ?? term.max_draft_m ?? 0;
            const maxLoa = term.maxLoaMeters ?? term.max_loa_m ?? 0;
            const handlingRate = term.handlingRateTph ?? Math.round((term.handling_rate_mt_day || 0) / 24);

            return (
              <div
                key={term.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4.5 backdrop-blur-md hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-100">{term.name}</h4>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 mt-1">
                      {term.terminalType || term.terminal_type}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                        isNearFull
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      }`}
                    >
                      {occupancyPct}%
                    </span>
                  </div>
                </div>

                {/* Berth Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Berth Occupancy</span>
                    <span className="font-mono text-slate-200">
                      {occupied} / {total} active
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isNearFull ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Max Draft</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {maxDraft} m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Max LOA</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {maxLoa} m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Throughput</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {handlingRate.toLocaleString()} TPH
                    </span>
                  </div>
                </div>

                {/* Active Vessels */}
                {(term.activeVessels && term.activeVessels.length > 0) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                      Currently Berthed:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {term.activeVessels.map((v, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 font-medium"
                        >
                          {typeof v === 'string' ? v : v.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Berthing Lineup & Queue Sequence */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-slate-100">
                Official Port Berthing Lineup & Queue
              </h3>
              <p className="text-xs text-slate-400">
                Prioritized berthing sequence by Harbor Master & Terminal Operators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Terminal Filter:</span>
            <select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
              aria-label="Filter lineups by terminal"
              className="text-xs bg-slate-950/80 border border-slate-700 rounded-lg text-slate-300 py-1.5 px-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Terminals ({lineups.length})</option>
              {terminals.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-12 text-center">Seq</th>
                <th className="py-3 px-4">Vessel & IMO</th>
                <th className="py-3 px-3">Terminal & Berth</th>
                <th className="py-3 px-3">Cargo Details</th>
                <th className="py-3 px-3">Est. Berthing (ETB)</th>
                <th className="py-3 px-3">Est. Completion (ETC)</th>
                <th className="py-3 px-3">Est. Turnaround</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLineups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No lineup records found for the selected terminal.
                  </td>
                </tr>
              ) : (
                filteredLineups.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Seq */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-cyan-400 font-mono font-bold text-xs">
                        {item.queue_sequence}
                      </span>
                    </td>

                    {/* Vessel */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{item.vessel_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        IMO {item.imo}
                      </div>
                    </td>

                    {/* Terminal & Berth */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{item.terminal_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.berth_name}
                      </div>
                    </td>

                    {/* Cargo */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{item.cargo_type || item.cargo_desc}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.operation} {(item.cargo_quantity_mt ?? 0).toLocaleString()} MT
                      </div>
                    </td>

                    {/* ETB */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-200">
                        {new Date(item.estimated_berthing).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.estimated_berthing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* ETC */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-200">
                        {item.estimated_departure ? new Date(item.estimated_departure).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.estimated_departure ? new Date(item.estimated_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    {/* Turnaround */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold text-indigo-300">
                        {(item.estimated_turnaround_hours ?? 24).toFixed(0)} hrs
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          (item.status || 'CONFIRMED') === 'CONFIRMED'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                            : (item.status || 'CONFIRMED') === 'AT_ANCHORAGE'
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                            : 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
                        }`}
                      >
                        {(item.status || 'CONFIRMED').replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
