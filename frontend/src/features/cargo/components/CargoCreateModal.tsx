import React, { useState } from 'react';
import { Plus, X, Package, AlertCircle, Compass } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Port } from '../../../types/port';
import type { CargoRecord } from '../../../types/cargo';

interface CargoCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  ports: Port[];
  onCreateCargo: (cargo: Partial<CargoRecord>) => void;
  onFindOptions?: (cargo: Partial<CargoRecord>) => void;
}

export const CargoCreateModal: React.FC<CargoCreateModalProps> = ({
  isOpen,
  onClose,
  ports,
  onCreateCargo,
  onFindOptions,
}) => {
  const [commodity, setCommodity] = useState('');
  const [cargoType, setCargoType] = useState('Dry Bulk');
  const [shipper, setShipper] = useState('');
  const [consignee, setConsignee] = useState('');
  const [weightTons, setWeightTons] = useState('');
  const [volumeM3, setVolumeM3] = useState('');
  const [originPortId, setOriginPortId] = useState('');
  const [destPortId, setDestPortId] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'standard' | 'high' | 'urgent'>('standard');
  const [isPrivate, setIsPrivate] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const buildPayload = (): Partial<CargoRecord> | null => {
    setErrorMsg(null);

    const weight = Number(weightTons);
    if (!weight || weight <= 0) {
      setErrorMsg('Please enter a valid deadweight tonnage greater than zero.');
      return null;
    }

    const origin = ports.find((p) => p.id === Number(originPortId));
    const dest = ports.find((p) => p.id === Number(destPortId));

    if (!origin || !dest) {
      setErrorMsg('Please select valid origin and destination loading seaports.');
      return null;
    }

    if (origin.id === dest.id) {
      setErrorMsg('Origin and destination ports cannot be identical.');
      return null;
    }

    return {
      commodity: commodity || `${cargoType} Consignment`,
      cargo_type: cargoType,
      shipper: shipper || 'Registered Enterprise Charterer',
      consignee: consignee || 'Industrial Receiving Terminal',
      weight_tons: weight,
      volume_m3: volumeM3 ? Number(volumeM3) : weight * 1.3,
      origin_port: {
        id: origin.id,
        name: origin.name,
        country: origin.country || 'International',
        unlocode: origin.unlocode || undefined,
        latitude: origin.latitude || 0,
        longitude: origin.longitude || 0,
      },
      destination_port: {
        id: dest.id,
        name: dest.name,
        country: dest.country || 'International',
        unlocode: dest.unlocode || undefined,
        latitude: dest.latitude || 0,
        longitude: dest.longitude || 0,
      },
      origin_port_id: origin.id,
      destination_port_id: dest.id,
      ready_date: readyDate ? new Date(readyDate).toISOString() : new Date().toISOString(),
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 86400000 * 7).toISOString(),
      priority,
      is_private: isPrivate,
      source: 'manual',
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    if (!payload) return;

    if (onFindOptions) {
      onFindOptions(payload);
    } else {
      onCreateCargo(payload);
    }
    onClose();
  };

  const handleSaveOnly = () => {
    const payload = buildPayload();
    if (!payload) return;
    onCreateCargo(payload);
    onClose();
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
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface)',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1101,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Register Freight Demand Consignment
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Add freight demand to registry with automated corridor routing and vessel matching
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <Input
              label="Commodity Description *"
              placeholder="e.g. Australian Coking Coal"
              required
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
            />

            <Select
              label="Cargo Category *"
              options={[
                { value: 'Dry Bulk', label: 'Dry Bulk (Ore, Coal, Grain)' },
                { value: 'Liquid Bulk', label: 'Liquid Bulk / Tanker Oil' },
                { value: 'Containerized', label: 'Containerized Freight' },
                { value: 'Breakbulk', label: 'Breakbulk / Steel / Machinery' },
              ]}
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
            />

            <Input
              label="Shipper / Charterer Entity *"
              placeholder="e.g. Rio Tinto Marine Logistics"
              required
              value={shipper}
              onChange={(e) => setShipper(e.target.value)}
            />

            <Input
              label="Consignee / Discharge Receiver"
              placeholder="e.g. Baosteel Terminal Services"
              value={consignee}
              onChange={(e) => setConsignee(e.target.value)}
            />

            <Input
              label="Deadweight (Tons) *"
              type="number"
              placeholder="e.g. 75000"
              required
              value={weightTons}
              onChange={(e) => setWeightTons(e.target.value)}
            />

            <Input
              label="Volume (m³)"
              type="number"
              placeholder="e.g. 92000"
              value={volumeM3}
              onChange={(e) => setVolumeM3(e.target.value)}
            />

            <Select
              label="Origin Seaport *"
              required
              options={[
                { value: '', label: 'Select loading port...' },
                ...ports.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.unlocode || p.country || 'Global'})`,
                })),
              ]}
              value={originPortId}
              onChange={(e) => setOriginPortId(e.target.value)}
            />

            <Select
              label="Destination Seaport *"
              required
              options={[
                { value: '', label: 'Select discharge port...' },
                ...ports.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.unlocode || p.country || 'Global'})`,
                })),
              ]}
              value={destPortId}
              onChange={(e) => setDestPortId(e.target.value)}
            />

            <Input
              label="Ready Date (Laycan Start)"
              type="date"
              value={readyDate}
              onChange={(e) => setReadyDate(e.target.value)}
            />

            <Input
              label="Laycan Canceling Date"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <Select
              label="Operational Priority"
              options={[
                { value: 'standard', label: 'Standard Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'urgent', label: 'Urgent Laycan' },
              ]}
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
            />

            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>Private Company Lineup (Confidential)</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" type="button" onClick={handleSaveOnly} icon={<Plus size={14} />}>
              Save Only
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<Compass size={14} />}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                fontWeight: 800,
                boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)',
              }}
            >
              FIND MARITIME OPTIONS
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
