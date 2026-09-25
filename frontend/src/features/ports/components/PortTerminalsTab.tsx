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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Marine Terminals Grid Card */}
      <div className="piw-card">
        <div className="piw-section-header-row">
          <div className="piw-section-heading">
            <Building2 size={18} color="var(--ol-accent-light)" />
            <span>Terminal Infrastructure & Berth Occupancy</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {terminals.length} Specialized Marine Terminals
          </span>
        </div>

        <div className="piw-terminals-grid">
          {terminals.map((term) => {
            const occupied = term.occupiedBerths ?? term.berths_occupied ?? 0;
            const total = term.totalBerths ?? term.berths_total ?? 1;
            const occupancyPct = Math.round((occupied / Math.max(1, total)) * 100);
            const isNearFull = occupancyPct >= 80;
            const maxDraft = term.maxDraftMeters ?? term.max_draft_m ?? 0;
            const maxLoa = term.maxLoaMeters ?? term.max_loa_m ?? 0;
            const handlingRate = term.handlingRateTph ?? Math.round((term.handling_rate_mt_day || 0) / 24);

            return (
              <div key={term.id} className="piw-terminal-card">
                <div className="piw-terminal-card-top">
                  <div>
                    <h4 className="piw-terminal-title">{term.name}</h4>
                    <span className="piw-terminal-type-tag">
                      {term.terminalType || term.terminal_type}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`piw-occupancy-badge ${isNearFull ? 'high' : 'normal'}`}>
                      {occupancyPct}%
                    </span>
                  </div>
                </div>

                {/* Berth Bar */}
                <div className="piw-occupancy-progress-wrap">
                  <div className="piw-occupancy-labels">
                    <span>Berth Occupancy</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#ffffff', fontWeight: 600 }}>
                      {occupied} / {total} active
                    </span>
                  </div>
                  <div className="piw-progress-track">
                    <div
                      className="piw-progress-fill"
                      style={{
                        width: `${occupancyPct}%`,
                        background: isNearFull
                          ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
                          : 'linear-gradient(90deg, #0284c7 0%, #00d8ff 100%)',
                      }}
                    />
                  </div>
                </div>

                {/* Technical Specs 3-Column */}
                <div className="piw-specs-3col">
                  <div className="piw-spec-unit">
                    <span className="piw-spec-unit-label">Max Draft</span>
                    <span className="piw-spec-unit-value">{maxDraft} m</span>
                  </div>
                  <div className="piw-spec-unit">
                    <span className="piw-spec-unit-label">Max LOA</span>
                    <span className="piw-spec-unit-value">{maxLoa} m</span>
                  </div>
                  <div className="piw-spec-unit">
                    <span className="piw-spec-unit-label">Throughput</span>
                    <span className="piw-spec-unit-value" style={{ color: '#34d399' }}>
                      {handlingRate.toLocaleString()} TPH
                    </span>
                  </div>
                </div>

                {/* Active Vessels Berthed */}
                {term.activeVessels && term.activeVessels.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                      Currently Berthed:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {term.activeVessels.map((v, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            color: '#e2e8f0',
                            fontWeight: 500,
                          }}
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
      <div className="piw-card">
        <div className="piw-section-header-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="piw-section-heading">
            <Layers size={18} color="#818cf8" />
            <div>
              <span>Official Port Berthing Lineup & Queue</span>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 400 }}>
                Prioritized berthing sequence by Harbor Master & Terminal Operators
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Terminal Filter:</span>
            <select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
              aria-label="Filter lineups by terminal"
              className="piw-select-dropdown"
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

        <div className="piw-table-card">
          <div className="piw-table-wrapper">
            <table className="piw-table">
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>Seq</th>
                  <th>Vessel & IMO</th>
                  <th>Terminal & Berth</th>
                  <th>Cargo Details</th>
                  <th>Est. Berthing (ETB)</th>
                  <th>Est. Completion (ETC)</th>
                  <th>Est. Turnaround</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLineups.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No lineup records found for the selected terminal.
                    </td>
                  </tr>
                ) : (
                  filteredLineups.map((item) => (
                    <tr key={item.id}>
                      {/* Seq */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="piw-seq-badge">
                          {item.queue_sequence}
                        </span>
                      </td>

                      {/* Vessel */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.vessel_name}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                          IMO {item.imo}
                        </div>
                      </td>

                      {/* Terminal & Berth */}
                      <td>
                        <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{item.terminal_name}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                          {item.berth_name}
                        </div>
                      </td>

                      {/* Cargo */}
                      <td>
                        <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{item.cargo_type || item.cargo_desc}</div>
                        <div style={{ fontSize: '10.5px', color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                          {item.operation} {(item.cargo_quantity_mt ?? 0).toLocaleString()} MT
                        </div>
                      </td>

                      {/* ETB */}
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#ffffff', fontSize: '12px' }}>
                          {new Date(item.estimated_berthing).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                          {new Date(item.estimated_berthing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* ETC */}
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono, monospace)', color: '#cbd5e1', fontSize: '12px' }}>
                          {item.estimated_departure ? new Date(item.estimated_departure).toLocaleDateString() : 'N/A'}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                          {item.estimated_departure ? new Date(item.estimated_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Turnaround */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#818cf8', fontSize: '12.5px' }}>
                          {(item.estimated_turnaround_hours ?? 24).toFixed(0)} hrs
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'right' }}>
                        <span className="piw-status-badge piw-status-confirmed">
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
    </div>
  );
};
