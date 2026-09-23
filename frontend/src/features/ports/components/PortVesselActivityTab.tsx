/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights Vessel Activity Tab
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Ship,
  Anchor,
  Activity,
  Clock,
  ExternalLink,
  Search,
  ArrowUpDown,
  Navigation,
} from 'lucide-react';
import type { PortVesselActivity, PortTerminalDetail } from '../../../types/port-insights';

interface PortVesselActivityTabProps {
  activities: PortVesselActivity[];
  terminals: PortTerminalDetail[];
  portName: string;
}

export const PortVesselActivityTab: React.FC<PortVesselActivityTabProps> = ({
  activities,
  terminals,
  portName,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'arriving' | 'waiting' | 'operating'>('all');
  const [terminalFilter, setTerminalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'waiting_hours' | 'dwt' | 'eta'>('waiting_hours');
  const [sortAsc, setSortAsc] = useState(false);

  // Counts for pill buttons
  const counts = useMemo(() => {
    return {
      all: activities.length,
      arriving: activities.filter((a) => a.status === 'arriving').length,
      waiting: activities.filter((a) => a.status === 'waiting').length,
      operating: activities.filter((a) => a.status === 'operating').length,
    };
  }, [activities]);

  // Filtered & Sorted activity records
  const processedActivities = useMemo(() => {
    let list = activities.filter((act) => {
      if (statusFilter !== 'all' && act.status !== statusFilter) return false;
      if (terminalFilter !== 'all' && act.terminal_name !== terminalFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          act.vessel_name.toLowerCase().includes(q) ||
          (act.imo || '').includes(q) ||
          act.vessel_type.toLowerCase().includes(q) ||
          act.cargo_type.toLowerCase().includes(q) ||
          act.terminal_name.toLowerCase().includes(q)
        );
      }
      return true;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.vessel_name.localeCompare(b.vessel_name);
      } else if (sortField === 'waiting_hours') {
        comparison = (a.waiting_hours || 0) - (b.waiting_hours || 0);
      } else if (sortField === 'dwt') {
        comparison = a.dwt - b.dwt;
      } else if (sortField === 'eta') {
        comparison = new Date(a.eta || 0).getTime() - new Date(b.eta || 0).getTime();
      }
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [activities, statusFilter, terminalFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: 'name' | 'waiting_hours' | 'dwt' | 'eta') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Status Tabs + Search + Terminal Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Activity
            <span className="bg-slate-950/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('arriving')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'arriving'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Ship className="h-3.5 w-3.5" />
            Arriving
            <span className="bg-slate-950/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {counts.arriving}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'waiting'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Anchor className="h-3.5 w-3.5" />
            At Anchorage
            <span className="bg-slate-950/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {counts.waiting}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('operating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'operating'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Operating Berths
            <span className="bg-slate-950/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {counts.operating}
            </span>
          </button>
        </div>

        {/* Search & Terminal Select */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vessel or cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            aria-label="Filter by terminal"
            className="text-xs bg-slate-950/80 border border-slate-700 rounded-lg text-slate-300 py-1.5 px-2.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Terminals</option>
            {terminals.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-cyan-400 select-none"
                >
                  <div className="flex items-center gap-1">
                    Vessel Name & IMO
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dwt')}
                  className="py-3 px-3 cursor-pointer hover:text-cyan-400 select-none"
                >
                  <div className="flex items-center gap-1">
                    Class / DWT
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Terminal & Berth</th>
                <th className="py-3 px-3">Cargo Manifest</th>
                <th
                  onClick={() => handleSort('waiting_hours')}
                  className="py-3 px-3 cursor-pointer hover:text-cyan-400 select-none"
                >
                  <div className="flex items-center gap-1">
                    Wait Time
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('eta')}
                  className="py-3 px-3 cursor-pointer hover:text-cyan-400 select-none"
                >
                  <div className="flex items-center gap-1">
                    ETA / Timeline
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-normal">
              {processedActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No vessel movements match the current filter criteria.
                  </td>
                </tr>
              ) : (
                processedActivities.map((act) => (
                  <tr
                    key={act.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Vessel Name & IMO */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        {act.vessel_id ? (
                          <Link
                            to={`/vessels/${act.vessel_id}`}
                            className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                          >
                            {act.vessel_name}
                            <ExternalLink className="h-2.5 w-2.5 inline" />
                          </Link>
                        ) : (
                          <span>{act.vessel_name}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        IMO {act.imo} • Flag: {act.flag}
                      </div>
                    </td>

                    {/* Class & DWT */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{act.vessel_type}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {act.dwt.toLocaleString()} DWT
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          act.status === 'operating'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                            : act.status === 'waiting'
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                            : 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            act.status === 'operating'
                              ? 'bg-emerald-500'
                              : act.status === 'waiting'
                              ? 'bg-amber-500'
                              : 'bg-cyan-500'
                          }`}
                        />
                        {act.status}
                      </span>
                    </td>

                    {/* Terminal & Berth */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200 text-xs">
                        {act.terminal_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {act.berth_assigned || 'Berth pending'}
                      </div>
                    </td>

                    {/* Cargo */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{act.cargo_type}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {act.operation} {act.cargo_quantity_mt.toLocaleString()} MT
                      </div>
                    </td>

                    {/* Waiting Hours */}
                    <td className="py-3 px-3">
                      {act.waiting_hours && act.waiting_hours > 0 ? (
                        <div className="flex items-center gap-1 text-amber-300 font-mono font-semibold">
                          <Clock className="h-3 w-3 text-amber-400" />
                          {act.waiting_hours.toFixed(1)} hrs
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">—</span>
                      )}
                    </td>

                    {/* ETA */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-200 text-[11px]">
                        {act.eta ? new Date(act.eta).toLocaleDateString() : 'In Port'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {act.eta ? new Date(act.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Berthed'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/distance-calculator?origin=${encodeURIComponent(portName)}&destination=Singapore`}
                          title="Calculate routing distance from this port"
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                        </Link>
                        {act.vessel_id && (
                          <Link
                            to={`/vessels/${act.vessel_id}`}
                            title="View vessel profile"
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
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
