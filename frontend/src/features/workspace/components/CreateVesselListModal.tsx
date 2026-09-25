/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Create Vessel List Modal
 */

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Ship, Tag, Palette } from 'lucide-react';

interface CreateVesselListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, initialVesselIds?: number[], tags?: string[], color?: string) => void;
}

const COLOR_OPTIONS = ['#38bdf8', '#34d399', '#f59e0b', '#ef4444', '#818cf8', '#ec4899', '#a855f7'];

export const CreateVesselListModal: React.FC<CreateVesselListModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#38bdf8');
  const [tagsInput, setTagsInput] = useState('');
  const [vesselIdsInput, setVesselIdsInput] = useState('1, 2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const vesselIds = vesselIdsInput
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onCreate(name.trim(), description.trim() || undefined, vesselIds, tags, color);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Saved Vessel List / Fleet Pool"
      maxWidth="520px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Create Fleet Pool
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, display: 'block' }}>
            List / Fleet Name <span style={{ color: '#38bdf8' }}>*</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. My Tankers, VLCC Watchlist, Competitor Fleet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, display: 'block' }}>
            Description <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="e.g. Dedicated crude carriers operating under spot charters in the Middle East."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ minHeight: 74, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={14} style={{ color: '#38bdf8' }} /> Pool Highlight Color
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2.5px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  transform: color === c ? 'scale(1.18)' : 'scale(1)',
                  boxShadow: color === c ? `0 0 12px ${c}` : '0 2px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ship size={14} style={{ color: '#38bdf8' }} /> Initial Vessel IDs <span style={{ color: '#64748b', fontWeight: 400 }}>(comma separated)</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 1, 2, 5, 8"
            value={vesselIdsInput}
            onChange={(e) => setVesselIdsInput(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 5, display: 'block' }}>
            You can also add and remove vessels anytime directly from vessel dossier pages.
          </span>
        </div>

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={14} style={{ color: '#38bdf8' }} /> Fleet Tags <span style={{ color: '#64748b', fontWeight: 400 }}>(comma separated)</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Crude, Priority, High Consumption"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
