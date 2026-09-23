import React, { useState } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  Clock,
  Navigation,
  Gauge,
  Calendar,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { MLEtaPredictionResponse } from '../../../types/ml-eta';

interface MlEtaPanelProps {
  prediction: MLEtaPredictionResponse | null;
  isLoading: boolean;
  onPredict?: () => void;
}

export const MlEtaPanel: React.FC<MlEtaPanelProps> = ({
  prediction,
  isLoading,
  onPredict,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!prediction) return null;

  const isAvailable = prediction.prediction_status === 'available';

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return { datePart: 'Pending', timePart: '', full: 'Pending' };
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
      return { datePart, timePart, full: `${datePart} ${timePart}` };
    } catch {
      return { datePart: isoString, timePart: '', full: isoString };
    }
  };

  const baselineArrival = formatDateTime(prediction.baseline_arrival);
  const predictedArrival = formatDateTime(prediction.predicted_arrival);

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-surface-alt)',
        borderRadius: '8px',
        border: '1px solid rgba(168, 85, 247, 0.35)', // Violet/Purple accent for ML/AI
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
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Cpu size={12} />
              MODULE 15 • XGBOOST ETA ENGINE
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: isAvailable
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.12)',
                color: isAvailable ? '#10b981' : '#f87171',
                border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {isAvailable ? 'ML Model v1.0 Available' : 'Data Audit Pending'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            First Machine Learning Prediction Module &middot; Non-Linear ETA Regression Pipeline
          </div>
        </div>

        {onPredict && (
          <Button
            size="sm"
            variant="secondary"
            icon={<BrainCircuit size={13} />}
            disabled={isLoading}
            onClick={onPredict}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            {isLoading ? 'Predicting...' : 'Re-run ML Prediction'}
          </Button>
        )}
      </div>

      {/* Comparison Grid: Baseline vs ML ETA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '1rem',
        }}
      >
        {/* Card 1: Module 13 Deterministic Baseline */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(11, 19, 43, 0.65)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 217, 255, 0.25)',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#00D9FF' }}>
            Model A: Baseline ETA (Module 13)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {baselineArrival.datePart}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            {baselineArrival.timePart}
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
            Duration: <strong style={{ color: '#38bdf8' }}>{prediction.baseline_duration_hours.toFixed(1)} hrs</strong> ({((prediction.baseline_duration_hours)/24.0).toFixed(1)} days)
          </div>
        </div>

        {/* Card 2: Module 15 XGBoost Prediction */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(24, 16, 43, 0.65)',
            borderRadius: '6px',
            border: `1px solid ${isAvailable ? 'rgba(168, 85, 247, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#c084fc' }}>
            Model B: XGBoost ETA (Module 15)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isAvailable ? '#ffffff' : '#f87171', marginTop: '4px' }}>
            {isAvailable ? predictedArrival.datePart : 'Unavailable'}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            {isAvailable ? predictedArrival.timePart : 'Training Halted (Rule 28)'}
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
            {isAvailable && prediction.predicted_duration_hours ? (
              <>
                Predicted: <strong style={{ color: '#c084fc' }}>{prediction.predicted_duration_hours.toFixed(1)} hrs</strong>
                {prediction.duration_delta_hours !== null && (
                  <span style={{ marginLeft: '8px', color: prediction.duration_delta_hours <= 0 ? '#10b981' : '#f59e0b' }}>
                    ({prediction.duration_delta_hours >= 0 ? `+${prediction.duration_delta_hours}` : prediction.duration_delta_hours}h vs Base)
                  </span>
                )}
              </>
            ) : (
              <span style={{ color: '#94a3b8' }}>
                Awaiting historical dataset upload
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Transparent Data Audit Notice */}
      {!isAvailable && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '6px',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#f87171' }}>Zero-Synthetic-Data Compliance (Rule 28):</strong>{' '}
            {prediction.status_reason}
          </div>
        </div>
      )}

      {/* Uncertainty Notice (Step 23) */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '6px',
          fontSize: '10.5px',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1rem',
        }}
      >
        <Info size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Statistical Calibration Notice:</strong> Prediction uncertainty intervals are not currently calibrated. The system does not fabricate speculative accuracy percentages without rigorous empirical cross-validation.
        </span>
      </div>

      {/* Accordion: View Features & Explainability Details */}
      <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.5rem' }}>
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
            padding: '6px 0',
            color: '#c084fc',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          <span>{showDetails ? 'Hide Feature Engineering & Model Details' : 'View Feature Engineering & Explainability Details (12 Features)'}</span>
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDetails && (
          <div
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: '6px',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Feature Vector Fed to XGBoost Regressor:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {Object.entries(prediction.features_used).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{key}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', marginTop: '2px' }}>
                    {typeof val === 'number' ? val.toLocaleString() : String(val)}
                  </div>
                </div>
              ))}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Algorithm</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>Extreme Gradient Boosting (XGBoost Regressor)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Feature Pipeline</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>EtaFeaturePipeline (12 continuous & categorical features)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Target Variable</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>actual_voyage_duration_hours</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Data Leakage Safeguard</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                    Zero post-voyage features in feature space
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Training Script</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>backend/ml/train_eta_model.py</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
