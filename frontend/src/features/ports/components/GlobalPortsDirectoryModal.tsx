/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Global Ports Directory Modal
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Anchor,
  MapPin,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { Port } from '../../../types/port';

interface GlobalPortsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ports: Port[];
  activePortId: number | null;
  onSelectPort: (portId: number) => void;
}

export const GlobalPortsDirectoryModal: React.FC<GlobalPortsDirectoryModalProps> = ({
  isOpen,
  onClose,
  ports,
  activePortId,
  onSelectPort,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract unique countries
  const countries = useMemo(() => {
    const list = Array.from(new Set(ports.map((p) => p.country).filter(Boolean))) as string[];
    list.sort();
    return list;
  }, [ports]);

  // Filtered ports
  const filteredPorts = useMemo(() => {
    return ports.filter((p) => {
      if (countryFilter !== 'all' && p.country !== countryFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.unlocode && p.unlocode.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.country && p.country.toLowerCase().includes(q))
      );
    });
  }, [ports, searchTerm, countryFilter]);

  // Paginated ports
  const totalPages = Math.max(1, Math.ceil(filteredPorts.length / pageSize));
  const paginatedPorts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPorts.slice(start, start + pageSize);
  }, [filteredPorts, currentPage, pageSize]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-950/80 p-2 border border-cyan-800/60 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Global Ports & Terminals Directory
              </h2>
              <p className="text-xs text-slate-400">
                World Port Index (Pub 150) & UN/LOCODE database ({ports.length} registered hubs)
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

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by port name, UN/LOCODE, city, or country..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter directory by country"
              className="text-xs bg-slate-950/80 border border-slate-700 rounded-lg text-slate-300 py-2 px-3 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Countries ({countries.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Port Name & Country</th>
                <th className="py-3 px-3">UN/LOCODE</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Pub 150 Coordinates</th>
                <th className="py-3 px-3">Marine Facilities</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedPorts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No ports found matching the search criteria.
                  </td>
                </tr>
              ) : (
                paginatedPorts.map((p) => {
                  const isActive = p.id === activePortId;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isActive ? 'bg-cyan-950/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Anchor
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? 'text-cyan-400' : 'text-slate-500'
                            }`}
                          />
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              {p.name}
                              {isActive && (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.city ? `${p.city}, ` : ''}
                              {p.country || 'Global Ocean'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {p.unlocode ? (
                          <span className="font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                            {p.unlocode}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-300">{p.port_type || 'Seaport'}</td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {p.latitude != null && p.longitude != null ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            {p.latitude.toFixed(2)}°, {p.longitude.toFixed(2)}°
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.facilities && p.facilities.length > 0 ? (
                            p.facilities.slice(0, 3).map((f, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.2 rounded bg-slate-800/70 text-slate-300 text-[10px]"
                              >
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[10px]">Standard Facilities</span>
                          )}
                          {p.facilities && p.facilities.length > 3 && (
                            <span className="text-slate-500 text-[10px]">
                              +{p.facilities.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            onSelectPort(p.id);
                            onClose();
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-slate-800 text-slate-400 cursor-default'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                          }`}
                        >
                          {isActive ? 'Active' : 'Load Insights'}
                          {!isActive && <ArrowRight className="h-3 w-3" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredPorts.length)} of {filteredPorts.length} ports
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
            >
              Previous
            </button>
            <span className="text-slate-300 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
