/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Bunker Fuel Prices & EU ETS Carbon Compliance Section
 */

import { Fuel, Leaf } from 'lucide-react';
import type {
  VoyageCalculationRecord,
  VoyageEconomicsResult,
  BunkerFuelPrices,
  EmissionsConfig,
} from '../../../types/voyage-calculator';

interface VoyageBunkerEmissionsSectionProps {
  voyage: VoyageCalculationRecord;
  result: VoyageEconomicsResult;
  onUpdateFuelPrices: (prices: Partial<BunkerFuelPrices>) => void;
  onUpdateEmissionsConfig: (config: Partial<EmissionsConfig>) => void;
  onUpdateVoyage: (partial: Partial<VoyageCalculationRecord>) => void;
}

export const VoyageBunkerEmissionsSection: React.FC<VoyageBunkerEmissionsSectionProps> = ({
  voyage,
  result,
  onUpdateFuelPrices,
  onUpdateEmissionsConfig,
  onUpdateVoyage,
}) => {
  return (
    <div className="voyage-panel-card">
      <div className="voyage-panel-header">
        <div>
          <div className="voyage-panel-title">
            <Fuel size={17} style={{ color: 'var(--voyage-amber)' }} />
            <span>Bunker Consumption, Pricing & EU ETS Carbon Liabilities</span>
          </div>
          <p className="voyage-panel-desc">
            Audit benchmark bunker grades, port operations burn rates, and European Union Emission Trading System (EU ETS) compliance.
          </p>
        </div>
      </div>

      {/* Consumption & Emissions Summary Intelligence Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
            Sea Fuel Burn
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--voyage-amber)' }}>
            ${result.sea_fuel_cost_usd.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--voyage-text-secondary)', marginTop: '2px' }}>
            Steaming across {result.total_sea_days} days
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
            Port Fuel Burn
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--voyage-amber)' }}>
            ${result.port_fuel_cost_usd.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--voyage-text-secondary)', marginTop: '2px' }}>
            Operations over {result.total_port_days} days
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
            Total Fuel Consumed
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--voyage-text)' }}>
            {result.total_fuel_consumed_mt.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--voyage-text-muted)' }}>MT</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--voyage-text-secondary)', marginTop: '2px' }}>
            Combined voyage bunker consumption
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
            CO₂ Footprint
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--voyage-green)' }}>
            {result.co2_emissions_mt.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--voyage-text-muted)' }}>MT</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--voyage-text-secondary)', marginTop: '2px' }}>
            IMO MRV audited carbon volume
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--voyage-text-muted)', marginBottom: '4px' }}>
            EU ETS Liability
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: result.eu_ets_cost_usd > 0 ? 'var(--voyage-green)' : 'var(--voyage-text-muted)' }}>
            ${result.eu_ets_cost_usd.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--voyage-text-secondary)', marginTop: '2px' }}>
            Taxable: {result.ets_taxable_emissions_mt.toLocaleString()} MT CO₂
          </div>
        </div>
      </div>

      {/* Two-Column Configuration: Fuel Benchmark Prices & EU ETS Scope */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Column 1: Bunker Prices Matrix */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--voyage-border)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--voyage-amber)' }}>
              Bunker Benchmark Prices ($ / MT)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--voyage-text-muted)' }}>Global Port Averages</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                VLSFO 0.5% ($/MT)
              </label>
              <input
                type="number"
                className="voyage-dark-input"
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
                value={voyage.fuel_prices.vlsfo_usd_mt}
                onChange={(e) => onUpdateFuelPrices({ vlsfo_usd_mt: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                LSMGO (SECA) ($/MT)
              </label>
              <input
                type="number"
                className="voyage-dark-input"
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
                value={voyage.fuel_prices.lsmgo_usd_mt}
                onChange={(e) => onUpdateFuelPrices({ lsmgo_usd_mt: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                MGO 0.1% ($/MT)
              </label>
              <input
                type="number"
                className="voyage-dark-input"
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
                value={voyage.fuel_prices.mgo_usd_mt}
                onChange={(e) => onUpdateFuelPrices({ mgo_usd_mt: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                HFO 3.5% ($/MT)
              </label>
              <input
                type="number"
                className="voyage-dark-input"
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
                value={voyage.fuel_prices.hfo_usd_mt}
                onChange={(e) => onUpdateFuelPrices({ hfo_usd_mt: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px dashed var(--voyage-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Port Idle Burn (MT/day)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '34px', fontSize: '12px' }}
                  value={voyage.fuel_port_idle_mt_day}
                  onChange={(e) => onUpdateVoyage({ fuel_port_idle_mt_day: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Port Working Burn (MT/day)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="voyage-dark-input"
                  style={{ width: '100%', height: '34px', fontSize: '12px' }}
                  value={voyage.fuel_port_working_mt_day}
                  onChange={(e) => onUpdateVoyage({ fuel_port_working_mt_day: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: EU ETS Regulations & Scope */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface-secondary)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '10px',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--voyage-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={15} style={{ color: 'var(--voyage-green)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--voyage-green)' }}>
                EU ETS Carbon Compliance
              </span>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={voyage.emissions_config.eu_ets_enabled}
                onChange={(e) => onUpdateEmissionsConfig({ eu_ets_enabled: e.target.checked })}
              />
              <span style={{ fontWeight: 600, color: 'var(--voyage-text)' }}>Apply EU ETS</span>
            </label>
          </div>

          {voyage.emissions_config.eu_ets_enabled ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    EUA Price (€/MT)
                  </label>
                  <input
                    type="number"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                    value={voyage.emissions_config.eu_ets_price_eur_mt}
                    onChange={(e) => onUpdateEmissionsConfig({ eu_ets_price_eur_mt: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    EUR / USD Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="voyage-dark-input"
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                    value={voyage.emissions_config.eur_usd_rate}
                    onChange={(e) => onUpdateEmissionsConfig({ eur_usd_rate: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--voyage-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ETS Scope (%)
                  </label>
                  <select
                    className="voyage-dark-select"
                    style={{ width: '100%', height: '36px', fontSize: '12px' }}
                    value={voyage.emissions_config.eu_ets_scope_pct}
                    onChange={(e) => onUpdateEmissionsConfig({ eu_ets_scope_pct: Number(e.target.value) })}
                  >
                    <option value={50}>50% (Extra-EU)</option>
                    <option value={100}>100% (Intra-EU)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(6, 19, 33, 0.6)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  border: '1px solid var(--voyage-border)',
                  fontSize: '12px',
                  color: 'var(--voyage-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <div>
                  Current Carbon Allowance Cost: <strong style={{ color: 'var(--voyage-green)' }}>
                    ${(voyage.emissions_config.eu_ets_price_eur_mt * voyage.emissions_config.eur_usd_rate).toFixed(2)} / MT CO₂
                  </strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--voyage-text-muted)', marginTop: '3px' }}>
                  Scope applies 50% for voyages entering/exiting EU ports and 100% for passages between two EU member ports.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--voyage-text-muted)', fontSize: '12px' }}>
              EU ETS Compliance is currently disabled for this voyage fixture.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
