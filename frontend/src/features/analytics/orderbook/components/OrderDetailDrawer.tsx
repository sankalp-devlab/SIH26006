/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Order Detail Slide-out Drawer
 * Displays comprehensive specifications, engineering attributes, and lifecycle stage for a contracted hull.
 */

import { X } from 'lucide-react';
import type { OrderbookRecord } from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface OrderDetailDrawerProps {
  order: OrderbookRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const LIFECYCLE_STAGES = [
  { id: 'ordered', label: 'Contract Signed' },
  { id: 'keel_laid', label: 'Keel Laid' },
  { id: 'under_construction', label: 'Drydock Assembly' },
  { id: 'launched', label: 'Launched / Fitting' },
  { id: 'sea_trials', label: 'Sea Trials' },
  { id: 'delivered', label: 'Delivered' },
];

export function OrderDetailDrawer({ order, isOpen, onClose }: OrderDetailDrawerProps) {
  if (!isOpen || !order) return null;

  // Determine stage index
  const stageIndex =
    order.status === 'delivered'
      ? 5
      : order.status === 'launched'
      ? 3
      : order.status === 'under_construction'
      ? 2
      : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '460px',
        maxWidth: '90vw',
        background: 'var(--color-bg-surface, #0f172a)',
        borderLeft: '1px solid var(--color-border-subtle, #1e293b)',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'var(--color-bg-surface, #0f172a)',
          zIndex: 10,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38bdf8',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.15)',
              }}
            >
              HULL {order.hull_number}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--color-text-muted, #64748b)',
              }}
            >
              {order.sector}
            </span>
          </div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              margin: '0.25rem 0 0 0',
            }}
          >
            {order.vessel_name}
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary, #94a3b8)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Construction Lifecycle Stepper */}
        <div>
          <h4
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-muted, #64748b)',
              margin: '0 0 0.75rem 0',
            }}
          >
            Shipbuilding Milestone Tracker
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {LIFECYCLE_STAGES.map((stg, idx) => {
              const isPassed = idx <= stageIndex;
              const isCurrent = idx === stageIndex;

              return (
                <div
                  key={stg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isCurrent
                        ? '#38bdf8'
                        : isPassed
                        ? '#10b981'
                        : 'var(--color-border-subtle, #1e293b)',
                      color: '#0b0f19',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      zIndex: 2,
                    }}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: isCurrent ? '#38bdf8' : isPassed ? '#f8fafc' : '#64748b',
                      marginTop: '0.35rem',
                      textAlign: 'center',
                      fontWeight: isCurrent ? 700 : 500,
                      lineHeight: 1.1,
                    }}
                  >
                    {stg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commercial & Contract Overview */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h4
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted, #64748b)',
              margin: '0 0 0.75rem 0',
            }}
          >
            Contract & Commercial Stakeholders
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Beneficial Owner</span>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                {order.owner_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.owner_country}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Shipyard & Builder</span>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                {order.shipyard_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {order.shipyard_country} ({order.shipyard_group})
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Contract Value</span>
              <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>
                {OrderbookAnalyticsEngine.formatUsdMillions(order.contract_price_usd_m)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Order Date</span>
              <div style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.85rem' }}>
                {order.order_date}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Target Delivery</span>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>
                {order.expected_delivery_quarter}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {order.expected_delivery_date}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Classification</span>
              <div style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.85rem' }}>
                {order.classification_society || 'DNV / Lloyd’s'}
              </div>
            </div>
          </div>
        </div>

        {/* Engineering & Propulsion Specifications */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h4
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted, #64748b)',
              margin: '0 0 0.75rem 0',
            }}
          >
            Engineering & Propulsion Attributes
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Vessel Class</span>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                {order.vessel_class}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Deadweight (DWT)</span>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>
                {OrderbookAnalyticsEngine.formatDwt(order.capacity_dwt)}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Propulsion & Alternative Fuel</span>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '0.2rem',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  background:
                    order.propulsion_type !== 'Conventional HFO/VLSFO'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(148, 163, 184, 0.1)',
                  color:
                    order.propulsion_type !== 'Conventional HFO/VLSFO' ? '#10b981' : '#94a3b8',
                }}
              >
                {order.propulsion_type}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Exhaust Scrubber (EGCS)</span>
              <div style={{ fontWeight: 600, color: order.scrubber_fitted ? '#10b981' : '#64748b' }}>
                {order.scrubber_fitted ? 'Fitted (Open/Hybrid)' : 'No Scrubber'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>NOx Tier Compliance</span>
              <div style={{ fontWeight: 600, color: '#38bdf8' }}>IMO Tier III (EEDI Ph. 3)</div>
            </div>
          </div>
        </div>

        {/* Commercial Context Notes */}
        {order.notes && (
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              lineHeight: 1.4,
            }}
          >
            <strong style={{ color: '#38bdf8' }}>Intelligence Brief: </strong>
            {order.notes}
          </div>
        )}
      </div>
    </div>
  );
}
