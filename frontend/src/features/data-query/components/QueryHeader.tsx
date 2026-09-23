import React, { useState } from 'react';
import {
  LineChart,
  Table,
  Layers,
  Share2,
  Download,
  RefreshCw,
  Code,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
  Calendar,
  Zap,
  FileSpreadsheet,
} from 'lucide-react';
import type {
  QueryMode,
  QueryTemplatePreset,
} from '../../../types/data-query';

interface QueryHeaderProps {
  mode: QueryMode;
  onSetMode: (mode: QueryMode) => void;
  presets: QueryTemplatePreset[];
  onSelectPreset: (preset: QueryTemplatePreset) => void;
  onRefresh: () => void;
  isFetching: boolean;
  executionTimeMs: number;
  onOpenShareModal: () => void;
  onToggleCustomSql: () => void;
  isCustomSqlOpen: boolean;
  onExportCsv: () => void;
  onExportJson: () => void;
  onCopyTsv: () => void;
  onResetToDefault: () => void;
  onOpenExportModal?: () => void;
  onOpenExcelAnalytics?: () => void;
}

export const QueryHeader: React.FC<QueryHeaderProps> = ({
  mode,
  onSetMode,
  presets,
  onSelectPreset,
  onRefresh,
  isFetching,
  executionTimeMs,
  onOpenShareModal,
  onToggleCustomSql,
  isCustomSqlOpen,
  onExportCsv,
  onExportJson,
  onCopyTsv,
  onResetToDefault,
  onOpenExportModal,
  onOpenExcelAnalytics,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  const modeButtons: { id: QueryMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'time_series', label: 'Time Series', icon: LineChart },
    { id: 'raw_data', label: 'Raw Data Ledger', icon: Table },
    { id: 'pivot', label: 'Pivot Aggregation', icon: Layers },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
      {/* Top Row: Title, Historical Depth Badge, Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              MODULE 24
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-cyan-400" />
              Coverage: 2014 – Present (12+ Years)
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-slate-800/80 text-emerald-400 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {executionTimeMs}ms
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
            Maritime Data Query & Analytics Workbench
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-dimensional data explorer over empirical freight rates, trade flows, fleet ton-miles, and emissions.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPresetOpen((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Templates
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isPresetOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Analytical Templates
                </div>
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPreset(p);
                      setIsPresetOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs transition group"
                  >
                    <div className="font-semibold text-white group-hover:text-cyan-400">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {p.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom SQL Toggle */}
          <button
            onClick={onToggleCustomSql}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              isCustomSqlOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Open SQL Query Editor"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            SQL Console
          </button>

          {/* Share Query Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Share refreshable query URL"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            Share Query
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50">
                {onOpenExcelAnalytics && (
                  <button
                    onClick={() => {
                      onOpenExcelAnalytics();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-sky-300 font-semibold flex items-center justify-between border-b border-slate-800 mb-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                      <span>Excel Analytics (.xls)...</span>
                    </span>
                    <span className="font-mono text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
                      5-Sheet
                    </span>
                  </button>
                )}
                {onOpenExportModal && (
                  <button
                    onClick={() => {
                      onOpenExportModal();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-cyan-300 font-semibold flex items-center justify-between border-b border-slate-800 mb-1"
                  >
                    <span>Full Export Wizard...</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                )}
                <button
                  onClick={() => {
                    onExportCsv();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                >
                  <span>Download CSV</span>
                  <span className="font-mono text-[10px] text-slate-400">.csv</span>
                </button>
                <button
                  onClick={() => {
                    onExportJson();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                >
                  <span>Download JSON</span>
                  <span className="font-mono text-[10px] text-slate-400">.json</span>
                </button>
                <button
                  onClick={() => {
                    onCopyTsv();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                >
                  <span>Copy for Excel / Sheets</span>
                  <span className="font-mono text-[10px] text-slate-400">TSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
            title="Refresh current query"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Reset Action */}
          <button
            onClick={onResetToDefault}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="Reset workbench to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Query Mode Tabs */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          {modeButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = mode === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onSetMode(btn.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
                {isActive && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>Mode: <strong className="text-cyan-400 uppercase">{mode.replace('_', ' ')}</strong></span>
        </div>
      </div>
    </div>
  );
};
