/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixture Detail Slide-out Drawer
 */

import { useState } from 'react';
import {
  Ship,
  Building2,
  Package,
  Share2,
  Edit2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidePanel } from '../../../components/ui/SidePanel';
import type { FixtureRecord, FixtureStatus, PortNodeType } from '../../../types/fixture';

interface FixtureDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: FixtureRecord | null;
  onOpenEdit: (fixture: FixtureRecord) => void;
  onOpenStatusModal: (fixture: FixtureRecord) => void;
  onOpenShare: (fixture: FixtureRecord) => void;
}

const PORT_TYPE_STYLES: Record<PortNodeType, { color: string; bg: string; label: string }> = {
  load: { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', label: 'Load Port' },
  discharge: { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)', label: 'Discharge Port' },
  bunkering: { color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)', label: 'Bunkering' },
  transit: { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)', label: 'Transit / Canal' },
};

export const FixtureDetailDrawer: React.FC<FixtureDetailDrawerProps> = ({
  isOpen,
  onClose,
  fixture,
  onOpenEdit,
  onOpenStatusModal,
  onOpenShare,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rotation' | 'commercial' | 'history'>('overview');

  if (!fixture) return null;

  const renderStatusBadge = (status: FixtureStatus) => {
    switch (status) {
      case 'fully_fixed':
        return <span className="badge badge-success">Fully Fixed</span>;
      case 'on_subjects':
        return <span className="badge badge-warning">On Subjects</span>;
      case 'failed':
        return <span className="badge badge-danger">Failed / Broken</span>;
      case 'draft':
      default:
        return <span className="badge badge-neutral">Draft</span>;
    }
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={fixture.fixture_reference}
      subtitle={`${fixture.vessel_name} • ${fixture.charterer}`}
      width="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Top Action Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.02))',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderStatusBadge(fixture.status)}
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Fixed: {new Date(fixture.fixture_date).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenEdit(fixture)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenStatusModal(fixture)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              <CheckCircle size={13} /> Status
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenShare(fixture)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              <Share2 size={13} /> Recap
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            gap: '1rem',
          }}
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'rotation', label: `Rotation (${fixture.ports.length})` },
            { id: 'commercial', label: 'Commercial Terms' },
            { id: 'history', label: `Audit Log (${fixture.history?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 0',
                fontSize: '0.8125rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Vessel Particulars Card */}
            <div
              style={{
                padding: '0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Ship size={15} style={{ color: 'var(--color-brand-primary)' }} />
                  Vessel Particulars
                </div>
                <Link
                  to={`/vessels?search=${encodeURIComponent(fixture.vessel_name)}`}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-brand-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    textDecoration: 'none',
                  }}
                >
                  View Vessel <ExternalLink size={12} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Name:</span>{' '}
                  <span style={{ fontWeight: 600 }}>{fixture.vessel_name}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>IMO:</span>{' '}
                  <span>{fixture.vessel_imo}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Type:</span>{' '}
                  <span>{fixture.vessel_type}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>DWT:</span>{' '}
                  <span>{fixture.vessel_dwt.toLocaleString()} MT</span>
                </div>
              </div>
            </div>

            {/* Chartering Parties Card */}
            <div
              style={{
                padding: '0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <Building2 size={15} style={{ color: 'var(--color-brand-primary)' }} />
                Chartering Parties & Contract
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Charterer:</span>{' '}
                  <span style={{ fontWeight: 600 }}>{fixture.charterer}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>CP Form:</span>{' '}
                  <span style={{ fontWeight: 600 }}>{fixture.charter_party_form}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Broker:</span>{' '}
                  <span>{fixture.charterer_broker || 'Direct / None'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Owner Entity:</span>{' '}
                  <span>{fixture.owner_entity || 'Maritime Fleet Holdings'}</span>
                </div>
              </div>
            </div>

            {/* Cargo & Laycan Card */}
            <div
              style={{
                padding: '0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <Package size={15} style={{ color: 'var(--color-brand-primary)' }} />
                Cargo Consignment & Laycan
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Commodity:</span>{' '}
                  <span style={{ fontWeight: 600 }}>{fixture.commodity}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Quantity:</span>{' '}
                  <span style={{ fontWeight: 600 }}>{fixture.quantity_tons.toLocaleString()} MT</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Category:</span>{' '}
                  <span>{fixture.cargo_type}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Laycan Window:</span>{' '}
                  <span style={{ fontWeight: 600 }}>
                    {fixture.laycan_start} to {fixture.laycan_end}
                  </span>
                </div>
              </div>
            </div>

            {/* Rate & Demurrage Summary */}
            <div
              style={{
                padding: '0.875rem',
                backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.02))',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Agreed Commercial Rate</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                  {fixture.rate_formatted}
                </div>
              </div>
              {fixture.demurrage_usd_day && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Demurrage</span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                    ${fixture.demurrage_usd_day.toLocaleString()} / day
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {fixture.notes && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  DESK NOTES:
                </div>
                <div style={{ color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>{fixture.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MULTI-PORT ROTATION */}
        {activeTab === 'rotation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Full ordered port call sequence for voyage rotation #{fixture.fixture_reference}:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {fixture.ports.map((port, idx) => {
                const style = PORT_TYPE_STYLES[port.port_type];
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      position: 'relative',
                    }}
                  >
                    {/* Step number */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: style.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        flexShrink: 0,
                      }}
                    >
                      {port.sequence}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                          <Link
                            to={`/ports?search=${encodeURIComponent(port.port_name)}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            title="View port information"
                          >
                            {port.port_name}
                          </Link>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                            ({port.country})
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: style.bg,
                            color: style.color,
                          }}
                        >
                          {style.label}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {port.unlocode && <span>UN/LOCODE: {port.unlocode} • </span>}
                        {port.draft_m && <span>Max Draft: {port.draft_m}m • </span>}
                        {port.eta && <span>ETA: {port.eta} </span>}
                        {port.etd && <span>| ETD: {port.etd}</span>}
                      </div>

                      {port.berth_notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                          Note: {port.berth_notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: COMMERCIAL TERMS */}
        {activeTab === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div
              style={{
                padding: '0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Rate Particulars</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Basis / Type:</span>{' '}
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {fixture.rate_type.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Currency:</span>{' '}
                  <span style={{ fontWeight: 600 }}>{fixture.rate_currency}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Rate Value:</span>{' '}
                  <span style={{ fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                    {fixture.rate_formatted}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Commission:</span>{' '}
                  <span>{fixture.commission_percent ? `${fixture.commission_percent}% Total` : 'None'}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Demurrage & Clauses</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Demurrage (USD/Day):</span>{' '}
                  <span style={{ fontWeight: 600 }}>
                    {fixture.demurrage_usd_day ? `$${fixture.demurrage_usd_day.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Charter Party Form:</span>{' '}
                  <span style={{ fontWeight: 600 }}>{fixture.charter_party_form}</span>
                </div>
              </div>

              {fixture.rate_notes && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <strong>Special Freight Conditions:</strong> {fixture.rate_notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Complete audit lifecycle records for {fixture.fixture_reference}:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(fixture.history || []).map((audit) => (
                <div
                  key={audit.id}
                  style={{
                    padding: '0.625rem 0.75rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{audit.action}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(audit.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    By: <strong>{audit.user}</strong>
                    {audit.from_status && audit.to_status && (
                      <span style={{ marginLeft: '6px' }}>
                        ({audit.from_status} → <strong>{audit.to_status}</strong>)
                      </span>
                    )}
                  </div>

                  {audit.note && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{audit.note}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SidePanel>
  );
};
