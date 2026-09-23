/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator Input Section
 */

import { useState, useMemo } from 'react';
import {
  Gauge,
  CloudSun,
  Calendar,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import type {
  DistanceCalculationRecord,
  GeoCoordinate,
  RoutePreference,
} from '../../../types/distance-calculator';
import type { Port } from '../../../types/port';
import type { Vessel } from '../../../types/vessel';
import type { VesselPosition } from '../../../types/map';

interface DistanceInputSectionProps {
  record: DistanceCalculationRecord;
  ports: Port[];
  vessels: Vessel[];
  enrichedVessels: VesselPosition[];
  selectedVessel: Vessel | null;
  selectedVesselPosition: VesselPosition | null;
  onSetOriginPortId: (id: number) => void;
  onSetDestinationPortId: (id: number) => void;
  onSetOriginPoint: (pt: GeoCoordinate) => void;
  onSetVesselId: (id: number) => void;
  onSetSpeed: (knots: number) => void;
  onSetWeatherMargin: (pct: number) => void;
  onSetDepartureTime: (iso: string) => void;
  onSetPreference: (pref: RoutePreference) => void;
  onToggleAvoidPiracy: () => void;
  onToggleAllowSuez: () => void;
  onToggleAllowPanama: () => void;
  onToggleAllowKiel: () => void;
}

const OFFSHORE_PRESETS: GeoCoordinate[] = [
  { name: 'Off Gibraltar OPL', latitude: 36.1, longitude: -5.3 },
  { name: 'Arabian Sea OPL (Fujairah)', latitude: 25.2, longitude: 56.6 },
  { name: 'Singapore Eastern Anchorage', latitude: 1.28, longitude: 103.95 },
  { name: 'US Gulf Offshore Lightering', latitude: 28.1, longitude: -90.5 },
];

export function DistanceInputSection({
  record,
  ports,
  vessels,
  selectedVessel: _selectedVessel,
  selectedVesselPosition,
  onSetOriginPortId,
  onSetDestinationPortId,
  onSetOriginPoint,
  onSetVesselId,
  onSetSpeed,
  onSetWeatherMargin,
  onSetDepartureTime,
  onSetPreference,
  onToggleAvoidPiracy,
  onToggleAllowSuez,
  onToggleAllowPanama,
  onToggleAllowKiel,
}: DistanceInputSectionProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  // Filtered port lists
  const filteredOriginPorts = useMemo(() => {
    if (!originSearch) return ports.slice(0, 50);
    const q = originSearch.toLowerCase();
    return ports.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        (p.unlocode && p.unlocode.toLowerCase().includes(q))
    );
  }, [ports, originSearch]);

  const filteredDestPorts = useMemo(() => {
    if (!destSearch) return ports.slice(0, 50);
    const q = destSearch.toLowerCase();
    return ports.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        (p.unlocode && p.unlocode.toLowerCase().includes(q))
    );
  }, [ports, destSearch]);

  const currentOriginPort = ports.find((p) => p.id === record.origin_port_id);
  const currentDestPort = ports.find((p) => p.id === record.destination_port_id);

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
          Voyage Route & Parameters
        </h2>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {record.mode.replace(/_/g, ' ')}
        </span>
      </div>

      {/* --- ORIGIN SELECTOR --- */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
          ORIGIN {record.mode === 'vessel_to_port' ? '(LIVE VESSEL POSITION)' : record.mode === 'point_to_port' ? '(COORDINATES)' : '(DEPARTURE PORT)'}
        </label>

        {record.mode === 'port_to_port' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <input
                type="text"
                placeholder="Search origin port, country, code..."
                value={originSearch}
                onChange={(e) => setOriginSearch(e.target.value)}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={record.origin_port_id || ''}
              onChange={(e) => onSetOriginPortId(Number(e.target.value))}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '13px',
                color: '#f8fafc',
                outline: 'none',
              }}
            >
              {filteredOriginPorts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.country || 'Intl'}) {p.unlocode ? `[${p.unlocode}]` : ''}
                </option>
              ))}
            </select>
            {currentOriginPort && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '8px' }}>
                <span>Lat: {currentOriginPort.latitude?.toFixed(2)}°</span>
                <span>Lng: {currentOriginPort.longitude?.toFixed(2)}°</span>
                <span>UN/LOCODE: {currentOriginPort.unlocode || 'N/A'}</span>
              </div>
            )}
          </div>
        )}

        {record.mode === 'point_to_port' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Latitude (°N / °S)</label>
                <input
                  type="number"
                  step="0.01"
                  value={record.origin_point?.latitude ?? 36.1}
                  onChange={(e) =>
                    onSetOriginPoint({
                      name: record.origin_point?.name || 'Custom Point',
                      latitude: Number(e.target.value),
                      longitude: record.origin_point?.longitude ?? -5.3,
                    })
                  }
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Longitude (°E / °W)</label>
                <input
                  type="number"
                  step="0.01"
                  value={record.origin_point?.longitude ?? -5.3}
                  onChange={(e) =>
                    onSetOriginPoint({
                      name: record.origin_point?.name || 'Custom Point',
                      latitude: record.origin_point?.latitude ?? 36.1,
                      longitude: Number(e.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {OFFSHORE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onSetOriginPoint(preset)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '10px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {record.mode === 'vessel_to_port' && (
          <div>
            <select
              value={record.vessel_id || ''}
              onChange={(e) => onSetVesselId(Number(e.target.value))}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '13px',
                color: '#f8fafc',
                outline: 'none',
              }}
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.vessel_type || 'Vessel'} - {v.capacity_tons?.toLocaleString()} DWT)
                </option>
              ))}
            </select>

            {selectedVesselPosition && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginTop: '6px',
                  fontSize: '11px',
                  color: '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    AIS Position: <strong>{selectedVesselPosition.latitude.toFixed(2)}°N, {selectedVesselPosition.longitude.toFixed(2)}°E</strong>
                  </span>
                  <span style={{ color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>
                    ● {selectedVesselPosition.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Speed: {selectedVesselPosition.speed_knots} kn | Hdg: {selectedVesselPosition.heading}°</span>
                  <span>Draft: {selectedVesselPosition.draft_m}m</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- DESTINATION SELECTOR --- */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
          DESTINATION (DISCHARGE PORT)
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <input
            type="text"
            placeholder="Search destination port, country, code..."
            value={destSearch}
            onChange={(e) => setDestSearch(e.target.value)}
            style={{
              flex: 1,
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '12px',
              color: '#f8fafc',
              outline: 'none',
            }}
          />
        </div>
        <select
          value={record.destination_port_id || ''}
          onChange={(e) => onSetDestinationPortId(Number(e.target.value))}
          style={{
            width: '100%',
            background: '#0f172a',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '13px',
            color: '#f8fafc',
            outline: 'none',
          }}
        >
          {filteredDestPorts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.country || 'Intl'}) {p.unlocode ? `[${p.unlocode}]` : ''}
            </option>
          ))}
        </select>
        {currentDestPort && (
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '8px' }}>
            <span>Lat: {currentDestPort.latitude?.toFixed(2)}°</span>
            <span>Lng: {currentDestPort.longitude?.toFixed(2)}°</span>
            <span>UN/LOCODE: {currentDestPort.unlocode || 'N/A'}</span>
          </div>
        )}
      </div>

      {/* --- SPEED, WEATHER MARGIN & DEPARTURE --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {/* Speed */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
            <Gauge size={12} /> Speed (Knots)
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="30"
            value={record.speed_knots}
            onChange={(e) => onSetSpeed(Number(e.target.value))}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '13px',
              color: '#f8fafc',
            }}
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {[11.5, 13.5, 15.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSetSpeed(s)}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  color: record.speed_knots === s ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {s} kn
              </button>
            ))}
          </div>
        </div>

        {/* Sea Margin */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
            <CloudSun size={12} /> Sea Margin (%)
          </label>
          <input
            type="number"
            step="1"
            min="0"
            max="30"
            value={record.weather_margin_pct}
            onChange={(e) => onSetWeatherMargin(Number(e.target.value))}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '13px',
              color: '#f8fafc',
            }}
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {[0, 5, 10].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSetWeatherMargin(m)}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  color: record.weather_margin_pct === m ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                +{m}%
              </button>
            ))}
          </div>
        </div>

        {/* Departure Time */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
            <Calendar size={12} /> Departure (UTC)
          </label>
          <input
            type="datetime-local"
            value={record.departure_time ? record.departure_time.slice(0, 16) : ''}
            onChange={(e) => onSetDepartureTime(new Date(e.target.value).toISOString())}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '12px',
              color: '#f8fafc',
            }}
          />
        </div>
      </div>

      {/* --- ADVANCED ROUTING CONSTRAINTS ACCORDION --- */}
      <div
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          paddingTop: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} style={{ color: '#38bdf8' }} />
            Advanced Routing Constraints & Canals
          </span>
          {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isAdvancedOpen && (
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(10, 25, 47, 0.5)',
              padding: '12px',
              borderRadius: '8px',
            }}
          >
            {/* Preference */}
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Routing Preference
              </label>
              <select
                value={record.route_preference}
                onChange={(e) => onSetPreference(e.target.value as RoutePreference)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              >
                <option value="shortest">Shortest / Direct Navigation Corridors</option>
                <option value="avoid_piracy">Piracy Avoidance (Cape of Good Hope)</option>
                <option value="avoid_seca">SECA Minimization (Fuel Cost)</option>
              </select>
            </div>

            {/* Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={record.avoid_piracy}
                  onChange={onToggleAvoidPiracy}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldAlert size={13} style={{ color: '#f87171' }} /> Avoid Piracy Zones
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={record.allow_suez}
                  onChange={onToggleAllowSuez}
                />
                <span>Allow Suez Canal ($320k)</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={record.allow_panama}
                  onChange={onToggleAllowPanama}
                />
                <span>Allow Panama Canal ($260k)</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={record.allow_kiel}
                  onChange={onToggleAllowKiel}
                />
                <span>Allow Kiel Canal ($15k)</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
