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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Control Bar: Status Tabs + Search + Terminal Filter */}
      <div className="piw-filter-bar">
        {/* Status Filter Buttons */}
        <div className="piw-filter-pills-row">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`piw-pill-btn ${statusFilter === 'all' ? 'active-all' : ''}`}
          >
            <span>All Activity</span>
            <span className="piw-pill-count">{counts.all}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('arriving')}
            className={`piw-pill-btn ${statusFilter === 'arriving' ? 'active-arriving' : ''}`}
          >
            <Ship size={14} />
            <span>Arriving</span>
            <span className="piw-pill-count">{counts.arriving}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('waiting')}
            className={`piw-pill-btn ${statusFilter === 'waiting' ? 'active-waiting' : ''}`}
          >
            <Anchor size={14} />
            <span>At Anchorage</span>
            <span className="piw-pill-count">{counts.waiting}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('operating')}
            className={`piw-pill-btn ${statusFilter === 'operating' ? 'active-operating' : ''}`}
          >
            <Activity size={14} />
            <span>Operating Berths</span>
            <span className="piw-pill-count">{counts.operating}</span>
          </button>
        </div>

        {/* Search & Terminal Select */}
        <div className="piw-filter-controls-right">
          <div className="piw-search-container">
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search vessel or cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="piw-search-input"
            />
          </div>

          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            aria-label="Filter by terminal"
            className="piw-select-dropdown"
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
      <div className="piw-table-card">
        <div className="piw-table-wrapper">
          <table className="piw-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  <button type="button">
                    <span>Vessel Name & IMO</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th onClick={() => handleSort('dwt')} style={{ cursor: 'pointer' }}>
                  <button type="button">
                    <span>Class / DWT</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>Status</th>
                <th>Terminal & Berth</th>
                <th>Cargo Manifest</th>
                <th onClick={() => handleSort('waiting_hours')} style={{ cursor: 'pointer' }}>
                  <button type="button">
                    <span>Wait Time</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th onClick={() => handleSort('eta')} style={{ cursor: 'pointer' }}>
                  <button type="button">
                    <span>ETA / Timeline</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No vessel movements match the current filter criteria.
                  </td>
                </tr>
              ) : (
                processedActivities.map((act) => (
                  <tr key={act.id}>
                    {/* Vessel Name & IMO */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {act.vessel_id ? (
                          <Link
                            to={`/vessels/${act.vessel_id}`}
                            style={{ color: '#00d8ff', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>{act.vessel_name}</span>
                            <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <span>{act.vessel_name}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                        IMO {act.imo} • Flag: {act.flag}
                      </div>
                    </td>

                    {/* Class & DWT */}
                    <td>
                      <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{act.vessel_type}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                        {act.dwt.toLocaleString()} DWT
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`piw-status-badge piw-status-${act.status}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {act.status}
                      </span>
                    </td>

                    {/* Terminal & Berth */}
                    <td>
                      <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{act.terminal_name}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                        {act.berth_assigned || 'Berth pending'}
                      </div>
                    </td>

                    {/* Cargo */}
                    <td>
                      <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{act.cargo_type}</div>
                      <div style={{ fontSize: '10.5px', color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                        {act.operation} {act.cargo_quantity_mt.toLocaleString()} MT
                      </div>
                    </td>

                    {/* Waiting Hours */}
                    <td>
                      {act.waiting_hours && act.waiting_hours > 0 ? (
                        <div className="piw-wait-badge">
                          <Clock size={12} />
                          <span>{act.waiting_hours.toFixed(1)} hrs</span>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>—</span>
                      )}
                    </td>

                    {/* ETA */}
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#ffffff', fontSize: '12px' }}>
                        {act.eta ? new Date(act.eta).toLocaleDateString() : 'In Port'}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                        {act.eta ? new Date(act.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Berthed'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="piw-action-group" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          to={`/distance-calculator?origin=${encodeURIComponent(portName)}&destination=Singapore`}
                          title="Calculate routing distance from this port"
                          className="piw-action-btn"
                        >
                          <Navigation size={13} />
                        </Link>
                        {act.vessel_id && (
                          <Link
                            to={`/vessels/${act.vessel_id}`}
                            title="View vessel profile"
                            className="piw-action-btn"
                          >
                            <ExternalLink size={13} />
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
