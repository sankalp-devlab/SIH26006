/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Multi-Port Ordered Rotation Sequence Editor
 */

import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Fuel,
  UploadCloud,
  DownloadCloud,
  Compass,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import type { FixturePortNode, PortNodeType } from '../../../types/fixture';

interface PortOption {
  id: number;
  name: string;
  country: string;
  unlocode?: string;
  max_draft?: number;
}

interface FixturePortSequenceEditorProps {
  ports: FixturePortNode[];
  availablePorts: PortOption[];
  onChange: (updatedPorts: FixturePortNode[]) => void;
  readOnly?: boolean;
}

const PORT_TYPE_META: Record<
  PortNodeType,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  load: {
    label: 'Load Port',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.12)',
    icon: <UploadCloud size={13} />,
  },
  discharge: {
    label: 'Discharge Port',
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.12)',
    icon: <DownloadCloud size={13} />,
  },
  bunkering: {
    label: 'Bunkering',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.12)',
    icon: <Fuel size={13} />,
  },
  transit: {
    label: 'Transit / Canal',
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.12)',
    icon: <Compass size={13} />,
  },
};

export const FixturePortSequenceEditor: React.FC<FixturePortSequenceEditorProps> = ({
  ports,
  availablePorts,
  onChange,
  readOnly = false,
}) => {
  const [selectedPortId, setSelectedPortId] = useState<number | ''>('');
  const [selectedPortType, setSelectedPortType] = useState<PortNodeType>('load');

  const handleAddPort = () => {
    if (!selectedPortId) return;
    const found = availablePorts.find((p) => p.id === Number(selectedPortId));
    if (!found) return;

    const newPort: FixturePortNode = {
      sequence: ports.length + 1,
      port_id: found.id,
      port_name: found.name,
      country: found.country,
      unlocode: found.unlocode,
      port_type: selectedPortType,
      draft_m: found.max_draft,
    };

    onChange([...ports, newPort]);
    setSelectedPortId('');
  };

  const handleRemovePort = (index: number) => {
    const updated = ports
      .filter((_, idx) => idx !== index)
      .map((p, idx) => ({ ...p, sequence: idx + 1 }));
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...ports];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    // Re-index sequences
    const reindexed = updated.map((p, idx) => ({ ...p, sequence: idx + 1 }));
    onChange(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index >= ports.length - 1) return;
    const updated = [...ports];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    // Re-index sequences
    const reindexed = updated.map((p, idx) => ({ ...p, sequence: idx + 1 }));
    onChange(reindexed);
  };

  const handleUpdateField = (
    index: number,
    field: keyof FixturePortNode,
    value: unknown
  ) => {
    const updated = ports.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: value };
      }
      return p;
    });
    onChange(updated);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {/* Visual Sequence Chain Ribbon */}
      <div
        style={{
          padding: '0.75rem',
          backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.02))',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          minHeight: '44px',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
          Rotation Flow:
        </span>
        {ports.length === 0 ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            No ports in sequence. Add at least one load and one discharge port.
          </span>
        ) : (
          ports.map((node, idx) => {
            const meta = PORT_TYPE_META[node.port_type];
            return (
              <React.Fragment key={idx}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: meta.bg,
                    color: meta.color,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: `1px solid ${meta.color}40`,
                  }}
                >
                  <span style={{ opacity: 0.8 }}>#{node.sequence}</span>
                  {node.port_name}
                  <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', opacity: 0.85 }}>
                    ({node.port_type})
                  </span>
                </div>
                {idx < ports.length - 1 && (
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.8125rem' }}>
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Ordered List of Ports */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {ports.map((port, index) => {
          const meta = PORT_TYPE_META[port.port_type];
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                flexWrap: 'wrap',
              }}
            >
              {/* Sequence badge & Reorder buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-brand-primary, #0284c7)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {port.sequence}
                </span>

                {!readOnly && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '1px',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        opacity: index === 0 ? 0.3 : 0.8,
                        lineHeight: 0,
                      }}
                      title="Move up in rotation sequence"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === ports.length - 1}
                      onClick={() => handleMoveDown(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '1px',
                        cursor: index === ports.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: index === ports.length - 1 ? 0.3 : 0.8,
                        lineHeight: 0,
                      }}
                      title="Move down in rotation sequence"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Port Name & Country Info */}
              <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} style={{ color: 'var(--color-text-secondary)' }} />
                  {port.port_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {port.country} {port.unlocode ? `(${port.unlocode})` : ''}
                </div>
              </div>

              {/* Port Type Select */}
              <div style={{ minWidth: '140px' }}>
                {readOnly ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: meta.bg,
                      color: meta.color,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                ) : (
                  <select
                    className="select"
                    style={{
                      height: '32px',
                      fontSize: '0.8125rem',
                      width: '100%',
                      fontWeight: 600,
                      color: meta.color,
                    }}
                    value={port.port_type}
                    onChange={(e) => handleUpdateField(index, 'port_type', e.target.value as PortNodeType)}
                  >
                    <option value="load">Load Port</option>
                    <option value="discharge">Discharge Port</option>
                    <option value="bunkering">Bunkering</option>
                    <option value="transit">Transit / Canal</option>
                  </select>
                )}
              </div>

              {/* ETA & ETD Dates */}
              {!readOnly ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>ETA:</span>
                    <input
                      type="date"
                      className="input"
                      style={{ height: '30px', fontSize: '0.75rem', padding: '2px 6px', width: '125px' }}
                      value={port.eta || ''}
                      onChange={(e) => handleUpdateField(index, 'eta', e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>ETD:</span>
                    <input
                      type="date"
                      className="input"
                      style={{ height: '30px', fontSize: '0.75rem', padding: '2px 6px', width: '125px' }}
                      value={port.etd || ''}
                      onChange={(e) => handleUpdateField(index, 'etd', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {port.eta ? `ETA: ${port.eta}` : ''} {port.etd ? `| ETD: ${port.etd}` : ''}
                </div>
              )}

              {/* Delete action */}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemovePort(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger, #ef4444)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Remove port from sequence"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Port Row */}
      {!readOnly && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.02))',
            borderRadius: '8px',
            border: '1px dashed var(--color-border)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <select
              className="select"
              style={{ height: '36px', fontSize: '0.875rem', width: '100%' }}
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">-- Select Port to Append to Sequence --</option>
              {availablePorts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.country}) {p.unlocode ? `[${p.unlocode}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select
              className="select"
              style={{ height: '36px', fontSize: '0.875rem', width: '100%' }}
              value={selectedPortType}
              onChange={(e) => setSelectedPortType(e.target.value as PortNodeType)}
            >
              <option value="load">Load Port</option>
              <option value="discharge">Discharge Port</option>
              <option value="bunkering">Bunkering</option>
              <option value="transit">Transit / Canal</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAddPort}
            disabled={!selectedPortId}
            style={{
              height: '36px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <Plus size={15} /> Add Port Node
          </button>
        </div>
      )}

      {ports.length === 0 && !readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.75rem' }}>
          <AlertCircle size={14} />
          Commercial fixtures require at least 1 Load Port and 1 Discharge Port.
        </div>
      )}
    </div>
  );
};
