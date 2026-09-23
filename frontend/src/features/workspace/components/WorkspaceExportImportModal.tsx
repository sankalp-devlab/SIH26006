/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Export / Import / Reset Modal
 */

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Download, Upload, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

interface WorkspaceExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceExportImportModal: React.FC<WorkspaceExportImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { exportWorkspaceJson, importWorkspaceJson, resetToDefaults } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'reset'>('export');
  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const exportedString = exportWorkspaceJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sih26006_workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportStatus(null);
    if (!importJson.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste valid JSON workspace data.' });
      return;
    }

    const res = importWorkspaceJson(importJson);
    if (res.success) {
      setImportStatus({
        type: 'success',
        message: 'Workspace imported and synchronized successfully!',
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setImportStatus({
        type: 'error',
        message: res.error || 'Failed to import workspace.',
      });
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all workspace data (favourites, lists, tags, queries, cargo) to factory default seeds?')) {
      await resetToDefaults();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace Data Management (Export & Import)"
      maxWidth="650px"
    >
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => { setActiveTab('export'); setImportStatus(null); }}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'export' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'export' ? '#38bdf8' : '#94a3b8',
            fontWeight: activeTab === 'export' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Download size={15} /> Export Workspace
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('import'); setImportStatus(null); }}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'import' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'import' ? '#38bdf8' : '#94a3b8',
            fontWeight: activeTab === 'import' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Upload size={15} /> Import Backup
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('reset'); setImportStatus(null); }}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reset' ? '2px solid #ef4444' : '2px solid transparent',
            color: activeTab === 'reset' ? '#ef4444' : '#94a3b8',
            fontWeight: activeTab === 'reset' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginLeft: 'auto',
          }}
        >
          <RotateCcw size={15} /> Reset
        </button>
      </div>

      {activeTab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Your personal workspace configuration (favourites, custom fleet lists, saved data queries,
            tags, templates, and private cargo tracking) can be exported as a verified JSON payload:
          </p>

          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              value={exportedString}
              rows={8}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                background: '#0b1329',
                color: '#38bdf8',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard' : 'Copy JSON'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Download File (.json)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Paste a valid SIH26006 workspace backup JSON below. Existing saved objects will be updated
            and synchronized across your active session.
          </p>

          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            rows={8}
            placeholder='{ "schema": "SIH26006_WORKSPACE_V1", "data": { ... } }'
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              background: '#0b1329',
              color: '#e2e8f0',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              resize: 'none',
            }}
          />

          {importStatus && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.85rem',
                backgroundColor:
                  importStatus.type === 'success'
                    ? 'rgba(52, 211, 153, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                border:
                  importStatus.type === 'success'
                    ? '1px solid rgba(52, 211, 153, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                color: importStatus.type === 'success' ? '#34d399' : '#ef4444',
              }}
            >
              {importStatus.message}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleImport}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={14} /> Validate & Import Workspace
            </button>
          </div>
        </div>
      )}

      {activeTab === 'reset' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: 14,
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem' }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>Warning: Reset Workspace</strong>
              This will erase any custom vessel lists, private cargo, saved queries, tags, and
              favourites you have added, resetting the environment to default demonstration records.
            </div>
          </div>

          <button
            type="button"
            className="btn"
            onClick={handleReset}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 10,
            }}
          >
            <RotateCcw size={16} /> Confirm Factory Reset to Default Seeds
          </button>
        </div>
      )}
    </Modal>
  );
};
