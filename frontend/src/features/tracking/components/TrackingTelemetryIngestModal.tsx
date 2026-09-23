import React, { useState } from 'react';
import { X, Radio, CheckCircle2, AlertTriangle, Shield, Navigation } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { trackingService } from '../../../services/api/tracking.service';
import type { TrackedVesselSummary, PositionIngestPayload } from '../../../types/tracking';

interface TrackingTelemetryIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: TrackedVesselSummary[];
  selectedVesselId?: number | null;
  onIngestSuccess: () => void;
}

export const TrackingTelemetryIngestModal: React.FC<TrackingTelemetryIngestModalProps> = ({
  isOpen,
  onClose,
  vessels,
  selectedVesselId,
  onIngestSuccess,
}) => {
  const [vesselId, setVesselId] = useState<number>(selectedVesselId || (vessels[0]?.vessel_id ?? 1));
  const [latitude, setLatitude] = useState<string>('1.2855'); // Singapore port anchorage default
  const [longitude, setLongitude] = useState<string>('103.8565');
  const [speedKnots, setSpeedKnots] = useState<string>('12.5');
  const [heading, setHeading] = useState<string>('90.0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const spdNum = speedKnots ? parseFloat(speedKnots) : undefined;
    const hdgNum = heading ? parseFloat(heading) : undefined;

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setErrorMessage('Latitude must be a valid number between -90.0 and +90.0 degrees.');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setErrorMessage('Longitude must be a valid number between -180.0 and +180.0 degrees.');
      setIsSubmitting(false);
      return;
    }

    const payload: PositionIngestPayload = {
      vessel_id: vesselId,
      latitude: latNum,
      longitude: lngNum,
      speed_knots: spdNum,
      heading: hdgNum,
      recorded_at: new Date().toISOString(),
    };

    try {
      const response = await trackingService.ingestPosition(payload);
      if (response.success) {
        setSuccessMessage(`Observation successfully ingested for Vessel #${vesselId}. Status: ${response.freshness_status}`);
        setTimeout(() => {
          onIngestSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('[TelemetryIngestModal] Error:', err);
      let msg = 'Failed to ingest observation.';
      if (err?.data?.detail) {
        if (typeof err.data.detail === 'string') msg = err.data.detail;
        else if (err.data.detail?.violations) msg = err.data.detail.violations.join('; ');
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetPositions = [
    { label: 'Singapore Anchorage', lat: 1.2855, lng: 103.8565, speed: 0.2, hdg: 110 },
    { label: 'Malacca Strait Underway', lat: 2.5000, lng: 101.5000, speed: 14.5, hdg: 315 },
    { label: 'Arabian Gulf / Ras Tanura', lat: 26.6500, lng: 50.1500, speed: 13.0, hdg: 135 },
    { label: 'Suez Approach / Red Sea', lat: 27.8000, lng: 34.3000, speed: 12.0, hdg: 340 },
    { label: 'Rotterdam Europort', lat: 51.9500, lng: 4.1200, speed: 0.1, hdg: 270 },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(5, 12, 28, 0.85)',
          backdropFilter: 'blur(5px)',
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '12px',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          zIndex: 1101,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface-alt)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Radio size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Ingest Authentic Telemetry
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Module 20 &middot; Supabase vessel_positions telemetry persistence
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMessage && (
            <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.8125rem', display: 'flex', gap: '8px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.8125rem', display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Vessel Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Target Fleet Vessel
            </label>
            <select
              value={vesselId}
              onChange={(e) => setVesselId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-surface-alt)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
              }}
            >
              {vessels.map((v) => (
                <option key={v.vessel_id} value={v.vessel_id}>
                  {v.name} (#{v.vessel_id}) &mdash; {v.vessel_type}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              Authentic Maritime Corridor Presets:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {presetPositions.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setLatitude(p.lat.toString());
                    setLongitude(p.lng.toString());
                    setSpeedKnots(p.speed.toString());
                    setHeading(p.hdg.toString());
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.675rem',
                    backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#38bdf8',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Latitude (-90 to +90&deg;)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Longitude (-180 to +180&deg;)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>
          </div>

          {/* Speed and Heading Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Speed Over Ground (knots)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={speedKnots}
                onChange={(e) => setSpeedKnots(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Heading / Course (0 to 360&deg;)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="360"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>
          </div>

          {/* Rule 28 Disclosure */}
          <div style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'flex', gap: '6px' }}>
            <Shield size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Observations are strictly committed to Supabase <code>public.vessel_positions</code> with current UTC timestamp. Freshness is evaluated in real time without synthetic animation.
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
            <Button size="sm" variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ingesting...' : 'Ingest Observation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
