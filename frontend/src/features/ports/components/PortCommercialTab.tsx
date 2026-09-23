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
        // usually proportional to GRT
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
    <div className="space-y-6">
      {/* 1. Top Section: Live Bunker Fuel Pricing */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-slate-100">
                Marine Bunker Prices & Fuel Availability
              </h3>
              <p className="text-xs text-slate-400">
                Indicative delivered bunker quotations (USD / MT) at {portName}
              </p>
            </div>
          </div>

          <Link
            to={`/voyage-calculator?originPort=${encodeURIComponent(portName)}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <Calculator className="h-3.5 w-3.5" />
            Apply to Voyage Calculator
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bunkerPrices.map((bunker) => {
            const grade = bunker.fuel_grade || bunker.fuel_type;
            const avail = bunker.availability || (bunker.is_live ? 'AVAILABLE' : 'LIMITED');
            const price = bunker.price_per_mt_usd ?? bunker.price_usd_mt;
            const changePct = bunker.change_pct ?? (bunker.delta_usd || 0);

            return (
              <div
                key={bunker.id || bunker.fuel_type}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-slate-200">
                    {grade}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      avail === 'AVAILABLE'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : avail === 'LIMITED'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                    }`}
                  >
                    {avail}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-100">
                    ${price.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-400">/ MT</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2.5 border-t border-slate-800/60">
                  <span>Supplier: {bunker.supplier || bunker.source}</span>
                  {changePct !== 0 ? (
                    <span
                      className={`flex items-center font-mono font-medium ${
                        changePct < 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {changePct < 0 ? (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      )}
                      {Math.abs(changePct)}%
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono">0.0%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bottom Grid: Port Tariffs Table + Interactive DA Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Port Tariff Schedule (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-slate-100">
                Official Port Tariff & Dues Schedule
              </h3>
            </div>
            <span className="text-xs text-slate-400">Standard Port Authority Tariff</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Charge Item</th>
                  <th className="py-2.5 px-3">Tariff Basis / Rule</th>
                  <th className="py-2.5 px-3">Applicability</th>
                  <th className="py-2.5 px-3 text-right">Standard Rate (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {portCosts.map((cost) => {
                  const mandatory = cost.mandatory ?? true;
                  const standardAmount = cost.standard_amount_usd ?? cost.rate_usd;

                  return (
                    <tr key={cost.id || cost.item_name} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-medium text-slate-100">
                        {cost.item_name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {cost.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{cost.basis}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            mandatory
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-800/50 text-slate-400'
                          }`}
                        >
                          {mandatory ? 'Mandatory' : 'Conditional'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-100">
                        ${standardAmount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive DA Simulator (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold text-slate-100">Disbursement Account (DA) Estimator</h3>
              </div>
              <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                SIMULATOR
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Estimate proforma port call disbursement expenses based on vessel dimensions and stay duration.
            </p>

            {/* Inputs */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Vessel Gross Tonnage (GRT)</span>
                  <span className="font-mono font-semibold text-cyan-400">
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
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Port Stay (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={stayDays}
                    onChange={(e) => setStayDays(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-slate-700 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tug Assist Movements</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={tugMoves}
                    onChange={(e) => setTugMoves(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-slate-700 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Port & Channel Dues:</span>
                <span className="font-mono text-slate-200">${daEstimate.portDues.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pilotage (In/Out):</span>
                <span className="font-mono text-slate-200">${daEstimate.pilotage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Towage Assistance ({tugMoves} tugs):</span>
                <span className="font-mono text-slate-200">${daEstimate.towage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Berth Hire ({stayDays} days):</span>
                <span className="font-mono text-slate-200">${daEstimate.berthHire.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Agency, Security & Sundries:</span>
                <span className="font-mono text-slate-200">${daEstimate.sundries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-2 text-sm">
                <span>Estimated Total DA:</span>
                <span className="font-mono text-emerald-400 text-base">
                  ${daEstimate.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Subject to final port authority invoice</span>
            <span className="text-slate-500 font-mono">USD currency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
