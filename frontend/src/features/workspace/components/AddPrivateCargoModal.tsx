/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Add Private Cargo Modal
 */

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ShieldCheck, Ship, Anchor, Calendar, FileText } from 'lucide-react';
import type { PrivateCargoRecord, CargoTrackingStatus } from '../../../types/personalization';

interface AddPrivateCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cargo: Omit<PrivateCargoRecord, 'id' | 'createdAt' | 'updatedAt' | 'isPrivate'>) => void;
}

export const AddPrivateCargoModal: React.FC<AddPrivateCargoModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [cargoName, setCargoName] = useState('');
  const [cargoType, setCargoType] = useState('Crude Oil');
  const [volume, setVolume] = useState<number>(100000);
  const [unit, setUnit] = useState<'MT' | 'BBL' | 'CBM' | 'TEU'>('MT');
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [associatedVesselName, setAssociatedVesselName] = useState('');
  const [voyageRef, setVoyageRef] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [status, setStatus] = useState<CargoTrackingStatus>('in_transit');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('Priority');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoName.trim() || !originPort.trim() || !destinationPort.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      cargoName: cargoName.trim(),
      cargoType,
      volume: Number(volume) || 0,
      unit,
      originPort: originPort.trim(),
      destinationPort: destinationPort.trim(),
      associatedVesselName: associatedVesselName.trim() || undefined,
      voyageRef: voyageRef.trim() || undefined,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival).toISOString() : undefined,
      status,
      notes: notes.trim() || undefined,
      tags,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track New Private Cargo"
      maxWidth="620px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!cargoName.trim() || !originPort.trim() || !destinationPort.trim()}
          >
            Create Private Tracker
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Privacy Assurance Banner */}
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.85rem',
            color: '#38bdf8',
          }}
        >
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Private Workspace Scope:</strong> This cargo parcel is encrypted in your
            personal workspace. It is strictly inaccessible to external users, public maps, or
            global trade statistics.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
              Cargo Identifier / Parcel Title *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Murban Crude Parcel #418"
                value={cargoName}
                onChange={(e) => setCargoName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
              Commodity / Cargo Type
            </label>
            <select
              className="input-field"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Crude Oil">Crude Oil</option>
              <option value="Clean Petroleum">Clean Petroleum Products (CPP)</option>
              <option value="Fuel Oil / Dirty">Dirty Petroleum / Fuel Oil (DPP)</option>
              <option value="LNG">Liquefied Natural Gas (LNG)</option>
              <option value="LPG">Liquefied Petroleum Gas (LPG)</option>
              <option value="Chemicals">Liquid Chemicals</option>
              <option value="Dry Bulk">Dry Bulk (Iron Ore / Coal / Grain)</option>
              <option value="Container">Containerized Freight</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
              Volume / Quantity
            </label>
            <input
              type="number"
              className="input-field"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
              Unit
            </label>
            <select
              className="input-field"
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="MT">Metric Tons (MT)</option>
              <option value="BBL">Barrels (BBL)</option>
              <option value="CBM">Cubic Meters (CBM)</option>
              <option value="TEU">Twenty-foot (TEU)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
              Current Status
            </label>
            <select
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value as CargoTrackingStatus)}
              style={{ width: '100%' }}
            >
              <option value="planned">Planned</option>
              <option value="in_transit">In Transit</option>
              <option value="discharging">Discharging</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Anchor size={12} /> Origin Terminal / Port *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Ras Tanura (SA RTT)"
              value={originPort}
              onChange={(e) => setOriginPort(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Anchor size={12} /> Destination Terminal / Port *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Ningbo (CN NGB)"
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Ship size={12} /> Assigned Vessel Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. PACIFIC DISCOVERY"
              value={associatedVesselName}
              onChange={(e) => setAssociatedVesselName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
              Voyage Ref / Bill of Lading
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. VYG-2026-084"
              value={voyageRef}
              onChange={(e) => setVoyageRef(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> Estimated Arrival (ETA)
            </label>
            <input
              type="date"
              className="input-field"
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
            Workspace Tags (comma separated)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Priority, Charter Client A, Q4 Delivery"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FileText size={12} /> Operator Confidential Journal / Notes
          </label>
          <textarea
            className="input-field"
            rows={2}
            placeholder="e.g. Discharge window confirmed with terminal. Letter of indemnity issued."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  );
};
