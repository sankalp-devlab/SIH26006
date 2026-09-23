/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Mobile Export & Share Sheet
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Database,
  Share2,
  Copy,
  Download,
  Check,
  Smartphone,
} from 'lucide-react';
import { MobileBottomSheet } from '../mobile/MobileBottomSheet';
import type {
  ExportFormat,
  ExportColumnDefinition,
  ExportProvenanceMetadata,
  ExportResult,
} from '../../types/export-sharing';
import { ExportService } from '../../services/export-sharing/export.service';
import { SharingService } from '../../services/export-sharing/sharing.service';

export interface MobileExportSheetProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataset: string;
  data: T[];
  columns: ExportColumnDefinition<T>[];
  metadata?: ExportProvenanceMetadata;
  onSuccess?: (result: ExportResult) => void;
}

export const MobileExportSheet: React.FC<MobileExportSheetProps> = ({
  isOpen,
  onClose,
  title,
  dataset,
  data,
  columns,
  metadata,
  onSuccess,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formats: {
    format: ExportFormat;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      format: 'csv',
      label: 'CSV (Universal)',
      description: 'Comma-separated with UTF-8 BOM',
      icon: FileText,
    },
    {
      format: 'excel',
      label: 'Excel (.xls)',
      description: 'Styled SpreadsheetML with formatting',
      icon: FileSpreadsheet,
    },
    {
      format: 'json',
      label: 'JSON Document',
      description: 'Standard machine-readable export',
      icon: Database,
    },
  ];

  const handleDownload = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const result = await ExportService.exportData({
        format: selectedFormat,
        dataset,
        data,
        columns,
        metadata: {
          ...metadata,
          source: 'Mobile Intelligence View',
        },
      });

      setStatusMessage({
        type: 'success',
        text: `Exported ${result.recordCount} rows (${(result.byteSize / 1024).toFixed(1)} KB)`,
      });

      if (onSuccess) onSuccess(result);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Export failed',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      const shared = await SharingService.shareViaWebShare({
        title: `${dataset} — Maritime Intelligence`,
        text: `Exported ${data.length} records from ${dataset}`,
        url: shareUrl,
      });

      if (shared) {
        setStatusMessage({ type: 'success', text: 'Shared successfully!' });
      } else {
        // Fallback copied
        setStatusMessage({ type: 'success', text: 'Share link copied to clipboard!' });
      }
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Sharing failed' });
    }
  };

  const handleCopyClipboard = async () => {
    try {
      const result = await ExportService.exportData({
        format: 'tsv',
        dataset,
        data,
        columns,
      });
      setStatusMessage({ type: 'success', text: `Copied ${result.recordCount} rows to clipboard` });
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Clipboard copy failed' });
    }
  };

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title || `Export ${dataset}`}
    >
      <div className="space-y-4 pb-4">
        {/* Row count pill */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Active Dataset:</span>
            <span className="font-semibold text-white">{dataset}</span>
          </div>
          <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-mono font-medium">
            {data.length} records
          </span>
        </div>

        {/* Format Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Select Output Format
          </label>
          <div className="grid grid-cols-1 gap-2">
            {formats.map(({ format, label, description, icon: Icon }) => {
              const isSelected = selectedFormat === format;
              return (
                <button
                  key={format}
                  type="button"
                  onClick={() => setSelectedFormat(format)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs text-slate-400">{description}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : null}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting || data.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating File...' : `Download ${selectedFormat.toUpperCase()}`}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Share View</span>
            </button>
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy TSV</span>
            </button>
          </div>
        </div>
      </div>
    </MobileBottomSheet>
  );
};
