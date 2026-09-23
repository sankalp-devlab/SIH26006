/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Desktop Export Modal
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import {
  FileSpreadsheet,
  FileText,
  Database,
  Copy,
  Download,
  Check,
  Columns,
  BookmarkPlus,
  Table,
} from 'lucide-react';
import type {
  ExportFormat,
  ExportColumnDefinition,
  ExportProvenanceMetadata,
  ExportResult,
} from '../../types/export-sharing';
import { ExportService } from '../../services/export-sharing/export.service';
import { ExportFormatter } from '../../services/export-sharing/export-formatter.service';
import { ColumnSelector } from './ColumnSelector';
import { personalizationService } from '../../services/personalization/personalization.service';

interface ExportModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataset: string;
  data: T[];
  columns: ExportColumnDefinition<T>[];
  metadata?: ExportProvenanceMetadata;
  onSuccess?: (result: ExportResult) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  dataset,
  data,
  columns: initialColumns,
  metadata,
  onSuccess,
}) => {
  const [columns, setColumns] = useState<ExportColumnDefinition[]>(initialColumns);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    initialColumns.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );
  const [customFilename, setCustomFilename] = useState('');
  const [isColumnPanelOpen, setIsColumnPanelOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeColumns = ExportService.resolveActiveColumns(columns, selectedKeys);

  const handleExport = async () => {
    setIsExporting(true);
    setStatusMessage(null);

    const fullMetadata: ExportProvenanceMetadata = {
      datasetName: dataset,
      exportedAt: new Date().toISOString(),
      recordCount: data.length,
      provenanceStatus: metadata?.provenanceStatus || 'CANONICAL_EMPIRICAL',
      activeFilters: metadata?.activeFilters,
      dateRange: metadata?.dateRange,
      originUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    const res = await ExportService.executeExport({
      title,
      dataset,
      data,
      columns: activeColumns,
      format: selectedFormat,
      filename: customFilename.trim() || undefined,
      metadata: fullMetadata,
    });

    setIsExporting(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: selectedFormat === 'tsv'
          ? `Copied ${data.length} records to clipboard as TSV!`
          : `Exported ${data.length} records as ${res.filename} (${(res.byteSize / 1024).toFixed(1)} KB)`,
      });
      if (onSuccess) onSuccess(res);
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1500);
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to export data.',
      });
    }
  };

  const handleSaveAsTemplate = () => {
    const templateName = prompt('Enter a name for this custom export template:', `${title} Template`);
    if (!templateName || !templateName.trim()) return;

    personalizationService.createTemplate(
      templateName.trim(),
      `Custom column profile for ${dataset} with ${selectedKeys.length} columns.`,
      'export',
      {
        targetDataset: dataset,
        selectedColumnKeys: selectedKeys,
        defaultFormat: selectedFormat,
      },
      ['Export Profile']
    );

    alert(`Export template "${templateName.trim()}" saved to your Personal Workspace!`);
  };

  const FORMAT_CARDS: { id: ExportFormat; title: string; subtitle: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
    {
      id: 'csv',
      title: 'CSV Spreadsheet',
      subtitle: 'RFC 4180 with UTF-8 BOM',
      icon: FileText,
    },
    {
      id: 'xlsx',
      title: 'Microsoft Excel XML',
      subtitle: 'Native .xls with frozen panes',
      icon: FileSpreadsheet,
    },
    {
      id: 'json',
      title: 'Structured JSON',
      subtitle: 'Full metadata & records envelope',
      icon: Database,
    },
    {
      id: 'tsv',
      title: 'Copy TSV to Clipboard',
      subtitle: 'Paste directly into Excel/Sheets',
      icon: Copy,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export Dataset: ${title}`}
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSaveAsTemplate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
          >
            <BookmarkPlus size={14} /> Save as Workspace Template
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isExporting}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExport}
              disabled={isExporting || selectedKeys.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {selectedFormat === 'tsv' ? <Copy size={14} /> : <Download size={14} />}
              {isExporting
                ? 'Processing...'
                : selectedFormat === 'tsv'
                ? 'Copy to Clipboard'
                : `Download ${selectedFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Record count summary bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: '0.82rem',
          }}
        >
          <span style={{ color: '#94a3b8' }}>
            Target Records: <strong style={{ color: '#f8fafc' }}>{data.length.toLocaleString()} rows</strong>
          </span>
          <span style={{ color: '#38bdf8' }}>
            Active Columns: <strong>{activeColumns.length} fields</strong>
          </span>
        </div>

        {/* Format Selection Cards */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 8, display: 'block' }}>
            Choose Export Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {FORMAT_CARDS.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormat === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 8,
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <Icon size={20} color={isSelected ? '#38bdf8' : '#94a3b8'} />
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                    {fmt.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                    {fmt.subtitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Filename */}
        {selectedFormat !== 'tsv' && (
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, display: 'block' }}>
              Custom Filename (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder={ExportService.generateFilename(title, selectedFormat)}
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              style={{ width: '100%', fontSize: '0.82rem' }}
            />
          </div>
        )}

        {/* Column Configuration Toggle */}
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsColumnPanelOpen((prev) => !prev)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              padding: '8px 12px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Columns size={14} color="#38bdf8" /> Configure Exported Columns & Sequence
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
              {isColumnPanelOpen ? 'Hide Column Selector ▲' : `Customize (${activeColumns.length} fields) ▼`}
            </span>
          </button>

          {isColumnPanelOpen && (
            <div style={{ marginTop: 10 }}>
              <ColumnSelector
                columns={columns}
                selectedKeys={selectedKeys}
                onChangeSelectedKeys={setSelectedKeys}
                onReorderColumns={setColumns}
              />
            </div>
          )}
        </div>

        {/* Preview of first 3 rows */}
        {data.length > 0 && (
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Table size={12} /> Sample Row Preview (First {Math.min(3, data.length)} records)
            </div>
            <div
              style={{
                overflowX: 'auto',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
                maxHeight: 120,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8' }}>
                    {activeColumns.slice(0, 6).map((c) => (
                      <th key={c.key} style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        {c.header}
                      </th>
                    ))}
                    {activeColumns.length > 6 && <th style={{ padding: '6px 8px' }}>...</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 3).map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {activeColumns.slice(0, 6).map((c) => (
                        <td key={c.key} style={{ padding: '6px 8px', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                          {ExportFormatter.formatCellValue(ExportFormatter.extractValue(row, c.key), row, c)}
                        </td>
                      ))}
                      {activeColumns.length > 6 && <td style={{ padding: '6px 8px', color: '#64748b' }}>...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {statusMessage && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor:
                statusMessage.type === 'success'
                  ? 'rgba(52, 211, 153, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              border:
                statusMessage.type === 'success'
                  ? '1px solid rgba(52, 211, 153, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.4)',
              color: statusMessage.type === 'success' ? '#34d399' : '#ef4444',
            }}
          >
            {statusMessage.type === 'success' && <Check size={14} />}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
