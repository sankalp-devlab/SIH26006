import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Copy,
  ChevronDown,
  Check,
  TrendingUp,
  Globe2,
  Leaf,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import type { ReportingDashboardView, ReportFilterState } from '../../../../types/reporting';

interface ReportingHeaderProps {
  activeView: ReportingDashboardView;
  onViewChange: (view: ReportingDashboardView) => void;
  filter: ReportFilterState;
  onOpenDossier: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onCopyTsv: () => void;
  copyFeedback: string | null;
  filteredCount: number;
  totalCount: number;
}

const VIEW_TABS: { id: ReportingDashboardView; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'commercial', label: 'Commercial Freight & Earnings', icon: TrendingUp },
  { id: 'trade_flows', label: 'Trade Flows & Ton-Miles', icon: Globe2 },
  { id: 'emissions', label: 'Decarbonization & CII', icon: Leaf },
  { id: 'valuations', label: 'Valuations & Fleet Allocation', icon: DollarSign },
];

export const ReportingHeader: React.FC<ReportingHeaderProps> = ({
  activeView,
  onViewChange,
  onOpenDossier,
  onExportCsv,
  onExportJson,
  onCopyTsv,
  copyFeedback,
  filteredCount,
  totalCount,
}) => {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      {/* Top row: Title, badges, and primary action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              MODULE 25
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              8-STAGE INTERACTIVE FUNNEL
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Ledger Verified
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Reporting & Analytics UX
            <Sparkles size={18} className="text-cyan-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Enterprise maritime intelligence terminal with contextual drill-downs, empirical fixture ledgers, and strategic decision guidance.
          </p>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Active ledger records pill */}
          <div className="text-xs bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <span className="text-slate-500 mr-1">Audited Scope:</span>
            <span className="font-semibold text-cyan-400">{filteredCount.toLocaleString()}</span>
            <span className="text-slate-500"> / {totalCount.toLocaleString()} fixtures</span>
          </div>

          {/* Consolidated Executive Dossier button */}
          <button
            id="btn-executive-dossier"
            onClick={onOpenDossier}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium shadow-md shadow-cyan-900/20 transition-all border border-cyan-400/30"
          >
            <FileText size={15} />
            Consolidated Dossier
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="btn-export-dropdown"
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Download size={14} className="text-cyan-400" />
              Export
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportOpen && (
              <div
                className="absolute right-0 mt-1.5 w-48 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-50 py-1"
                onMouseLeave={() => setExportOpen(false)}
              >
                <button
                  id="btn-export-csv"
                  onClick={() => {
                    onExportCsv();
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  Export CSV Ledger
                </button>
                <button
                  id="btn-export-json"
                  onClick={() => {
                    onExportJson();
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Download size={14} className="text-cyan-400" />
                  Export JSON Package
                </button>
                <button
                  id="btn-copy-tsv"
                  onClick={() => {
                    onCopyTsv();
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-800"
                >
                  <Copy size={14} className="text-indigo-400" />
                  Copy TSV to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy feedback badge */}
      {copyFeedback && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs animate-in fade-in duration-200 w-fit">
          <Check size={14} />
          {copyFeedback}
        </div>
      )}

      {/* Navigation View Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
        {VIEW_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-view-${tab.id}`}
              onClick={() => onViewChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-slate-800 to-slate-800/90 text-white shadow-sm border border-cyan-500/30 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
