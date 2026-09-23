/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Economics, Financial Bridge & Commercial Waterfall
 */

import React from 'react';
import {
  DollarSign,
  Award,
  Clock,
  ArrowDownRight,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { VoyageCalculationRecord, VoyageEconomicsResult } from '../../../types/voyage-calculator';

interface VoyageEconomicsBreakdownProps {
  voyage: VoyageCalculationRecord;
  result: VoyageEconomicsResult;
}

export const VoyageEconomicsBreakdown: React.FC<VoyageEconomicsBreakdownProps> = ({ voyage, result }) => {
  const isProfitable = result.net_pnl_usd >= 0;
  const isTcePositive = result.tce_usd_day >= 0;

  const totalDays = result.total_voyage_days || 1;
  const seaDaysPct = Math.min(100, Math.max(0, Math.round((result.total_sea_days / totalDays) * 100)));
  const portDaysPct = 100 - seaDaysPct;

  // Waterfall steps calculation
  const totalRev = result.total_revenue_usd || 1;
  const otherExpenses = result.canal_costs_usd + result.eu_ets_cost_usd + result.extra_costs_usd;

  const waterfallSteps = [
    {
      label: 'Gross Revenue',
      amount: result.total_revenue_usd,
      isPositive: true,
      color: 'var(--voyage-cyan)',
      category: 'Revenue Stream',
      pct: 100,
    },
    {
      label: 'Commissions',
      amount: -result.total_commissions_usd,
      isPositive: false,
      color: 'var(--voyage-amber)',
      category: 'Address & Brokerage',
      pct: Math.round((result.total_commissions_usd / totalRev) * 100),
    },
    {
      label: 'Bunker Costs',
      amount: -result.total_fuel_cost_usd,
      isPositive: false,
      color: 'var(--voyage-amber)',
      category: 'Sea + Port Bunkers',
      pct: Math.round((result.total_fuel_cost_usd / totalRev) * 100),
    },
    {
      label: 'Port Disbursements',
      amount: -result.port_costs_usd,
      isPositive: false,
      color: 'var(--voyage-red)',
      category: 'Port Agency & Dues',
      pct: Math.round((result.port_costs_usd / totalRev) * 100),
    },
    ...(otherExpenses > 0
      ? [
          {
            label: 'Canal, ETS & Other',
            amount: -otherExpenses,
            isPositive: false,
            color: 'var(--voyage-red)',
            category: 'Canal / Carbon / Extras',
            pct: Math.round((otherExpenses / totalRev) * 100),
          },
        ]
      : []),
    ...(result.vessel_hire_cost_usd > 0
      ? [
          {
            label: 'Vessel Charter Hire',
            amount: -result.vessel_hire_cost_usd,
            isPositive: false,
            color: 'var(--voyage-red)',
            category: 'Daily Tonnage Hire',
            pct: Math.round((result.vessel_hire_cost_usd / totalRev) * 100),
          },
        ]
      : []),
    {
      label: 'Net Profit & Loss',
      amount: result.net_pnl_usd,
      isPositive: isProfitable,
      color: isProfitable ? 'var(--voyage-green)' : 'var(--voyage-red)',
      category: isProfitable ? 'Net Surplus' : 'Deficit Return',
      pct: Math.round((Math.abs(result.net_pnl_usd) / totalRev) * 100),
      isResult: true,
    },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Financial Analysis Section Header */}
      <div
        style={{
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--voyage-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--voyage-cyan)',
            }}
          >
            Commercial P&L
          </span>
          <span style={{ color: 'var(--voyage-border)' }}>•</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--voyage-text)' }}>
            Financial Waterfall & TCE Formula Transparency
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--voyage-text-secondary)', lineHeight: 1.4 }}>
          Transparent audit of revenue streams, voyage expenses, daily vessel hire and Time Charter Equivalent calculation.
        </p>
      </div>

      {/* Two-Column Grid: Left Financial Breakdown, Right Commercial Waterfall & TCE Formula */}
      <div className="voyage-financial-workspace-grid">
        {/* COLUMN 1: Financial Breakdown Statement */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '12px',
            padding: '22px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--voyage-border)',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--voyage-text)' }}>
              Financial Breakdown Statement (USD)
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--voyage-surface-secondary)',
                border: '1px solid var(--voyage-border)',
                color: 'var(--voyage-text-muted)',
              }}
            >
              Audited Fixture Ledger
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {/* Category: REVENUE */}
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--voyage-cyan)', marginTop: '4px' }}>
              Revenue Streams
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ color: 'var(--voyage-text-secondary)' }}>
                Gross Freight Revenue ({voyage.cargoes.length} parcel{voyage.cargoes.length > 1 ? 's' : ''}):
              </span>
              <span style={{ fontWeight: 600, color: 'var(--voyage-green)', textAlign: 'right' }}>
                +${result.gross_freight_revenue.toLocaleString()}
              </span>
            </div>

            {result.ballast_bonus_usd > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ color: 'var(--voyage-text-secondary)' }}>Ballast Bonus:</span>
                <span style={{ fontWeight: 600, color: 'var(--voyage-green)', textAlign: 'right' }}>
                  +${result.ballast_bonus_usd.toLocaleString()}
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                backgroundColor: 'var(--voyage-surface-secondary)',
                borderRadius: '6px',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                fontWeight: 700,
              }}
            >
              <span style={{ color: 'var(--voyage-text)' }}>TOTAL GROSS REVENUE:</span>
              <span style={{ color: 'var(--voyage-cyan)', fontSize: '14px', textAlign: 'right' }}>
                ${result.total_revenue_usd.toLocaleString()}
              </span>
            </div>

            {/* Category: VOYAGE EXPENSES */}
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--voyage-amber)', marginTop: '12px' }}>
              Operating & Voyage Expenses
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ color: 'var(--voyage-text-secondary)' }}>Address & Broker Commissions:</span>
              <span style={{ color: 'var(--voyage-amber)', textAlign: 'right', fontWeight: 500 }}>
                -${result.total_commissions_usd.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ color: 'var(--voyage-text-secondary)' }}>Sea Steaming Bunker Fuel:</span>
              <span style={{ color: 'var(--voyage-amber)', textAlign: 'right', fontWeight: 500 }}>
                -${result.sea_fuel_cost_usd.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ color: 'var(--voyage-text-secondary)' }}>Port Operations Bunker Fuel:</span>
              <span style={{ color: 'var(--voyage-amber)', textAlign: 'right', fontWeight: 500 }}>
                -${result.port_fuel_cost_usd.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ color: 'var(--voyage-text-secondary)' }}>Port Disbursements & Agency:</span>
              <span style={{ color: 'var(--voyage-red)', textAlign: 'right', fontWeight: 500 }}>
                -${result.port_costs_usd.toLocaleString()}
              </span>
            </div>

            {result.canal_costs_usd > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ color: 'var(--voyage-text-secondary)' }}>Canal Transit Tolls:</span>
                <span style={{ color: 'var(--voyage-red)', textAlign: 'right', fontWeight: 500 }}>
                  -${result.canal_costs_usd.toLocaleString()}
                </span>
              </div>
            )}

            {result.eu_ets_cost_usd > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ color: 'var(--voyage-text-secondary)' }}>EU ETS Carbon Compliance:</span>
                <span style={{ color: 'var(--voyage-red)', textAlign: 'right', fontWeight: 500 }}>
                  -${result.eu_ets_cost_usd.toLocaleString()}
                </span>
              </div>
            )}

            {result.extra_costs_usd > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ color: 'var(--voyage-text-secondary)' }}>Miscellaneous & Security Fees:</span>
                <span style={{ color: 'var(--voyage-red)', textAlign: 'right', fontWeight: 500 }}>
                  -${result.extra_costs_usd.toLocaleString()}
                </span>
              </div>
            )}

            {result.vessel_hire_cost_usd > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ color: 'var(--voyage-text-secondary)' }}>
                  Charter Hire (${voyage.daily_hire_usd.toLocaleString()} × {result.total_voyage_days}d):
                </span>
                <span style={{ color: 'var(--voyage-red)', textAlign: 'right', fontWeight: 500 }}>
                  -${result.vessel_hire_cost_usd.toLocaleString()}
                </span>
              </div>
            )}

            {/* Subtotal: Voyage Expenses */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderTop: '1px dashed var(--voyage-border)',
                fontWeight: 600,
                marginTop: '4px',
              }}
            >
              <span style={{ color: 'var(--voyage-text-secondary)' }}>Total Voyage Expenses:</span>
              <span style={{ color: 'var(--voyage-red)', textAlign: 'right' }}>
                -${result.total_voyage_costs_usd.toLocaleString()}
              </span>
            </div>

            {/* Final Bottom Line: Net P&L */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                marginTop: '10px',
                borderRadius: '8px',
                backgroundColor: isProfitable ? 'rgba(32, 201, 138, 0.1)' : 'rgba(255, 77, 85, 0.12)',
                border: `1px solid ${isProfitable ? 'rgba(32, 201, 138, 0.3)' : 'rgba(255, 77, 85, 0.35)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} style={{ color: isProfitable ? 'var(--voyage-green)' : 'var(--voyage-red)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--voyage-text)' }}>
                  NET PROFIT / LOSS (P&L):
                </span>
              </div>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: isProfitable ? 'var(--voyage-green)' : 'var(--voyage-red)',
                  textAlign: 'right',
                }}
              >
                {result.net_pnl_usd < 0 ? '-' : '+'}${Math.abs(result.net_pnl_usd).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Commercial Waterfall & TCE Formula Transparency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Commercial Waterfall Visualization */}
          <div
            style={{
              backgroundColor: 'var(--voyage-surface)',
              border: '1px solid var(--voyage-border)',
              borderRadius: '12px',
              padding: '22px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--voyage-border)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--voyage-text)' }}>
                Commercial Waterfall
              </span>
              <span style={{ fontSize: '11px', color: 'var(--voyage-text-muted)' }}>
                Revenue to Net Return Bridge
              </span>
            </div>

            {/* Waterfall Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {waterfallSteps.map((step, idx) => {
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {step.isResult ? (
                          step.isPositive ? (
                            <TrendingUp size={13} style={{ color: 'var(--voyage-green)' }} />
                          ) : (
                            <TrendingDown size={13} style={{ color: 'var(--voyage-red)' }} />
                          )
                        ) : (
                          <ArrowDownRight size={13} style={{ color: 'var(--voyage-text-muted)', opacity: 0.6 }} />
                        )}
                        <span style={{ fontWeight: step.isResult ? 700 : 500, color: step.isResult ? 'var(--voyage-text)' : 'var(--voyage-text-secondary)' }}>
                          {step.label}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--voyage-text-muted)' }}>
                          ({step.category})
                        </span>
                      </div>

                      <span style={{ fontWeight: 700, color: step.color, textAlign: 'right' }}>
                        {step.amount < 0 ? '-' : '+'}${Math.abs(step.amount).toLocaleString()}
                      </span>
                    </div>

                    {/* Step Visual Bar */}
                    <div
                      style={{
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--voyage-surface-secondary)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(8, step.pct))}%`,
                          backgroundColor: step.color,
                          borderRadius: '3px',
                          boxShadow: step.isResult ? `0 0 8px ${step.color}` : undefined,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TCE Calculation Formula Card */}
          <div
            style={{
              backgroundColor: 'var(--voyage-surface)',
              border: '1px solid var(--voyage-border)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Award size={16} style={{ color: 'var(--voyage-cyan)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--voyage-cyan)' }}>
                  TCE Calculation Formula
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 217, 255, 0.1)',
                  color: 'var(--voyage-cyan)',
                  fontWeight: 600,
                }}
              >
                Baltic Exchange Standard
              </span>
            </div>

            {/* Formula Block */}
            <div
              style={{
                backgroundColor: 'var(--voyage-surface-secondary)',
                border: '1px solid var(--voyage-border)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                lineHeight: 1.6,
                marginBottom: '10px',
              }}
            >
              <div style={{ color: 'var(--voyage-text-secondary)', marginBottom: '4px' }}>
                TCE = (Net Freight + Ballast Bonus - Voyage Costs ex Hire) ÷ Total Voyage Days
              </div>
              <div style={{ color: 'var(--voyage-text-muted)', fontSize: '11px', marginBottom: '6px' }}>
                TCE = (${result.net_freight_revenue.toLocaleString()} + ${result.ballast_bonus_usd.toLocaleString()} - ${result.voyage_costs_ex_hire_usd.toLocaleString()}) ÷ {result.total_voyage_days}d
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isTcePositive ? 'var(--voyage-green)' : 'var(--voyage-red)',
                  borderTop: '1px dashed var(--voyage-border)',
                  paddingTop: '6px',
                }}
              >
                <CheckCircle2 size={14} />
                <span>TCE = ${result.tce_usd_day.toLocaleString()} / day</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: 'var(--voyage-text-muted)', lineHeight: 1.4 }}>
              Normalizes voyage spot fixture earnings against period time charter markets by calculating net daily equivalent revenue after deducting all bunker, canal, and port disbursement costs.
            </p>
          </div>

          {/* Operational Duration Allocation Bar */}
          <div
            style={{
              backgroundColor: 'var(--voyage-surface)',
              border: '1px solid var(--voyage-border)',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} style={{ color: 'var(--voyage-cyan)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Voyage Time Allocation
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--voyage-text)' }}>
                {result.total_voyage_days} Total Days
              </span>
            </div>

            <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px', backgroundColor: 'var(--voyage-surface-secondary)' }}>
              <div
                style={{
                  width: `${seaDaysPct}%`,
                  backgroundColor: 'var(--voyage-cyan)',
                  transition: 'width 0.3s ease',
                }}
                title={`Sea Steaming: ${result.total_sea_days}d (${seaDaysPct}%)`}
              />
              <div
                style={{
                  width: `${portDaysPct}%`,
                  backgroundColor: 'var(--voyage-amber)',
                  transition: 'width 0.3s ease',
                }}
                title={`Port Operations: ${result.total_port_days}d (${portDaysPct}%)`}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--voyage-text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--voyage-cyan)' }} />
                Sea Steaming: <strong>{result.total_sea_days}d</strong> ({seaDaysPct}%)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--voyage-amber)' }} />
                Port Operations: <strong>{result.total_port_days}d</strong> ({portDaysPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
