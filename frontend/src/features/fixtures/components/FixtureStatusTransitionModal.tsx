/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixture Status Transition Modal
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { FixtureRecord, FixtureStatus } from '../../../types/fixture';

interface FixtureStatusTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: FixtureRecord | null;
  onTransition: (id: string, newStatus: FixtureStatus, reason: string) => Promise<void>;
}

const STATUS_OPTIONS: Array<{
  status: FixtureStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    status: 'draft',
    label: 'Draft',
    description: 'Initial commercial negotiation or preliminary indication.',
    icon: <FileText size={16} />,
    color: '#64748b',
  },
  {
    status: 'on_subjects',
    label: 'On Subjects (Sub-Fix)',
    description: 'Agreed main terms; awaiting stem approval, board signoff, or vetting.',
    icon: <Clock size={16} />,
    color: '#d97706',
  },
  {
    status: 'fully_fixed',
    label: 'Fully Fixed (Clean)',
    description: 'All subjects lifted. Charter party execution ready; commercial agreement locked.',
    icon: <CheckCircle size={16} />,
    color: '#16a34a',
  },
  {
    status: 'failed',
    label: 'Failed / Broken',
    description: 'Subjects failed, stem rejected, or negotiations discontinued.',
    icon: <XCircle size={16} />,
    color: '#ef4444',
  },
];

export const FixtureStatusTransitionModal: React.FC<FixtureStatusTransitionModalProps> = ({
  isOpen,
  onClose,
  fixture,
  onTransition,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<FixtureStatus>('on_subjects');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixture) {
      if (fixture.status === 'draft') {
        setSelectedStatus('on_subjects');
        setReason('Main terms agreed in principle; stem and supplier confirmation pending.');
      } else if (fixture.status === 'on_subjects') {
        setSelectedStatus('fully_fixed');
        setReason('All subjects lifted cleanly. Terminal vetting approved.');
      } else if (fixture.status === 'fully_fixed') {
        setSelectedStatus('failed');
        setReason('Cargo cancelled by charterers prior to laycan.');
      } else {
        setSelectedStatus('draft');
        setReason('Reopening negotiation under revised terms.');
      }
    }
    setError(null);
  }, [fixture, isOpen]);

  if (!fixture) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedStatus === fixture.status) {
      setError('Please choose a different status than the current status.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide an operational or commercial reason for this lifecycle transition.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onTransition(fixture.id, selectedStatus, reason.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status: ${fixture.fixture_reference}`}
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Current Status Banner */}
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.02))',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Vessel:</span>{' '}
              <strong>{fixture.vessel_name}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Charterer: {fixture.charterer}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                Current Status:
              </span>
              <strong style={{ textTransform: 'capitalize' }}>{fixture.status.replace('_', ' ')}</strong>
            </div>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-danger, #ef4444)',
                borderRadius: '6px',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Status Selection Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
              Select Target Status *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = selectedStatus === opt.status;
                const isCurrent = fixture.status === opt.status;

                return (
                  <label
                    key={opt.status}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.625rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? opt.color : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? `${opt.color}0a` : 'var(--color-surface)',
                      cursor: 'pointer',
                      opacity: isCurrent ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="radio"
                      name="fixture_status"
                      value={opt.status}
                      checked={isSelected}
                      onChange={() => setSelectedStatus(opt.status)}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.8125rem', color: opt.color }}>
                        {opt.icon}
                        {opt.label}
                        {isCurrent && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                            (Current)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {opt.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Reason & Audit Log Note */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
              Operational Reason & Desk Note *
            </label>
            <textarea
              className="input"
              style={{ width: '100%', height: '70px', fontSize: '0.8125rem', padding: '6px 10px' }}
              placeholder="e.g. Stem confirmation received from terminal, BOD approval confirmed."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Footer Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting || selectedStatus === fixture.status}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <CheckCircle size={14} />
              {isSubmitting ? 'Updating...' : 'Confirm Transition'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
