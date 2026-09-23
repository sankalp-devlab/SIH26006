/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Calculator KPI Summary Strip
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Fuel,
  AlertTriangle,
  Award,
  Leaf,
} from 'lucide-react';
import type { VoyageEconomicsResult } from '../../../types/voyage-calculator';

interface VoyageKPISummaryProps {
  result: VoyageEconomicsResult;
  vesselDwt: number;
}

export const VoyageKPISummary: React.FC<VoyageKPISummaryProps> = ({ result, vesselDwt }) => {
  const isProfitable = result.net_pnl_usd >= 0;
  const isTcePositive = result.tce_usd_day >= 0;

  // Sea vs Port duration percentages for micro-progress bar
  const totalDays = result.total_voyage_days || 1;
  const seaDaysPct = Math.min(100, Math.max(0, Math.round((result.total_sea_days / totalDays) * 100)));
  const portDaysPct = 100 - seaDaysPct;

  // Revenue vs Expense ratio for gross revenue micro-visual
  const revenueRatio = result.total_revenue_usd > 0
    ? Math.min(100, Math.max(0, Math.round(((result.total_revenue_usd - result.total_commissions_usd) / result.total_revenue_usd) * 100)))
    : 100;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Overload Capacity Alert Banner */}
      {result.is_overloaded && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 77, 85, 0.12)',
            border: '1px solid var(--voyage-red)',
            color: 'var(--voyage-red)',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            CRITICAL CAPACITY OVERLOAD: Total allocated cargo ({result.total_allocated_cargo_mt.toLocaleString()} MT) exceeds vessel deadweight capacity ({vesselDwt.toLocaleString()} MT) by {(result.total_allocated_cargo_mt - vesselDwt).toLocaleString()} MT ({result.capacity_utilization_pct}%). Reduce parcel quantities.
          </span>
        </div>
      )}

      {/* 6 Hero KPI Metric Cards Grid — ALL SIX ON ONE ROW on desktop */}
      <div className="voyage-kpi-grid">
        {/* CARD 1: Time Charter Equivalent (TCE) */}
        <div className="voyage-kpi-card">
          <div className="voyage-kpi-top">
            <span className="voyage-kpi-label">Time Charter Equiv.</span>
            <div
              className="voyage-kpi-icon-wrap"
              style={{
                backgroundColor: isTcePositive ? 'rgba(32, 201, 138, 0.12)' : 'rgba(255, 77, 85, 0.12)',
                color: isTcePositive ? 'var(--voyage-green)' : 'var(--voyage-red)',
              }}
            >
              <Award size={15} />
            </div>
          </div>

          <div className="voyage-kpi-middle">
            <div
              className="voyage-kpi-value"
              style={{ color: isTcePositive ? 'var(--voyage-green)' : 'var(--voyage-red)' }}
            >
              ${result.tce_usd_day.toLocaleString()}
              <span className="voyage-kpi-unit">/ day</span>
            </div>
          </div>

          <div>
            <div className="voyage-kpi-bottom">
              <span>Net earnings over {result.total_voyage_days} days</span>
              {isTcePositive ? (
                <TrendingUp size={14} style={{ color: 'var(--voyage-green)', flexShrink: 0 }} />
              ) : (
                <TrendingDown size={14} style={{ color: 'var(--voyage-red)', flexShrink: 0 }} />
              )}
            </div>
            {/* Subtle trend progress indicator */}
            <div className="voyage-micro-progress">
              <div
                className="voyage-micro-progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(15, (result.tce_usd_day / 25000) * 100))}%`,
                  backgroundColor: isTcePositive ? 'var(--voyage-green)' : 'var(--voyage-red)',
                }}
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Net Profit & Loss */}
        <div
          className="voyage-kpi-card"
          style={{
            borderColor: isProfitable ? 'var(--voyage-border)' : 'rgba(255, 77, 85, 0.35)',
            boxShadow: isProfitable ? undefined : '0 0 16px rgba(255, 77, 85, 0.15)',
          }}
        >
          <div className="voyage-kpi-top">
            <span className="voyage-kpi-label">Net Profit & Loss</span>
            <div
              className="voyage-kpi-icon-wrap"
              style={{
                backgroundColor: isProfitable ? 'rgba(32, 201, 138, 0.12)' : 'rgba(255, 77, 85, 0.14)',
                color: isProfitable ? 'var(--voyage-green)' : 'var(--voyage-red)',
              }}
            >
              {isProfitable ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            </div>
          </div>

          <div className="voyage-kpi-middle">
            <div
              className="voyage-kpi-value"
              style={{ color: isProfitable ? 'var(--voyage-green)' : 'var(--voyage-red)' }}
            >
              {result.net_pnl_usd < 0 ? '-' : '+'}${Math.abs(result.net_pnl_usd).toLocaleString()}
            </div>
          </div>

          <div>
            <div className="voyage-kpi-bottom">
              <span style={{ color: isProfitable ? 'var(--voyage-green)' : 'var(--voyage-red)', fontWeight: 600 }}>
                {isProfitable ? 'Profitable Voyage' : 'Deficit / Negative Return'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--voyage-text-muted)' }}>
                ({result.daily_pnl_usd < 0 ? '-' : '+'}${Math.abs(result.daily_pnl_usd).toLocaleString()}/d)
              </span>
            </div>
            <div className="voyage-micro-progress">
              <div
                className="voyage-micro-progress-fill"
                style={{
                  width: '100%',
                  backgroundColor: isProfitable ? 'var(--voyage-green)' : 'var(--voyage-red)',
                }}
              />
            </div>
          </div>
        </div>

        {/* CARD 3: Gross Revenue */}
        <div className="voyage-kpi-card">
          <div className="voyage-kpi-top">
            <span className="voyage-kpi-label">Gross Revenue</span>
            <div
              className="voyage-kpi-icon-wrap"
              style={{
                backgroundColor: 'rgba(47, 140, 255, 0.12)',
                color: 'var(--voyage-blue)',
              }}
            >
              <DollarSign size={15} />
            </div>
          </div>

          <div className="voyage-kpi-middle">
            <div className="voyage-kpi-value" style={{ color: 'var(--voyage-text)' }}>
              ${result.total_revenue_usd.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="voyage-kpi-bottom">
              <span>Freight: ${result.gross_freight_revenue.toLocaleString()}</span>
              <span style={{ color: 'var(--voyage-amber)', fontSize: '11px' }}>
                Comm: -${result.total_commissions_usd.toLocaleString()}
              </span>
            </div>
            <div className="voyage-micro-progress">
              <div
                className="voyage-micro-progress-fill"
                style={{
                  width: `${revenueRatio}%`,
                  backgroundColor: 'var(--voyage-blue)',
                }}
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Voyage Duration */}
        <div className="voyage-kpi-card">
          <div className="voyage-kpi-top">
            <span className="voyage-kpi-label">Voyage Duration</span>
            <div
              className="voyage-kpi-icon-wrap"
              style={{
                backgroundColor: 'rgba(0, 217, 255, 0.12)',
                color: 'var(--voyage-cyan)',
              }}
            >
              <Clock size={15} />
            </div>
          </div>

          <div className="voyage-kpi-middle">
            <div className="voyage-kpi-value" style={{ color: 'var(--voyage-text)' }}>
              {result.total_voyage_days}
              <span className="voyage-kpi-unit">Days</span>
            </div>
          </div>

          <div>
            <div className="voyage-kpi-bottom">
              <span>{result.total_sea_days}d Sea</span>
              <span style={{ color: 'var(--voyage-amber)' }}>{result.total_port_days}d Port</span>
            </div>
            {/* Dual timeline progress: Sea (Cyan) + Port (Amber) */}
            <div className="voyage-micro-progress" style={{ display: 'flex' }}>
              <div
                style={{
                  width: `${seaDaysPct}%`,
                  backgroundColor: 'var(--voyage-cyan)',
                  height: '100%',
                }}
                title={`Sea Steaming: ${result.total_sea_days}d (${seaDaysPct}%)`}
              />
              <div
                style={{
                  width: `${portDaysPct}%`,
                  backgroundColor: 'var(--voyage-amber)',
                  height: '100%',
                }}
                title={`Port Operations: ${result.total_port_days}d (${portDaysPct}%)`}
              />
            </div>
          </div>
        </div>

        {/* CARD 5: Total Fuel Cost */}
        <div className="voyage-kpi-card">
          <div className="voyage-kpi-top">
            <span className="voyage-kpi-label">Total Fuel Cost</span>
            <div
              className="voyage-kpi-icon-wrap"
              style={{
                backgroundColor: 'rgba(255, 176, 32, 0.12)',
                color: 'var(--voyage-amber)',
              }}
            >
              <Fuel size={15} />
            </div>
          </div>

          <div className="voyage-kpi-middle">
            <div className="voyage-kpi-value" style={{ color: 'var(--voyage-amber)' }}>
              ${result.total_fuel_cost_usd.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="voyage-kpi-bottom">
              <span>{result.total_fuel_consumed_mt.toLocaleString()} MT Total</span>
              <span style={{ fontSize: '11px', color: 'var(--voyage-text-muted)' }}>
                {result.sea_fuel_cost_usd > 0 ? 'Sea + Port' : 'Port Only'}
              </span>
            </div>
            <div className="voyage-micro-progress">
              <div
                className="voyage-micro-progress-fill"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--voyage-amber)',
                }}
              />
            </div>
          </div>
        </div>

        {/* CARD 6: Carbon & EU ETS — Never drops alone! */}
        <div className="voyage-kpi-card">
          <div className="voyage-kpi-top">
            <span className="voyage-kpi-label">Carbon & EU ETS</span>
            <div
              className="voyage-kpi-icon-wrap"
              style={{
                backgroundColor: 'rgba(32, 201, 138, 0.12)',
                color: 'var(--voyage-green)',
              }}
            >
              <Leaf size={15} />
            </div>
          </div>

          <div className="voyage-kpi-middle">
            <div className="voyage-kpi-value" style={{ color: 'var(--voyage-text)' }}>
              {result.co2_emissions_mt.toLocaleString()}
              <span className="voyage-kpi-unit">MT CO₂</span>
            </div>
          </div>

          <div>
            <div className="voyage-kpi-bottom">
              <span style={{ color: result.eu_ets_cost_usd > 0 ? 'var(--voyage-green)' : 'var(--voyage-text-muted)' }}>
                {result.eu_ets_cost_usd > 0
                  ? `ETS: $${result.eu_ets_cost_usd.toLocaleString()}`
                  : 'ETS Non-applicable'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--voyage-text-muted)' }}>
                Taxable: {result.ets_taxable_emissions_mt.toLocaleString()} MT
              </span>
            </div>
            <div className="voyage-micro-progress">
              <div
                className="voyage-micro-progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(20, (result.co2_emissions_mt / 3000) * 100))}%`,
                  backgroundColor: 'var(--voyage-green)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
