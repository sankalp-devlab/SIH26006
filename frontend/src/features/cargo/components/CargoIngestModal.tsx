import React, { useState } from 'react';
import {
  Radio,
  X,
  Mail,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { CargoRecord, CargoSource } from '../../../types/cargo';
import type { Port } from '../../../types/port';

interface CargoIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  ports: Port[];
  onIngestCargo: (cargo: Partial<CargoRecord>) => void;
}

interface IngestPreset {
  title: string;
  source: CargoSource;
  sender: string;
  rawText: string;
  parsed: Partial<CargoRecord>;
}

export const CargoIngestModal: React.FC<CargoIngestModalProps> = ({
  isOpen,
  onClose,
  ports: _ports,
  onIngestCargo,
}) => {
  const PRESETS: IngestPreset[] = [
    {
      title: 'WhatsApp Broker Quote (Handymax Coal)',
      source: 'whatsapp',
      sender: 'Singapore Brokerage Desk (+65 9182 3341)',
      rawText: 'FIRM INQUIRY: 52,000 MT Thermal Coal (5,500 NAR), Samarinda / Mumbai. Laycan: 24-30 Sep 2026. Shipper: Adaro Indonesia. Draft max 12.5m.',
      parsed: {
        reference_number: `CRG-2026-${Math.floor(8900 + Math.random() * 1000)}`,
        source: 'whatsapp',
        source_message_id: `WA-RAW-${Date.now()}`,
        source_sender: 'Singapore Brokerage Desk (+65 9182 3341)',
        shipper: 'PT Adaro Energy Indonesia',
        consignee: 'Tata Power Trombay Station',
        commodity: 'Indonesian Thermal Coal (5,500 NAR)',
        cargo_type: 'Dry Bulk',
        weight_tons: 52000,
        volume_m3: 65000,
        origin_port: { id: 103, name: 'Samarinda Port', country: 'Indonesia', unlocode: 'IDSMD', latitude: -0.5, longitude: 117.15 },
        destination_port: { id: 102, name: 'JNPT Mumbai', country: 'India', unlocode: 'INJNP', latitude: 18.948, longitude: 72.951 },
        ready_date: '2026-09-24T00:00:00Z',
        deadline: '2026-09-30T23:59:59Z',
        priority: 'standard',
        zone: 'Zone B - Bay of Bengal',
        is_private: false,
        confidence_score: 96,
      },
    },
    {
      title: 'Email Chartering Circular (Crude Suezmax)',
      source: 'email',
      sender: 'chartering-desk@trafigura.com',
      rawText: 'RE: OPEN ORDER - 140,000 MT Arab Heavy Crude, Ras Tanura to Rotterdam Maasvlakte. Laycan 20-27 Sep 2026. Trafigura Maritime Rotterdam.',
      parsed: {
        reference_number: `CRG-2026-${Math.floor(8900 + Math.random() * 1000)}`,
        source: 'email',
        source_message_id: `EML-TRAF-${Date.now()}`,
        source_sender: 'chartering-desk@trafigura.com',
        shipper: 'Trafigura Maritime Pte Ltd',
        consignee: 'Rotterdam Maasvlakte Oil Terminal',
        commodity: 'Arab Heavy Crude Oil',
        cargo_type: 'Liquid Bulk',
        weight_tons: 140000,
        volume_m3: 161000,
        origin_port: { id: 101, name: 'Ras Tanura', country: 'Saudi Arabia', unlocode: 'SARST', latitude: 26.65, longitude: 50.16 },
        destination_port: { id: 105, name: 'Rotterdam Maasvlakte', country: 'Netherlands', unlocode: 'NLRTM', latitude: 51.96, longitude: 4.02 },
        ready_date: '2026-09-20T00:00:00Z',
        deadline: '2026-09-27T23:59:59Z',
        priority: 'high',
        zone: 'Zone D - Med & Europe',
        is_private: true,
        confidence_score: 98,
      },
    },
    {
      title: 'Slack Freight Channel Notice (Containerized Machinery)',
      source: 'slack',
      sender: '#asia-freight-desk (Marcus Wong)',
      rawText: 'NEW NOTICE: 18,500 MT containerized high-precision tooling equipment, Shanghai Yangshan to Antwerp. Ready 26 Sep, deadline 05 Oct. Cosco Logistics.',
      parsed: {
        reference_number: `CRG-2026-${Math.floor(8900 + Math.random() * 1000)}`,
        source: 'slack',
        source_message_id: `SLACK-COSCO-${Date.now()}`,
        source_sender: '#asia-freight-desk (Marcus Wong)',
        shipper: 'COSCO Shipping Logistics Co.',
        consignee: 'Siemens Energy AG Europe',
        commodity: 'High-Precision Industrial Tooling Equipment',
        cargo_type: 'Containerized',
        weight_tons: 18500,
        volume_m3: 42000,
        origin_port: { id: 106, name: 'Shanghai Yangshan', country: 'China', unlocode: 'CNSHA', latitude: 30.62, longitude: 122.07 },
        destination_port: { id: 110, name: 'Antwerp Port', country: 'Belgium', unlocode: 'BEANR', latitude: 51.27, longitude: 4.34 },
        ready_date: '2026-09-26T00:00:00Z',
        deadline: '2026-10-05T23:59:59Z',
        priority: 'standard',
        zone: 'Zone D - Med & Europe',
        is_private: false,
        confidence_score: 93,
      },
    },
  ];

  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const activePreset = PRESETS[selectedPresetIdx];

  if (!isOpen) return null;

  const handleIngest = () => {
    onIngestCargo(activePreset.parsed);
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

      {/* Modal Container */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '740px',
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
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Radio size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Multi-Channel Ingestion & Normalization Simulator
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Simulate ingestion from WhatsApp, Email, Slack broker circulars with automated entity normalization
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

        {/* Preset Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Select Incoming Ingestion Stream
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '6px' }}>
            {PRESETS.map((preset, idx) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => setSelectedPresetIdx(idx)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: selectedPresetIdx === idx ? '2px solid var(--color-brand-accent)' : '1px solid var(--color-border-subtle)',
                  backgroundColor: selectedPresetIdx === idx ? 'var(--color-brand-light)' : 'var(--color-bg-surface)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {preset.source === 'whatsapp' && <MessageSquare size={14} color="#10b981" />}
                  {preset.source === 'email' && <Mail size={14} color="#0284c7" />}
                  {preset.source === 'slack' && <Radio size={14} color="#8b5cf6" />}
                  <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>
                    {preset.source.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                  {preset.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Raw Inbound Message Text */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Raw Message Lineage
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              From: {activePreset.sender}
            </span>
          </div>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-bg-surface-alt)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
              lineHeight: 1.45,
            }}
          >
            "{activePreset.rawText}"
          </div>
        </div>

        {/* Normalized Output Preview */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} color="var(--color-brand-accent)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand-accent)', textTransform: 'uppercase' }}>
              Platform Normalized Cargo Consignment
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.6875rem', marginLeft: 'auto' }}>
              {activePreset.parsed.confidence_score}% Extraction Confidence
            </span>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #bae6fd',
              backgroundColor: '#f0f9ff',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.75rem',
            }}
          >
            <div>
              <div style={{ color: 'var(--color-text-muted)' }}>Shipper</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{activePreset.parsed.shipper}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)' }}>Commodity</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{activePreset.parsed.commodity}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)' }}>Tonnage</div>
              <div style={{ fontWeight: 700, color: 'var(--color-brand-accent)', marginTop: '2px' }}>
                {activePreset.parsed.weight_tons?.toLocaleString()} MT
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)' }}>Loading Port</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{activePreset.parsed.origin_port?.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)' }}>Discharge Port</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{activePreset.parsed.destination_port?.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)' }}>Corridor Zone</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{activePreset.parsed.zone}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCircle2 size={14} />}
            onClick={handleIngest}
          >
            Normalize & Ingest into Live Registry
          </Button>
        </div>
      </div>
    </div>
  );
};
