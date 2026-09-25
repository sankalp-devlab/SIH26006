/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights Commercial Tab (DA Tariffs & Bunker Prices)
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Fuel,
  Receipt,
  Calculator,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { PortCostItem, PortBunkerPrice } from '../../../types/port-insights';

interface PortCommercialTabProps {
  portCosts: PortCostItem[];
  bunkerPrices: PortBunkerPrice[];
  portName: string;
}

export const PortCommercialTab: React.FC<PortCommercialTabProps> = ({
  portCosts,
  bunkerPrices,
  portName,
}) => {
  // Interactive Disbursement Account (DA) Simulator
  const [vesselGrt, setVesselGrt] = useState<number>(45000);
  const [stayDays, setStayDays] = useState<number>(3);
  const [tugMoves, setTugMoves] = useState<number>(4);

  // Compute live estimated DA total
  const daEstimate = useMemo(() => {
    let portDues = 0;
    let pilotage = 0;
    let towage = 0;
    let berthHire = 0;
    let sundries = 0;

    portCosts.forEach((c) => {
      const cat = c.category.toLowerCase();
      const amount = c.standard_amount_usd ?? c.rate_usd;
      if (cat.includes('due') || cat.includes('channel')) {
        portDues += Math.round(amount * (vesselGrt / 40000));
      } else if (cat.includes('pilot')) {
        pilotage += Math.round(amount * (vesselGrt / 40000));
      } else if (cat.includes('tug') || cat.includes('tow')) {
        towage += Math.round(amount * (tugMoves / 2));
      } else if (cat.includes('berth')) {
        berthHire += Math.round(amount * stayDays);
      } else {
        sundries += amount;
      }
    });

    const total = portDues + pilotage + towage + berthHire + sundries;
    return {
      portDues,
      pilotage,
      towage,
      berthHire,
      sundries,
      total,
    };
  }, [portCosts, vesselGrt, stayDays, tugMoves]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Top Section: Live Bunker Fuel Pricing */}
      <div className="piw-card">
        <div className="piw-section-header-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="piw-section-heading">
            <Fuel size={18} color="#34d399" />
            <div>
              <span>Marine Bunker Prices & Fuel Availability</span>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 400 }}>
                Indicative delivered bunker quotations (USD / MT) at {portName}
              </p>
            </div>
          </div>

          <Link
            to={`/voyage-calculator?originPort=${encodeURIComponent(portName)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#34d399',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Calculator size={14} />
            <span>Apply to Voyage Calculator</span>
          </Link>
        </div>

        <div className="piw-bunkers-grid">
          {bunkerPrices.map((bunker) => {
            const grade = bunker.fuel_grade || bunker.fuel_type;
            const avail = bunker.availability || (bunker.is_live ? 'AVAILABLE' : 'LIMITED');
            const price = bunker.price_per_mt_usd ?? bunker.price_usd_mt;
            const changePct = bunker.change_pct ?? (bunker.delta_usd || 0);

            return (
              <div key={bunker.id || bunker.fuel_type} className="piw-bunker-card">
                <div>
                  <div className="piw-bunker-header">
                    <span className="piw-bunker-grade-title">{grade}</span>
                    <span
                      className={`piw-bunker-avail-badge ${
                        avail === 'AVAILABLE' ? 'avail' : 'limited'
                      }`}
                    >
                      {avail}
                    </span>
                  </div>

                  <div className="piw-bunker-price-row">
                    <span className="piw-bunker-price-val">${price.toFixed(0)}</span>
                    <span className="piw-bunker-price-unit">/ MT</span>
                  </div>
                </div>

                <div>
                  {changePct !== 0 ? (
                    <span
                      className="piw-bunker-delta-tag"
                      style={{ color: changePct < 0 ? '#34d399' : '#f87171' }}
                    >
                      {changePct < 0 ? (
                        <TrendingDown size={14} />
                      ) : (
                        <TrendingUp size={14} />
                      )}
                      <span>{Math.abs(changePct)}% vs 7d Mean</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                      0.0% vs Mean
                    </span>
                  )}
                  <div className="piw-bunker-supplier-name">
                    Supplier: {bunker.supplier || bunker.source || 'Platts Benchmark'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bottom Grid: Port Tariffs Table + Interactive DA Calculator */}
      <div className="piw-commercial-columns">
        {/* Left: Port Tariff Schedule */}
        <div className="piw-card">
          <div className="piw-section-header-row">
            <div className="piw-section-heading">
              <Receipt size={18} color="var(--ol-accent-light)" />
              <span>Official Port Tariff & Dues Schedule</span>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Standard Port Authority Tariff</span>
          </div>

          <div className="piw-table-card">
            <div className="piw-table-wrapper">
              <table className="piw-table">
                <thead>
                  <tr>
                    <th>Charge Item</th>
                    <th>Tariff Basis / Rule</th>
                    <th>Applicability</th>
                    <th style={{ textAlign: 'right' }}>Standard Rate (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {portCosts.map((cost) => {
                    const mandatory = cost.mandatory ?? true;
                    const standardAmount = cost.standard_amount_usd ?? cost.rate_usd;

                    return (
                      <tr key={cost.id || cost.item_name}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{cost.item_name}</div>
                          <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                            {cost.category}
                          </span>
                        </td>
                        <td style={{ color: '#cbd5e1' }}>{cost.basis}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: mandatory ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                              color: mandatory ? '#38bdf8' : '#94a3b8',
                              border: mandatory ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {mandatory ? 'Mandatory' : 'Conditional'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#ffffff' }}>
                          ${standardAmount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Interactive DA Simulator */}
        <div className="piw-da-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="#818cf8" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Disbursement Account (DA) Estimator
              </h3>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                background: 'rgba(129, 140, 248, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.35)',
                color: '#818cf8',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              SIMULATOR
            </span>
          </div>

          <p style={{ fontSize: '11.5px', color: '#94a3b8', marginBottom: '16px' }}>
            Estimate proforma port call disbursement expenses based on vessel dimensions and stay duration.
          </p>

          {/* Inputs */}
          <div className="piw-da-input-group">
            <div className="piw-da-input-label">
              <span>Vessel Gross Tonnage (GRT)</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#00d8ff' }}>
                {vesselGrt.toLocaleString()} GRT
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={160000}
              step={5000}
              value={vesselGrt}
              onChange={(e) => setVesselGrt(Number(e.target.value))}
              className="piw-da-range-slider"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Port Stay (Days)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={stayDays}
                onChange={(e) => setStayDays(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  height: '34px',
                  background: '#050e1a',
                  border: '1px solid rgba(80, 180, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '0 8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Tug Assist Moves
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={tugMoves}
                onChange={(e) => setTugMoves(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  height: '34px',
                  background: '#050e1a',
                  border: '1px solid rgba(80, 180, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '0 8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Cost Breakdown */}
          <div style={{ background: '#050e1a', border: '1px solid rgba(80, 180, 255, 0.12)', borderRadius: '8px', padding: '12px' }}>
            <div className="piw-da-breakdown-row">
              <span>Port & Channel Dues:</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>${daEstimate.portDues.toLocaleString()}</span>
            </div>
            <div className="piw-da-breakdown-row">
              <span>Pilotage (In / Out):</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>${daEstimate.pilotage.toLocaleString()}</span>
            </div>
            <div className="piw-da-breakdown-row">
              <span>Towage Assistance ({tugMoves} tugs):</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>${daEstimate.towage.toLocaleString()}</span>
            </div>
            <div className="piw-da-breakdown-row">
              <span>Berth Hire ({stayDays} days):</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>${daEstimate.berthHire.toLocaleString()}</span>
            </div>
            <div className="piw-da-breakdown-row" style={{ borderBottom: 'none' }}>
              <span>Agency, Security & Sundries:</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>${daEstimate.sundries.toLocaleString()}</span>
            </div>
          </div>

          <div className="piw-da-total-box">
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estimated Total DA Proforma
            </span>
            <div className="piw-da-total-val">
              ${daEstimate.total.toLocaleString()} USD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
