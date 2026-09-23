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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
            List / Fleet Name *
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. My Tankers, VLCC Watchlist, Competitor Fleet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
            Description (Optional)
          </label>
          <textarea
            className="input-field"
            rows={2}
            placeholder="e.g. Dedicated crude carriers operating under spot charters in the Middle East."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={14} /> Pool Highlight Color
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2px solid #ffffff' : '2px solid transparent',
                  cursor: 'pointer',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ship size={14} /> Initial Vessel IDs (comma separated)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 1, 2, 5, 8"
            value={vesselIdsInput}
            onChange={(e) => setVesselIdsInput(e.target.value)}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, display: 'block' }}>
            You can also add and remove vessels anytime directly from vessel dossier pages.
          </span>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={14} /> Fleet Tags (comma separated)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Crude, Priority, High Consumption"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </form>
    </Modal>
  );
};
