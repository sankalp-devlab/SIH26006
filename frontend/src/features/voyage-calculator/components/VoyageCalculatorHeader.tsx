/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Calculator Header & Mode Switcher
 */

import React from 'react';
import {
  Compass,
  Ship,
  Save,
  Copy,
  Download,
  BookOpen,
  Layers,
  Flame,
  Wheat,
  Edit2,
} from 'lucide-react';
import type { VoyageMode, VoyageCalculationRecord, VoyageWorkbook } from '../../../types/voyage-calculator';

interface VoyageCalculatorHeaderProps {
  voyage: VoyageCalculationRecord;
  workbooks: VoyageWorkbook[];
  activeWorkbookId: string;
  onUpdateName: (name: string) => void;
  onSetMode: (mode: VoyageMode) => void;
  onOpenWorkbooks: () => void;
  onSave: () => void;
  onDuplicate: () => void;
  onExportCSV: () => void;
  onReset?: () => void;
}

export const VoyageCalculatorHeader: React.FC<VoyageCalculatorHeaderProps> = ({
  voyage,
  workbooks,
  activeWorkbookId,
  onUpdateName,
  onSetMode,
  onOpenWorkbooks,
  onSave,
  onDuplicate,
  onExportCSV,
}) => {
  const currentWb = workbooks.find((w) => w.id === activeWorkbookId);

  // Compute origin to destination route summary if legs exist
  const routeSummary = React.useMemo(() => {
    if (voyage.legs.length > 0) {
      const origin = voyage.legs[0].origin_port_name.replace(/ Port| Terminal| Anchorage/gi, '');
      const destination = voyage.legs[voyage.legs.length - 1].destination_port_name.replace(/ Port| Terminal| Anchorage/gi, '');
      return `${origin} → ${destination}`;
    }
    return null;
  }, [voyage.legs]);

  return (
    <div className="voyage-header-card">
      {/* Left: Eyebrow, Voyage Title, Compact Vessel Metadata */}
      <div className="voyage-header-left">
        <div className="voyage-eyebrow">
          <Compass size={13} style={{ color: 'var(--voyage-cyan)' }} />
          <span>Voyage Calculator</span>
          {routeSummary && (
            <>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: 'var(--voyage-text-secondary)', textTransform: 'none', letterSpacing: 'normal' }}>
                {routeSummary}
              </span>
            </>
          )}
        </div>

        <div className="voyage-title-row">
          <input
            type="text"
            className="voyage-title-input"
            value={voyage.name}
            onChange={(e) => onUpdateName(e.target.value)}
            title="Click to rename voyage"
            aria-label="Voyage Name"
          />
          <Edit2 size={15} style={{ color: 'var(--voyage-text-muted)', flexShrink: 0, opacity: 0.6 }} />
        </div>

        {/* Compact Metadata Row */}
        <div className="voyage-metadata-strip">
          <span className="voyage-meta-pill highlight">
            <Ship size={13} style={{ color: 'var(--voyage-cyan)' }} />
            <span>{voyage.vessel_name}</span>
          </span>

          <span className="voyage-meta-pill">
            <span>{voyage.vessel_type}</span>
          </span>

          <span className="voyage-meta-pill">
            <span>{voyage.vessel_dwt.toLocaleString()} MT DWT</span>
          </span>

          <span
            className="voyage-meta-pill clickable"
            onClick={onOpenWorkbooks}
            title="Switch or manage workbooks"
          >
            <BookOpen size={12} style={{ color: 'var(--voyage-cyan)' }} />
            <span>{currentWb ? currentWb.name : 'Default Workbook'}</span>
          </span>
        </div>
      </div>

      {/* Center: Dry Bulk vs Tanker Mode Switcher */}
      <div className="voyage-mode-toggle">
        <button
          type="button"
          onClick={() => onSetMode('dry')}
          className={`voyage-mode-btn ${voyage.mode === 'dry' ? 'active' : ''}`}
          title="Switch to Dry Bulk fixture calculation mode"
        >
          <Wheat size={14} />
          <span>Dry Bulk</span>
        </button>

        <button
          type="button"
          onClick={() => onSetMode('tanker')}
          className={`voyage-mode-btn ${voyage.mode === 'tanker' ? 'active' : ''}`}
          title="Switch to Tanker fixture calculation mode"
        >
          <Flame size={14} />
          <span>Tanker</span>
        </button>
      </div>

      {/* Right: Global Actions strictly aligned on baseline */}
      <div className="voyage-header-actions">
        <button
          type="button"
          className="voyage-action-btn"
          onClick={onOpenWorkbooks}
          title="Manage saved workbooks"
        >
          <Layers size={14} />
          <span>Workbooks</span>
        </button>

        <button
          type="button"
          className="voyage-action-btn"
          onClick={onDuplicate}
          title="Duplicate as new voyage scenario"
        >
          <Copy size={14} />
          <span>Duplicate</span>
        </button>

        <button
          type="button"
          className="voyage-action-btn"
          onClick={onExportCSV}
          title="Export calculation recap to CSV"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          className="voyage-action-btn primary"
          onClick={onSave}
          title="Save voyage calculation"
        >
          <Save size={14} />
          <span>Save Voyage</span>
        </button>
      </div>
    </div>
  );
};
