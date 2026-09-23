/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Scenario Comparison Matrix (Base vs Optimistic vs Pessimistic)
 */

import React from 'react';
import { Sliders, TrendingUp, TrendingDown, Check } from 'lucide-react';
import type {
  VoyageCalculationRecord,
  VoyageEconomicsResult,
} from '../../../types/voyage-calculator';

interface VoyageScenarioComparisonProps {
  voyage: VoyageCalculationRecord;
  scenarioResults: Record<string, VoyageEconomicsResult>;
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
}

export const VoyageScenarioComparison: React.FC<VoyageScenarioComparisonProps> = ({
  voyage,
  scenarioResults,
  activeScenarioId,
  onSelectScenario,
}) => {
  const baseResult = scenarioResults['sc-base'] || Object.values(scenarioResults)[0];

  return (
    <div className="voyage-panel-card">
      <div className="voyage-panel-header">
        <div>
          <div className="voyage-panel-title">
            <Sliders size={17} style={{ color: 'var(--voyage-cyan)' }} />
            <span>Scenario Matrix & Comparative Sensitivity Analysis</span>
          </div>
          <p className="voyage-panel-desc">
            Evaluate market volatility, weather delays, and fuel price swings side-by-side without mutating your base voyage fixture.
          </p>
        </div>
      </div>

      {/* Scenarios Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${voyage.scenarios.length}, minmax(220px, 1fr))`,
          gap: '14px',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {voyage.scenarios.map((sc) => {
          const res = scenarioResults[sc.id];
          const isActive = activeScenarioId === sc.id;
          if (!res) return null;

          const tceDiff = res.tce_usd_day - (baseResult?.tce_usd_day || 0);

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              style={{
                backgroundColor: isActive ? 'rgba(0, 217, 255, 0.08)' : 'var(--voyage-surface-secondary)',
                border: `1.5px solid ${isActive ? 'var(--voyage-cyan)' : 'var(--voyage-border)'}`,
                boxShadow: isActive ? '0 0 16px rgba(0, 217, 255, 0.2)' : 'none',
                borderRadius: '10px',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: isActive ? 'var(--voyage-cyan)' : 'var(--voyage-text)' }}>
                  {sc.name}
                </span>
                {isActive && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 217, 255, 0.2)',
                      color: 'var(--voyage-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Check size={10} /> ACTIVE
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--voyage-text-secondary)', marginBottom: '12px', minHeight: '34px', lineHeight: 1.4 }}>
                {sc.description}
              </div>

              <div style={{ fontSize: '22px', fontWeight: 800, color: res.tce_usd_day >= 0 ? 'var(--voyage-green)' : 'var(--voyage-red)' }}>
                ${res.tce_usd_day.toLocaleString()}
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--voyage-text-secondary)', marginLeft: '4px' }}>
                  / day
                </span>
              </div>

              {sc.type !== 'base' && baseResult && (
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: tceDiff >= 0 ? 'var(--voyage-green)' : 'var(--voyage-red)',
                    marginTop: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {tceDiff >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  <span>{tceDiff >= 0 ? `+` : ``}${tceDiff.toLocaleString()} / day vs Base</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix Table */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--voyage-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--voyage-surface-secondary)', borderBottom: '1px solid var(--voyage-border)' }}>
              <th style={{ padding: '12px 16px', width: '220px', color: 'var(--voyage-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Key Commercial Metric
              </th>
              {voyage.scenarios.map((sc) => {
                const isActive = activeScenarioId === sc.id;
                return (
                  <th
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      color: isActive ? 'var(--voyage-cyan)' : 'var(--voyage-text)',
                      fontWeight: isActive ? 700 : 600,
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{sc.name}</span>
                      {isActive && <Check size={13} style={{ color: 'var(--voyage-cyan)' }} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--voyage-border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>TCE (USD / Day)</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                const isPos = (res?.tce_usd_day || 0) >= 0;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      fontWeight: 700,
                      color: isPos ? 'var(--voyage-green)' : 'var(--voyage-red)',
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    ${res ? res.tce_usd_day.toLocaleString() : '-'} / day
                  </td>
                );
              })}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--voyage-border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>Net Profit & Loss (P&L)</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                const isProf = (res?.net_pnl_usd || 0) >= 0;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      fontWeight: 700,
                      color: isProf ? 'var(--voyage-green)' : 'var(--voyage-red)',
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    ${res ? res.net_pnl_usd.toLocaleString() : '-'}
                  </td>
                );
              })}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--voyage-border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>Daily P&L Margin</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      color: 'var(--voyage-text-secondary)',
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    ${res ? res.daily_pnl_usd.toLocaleString() : '-'} / day
                  </td>
                );
              })}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--voyage-border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>Total Voyage Days</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      color: 'var(--voyage-text)',
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    {res ? `${res.total_voyage_days}d (${res.total_sea_days}s / ${res.total_port_days}p)` : '-'}
                  </td>
                );
              })}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--voyage-border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>Gross Revenue</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      color: 'var(--voyage-cyan)',
                      fontWeight: 600,
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    ${res ? res.total_revenue_usd.toLocaleString() : '-'}
                  </td>
                );
              })}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--voyage-border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>Total Bunker Cost</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      color: 'var(--voyage-amber)',
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    ${res ? res.total_fuel_cost_usd.toLocaleString() : '-'} ({res?.total_fuel_consumed_mt} MT)
                  </td>
                );
              })}
            </tr>

            <tr style={{ borderBottom: '1px solid var(--voyage-border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>Total Voyage Costs</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      color: 'var(--voyage-red)',
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    -${res ? res.total_voyage_costs_usd.toLocaleString() : '-'}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--voyage-text)' }}>EU ETS Liability</td>
              {voyage.scenarios.map((sc) => {
                const res = scenarioResults[sc.id];
                const isActive = activeScenarioId === sc.id;
                return (
                  <td
                    key={sc.id}
                    style={{
                      padding: '12px 16px',
                      color: (res?.eu_ets_cost_usd || 0) > 0 ? 'var(--voyage-green)' : 'var(--voyage-text-muted)',
                      backgroundColor: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined,
                      borderLeft: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                      borderRight: isActive ? '1px solid rgba(0, 217, 255, 0.3)' : undefined,
                    }}
                  >
                    ${res ? res.eu_ets_cost_usd.toLocaleString() : '-'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
