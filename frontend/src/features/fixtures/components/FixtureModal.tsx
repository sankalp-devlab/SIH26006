/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixture Create & Edit Modal
 */

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  Check,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { FixturePortSequenceEditor } from './FixturePortSequenceEditor';
import type {
  FixtureRecord,
  CreateFixturePayload,
  FixturePortNode,
  RateCurrency,
  RateType,
  FixtureStatus,
} from '../../../types/fixture';

interface VesselOption {
  id: number;
  name: string;
  type: string;
  imo: string;
  dwt: number;
}

interface PortOption {
  id: number;
  name: string;
  country: string;
  unlocode?: string;
  max_draft?: number;
}

interface FixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateFixturePayload) => Promise<void>;
  editingFixture?: FixtureRecord | null;
  vessels: VesselOption[];
  ports: PortOption[];
}

const CHARTER_PARTY_FORMS = [
  'GENCON 94',
  'NYPE 93',
  'SHELLTIME 4',
  'ASBATANKVOY',
  'BPVOY4',
  'BALTIME 1939',
  'BIMCO GENTIME',
  'AMWELSH 93',
];

export const FixtureModal: React.FC<FixtureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFixture,
  vessels,
  ports,
}) => {
  const [activeSection, setActiveSection] = useState<'particulars' | 'rotation' | 'commercial'>('particulars');

  // Form State
  const [vesselId, setVesselId] = useState<number | ''>('');
  const [charterer, setCharterer] = useState('');
  const [chartererBroker, setChartererBroker] = useState('');
  const [ownerEntity, setOwnerEntity] = useState('Maritime Fleet Holdings Ltd');
  const [charterPartyForm, setCharterPartyForm] = useState('GENCON 94');

  const [commodity, setCommodity] = useState('');
  const [cargoType, setCargoType] = useState('Dry Bulk');
  const [quantityTons, setQuantityTons] = useState<number | ''>(50000);

  const [portNodes, setPortNodes] = useState<FixturePortNode[]>([]);

  const [rateValue, setRateValue] = useState<number | ''>(24000);
  const [rateCurrency, setRateCurrency] = useState<RateCurrency>('USD');
  const [rateType, setRateType] = useState<RateType>('per_day');
  const [rateNotes, setRateNotes] = useState('');
  const [demurrageUsdDay, setDemurrageUsdDay] = useState<number | ''>(18000);
  const [commissionPercent, setCommissionPercent] = useState<number | ''>(2.5);

  const [fixtureDate, setFixtureDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [laycanStart, setLaycanStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [laycanEnd, setLaycanEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 12);
    return d.toISOString().split('T')[0];
  });

  const [status, setStatus] = useState<FixtureStatus>('draft');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Synchronize when editingFixture changes
  useEffect(() => {
    if (editingFixture) {
      setVesselId(editingFixture.vessel_id);
      setCharterer(editingFixture.charterer);
      setChartererBroker(editingFixture.charterer_broker || '');
      setOwnerEntity(editingFixture.owner_entity || 'Maritime Fleet Holdings Ltd');
      setCharterPartyForm(editingFixture.charter_party_form || 'GENCON 94');

      setCommodity(editingFixture.commodity);
      setCargoType(editingFixture.cargo_type);
      setQuantityTons(editingFixture.quantity_tons);

      setPortNodes(editingFixture.ports || []);

      setRateValue(editingFixture.rate_value);
      setRateCurrency(editingFixture.rate_currency);
      setRateType(editingFixture.rate_type);
      setRateNotes(editingFixture.rate_notes || '');
      setDemurrageUsdDay(editingFixture.demurrage_usd_day || '');
      setCommissionPercent(editingFixture.commission_percent || '');

      setFixtureDate(editingFixture.fixture_date.split('T')[0]);
      setLaycanStart(editingFixture.laycan_start);
      setLaycanEnd(editingFixture.laycan_end);

      setStatus(editingFixture.status);
      setNotes(editingFixture.notes || '');
    } else {
      // Default reset
      setVesselId(vessels[0]?.id || '');
      setCharterer('');
      setChartererBroker('');
      setOwnerEntity('Maritime Fleet Holdings Ltd');
      setCharterPartyForm('GENCON 94');

      setCommodity('Industrial Iron Ore');
      setCargoType('Dry Bulk');
      setQuantityTons(65000);

      // Default load + discharge ports if available
      if (ports.length >= 2) {
        setPortNodes([
          {
            sequence: 1,
            port_id: ports[0].id,
            port_name: ports[0].name,
            country: ports[0].country,
            unlocode: ports[0].unlocode,
            port_type: 'load',
          },
          {
            sequence: 2,
            port_id: ports[1].id,
            port_name: ports[1].name,
            country: ports[1].country,
            unlocode: ports[1].unlocode,
            port_type: 'discharge',
          },
        ]);
      } else {
        setPortNodes([]);
      }

      setRateValue(26500);
      setRateCurrency('USD');
      setRateType('per_day');
      setRateNotes('1.25% address commission to charterers; standard bunker escalation clause');
      setDemurrageUsdDay(20000);
      setCommissionPercent(2.5);

      const today = new Date();
      setFixtureDate(today.toISOString().split('T')[0]);

      const lStart = new Date();
      lStart.setDate(today.getDate() + 7);
      setLaycanStart(lStart.toISOString().split('T')[0]);

      const lEnd = new Date();
      lEnd.setDate(today.getDate() + 12);
      setLaycanEnd(lEnd.toISOString().split('T')[0]);

      setStatus('draft');
      setNotes('');
    }
    setValidationError(null);
    setActiveSection('particulars');
  }, [editingFixture, isOpen, vessels, ports]);

  const selectedVessel = vessels.find((v) => v.id === Number(vesselId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validations
    if (!vesselId || !selectedVessel) {
      setValidationError('Please select a vessel from the fleet registry.');
      setActiveSection('particulars');
      return;
    }

    if (!charterer.trim()) {
      setValidationError('Charterer entity name is required.');
      setActiveSection('particulars');
      return;
    }

    if (!commodity.trim()) {
      setValidationError('Cargo commodity description is required.');
      setActiveSection('particulars');
      return;
    }

    if (!quantityTons || Number(quantityTons) <= 0) {
      setValidationError('Agreed cargo quantity must be greater than zero.');
      setActiveSection('particulars');
      return;
    }

    if (portNodes.length === 0) {
      setValidationError('Commercial fixtures require at least 1 port in the rotation.');
      setActiveSection('rotation');
      return;
    }

    const hasLoad = portNodes.some((p) => p.port_type === 'load');
    const hasDischarge = portNodes.some((p) => p.port_type === 'discharge');
    if (!hasLoad || !hasDischarge) {
      setValidationError('Rotation must contain at least one Load Port and one Discharge Port.');
      setActiveSection('rotation');
      return;
    }

    if (!rateValue || Number(rateValue) <= 0) {
      setValidationError('Agreed charter rate must be greater than zero.');
      setActiveSection('commercial');
      return;
    }

    if (new Date(laycanEnd) < new Date(laycanStart)) {
      setValidationError('Laycan canceling date (end) cannot be prior to laycan commencement date (start).');
      setActiveSection('commercial');
      return;
    }

    const payload: CreateFixturePayload = {
      vessel_id: selectedVessel.id,
      vessel_name: selectedVessel.name,
      vessel_type: selectedVessel.type,
      vessel_imo: selectedVessel.imo,
      vessel_dwt: selectedVessel.dwt,
      commodity: commodity.trim(),
      cargo_type: cargoType,
      quantity_tons: Number(quantityTons),
      ports: portNodes,
      rate_value: Number(rateValue),
      rate_currency: rateCurrency,
      rate_type: rateType,
      rate_notes: rateNotes.trim() || undefined,
      demurrage_usd_day: demurrageUsdDay ? Number(demurrageUsdDay) : undefined,
      commission_percent: commissionPercent ? Number(commissionPercent) : undefined,
      charterer: charterer.trim(),
      charterer_broker: chartererBroker.trim() || undefined,
      owner_entity: ownerEntity.trim() || 'Maritime Fleet Holdings Ltd',
      charter_party_form: charterPartyForm,
      fixture_date: new Date(fixtureDate).toISOString(),
      laycan_start: laycanStart,
      laycan_end: laycanEnd,
      status,
      notes: notes.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingFixture ? `Edit Fixture: ${editingFixture.fixture_reference}` : 'Create Commercial Fixture'}
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit}>
        {/* Navigation Tabs inside Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
          }}
        >
          <button
            type="button"
            className="btn btn-sm"
            style={{
              backgroundColor: activeSection === 'particulars' ? 'var(--color-brand-primary)' : 'transparent',
              color: activeSection === 'particulars' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              fontWeight: 600,
            }}
            onClick={() => setActiveSection('particulars')}
          >
            1. Vessel & Parties
          </button>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              backgroundColor: activeSection === 'rotation' ? 'var(--color-brand-primary)' : 'transparent',
              color: activeSection === 'rotation' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              fontWeight: 600,
            }}
            onClick={() => setActiveSection('rotation')}
          >
            2. Multi-Port Rotation ({portNodes.length})
          </button>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              backgroundColor: activeSection === 'commercial' ? 'var(--color-brand-primary)' : 'transparent',
              color: activeSection === 'commercial' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              fontWeight: 600,
            }}
            onClick={() => setActiveSection('commercial')}
          >
            3. Commercial & Laycan
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-danger, #ef4444)',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        {/* SECTION 1: Particulars (Vessel, Charterer, Cargo) */}
        {activeSection === 'particulars' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Vessel Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                Chartered Vessel *
              </label>
              <select
                className="select"
                style={{ width: '100%', height: '38px', fontSize: '0.875rem' }}
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value ? Number(e.target.value) : '')}
                required
              >
                <option value="">-- Choose Vessel From Fleet Registry --</option>
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type}) • DWT: {v.dwt?.toLocaleString()} MT • IMO: {v.imo}
                  </option>
                ))}
              </select>
              {selectedVessel && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Selected: {selectedVessel.name} | Type: {selectedVessel.type} | IMO: {selectedVessel.imo} | DWT: {selectedVessel.dwt?.toLocaleString()} MT
                </div>
              )}
            </div>

            {/* Charterer & Broker Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Charterer Entity *
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  placeholder="e.g. Trafigura Maritime, Shell Global"
                  value={charterer}
                  onChange={(e) => setCharterer(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Brokerage / Broker Desk
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  placeholder="e.g. Clarksons Platou, Braemar ACM"
                  value={chartererBroker}
                  onChange={(e) => setChartererBroker(e.target.value)}
                />
              </div>
            </div>

            {/* Owner Entity & Charter Party Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Disponent Owner / Registered Owner
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={ownerEntity}
                  onChange={(e) => setOwnerEntity(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Charter Party Contract Form
                </label>
                <select
                  className="select"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={charterPartyForm}
                  onChange={(e) => setCharterPartyForm(e.target.value)}
                >
                  {CHARTER_PARTY_FORMS.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cargo & Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Commodity Description *
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  placeholder="e.g. Australian Thermal Coal, Arabian Heavy Crude"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Cargo Category
                </label>
                <select
                  className="select"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                >
                  <option value="Dry Bulk">Dry Bulk</option>
                  <option value="Liquid Bulk">Liquid Bulk</option>
                  <option value="Container">Container</option>
                  <option value="General Cargo">General Cargo</option>
                  <option value="Breakbulk">Breakbulk</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Quantity (MT) *
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={quantityTons}
                  onChange={(e) => setQuantityTons(e.target.value ? Number(e.target.value) : '')}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Multi-Port Rotation */}
        {activeSection === 'rotation' && (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Ordered Rotation & Call Schedule
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Add, reorder, and tag ports along the voyage rotation (Load, Bunkering, Canal Transit, Discharge).
              </p>
            </div>

            <FixturePortSequenceEditor
              ports={portNodes}
              availablePorts={ports}
              onChange={(updated) => setPortNodes(updated)}
            />
          </div>
        )}

        {/* SECTION 3: Commercial & Laycan */}
        {activeSection === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Commercial Rate Structure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Agreed Rate Value *
                </label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 24500"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Currency
                </label>
                <select
                  className="select"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={rateCurrency}
                  onChange={(e) => setRateCurrency(e.target.value as RateCurrency)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Basis / Rate Type
                </label>
                <select
                  className="select"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value as RateType)}
                >
                  <option value="per_day">Time Charter ($/Day)</option>
                  <option value="per_mt">Freight ($/MT)</option>
                  <option value="lumpsum">Lumpsum</option>
                  <option value="worldscale">Worldscale (WS)</option>
                </select>
              </div>
            </div>

            {/* Demurrage & Commission */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Demurrage Rate (USD / Day)
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={demurrageUsdDay}
                  onChange={(e) => setDemurrageUsdDay(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 20000"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Total Commission %
                </label>
                <input
                  type="number"
                  step="0.05"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 2.5"
                />
              </div>
            </div>

            {/* Laycan Dates & Fixture Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Fixture Date *
                </label>
                <input
                  type="date"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={fixtureDate}
                  onChange={(e) => setFixtureDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Laycan Commencing (Start) *
                </label>
                <input
                  type="date"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={laycanStart}
                  onChange={(e) => setLaycanStart(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Canceling Date (End) *
                </label>
                <input
                  type="date"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={laycanEnd}
                  onChange={(e) => setLaycanEnd(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Status & Rate Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Fixture Status
                </label>
                <select
                  className="select"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FixtureStatus)}
                >
                  <option value="draft">Draft</option>
                  <option value="on_subjects">On Subjects</option>
                  <option value="fully_fixed">Fully Fixed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  Special Clauses & Rate Notes
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', height: '36px', fontSize: '0.875rem' }}
                  value={rateNotes}
                  onChange={(e) => setRateNotes(e.target.value)}
                  placeholder="e.g. 1.25% address commission to charterers; Norwegean hull war risk clause"
                />
              </div>
            </div>

            {/* General Commercial Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                Operational & Commercial Desk Notes
              </label>
              <textarea
                className="input"
                style={{ width: '100%', height: '60px', fontSize: '0.8125rem', padding: '6px 10px' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes regarding vessel readiness, charterer credit approval, bunkering terms..."
              />
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.25rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div>
            {activeSection !== 'particulars' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (activeSection === 'commercial') setActiveSection('rotation');
                  else if (activeSection === 'rotation') setActiveSection('particulars');
                }}
              >
                Back
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>

            {activeSection !== 'commercial' ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (activeSection === 'particulars') setActiveSection('rotation');
                  else if (activeSection === 'rotation') setActiveSection('commercial');
                }}
              >
                Next Section →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={14} />
                {isSubmitting ? 'Saving...' : editingFixture ? 'Save Changes' : 'Register Fixture'}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
