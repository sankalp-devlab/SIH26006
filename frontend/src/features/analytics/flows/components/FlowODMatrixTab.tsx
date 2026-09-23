/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Interactive Origin-Destination (OD) Matrix Heatmap Tab
 */

import { useState } from 'react';
import { Grid, Search, Info } from 'lucide-react';
import type { ODMatrixData, ODMatrixCell } from '../../../../types/trade-flows';

interface FlowODMatrixTabProps {
  odMatrix: ODMatrixData;
  groupBy: 'port' | 'country';
  onGroupByChange: (val: 'port' | 'country') => void;
  onSelectFlow: (flowId: string) => void;
}

export function FlowODMatrixTab({
  odMatrix,
  groupBy,
  onGroupByChange,
  onSelectFlow,
}: FlowODMatrixTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<ODMatrixCell | null>(null);

  const { origins, destinations, cells } = odMatrix;

  // Filter origins and destinations by search term
  const filteredOrigins = origins.filter((o) => o.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDestinations = destinations.filter((d) => d.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!origins || origins.length === 0 || !destinations || destinations.length === 0) {
    return (
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '3rem',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        No origin-destination matrix data matches the current filter settings.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Control Bar: Aggregation Switcher & Filter */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Grid size={18} style={{ color: '#38bdf8' }} />
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Bilateral Origin &times; Destination Flow Matrix
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Heat-scaled trade volume throughput across {origins.length} origins and {destinations.length} destinations.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Group By Selector */}
          <div
            style={{
              display: 'flex',
              background: '#1e293b',
              padding: '0.2rem',
              borderRadius: 6,
              border: '1px solid #334155',
            }}
          >
            <button
              type="button"
              onClick={() => onGroupByChange('port')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: groupBy === 'port' ? '#38bdf8' : 'transparent',
                color: groupBy === 'port' ? '#0f172a' : '#94a3b8',
              }}
            >
              Port Level
            </button>
            <button
              type="button"
              onClick={() => onGroupByChange('country')}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: groupBy === 'country' ? '#38bdf8' : 'transparent',
                color: groupBy === 'country' ? '#0f172a' : '#94a3b8',
              }}
            >
              Country Level
            </button>
          </div>

          {/* Quick Matrix Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search ports/countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.35rem 0.5rem 0.35rem 1.75rem',
                fontSize: '0.75rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: 6,
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* 2D Scrollable Matrix Table */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          overflowX: 'auto',
          padding: '1rem',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3, fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: '0.6rem 0.75rem',
                  background: '#1e293b',
                  color: '#94a3b8',
                  textAlign: 'left',
                  borderRadius: 6,
                  fontWeight: 600,
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                }}
              >
                Origin (Export) &darr; / Dest (Import) &rarr;
              </th>
              {filteredDestinations.map((dest) => (
                <th
                  key={dest}
                  style={{
                    padding: '0.6rem 0.5rem',
                    background: '#1e293b',
                    color: '#f8fafc',
                    textAlign: 'center',
                    borderRadius: 6,
                    fontWeight: 600,
                    minWidth: 100,
                    whiteSpace: 'nowrap',
                  }}
                  title={dest}
                >
                  {dest}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrigins.map((orig) => (
              <tr key={orig}>
                <td
                  style={{
                    padding: '0.6rem 0.75rem',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontWeight: 600,
                    borderRadius: 6,
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {orig}
                </td>
                {filteredDestinations.map((dest) => {
                  const key = `${orig}:::${dest}`;
                  const cell = cells[key];

                  if (!cell || cell.volume_mt === 0) {
                    return (
                      <td
                        key={dest}
                        style={{
                          textAlign: 'center',
                          color: '#475569',
                          background: 'rgba(30, 41, 59, 0.4)',
                          borderRadius: 4,
                          padding: '0.5rem',
                        }}
                      >
                        -
                      </td>
                    );
                  }

                  const heat = cell.heat_intensity;
                  // Dynamic background from deep blue to bright cyan based on heat
                  const bg = `rgba(56, 189, 248, ${Math.max(0.18, heat * 0.85)})`;
                  const textColor = heat > 0.5 ? '#0f172a' : '#f8fafc';

                  return (
                    <td
                      key={dest}
                      onClick={() => {
                        setSelectedCell(cell);
                        if (cell.flow_ids && cell.flow_ids[0]) {
                          onSelectFlow(cell.flow_ids[0]);
                        }
                      }}
                      style={{
                        textAlign: 'center',
                        background: bg,
                        color: textColor,
                        fontWeight: 700,
                        borderRadius: 4,
                        padding: '0.5rem',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                      }}
                      title={`${orig} -> ${dest}: ${cell.volume_formatted} (${cell.voyages_count} voyages, ${cell.dominant_commodity}) - Click to inspect flow`}
                    >
                      <div>{cell.volume_formatted}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 500 }}>
                        {cell.voyages_count} voy
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drill-down Quick Preview when a cell is clicked */}
      {selectedCell && (
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} style={{ color: '#38bdf8' }} />
            <span>
              Selected Corridor:{' '}
              <strong style={{ color: '#38bdf8' }}>
                {selectedCell.origin_key} &rarr; {selectedCell.destination_key}
              </strong>
            </span>
            <span style={{ color: '#94a3b8' }}>• Dominant: {selectedCell.dominant_commodity}</span>
            <span style={{ color: '#94a3b8' }}>• Volume: {selectedCell.volume_formatted}</span>
            <span style={{ color: '#94a3b8' }}>• Voyages: {selectedCell.voyages_count}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (selectedCell.flow_ids && selectedCell.flow_ids[0]) {
                onSelectFlow(selectedCell.flow_ids[0]);
              }
            }}
          >
            Open Full Flow Details &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
