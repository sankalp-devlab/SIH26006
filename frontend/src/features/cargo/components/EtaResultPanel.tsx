import React, { useState } from 'react';
import {
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
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { ETACalculationResponse } from '../../../types/eta';

interface EtaResultPanelProps {
  eta: ETACalculationResponse | null;
  isLoading: boolean;
  onRecalculateWithDeparture?: (departureTime?: string) => void;
}

export const EtaResultPanel: React.FC<EtaResultPanelProps> = ({
  eta,
  isLoading,
  onRecalculateWithDeparture,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [scenarioDeparture, setScenarioDeparture] = useState<string>('');

  if (!eta) return null;

  // Date formatting
  const formatDateTime = (isoString: string) => {
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

  const arrivalFormatted = formatDateTime(eta.estimated_arrival);
  const departureFormatted = formatDateTime(eta.departure_time);

  // Friendly duration formatting: e.g. "34d 2h" (818.4 hrs)
  const formatDurationFriendly = (totalHours: number) => {
    const days = Math.floor(totalHours / 24);
    const remainingHours = Math.round(totalHours % 24);
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${totalHours.toFixed(1)}h`;
  };

  const handleApplyScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRecalculateWithDeparture) {
      onRecalculateWithDeparture(scenarioDeparture || undefined);
    }
  };

  const handleReset = () => {
    setScenarioDeparture('');
    if (onRecalculateWithDeparture) {
      onRecalculateWithDeparture(undefined);
    }
  };

  const isPartial = eta.eta_status === 'partial';

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-surface-alt)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 217, 255, 0.28)',
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
                backgroundColor: 'rgba(0, 217, 255, 0.12)',
                color: '#00D9FF',
                border: '1px solid rgba(0, 217, 255, 0.3)',
              }}
            >
              MODULE 13 • ETA CALCULATION
            </span>
            <span
              className="badge"
              style={{
                backgroundColor:
                  eta.eta_status === 'full'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                color: eta.eta_status === 'full' ? '#10b981' : '#f59e0b',
                border: `1px solid ${eta.eta_status === 'full' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {eta.eta_status === 'full' ? 'Full ETA' : 'Partial Baseline ETA'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Deterministic maritime transit baseline &middot; Calculated authoritatively via FastAPI
          </div>
        </div>

        {onRecalculateWithDeparture && (
          <Button
            size="sm"
            variant="ghost"
            icon={<Sliders size={13} />}
            onClick={() => setShowScenario(!showScenario)}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            {showScenario ? 'Hide Scenario' : 'Simulate Departure'}
          </Button>
        )}
      </div>

      {/* Scenario Departure Simulator Drawer */}
      {showScenario && onRecalculateWithDeparture && (
        <form
          onSubmit={handleApplyScenario}
          style={{
            marginBottom: '1rem',
            padding: '12px',
            backgroundColor: 'rgba(0, 217, 255, 0.04)',
            border: '1px dashed rgba(0, 217, 255, 0.3)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#00D9FF', marginBottom: '8px' }}>
            Departure Simulation & Laycan Adjustment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '3px' }}>
                Departure Date & Time (Local / UTC)
              </label>
              <input
                type="datetime-local"
                value={scenarioDeparture}
                onChange={(e) => setScenarioDeparture(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  color: 'var(--color-text-primary)',
                  fontSize: '11px',
                }}
              />
            </div>
            <Button size="sm" variant="primary" type="submit" disabled={isLoading} style={{ fontSize: '11px' }}>
              {isLoading ? 'Recalculating...' : 'Recalculate ETA'}
            </Button>
            <Button size="sm" variant="secondary" type="button" onClick={handleReset} style={{ fontSize: '11px' }}>
              <RotateCcw size={12} />
            </Button>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Testing custom departure date preserves exact route distance and vessel speed.
          </div>
        </form>
      )}

      {/* Hero ETA Display Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '12px',
          padding: '14px 16px',
          backgroundColor: 'rgba(11, 19, 43, 0.75)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 217, 255, 0.35)',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#00D9FF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px',
            }}
          >
            <Clock size={14} color="#00D9FF" />
            Estimated Arrival (ETA)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
            {arrivalFormatted.datePart}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', marginTop: '2px' }}>
            {arrivalFormatted.timePart}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            Departure: {departureFormatted.full} ({eta.departure_time_source})
          </div>
        </div>

        {/* Transit Summary Badge */}
        <div
          style={{
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            paddingLeft: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            Voyage Duration
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
            {formatDurationFriendly(eta.voyage_hours)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
            {eta.voyage_hours.toFixed(1)} sailing hours &middot; {eta.voyage_days.toFixed(1)} days
          </div>
        </div>
      </div>

      {/* Core Voyage Parameters Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '1rem',
        }}
      >
        {/* Route Distance */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
            <Navigation size={12} />
            Route Distance
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {eta.distance_nm.toLocaleString()} NM
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
            {eta.distance_km.toLocaleString()} km ({eta.distance_type})
          </div>
        </div>

        {/* Vessel Speed */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
            <Gauge size={12} />
            Vessel Speed
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {eta.effective_speed_knots} knots
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
            Source: {eta.speed_source}
          </div>
        </div>

        {/* Departure Time */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
            <Calendar size={12} />
            Departure Date
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {departureFormatted.datePart}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
            {departureFormatted.timePart}
          </div>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
            <Info size={12} />
            ETA Status
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: isPartial ? '#f59e0b' : '#10b981',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            {eta.eta_status}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
            Deterministic Baseline
          </div>
        </div>
      </div>

      {/* Notice Banner explaining transparent conditions */}
      {isPartial && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '6px',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '0.75rem',
          }}
        >
          <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <strong>Transparent Data Completeness:</strong> Base sailing time calculated authoritatively. Weather delays and port waiting times are unavailable in the project dataset and will be modeled in Module 15 (XGBoost) and Module 17 (Risk Engine).
          </div>
        </div>
      )}

      {/* Accordion: View Calculation Details */}
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
            color: '#00D9FF',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          <span>{showDetails ? 'Hide Calculation Details' : 'View Calculation Details & Mathematical Audit'}</span>
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
              Deterministic Baseline Formula:
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '6px 10px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                color: '#38bdf8',
                marginBottom: '10px',
              }}
            >
              Voyage Hours = Route Distance (NM) ÷ Effective Speed (Knots)
              <br />
              Estimated Arrival = Departure Timestamp + Voyage Duration
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Calculation Method</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{eta.calculation_method}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Route Distance (NM)</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{eta.distance_nm} NM ({eta.distance_type})</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Effective Vessel Speed</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{eta.effective_speed_knots} knots (from {eta.speed_source})</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Computed Voyage Hours</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{eta.voyage_hours} hrs</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Computed Voyage Days</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{eta.voyage_days} days</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Departure Timestamp</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{departureFormatted.full}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Departure Source</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{eta.departure_time_source}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Condition Adjustment</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--color-text-muted)' }}>Unavailable (No live sensors)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Port Waiting Duration</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--color-text-muted)' }}>Unavailable (No live port queue)</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--color-text-muted)' }}>Database Persistence</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600, color: eta.persisted ? '#10b981' : 'var(--color-text-muted)' }}>
                    {eta.persisted ? 'Persisted to bookings.estimated_eta' : 'Ad-hoc calculation'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
