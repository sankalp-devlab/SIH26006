/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Telemetry Ingestion Modal
 */

import React, { useState } from 'react';
import { X, Radio, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
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
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(4, 14, 25, 0.85)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#091A2A',
          borderRadius: '12px',
          border: '1px solid rgba(0, 217, 255, 0.35)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          zIndex: 1101,
          overflow: 'hidden',
          color: '#F5F8FC',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(100, 190, 240, 0.16)',
            backgroundColor: '#061321',
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
                backgroundColor: 'rgba(0, 217, 255, 0.12)',
                color: '#00D9FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 217, 255, 0.3)',
              }}
            >
              <Radio size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
                Ingest Authentic Telemetry
              </h3>
              <div style={{ fontSize: '11px', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace" }}>
                Module 20 &middot; vessel_positions telemetry persistence
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#7189A3',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMessage && (
            <div style={{ padding: '10px 12px', borderRadius: '6px', backgroundColor: 'rgba(255, 77, 85, 0.12)', border: '1px solid rgba(255, 77, 85, 0.35)', color: '#FF7076', fontSize: '12px', display: 'flex', gap: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div style={{ padding: '10px 12px', borderRadius: '6px', backgroundColor: 'rgba(32, 201, 138, 0.12)', border: '1px solid rgba(32, 201, 138, 0.35)', color: '#38E5A3', fontSize: '12px', display: 'flex', gap: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Vessel Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8DA2B7', marginBottom: '4px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
              Target Fleet Vessel
            </label>
            <select
              value={vesselId}
              onChange={(e) => setVesselId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(100, 190, 240, 0.2)',
                backgroundColor: '#061321',
                color: '#F5F8FC',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                outline: 'none',
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
            <div style={{ fontSize: '10px', color: '#7189A3', marginBottom: '4px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
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
                    fontSize: '10px',
                    fontFamily: "'JetBrains Mono', monospace",
                    backgroundColor: 'rgba(0, 217, 255, 0.08)',
                    border: '1px solid rgba(0, 217, 255, 0.25)',
                    color: '#00D9FF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
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
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8DA2B7', marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
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
                  boxSpacing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(100, 190, 240, 0.2)',
                  backgroundColor: '#061321',
                  color: '#F5F8FC',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8DA2B7', marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
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
                  boxSpacing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(100, 190, 240, 0.2)',
                  backgroundColor: '#061321',
                  color: '#F5F8FC',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Speed and Heading Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8DA2B7', marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
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
                  boxSpacing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(100, 190, 240, 0.2)',
                  backgroundColor: '#061321',
                  color: '#F5F8FC',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8DA2B7', marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
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
                  boxSpacing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(100, 190, 240, 0.2)',
                  backgroundColor: '#061321',
                  color: '#F5F8FC',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Rule 28 Disclosure */}
          <div style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)', fontSize: '11px', color: '#A5B8CC', display: 'flex', gap: '6px', lineHeight: 1.45 }}>
            <Shield size={14} color="#00D9FF" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Observations are strictly committed to Supabase <code style={{ color: '#00D9FF' }}>public.vessel_positions</code> with current UTC timestamp. Freshness is evaluated in real time without synthetic animation.
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="tracking-btn tracking-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="tracking-btn tracking-btn-primary"
            >
              {isSubmitting ? 'Ingesting...' : 'Ingest Observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackingTelemetryIngestModal;
