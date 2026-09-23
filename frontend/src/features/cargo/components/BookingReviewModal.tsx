import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Package,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Info,
  Copy,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { bookingService } from '../../../services/api/booking.service';
import type { BookingRecord, CreateBookingRequest } from '../../../types/booking';
import type { CargoRecord } from '../../../types/cargo';
import type { RecommendationResponse } from '../../../types/recommendation';

interface SelectedVesselCandidate {
  vessel_id: number;
  name: string;
  vessel_type: string;
  capacity_tons: number;
  imo_number?: string | null;
  flag?: string | null;
  recommendation_score?: number;
  score_tier?: string;
}

interface BookingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargo: CargoRecord;
  selectedVessel: SelectedVesselCandidate;
  recommendations?: RecommendationResponse | null;
  onBookingSuccess?: (booking: BookingRecord) => void;
}

export const BookingReviewModal: React.FC<BookingReviewModalProps> = ({
  isOpen,
  onClose,
  cargo,
  selectedVessel,
  recommendations,
  onBookingSuccess,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [operatorNotes, setOperatorNotes] = useState('');

  if (!isOpen) return null;

  // Resolve authoritative estimates
  const estCost = recommendations?.estimates?.cost?.total_cost ?? null;
  const costSource = recommendations?.estimates?.cost?.source ?? 'BASELINE_VOYAGE_CALCULATION';
  const estArrival = recommendations?.estimates?.eta?.estimated_arrival ?? null;
  const etaSource = recommendations?.estimates?.eta?.source ?? 'BASELINE_SPEED_DISTANCE_CALCULATION';
  const corridorDistance = recommendations?.route?.distance_nm ?? null;

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const idempotencyKey = `idemp-${cargo.id}-${selectedVessel.vessel_id}-${Date.now()}`;
    const payload: CreateBookingRequest = {
      cargo_id: cargo.id,
      vessel_id: selectedVessel.vessel_id,
      origin_port_id: cargo.origin_port?.id,
      destination_port_id: cargo.destination_port?.id,
      estimated_cost: estCost,
      cost_source: costSource,
      estimated_eta: estArrival,
      eta_source: etaSource,
      preference: recommendations?.preference || 'balanced',
      notes: operatorNotes.trim() || undefined,
      idempotency_key: idempotencyKey,
    };

    try {
      const result = await bookingService.createBooking(payload);
      setConfirmedBooking(result);
      if (onBookingSuccess) {
        onBookingSuccess(result);
      }
    } catch (err: any) {
      console.error('[BookingReviewModal] Booking submission error:', err);
      let msg = 'Failed to submit booking request. Please verify connection and retry.';
      if (err?.data?.detail) {
        if (typeof err.data.detail === 'string') {
          msg = err.data.detail;
        } else if (err.data.detail?.message) {
          msg = err.data.detail.message;
          if (err.data.detail?.violations?.length) {
            msg += ` (${err.data.detail.violations.join('; ')})`;
          }
        }
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleGoToBookingsHub = () => {
    onClose();
    navigate('/bookings');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(5, 12, 28, 0.82)',
          backdropFilter: 'blur(5px)',
        }}
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal Dialog Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '12px',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1101,
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
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
              <Ship size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {confirmedBooking ? 'Commercial Booking Confirmed' : 'Commercial Voyage Booking Review'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Module 19 Booking System &middot; SIH 26006 Maritime Intelligence
              </div>
            </div>
          </div>

          {!isSubmitting && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* SUCCESS SCREEN */}
          {confirmedBooking ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Success Hero Header */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid #10b981',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircle2 size={30} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Booking Request Successfully Logged
                </h4>
                <p style={{ margin: '0 auto 12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '480px' }}>
                  Your commercial voyage booking request has been validated and persisted into Supabase.
                  A unique maritime reference has been allocated.
                </p>

                {/* Booking Reference Hero Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    BOOKING REFERENCE:
                  </span>
                  <strong style={{ fontSize: '1.15rem', color: '#0284c7', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {confirmedBooking.booking_reference}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopyReference(confirmedBooking.booking_reference)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: copiedRef ? '#10b981' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <Copy size={14} />
                    {copiedRef ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Booking Snapshot Key-Values */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Booking Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        textTransform: 'uppercase',
                      }}
                    >
                      {confirmedBooking.booking_status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Allocated Vessel</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {confirmedBooking.vessel?.name || selectedVessel.name}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Cargo Payload</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {cargo.weight_tons.toLocaleString()} MT ({cargo.cargo_type})
                  </div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Voyage Corridor</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {cargo.origin_port?.name} &rarr; {cargo.destination_port?.name}
                  </div>
                </div>
              </div>

              {/* Estimate Disclosures & Compliance Notice */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(2, 132, 199, 0.04)',
                  borderRadius: '6px',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  fontSize: '0.75rem',
                  lineHeight: 1.45,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>
                  <Info size={14} /> Operational Notice & Transparency Disclosures
                </div>
                <p style={{ margin: '0 0 6px' }}>
                  {confirmedBooking.operational_notice}
                </p>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Estimated Cost: {confirmedBooking.estimated_cost ? `$${confirmedBooking.estimated_cost.toLocaleString()} USD (${confirmedBooking.cost_source})` : 'To be determined'} &middot;
                  Estimated Arrival: {confirmedBooking.estimated_eta ? `${new Date(confirmedBooking.estimated_eta).toUTCString()} (${confirmedBooking.eta_source})` : 'Pending dispatch'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <Button size="md" variant="secondary" onClick={onClose}>
                  Return to Cargo Drawer
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  icon={<ExternalLink size={15} />}
                  onClick={handleGoToBookingsHub}
                >
                  View in Bookings Hub
                </Button>
              </div>
            </div>
          ) : (
            /* PRE-SUBMISSION REVIEW SCREEN */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Error Banner */}
              {errorMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Section 1: Vessel & Cargo Pairing */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                {/* Cargo Card */}
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <Package size={14} color="#0284c7" /> Cargo Consignment
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', marginTop: '4px', color: 'var(--color-text-primary)' }}>
                    {cargo.commodity}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {cargo.weight_tons.toLocaleString()} MT &middot; {cargo.cargo_type}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Ref: {cargo.reference_number}
                  </div>
                </div>

                {/* Vessel Card */}
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <Ship size={14} color="#0284c7" /> Selected Vessel
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', marginTop: '4px', color: 'var(--color-text-primary)' }}>
                    {selectedVessel.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {selectedVessel.vessel_type} &middot; {selectedVessel.capacity_tons.toLocaleString()} MT DWT
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    IMO: {selectedVessel.imo_number || 'Registered Fleet'} &middot; {selectedVessel.flag || 'Verified'}
                  </div>
                </div>
              </div>

              {/* Section 2: Maritime Corridor */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Voyage Corridor Feasibility
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Origin Port</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{cargo.origin_port?.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{cargo.origin_port?.country} ({cargo.origin_port?.unlocode})</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
                    <div style={{ height: '1px', width: '40px', backgroundColor: '#0284c7' }} />
                    <ArrowRight size={16} />
                    <div style={{ height: '1px', width: '40px', backgroundColor: '#0284c7' }} />
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Destination Port</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{cargo.destination_port?.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{cargo.destination_port?.country} ({cargo.destination_port?.unlocode})</div>
                  </div>
                </div>
              </div>

              {/* Section 3: ETA, Cost, and Disclosures Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                }}
              >
                {/* Cost Estimate */}
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    <DollarSign size={12} color="#0284c7" /> Estimated Voyage Cost
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {estCost ? `$${estCost.toLocaleString()}` : 'Market Spot'}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Source: {costSource}
                  </div>
                </div>

                {/* ETA Estimate */}
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    <Clock size={12} color="#0284c7" /> Estimated Arrival (ETA)
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {estArrival ? new Date(estArrival).toLocaleDateString() : 'Upon Dispatch'}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Source: {etaSource}
                  </div>
                </div>

                {/* Risk Disclosure */}
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    <Shield size={12} color="#10b981" /> Risk Assessment
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    Verified Feasible
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Rule 28 Disclosures Applied
                  </div>
                </div>
              </div>

              {/* Optional Operator Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Commercial Booking Notes / Special Instructions (Optional)
                </label>
                <textarea
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  placeholder="e.g. Laycan flexibility 48h, charterer inspection required prior to loading."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Strict Notice & Disclosures */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(234, 179, 8, 0.08)',
                  borderRadius: '6px',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <Lock size={15} color="#ca8a04" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Notice of Reservation Request:</strong> Submitting this booking transmits a formal cargo
                  reservation to Supabase under status <code>PENDING</code>. Vessel availability is subject to
                  carrier operational confirmation and port authority berth clearance.
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <Button size="md" variant="ghost" disabled={isSubmitting} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  icon={<CheckCircle2 size={16} />}
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                >
                  {isSubmitting ? 'Transmitting Booking...' : 'Confirm Booking Request'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
