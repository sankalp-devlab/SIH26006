import React, { useState } from 'react';
import {
  BrainCircuit,
  DollarSign,
  Fuel,
  Ship,
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Cpu,
  Layers,
  Scale,
  Calendar,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { MLCostPredictionResponse } from '../../../types/ml-cost';

interface MlCostPanelProps {
  prediction: MLCostPredictionResponse | null;
  isLoading: boolean;
  onPredict?: () => void;
}

export const MlCostPanel: React.FC<MlCostPanelProps> = ({
  prediction,
  isLoading,
  onPredict,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!prediction) return null;

  const isAvailable = prediction.prediction_status === 'available';

  const formatCurrency = (val: number | null | undefined, curr = 'USD') => {
    if (val === null || val === undefined) return 'Pricing Input Required';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-surface-alt)',
        borderRadius: '8px',
        border: '1px solid rgba(16, 185, 129, 0.35)', // Emerald/Teal accent for commercial economics
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Cpu size={12} />
              MODULE 16 • XGBOOST COST ENGINE
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: isAvailable
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
                color: isAvailable ? '#10b981' : '#fbbf24',
                border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {isAvailable ? 'ML Model Active' : 'Awaiting Empirical Data (Rule 33)'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Machine learning voyage expense forecasting evaluated against Module 12 baseline economics
          </div>
        </div>

        {onPredict && (
          <Button
            size="sm"
            variant="secondary"
            icon={<BrainCircuit size={13} />}
            disabled={isLoading}
            onClick={onPredict}
            style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            {isLoading ? 'Predicting...' : 'Re-run ML Cost'}
          </Button>
        )}
      </div>

      {/* Side-by-Side Comparison Hero Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '12px',
          padding: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: '1rem',
          alignItems: 'center',
        }}
      >
        {/* Module 12 Baseline Cost */}
        <div style={{ padding: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#00D9FF', fontWeight: 600 }}>
            <Scale size={13} />
            Module 12 Baseline (Deterministic)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-text-primary)' }}>
            {formatCurrency(prediction.baseline_cost, prediction.currency)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {prediction.baseline_fuel_cost !== null ? (
              <span>Fuel: {formatCurrency(prediction.baseline_fuel_cost, prediction.currency)} &middot; Hire: {formatCurrency(prediction.baseline_operating_cost, prediction.currency)}</span>
            ) : (
              <span>Physics fuel burn calculated &middot; Bunker rate scenario pending</span>
            )}
          </div>
        </div>

        {/* Divider / Delta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
            borderLeft: '1px solid var(--color-border-subtle)',
            borderRight: '1px solid var(--color-border-subtle)',
            minHeight: '60px',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700 }}>VARIANCE</span>
          {isAvailable && prediction.cost_difference_usd !== null ? (
            <div style={{ textAlign: 'center', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: prediction.cost_difference_usd > 0 ? '#ef4444' : '#10b981',
                }}
              >
                {prediction.cost_difference_usd > 0 ? '+' : ''}
                {formatCurrency(prediction.cost_difference_usd, prediction.currency)}
              </span>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                ({prediction.cost_difference_pct > 0 ? '+' : ''}{prediction.cost_difference_pct}%)
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
              Pending Data
            </span>
          )}
        </div>

        {/* Module 16 XGBoost ML Cost */}
        <div style={{ padding: '0.5rem', textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
            <BrainCircuit size={13} />
            Module 16 ML Prediction (XGBoost)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: isAvailable ? '#34d399' : 'var(--color-text-secondary)' }}>
            {isAvailable ? formatCurrency(prediction.ml_predicted_cost, prediction.currency) : 'Pending Model Data'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {isAvailable ? 'Empirically trained XGBoost regressor' : 'Halted per non-negotiable Rule 33'}
          </div>
        </div>
      </div>

      {/* Transparent Audit & Limitation Notice (Rule 33 Enforcement) */}
      {!isAvailable && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            marginBottom: '1rem',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
              Historical Voyage Dataset Audit Notice (Rule 33 Compliance)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
              {prediction.reason ||
                'Module 14 historical voyage dataset contains 0 completed records with actual settlement costs. In strict accordance with platform data integrity rules, model training on fabricated or synthetic data is strictly prohibited.'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              The complete reproducible training and feature extraction pipeline is ready. Once empirical voyage settlement logs are ingested, models will train automatically.
            </div>
          </div>
        </div>
      )}

      {/* Feature Engineering Explainability Accordion */}
      <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={13} color="#34d399" />
            Model Feature Vector & Pre-Voyage Explainability ({Object.keys(prediction.features_used || {}).length} Features)
          </span>
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDetails && (
          <div style={{ marginTop: '0.75rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
                fontSize: '11px',
              }}
            >
              {Object.entries(prediction.features_used || {}).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {typeof val === 'number' ? val.toLocaleString() : String(val)}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '4px',
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Algorithm: {prediction.model_metadata?.model_name || 'XGBoost Regressor (Scikit-Learn API)'}</span>
              <span>Evaluated: {new Date(prediction.predicted_at).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
