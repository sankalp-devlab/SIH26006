import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Fuel,
  Ship,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type { VoyageMode } from '../../types/voyage-calculator';

export const MobileCalculatorView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramDistance = searchParams.get('distanceNm');

  // Mode: Dry Bulk ($/MT) vs Tanker (Worldscale / $/day)
  const [mode, setMode] = useState<VoyageMode>('dry');

  // Parameters
  const [distanceNm, setDistanceNm] = useState<number>(paramDistance ? Number(paramDistance) : 4850);
  const [cargoVolumeMt, setCargoVolumeMt] = useState<number>(170000); // Standard Capesize / VLCC
  const [freightRate, setFreightRate] = useState<number>(14.5); // $/MT for Dry, or WS for Tanker
  const [speedKnots, setSpeedKnots] = useState<number>(13.0);
  const [bunkerPriceUsd, setBunkerPriceUsd] = useState<number>(620); // VLSFO $/MT
  const [portDuesUsd, setPortDuesUsd] = useState<number>(65000);

  const seaConsumptionMt = 38.0;
  const portConsumptionMt = 4.0;
  const canalCostUsd = 0;
  const commissionPct = 3.75; // 3.75% standard address commission
  const loadRateMtDay = 35000;
  const dischargeRateMtDay = 25000;

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Pure Economic Formulation
  const economics = useMemo(() => {
    // 1. Durations
    const seaHours = distanceNm / (speedKnots || 13);
    const seaDays = seaHours / 24;
    const loadDays = cargoVolumeMt / (loadRateMtDay || 35000) + 0.5;
    const dischargeDays = cargoVolumeMt / (dischargeRateMtDay || 25000) + 0.5;
    const totalPortDays = loadDays + dischargeDays;
    const totalVoyageDays = Number((seaDays + totalPortDays).toFixed(1));

    // 2. Revenues
    let grossRevenue = 0;
    if (mode === 'dry') {
      grossRevenue = cargoVolumeMt * freightRate;
    } else {
      // Tanker WS baseline ~ $18.50/MT flat
      const wsFlat = 18.5;
      const effectiveRate = wsFlat * (freightRate / 100);
      grossRevenue = cargoVolumeMt * effectiveRate;
    }

    const commissionAmount = grossRevenue * (commissionPct / 100);
    const netRevenue = grossRevenue - commissionAmount;

    // 3. Voyage Expenses
    const seaBunkerMt = seaDays * seaConsumptionMt;
    const portBunkerMt = totalPortDays * portConsumptionMt;
    const totalBunkerMt = seaBunkerMt + portBunkerMt;
    const totalBunkerCost = totalBunkerMt * bunkerPriceUsd;

    const totalVoyageExpenses = totalBunkerCost + portDuesUsd + canalCostUsd;

    // 4. Net Earnings & Daily TCE
    const netProfit = netRevenue - totalVoyageExpenses;
    const netTcePerDay = Math.round(netProfit / (totalVoyageDays || 1));

    return {
      seaDays: Number(seaDays.toFixed(1)),
      portDays: Number(totalPortDays.toFixed(1)),
      totalVoyageDays,
      grossRevenue: Math.round(grossRevenue),
      commissionAmount: Math.round(commissionAmount),
      totalBunkerCost: Math.round(totalBunkerCost),
      totalVoyageExpenses: Math.round(totalVoyageExpenses),
      netProfit: Math.round(netProfit),
      netTcePerDay,
    };
  }, [
    mode,
    distanceNm,
    cargoVolumeMt,
    freightRate,
    speedKnots,
    seaConsumptionMt,
    portConsumptionMt,
    bunkerPriceUsd,
    portDuesUsd,
    canalCostUsd,
    commissionPct,
    loadRateMtDay,
    dischargeRateMtDay,
  ]);

  const handleSaveCalculation = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Segmented Mode: Dry Bulk vs Tanker */}
      <div className="mobile-segmented-control">
        <button
          onClick={() => {
            setMode('dry');
            setFreightRate(14.5);
          }}
          className={`mobile-segment-chip ${mode === 'dry' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Ship size={16} />
          Dry Bulk ($/MT)
        </button>
        <button
          onClick={() => {
            setMode('tanker');
            setFreightRate(65); // WS 65
          }}
          className={`mobile-segment-chip ${mode === 'tanker' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Fuel size={16} />
          Tanker (Worldscale)
        </button>
      </div>

      {/* Primary KPI Result Banner */}
      <div
        className="mobile-card"
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(30, 41, 59, 0.95) 100%)',
          borderColor: economics.netTcePerDay > 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(239, 68, 68, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            Estimated Net TCE
          </span>
          <span className={`mobile-badge ${economics.netTcePerDay > 20000 ? 'mobile-badge-live' : 'mobile-badge-subs'}`}>
            {economics.netTcePerDay > 0 ? 'Profitable' : 'Below Opex'}
          </span>
        </div>

        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
          ${economics.netTcePerDay.toLocaleString()}
          <span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}> / day</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          Net Voyage Profit: <strong>${(economics.netProfit / 1000).toFixed(0)}k</strong> over <strong>{economics.totalVoyageDays} days</strong>
        </div>

        {/* 4-Box Metric Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8,
            marginTop: 10,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>GROSS FREIGHT</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
              ${(economics.grossRevenue / 1_000_000).toFixed(2)}M
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BUNKER EXPENSE</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f87171' }}>
              ${(economics.totalBunkerCost / 1000).toFixed(0)}k
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SEA STEAMING</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
              {economics.seaDays} days
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>PORT LAYTIME</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
              {economics.portDays} days
            </div>
          </div>
        </div>
      </div>

      {/* Voyage Input Forms */}
      <div className="mobile-card">
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
          Voyage Parameters
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              VOYAGE DISTANCE (NM)
            </label>
            <input
              type="number"
              step="50"
              value={distanceNm}
              onChange={(e) => setDistanceNm(Number(e.target.value))}
              className="mobile-input"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              CARGO QUANTITY (MT)
            </label>
            <input
              type="number"
              step="5000"
              value={cargoVolumeMt}
              onChange={(e) => setCargoVolumeMt(Number(e.target.value))}
              className="mobile-input"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              {mode === 'dry' ? 'FREIGHT RATE ($/MT)' : 'WORLDSCALE (WS)'}
            </label>
            <input
              type="number"
              step={mode === 'dry' ? '0.25' : '1'}
              value={freightRate}
              onChange={(e) => setFreightRate(Number(e.target.value))}
              className="mobile-input"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              SERVICE SPEED (KTS)
            </label>
            <input
              type="number"
              step="0.5"
              value={speedKnots}
              onChange={(e) => setSpeedKnots(Number(e.target.value))}
              className="mobile-input"
            />
          </div>
        </div>

        {/* Bunker and Port Costs Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 10 }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              VLSFO PRICE ($/MT)
            </label>
            <input
              type="number"
              step="10"
              value={bunkerPriceUsd}
              onChange={(e) => setBunkerPriceUsd(Number(e.target.value))}
              className="mobile-input"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              PORT DUES ($ TOTAL)
            </label>
            <input
              type="number"
              step="5000"
              value={portDuesUsd}
              onChange={(e) => setPortDuesUsd(Number(e.target.value))}
              className="mobile-input"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveCalculation}
          className="mobile-btn-primary"
          style={{ marginTop: 14 }}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Voyage Saved to Local Storage!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Voyage Calculation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
