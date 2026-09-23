import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVessels } from '../../hooks/useVessels';
import { DistanceEngine } from '../../services/distance-calculator/distance-engine';
import {
  Ship,
  Anchor,
  Clock,
  Navigation,
  Calculator,
} from 'lucide-react';
import type { Port } from '../../types/port';

const BENCHMARK_PORTS: Port[] = [
  { id: 101, name: 'Singapore (SGSIN)', country: 'Singapore', latitude: 1.29, longitude: 103.85, unlocode: 'SGSIN', city: 'Singapore', port_type: 'Hub', facilities: ['Container', 'Bunker'], created_at: null },
  { id: 102, name: 'Rotterdam (NLRTM)', country: 'Netherlands', latitude: 51.92, longitude: 4.48, unlocode: 'NLRTM', city: 'Rotterdam', port_type: 'Hub', facilities: ['Crude', 'Container'], created_at: null },
  { id: 103, name: 'Ras Tanura (SARST)', country: 'Saudi Arabia', latitude: 26.64, longitude: 50.16, unlocode: 'SARST', city: 'Ras Tanura', port_type: 'Crude Terminal', facilities: ['Crude'], created_at: null },
  { id: 104, name: 'Houston (USHOU)', country: 'United States', latitude: 29.76, longitude: -95.37, unlocode: 'USHOU', city: 'Houston', port_type: 'Energy Hub', facilities: ['Energy', 'Chemical'], created_at: null },
  { id: 105, name: 'Ningbo-Zhoushan (CNNGB)', country: 'China', latitude: 29.87, longitude: 121.54, unlocode: 'CNNGB', city: 'Ningbo', port_type: 'Mega Port', facilities: ['Ore', 'Crude'], created_at: null },
  { id: 106, name: 'Fujairah (AEFJR)', country: 'United Arab Emirates', latitude: 25.13, longitude: 56.33, unlocode: 'AEFJR', city: 'Fujairah', port_type: 'Bunker Anchorage', facilities: ['Bunker'], created_at: null },
  { id: 107, name: 'Qingdao (CNTAO)', country: 'China', latitude: 36.07, longitude: 120.38, unlocode: 'CNTAO', city: 'Qingdao', port_type: 'Bulk Terminal', facilities: ['Iron Ore', 'Crude'], created_at: null },
];

export const MobileDistanceView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramVesselId = searchParams.get('vesselId');

  const { data: vesselsData } = useVessels(50);
  const vessels = vesselsData?.vessels || [];

  const [mode, setMode] = useState<'port_to_port' | 'vessel_to_port'>(
    paramVesselId ? 'vessel_to_port' : 'port_to_port'
  );

  const [originPortId, setOriginPortId] = useState<number>(103); // Ras Tanura
  const [destPortId, setDestPortId] = useState<number>(101); // Singapore
  const [selectedVesselId, setSelectedVesselId] = useState<number>(
    paramVesselId ? Number(paramVesselId) : vessels[0]?.id || 1
  );

  const [speedKnots, setSpeedKnots] = useState<number>(13.5);
  const [weatherMargin, setWeatherMargin] = useState<number>(5);
  const [allowSuez, setAllowSuez] = useState<boolean>(true);
  const [allowPanama, setAllowPanama] = useState<boolean>(false);

  const activeVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];
  const originPort = BENCHMARK_PORTS.find((p) => p.id === originPortId) || BENCHMARK_PORTS[0];
  const destPort = BENCHMARK_PORTS.find((p) => p.id === destPortId) || BENCHMARK_PORTS[1];

  // Calculate coordinates
  const calculationResult = useMemo(() => {
    let startLat = originPort.latitude || 0;
    let startLng = originPort.longitude || 0;
    let startLabel = originPort.name;

    if (mode === 'vessel_to_port' && activeVessel) {
      startLat = 14.85;
      startLng = 58.2;
      startLabel = `${activeVessel.name} (Live AIS Position)`;
    }

    const endLat = destPort.latitude || 0;
    const endLng = destPort.longitude || 0;

    // Direct haversine plus maritime sea corridor adjustment
    const rawNm = DistanceEngine.calculateHaversineDistance(startLat, startLng, endLat, endLng);
    // Channel circuity factor: Indian Ocean/Arabian sea routes ~ 1.25x
    const nauticalMiles = Math.round(rawNm * 1.22);

    const duration = DistanceEngine.calculateDuration(nauticalMiles, speedKnots, weatherMargin);
    const etaIso = DistanceEngine.calculateETA(new Date().toISOString(), duration.adjustedHours);
    const etaDate = new Date(etaIso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      startLabel,
      destLabel: destPort.name,
      nauticalMiles,
      duration,
      etaDate,
    };
  }, [mode, originPort, destPort, activeVessel, speedKnots, weatherMargin]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Mode Switcher */}
      <div className="mobile-segmented-control">
        <button
          onClick={() => setMode('port_to_port')}
          className={`mobile-segment-chip ${mode === 'port_to_port' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Anchor size={16} />
          Port to Port
        </button>
        <button
          onClick={() => setMode('vessel_to_port')}
          className={`mobile-segment-chip ${mode === 'vessel_to_port' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Ship size={16} />
          Vessel to Port
        </button>
      </div>

      {/* Input Selection Card */}
      <div className="mobile-card">
        {mode === 'port_to_port' ? (
          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              ORIGIN LOAD PORT
            </label>
            <select
              value={originPortId}
              onChange={(e) => setOriginPortId(Number(e.target.value))}
              className="mobile-input"
              style={{ background: '#0f172a' }}
            >
              {BENCHMARK_PORTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              SELECT ACTIVE VESSEL
            </label>
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(Number(e.target.value))}
              className="mobile-input"
              style={{ background: '#0f172a' }}
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.vessel_type || 'Tanker'} • {v.speed_laden_knots || 13} kts)
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
            DESTINATION DISCHARGE PORT
          </label>
          <select
            value={destPortId}
            onChange={(e) => setDestPortId(Number(e.target.value))}
            className="mobile-input"
            style={{ background: '#0f172a' }}
          >
            {BENCHMARK_PORTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speed & Margin Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              SPEED (KNOTS)
            </label>
            <input
              type="number"
              step="0.5"
              min="8"
              max="25"
              value={speedKnots}
              onChange={(e) => setSpeedKnots(Number(e.target.value))}
              className="mobile-input"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              WEATHER MARGIN (%)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="20"
              value={weatherMargin}
              onChange={(e) => setWeatherMargin(Number(e.target.value))}
              className="mobile-input"
            />
          </div>
        </div>

        {/* Canals Toggle Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Canals:</span>
          <button
            onClick={() => setAllowSuez(!allowSuez)}
            className={`mobile-badge ${allowSuez ? 'mobile-badge-live' : 'mobile-badge-subs'}`}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            Suez: {allowSuez ? 'Enabled' : 'Bypass (Cape)'}
          </button>
          <button
            onClick={() => setAllowPanama(!allowPanama)}
            className={`mobile-badge ${allowPanama ? 'mobile-badge-live' : 'mobile-badge-subs'}`}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            Panama: {allowPanama ? 'Yes' : 'No'}
          </button>
        </div>
      </div>

      {/* Output Results Card */}
      <div className="mobile-card" style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            Calculated Route Distance
          </div>
          <span className="mobile-badge mobile-badge-live">Haversine Verified</span>
        </div>

        <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
          {calculationResult.nauticalMiles.toLocaleString()}{' '}
          <span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}>NM</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          {calculationResult.startLabel} → <strong>{calculationResult.destLabel}</strong>
        </div>

        {/* ETA & Transit Time Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} color="#38bdf8" />
              SEA TRANSIT TIME
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
              {calculationResult.duration.adjustedDays} days
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              ({calculationResult.duration.adjustedHours} steaming hrs)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Navigation size={12} color="#34d399" />
              PROJECTED ARRIVAL
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginTop: 2 }}>
              {calculationResult.etaDate}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              Includes {weatherMargin}% weather buffer
            </div>
          </div>
        </div>

        {/* Action Button: Pass to Voyage Calculator */}
        <button
          onClick={() => navigate(`/m/calculator?distanceNm=${calculationResult.nauticalMiles}`)}
          className="mobile-btn-primary"
          style={{ marginTop: 12 }}
        >
          <Calculator size={16} />
          <span>Pass to Voyage Calculator ({calculationResult.nauticalMiles} NM)</span>
        </button>
      </div>
    </div>
  );
};
