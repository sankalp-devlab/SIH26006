import React, { useState } from 'react';
import {
  GitMerge,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { CargoRecord } from '../../../types/cargo';

interface CargoMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  primary: CargoRecord | null;
  duplicate: CargoRecord | null;
  onConfirmMerge: (primaryId: number, duplicateId: number, mergedFields: Partial<CargoRecord>) => void;
}

export const CargoMergeModal: React.FC<CargoMergeModalProps> = ({
  isOpen,
  onClose,
  primary,
  duplicate,
  onConfirmMerge,
}) => {
  if (!isOpen || !primary || !duplicate) return null;

  // Selected values for merged record (defaulting to primary)
  const [selectedShipper, setSelectedShipper] = useState<string>(primary.shipper);
  const [selectedCommodity, setSelectedCommodity] = useState<string>(primary.commodity);
  const [selectedWeight, setSelectedWeight] = useState<number>(primary.weight_tons);
  const [selectedReadyDate, setSelectedReadyDate] = useState<string>(primary.ready_date);
  const [selectedDeadline] = useState<string>(primary.deadline);

  const handleMerge = () => {
    onConfirmMerge(primary.id, duplicate.id, {
      shipper: selectedShipper,
      commodity: selectedCommodity,
      weight_tons: selectedWeight,
      ready_date: selectedReadyDate,
      deadline: selectedDeadline,
    });
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
          maxWidth: '780px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitMerge size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Controlled Consignment Merge
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Select commercial fields to retain in the primary record. The candidate duplicate will be safely archived.
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

        {/* Warning Banner */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.25rem',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Explicit Operator Decision:</strong> Merging will consolidate quotes into Primary Consignment{' '}
            <strong>{primary.reference_number}</strong> and archive <strong>{duplicate.reference_number}</strong> with audit history preserved.
          </span>
        </div>

        {/* Side-by-Side Field Selection Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              gap: '0.75rem',
              padding: '8px 12px',
              backgroundColor: 'var(--color-bg-surface-alt)',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            <span>Attribute</span>
            <span>Primary: {primary.reference_number} ({primary.source.toUpperCase()})</span>
            <span>Duplicate: {duplicate.reference_number} ({duplicate.source.toUpperCase()})</span>
          </div>

          {/* Shipper */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              gap: '0.75rem',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border-subtle)',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Shipper</span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedShipper === primary.shipper ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="shipper"
                checked={selectedShipper === primary.shipper}
                onChange={() => setSelectedShipper(primary.shipper)}
              />
              <span style={{ fontWeight: selectedShipper === primary.shipper ? 700 : 400 }}>
                {primary.shipper}
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedShipper === duplicate.shipper ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="shipper"
                checked={selectedShipper === duplicate.shipper}
                onChange={() => setSelectedShipper(duplicate.shipper)}
              />
              <span style={{ fontWeight: selectedShipper === duplicate.shipper ? 700 : 400 }}>
                {duplicate.shipper}
              </span>
            </label>
          </div>

          {/* Commodity */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              gap: '0.75rem',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border-subtle)',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Commodity</span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedCommodity === primary.commodity ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="commodity"
                checked={selectedCommodity === primary.commodity}
                onChange={() => setSelectedCommodity(primary.commodity)}
              />
              <span style={{ fontWeight: selectedCommodity === primary.commodity ? 700 : 400 }}>
                {primary.commodity}
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedCommodity === duplicate.commodity ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="commodity"
                checked={selectedCommodity === duplicate.commodity}
                onChange={() => setSelectedCommodity(duplicate.commodity)}
              />
              <span style={{ fontWeight: selectedCommodity === duplicate.commodity ? 700 : 400 }}>
                {duplicate.commodity}
              </span>
            </label>
          </div>

          {/* Weight */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              gap: '0.75rem',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border-subtle)',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Deadweight (MT)</span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedWeight === primary.weight_tons ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="weight"
                checked={selectedWeight === primary.weight_tons}
                onChange={() => setSelectedWeight(primary.weight_tons)}
              />
              <span style={{ fontWeight: selectedWeight === primary.weight_tons ? 700 : 400 }}>
                {primary.weight_tons.toLocaleString()} MT
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedWeight === duplicate.weight_tons ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="weight"
                checked={selectedWeight === duplicate.weight_tons}
                onChange={() => setSelectedWeight(duplicate.weight_tons)}
              />
              <span style={{ fontWeight: selectedWeight === duplicate.weight_tons ? 700 : 400 }}>
                {duplicate.weight_tons.toLocaleString()} MT
              </span>
            </label>
          </div>

          {/* Ready Date */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              gap: '0.75rem',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border-subtle)',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Ready Date</span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedReadyDate === primary.ready_date ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="ready_date"
                checked={selectedReadyDate === primary.ready_date}
                onChange={() => setSelectedReadyDate(primary.ready_date)}
              />
              <span style={{ fontWeight: selectedReadyDate === primary.ready_date ? 700 : 400 }}>
                {new Date(primary.ready_date).toLocaleDateString()}
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: selectedReadyDate === duplicate.ready_date ? '#f0fdf4' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="ready_date"
                checked={selectedReadyDate === duplicate.ready_date}
                onChange={() => setSelectedReadyDate(duplicate.ready_date)}
              />
              <span style={{ fontWeight: selectedReadyDate === duplicate.ready_date ? 700 : 400 }}>
                {new Date(duplicate.ready_date).toLocaleDateString()}
              </span>
            </label>
          </div>
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none' }}
            icon={<Check size={14} />}
            onClick={handleMerge}
          >
            Confirm Merge & Archive Duplicate
          </Button>
        </div>
      </div>
    </div>
  );
};
