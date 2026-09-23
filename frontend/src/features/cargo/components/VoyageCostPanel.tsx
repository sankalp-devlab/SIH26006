import React, { useState } from 'react';
import {
  DollarSign,
  Fuel,
  Ship,
  Anchor,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { CostCalculationResponse } from '../../../types/cost';

interface VoyageCostPanelProps {
  cost: CostCalculationResponse | null;
  isLoading: boolean;
  onRecalculateWithScenario?: (bunkerPrice?: number, dailyHire?: number) => void;
}

export const VoyageCostPanel: React.FC<VoyageCostPanelProps> = ({
  cost,
  isLoading,
  onRecalculateWithScenario,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [scenarioBunkerPrice, setScenarioBunkerPrice] = useState<string>('620');
  const [scenarioDailyHire, setScenarioDailyHire] = useState<string>('9500');

  if (!cost) return null;

  const handleApplyScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRecalculateWithScenario) {
      const p = scenarioBunkerPrice ? parseFloat(scenarioBunkerPrice) : undefined;
      const h = scenarioDailyHire ? parseFloat(scenarioDailyHire) : undefined;
      onRecalculateWithScenario(p, h);
    }
  };

  const handleResetToAuthoritative = () => {
    setScenarioBunkerPrice('');
    setScenarioDailyHire('');
    if (onRecalculateWithScenario) {
      onRecalculateWithScenario(undefined, undefined);
    }
  };

  const hasPricedComponents = cost.total_cost !== null && cost.total_cost > 0;

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-surface-alt)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 217, 255, 0.25)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 217, 255, 0.12)',
                color: '#00D9FF',
                border: '1px solid rgba(0, 217, 255, 0.3)',
              }}
            >
              MODULE 12 • COST CALCULATION
            </span>
            <span
              className="badge"
              style={{
                backgroundColor:
                  cost.cost_status === 'complete'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                color: cost.cost_status === 'complete' ? '#10b981' : '#f59e0b',
                border: `1px solid ${cost.cost_status === 'complete' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {cost.cost_status === 'complete' ? 'Complete Cost' : 'Partial Cost'}
            </span>
          </div>
          <h3 style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Authoritative Voyage Cost Evaluation
          </h3>
        </div>

        <Button
          size="sm"
          variant="ghost"
          icon={<Sliders size={13} />}
          onClick={() => setShowScenario(!showScenario)}
          title="Toggle Bunker & Hire Sensitivity Quotes"
        >
          {showScenario ? 'Hide Scenario' : 'Simulate Quote'}
        </Button>
      </div>

      {/* Hero Display: Total Estimated Cost */}
      <div
        style={{
          padding: '1rem',
          borderRadius: '6px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Voyage Cost
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: hasPricedComponents ? '#00D9FF' : '#94a3b8', lineHeight: 1.2 }}>
            {hasPricedComponents ? `$${cost.total_cost?.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Physical Metrics Only'}
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: '6px' }}>
              {cost.currency}
            </span>
          </div>

          {cost.cost_per_tonne !== null ? (
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
              ${cost.cost_per_tonne.toFixed(2)} / MT{' '}
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                (based on {cost.transit_metrics.cargo_weight_tons?.toLocaleString()} MT cargo weight)
              </span>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Total monetary rate unpriced in database &middot; Physical transit duration & fuel burn verified
            </div>
          )}
        </div>

        {/* Data Completeness Strip */}
        <div style={{ textAlign: 'right', maxWidth: '240px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Data Completeness
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
            <span style={{ color: cost.fuel_cost_status === 'calculated' ? '#10b981' : '#f59e0b' }}>
              {cost.fuel_cost_status === 'calculated' ? '✓ Fuel Cost available' : '⚠ Fuel Price unavailable'}
            </span>
            <span style={{ color: cost.operating_cost_status === 'calculated' ? '#10b981' : '#94a3b8' }}>
              {cost.operating_cost_status === 'calculated' ? '✓ Operating Cost available' : '○ Operating Cost unavailable'}
            </span>
            <span style={{ color: '#94a3b8' }}>
              ○ Port Tariffs unavailable
            </span>
          </div>
        </div>
      </div>

      {/* Cost Component Breakdown Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        {/* 1. Fuel Cost */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <Fuel size={13} color="#00D9FF" />
            <span>Fuel Cost</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: cost.fuel_cost ? 'var(--color-text-primary)' : 'var(--color-text-muted)', marginTop: '4px' }}>
            {cost.fuel_cost !== null ? `$${cost.fuel_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Unavailable'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {cost.transit_metrics.fuel_consumed_mt !== null
              ? `${cost.transit_metrics.fuel_consumed_mt.toLocaleString()} MT fuel burn`
              : 'Burn rate not in DB'}
          </div>
        </div>

        {/* 2. Vessel Operating Cost */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <Ship size={13} color="#8b5cf6" />
            <span>Operating Cost</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: cost.operating_cost ? 'var(--color-text-primary)' : 'var(--color-text-muted)', marginTop: '4px' }}>
            {cost.operating_cost !== null ? `$${cost.operating_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Unavailable'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {cost.transit_metrics.voyage_days} voyage days
          </div>
        </div>

        {/* 3. Port Tariffs */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <Anchor size={13} color="#10b981" />
            <span>Port Charges</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Unavailable
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Pub150 tariff omitted
          </div>
        </div>

        {/* 4. Other Verified Costs */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <HelpCircle size={13} color="#eab308" />
            <span>Canal / Other</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Unavailable
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            No tolls recorded
          </div>
        </div>
      </div>

      {/* Scenario Quote Simulation Form */}
      {showScenario && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(0, 217, 255, 0.04)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#00D9FF', marginBottom: '4px' }}>
            Bunker Stem & Charter Hire Sensitivity Simulation
          </div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            Authoritative database defaults remain strictly unpriced. Enter empirical broker quotes below to observe dynamic recalculation:
          </p>
          <form onSubmit={handleApplyScenario}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>
                  Bunker Quote ($/MT)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 620"
                  value={scenarioBunkerPrice}
                  onChange={(e) => setScenarioBunkerPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>
                  Vessel Hire Rate ($/day)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 9500"
                  value={scenarioDailyHire}
                  onChange={(e) => setScenarioDailyHire(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <Button type="submit" size="sm" variant="primary" icon={<RefreshCw size={12} />} disabled={isLoading}>
                  {isLoading ? 'Recalculating...' : 'Recalculate Cost'}
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={handleResetToAuthoritative}>
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Expandable Calculation Details Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
            color: 'var(--color-text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <span>View Calculation Details & Deterministic Mathematical Inputs</span>
          {showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showDetails && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem',
              borderRadius: '6px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Maritime Route Distance:</span>
                <div style={{ fontWeight: 600 }}>
                  {cost.transit_metrics.distance_nm.toLocaleString()} NM ({cost.transit_metrics.distance_km.toLocaleString()} km)
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Operational Vessel Speed:</span>
                <div style={{ fontWeight: 600 }}>
                  {cost.transit_metrics.speed_knots} knots ({cost.transit_metrics.speed_type})
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Voyage Transit Duration:</span>
                <div style={{ fontWeight: 600 }}>
                  {cost.transit_metrics.voyage_days} days ({cost.transit_metrics.voyage_hours} hrs)
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Fuel Consumption Rate:</span>
                <div style={{ fontWeight: 600 }}>
                  {cost.transit_metrics.fuel_rate_mt_day} MT / day
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Fuel Consumed:</span>
                <div style={{ fontWeight: 600, color: '#00D9FF' }}>
                  {cost.transit_metrics.fuel_consumed_mt?.toLocaleString()} Metric Tonnes
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Vessel Capacity Utilization:</span>
                <div style={{ fontWeight: 600 }}>
                  {cost.transit_metrics.capacity_utilization_pct !== null
                    ? `${cost.transit_metrics.capacity_utilization_pct}%`
                    : 'Unspecified'}
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)', fontSize: '10px' }}>
              <div>
                <strong>Formulas Applied:</strong>
              </div>
              <div>&bull; Voyage Days = Route Distance (NM) / (Vessel Speed × 24) = {cost.transit_metrics.distance_nm} / ({cost.transit_metrics.speed_knots} × 24) = {cost.transit_metrics.voyage_days} days</div>
              <div>&bull; Fuel Consumed = Voyage Days × Daily Burn Rate = {cost.transit_metrics.voyage_days} × {cost.transit_metrics.fuel_rate_mt_day} = {cost.transit_metrics.fuel_consumed_mt} MT</div>
              {cost.fuel_cost !== null && (
                <div>&bull; Fuel Cost = Fuel Consumed × Bunker Price = {cost.fuel_cost_details.formula}</div>
              )}
              {cost.operating_cost !== null && (
                <div>&bull; Operating Cost = Voyage Days × Daily Hire = {cost.operating_cost_details.formula}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
