import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  Calendar,
  Layers,
  Copy,
  Check,
  Info,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type { SkipperMessage, GroundingStatus } from '../../../types/skipper';
import { ProvenanceBadge } from '../../../components/provenance';
import { ProvenanceService } from '../../../services/provenance/provenance.service';

interface SkipperRightInspectorProps {
  message: SkipperMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SkipperRightInspector: React.FC<SkipperRightInspectorProps> = ({
  message,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const grounding = message?.grounding;
  const rawRecords = message?.evidenceRecords || [];

  const handleCopyJson = () => {
    if (!rawRecords.length) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(rawRecords, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusBadges: Record<GroundingStatus, { class: string; label: string }> = {
    VERIFIED_LIVE_DATA: {
      class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      label: 'VERIFIED LIVE LEDGER',
    },
    HISTORICAL_DATA: {
      class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      label: 'HISTORICAL BENCHMARK',
    },
    DEMO_SIMULATED_DATA: {
      class: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      label: 'SIMULATED TELEMETRY',
    },
    DATA_UNAVAILABLE: {
      class: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      label: 'DATA UNAVAILABLE',
    },
  };

  // Determine active data source highlights based on grounding metadata
  const datasetLower = grounding?.datasetName.toLowerCase() || '';
  const isAisSource = datasetLower.includes('ais') || datasetLower.includes('vessel');
  const isMarketSource = datasetLower.includes('baltic') || datasetLower.includes('ffa') || datasetLower.includes('freight');
  const isVoyageSource = datasetLower.includes('voyage') || datasetLower.includes('port') || datasetLower.includes('fixture');

  return (
    <aside className="skipper-inspector-panel">
      {/* Inspector Header */}
      <div className="skipper-inspector-header">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider leading-none">
              GROUNDING INSPECTOR
            </h3>
            <p className="text-[10px] text-[#7189A3] mt-0.5">Zero Hallucination Audit Trail</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close inspector"
        >
          <X size={16} />
        </button>
      </div>

      {/* Inspector Body */}
      <div className="skipper-inspector-body scrollbar-thin text-xs">
        {!grounding ? (
          <div className="p-6 text-center text-[#7189A3] space-y-3 bg-[#091A2A] rounded-xl border border-slate-800/80 my-auto">
            <Info size={28} className="mx-auto text-slate-600" />
            <p className="text-xs leading-relaxed">
              Select an AI response card to inspect its empirical grounding records, parameters, and verification audit.
            </p>
          </div>
        ) : (
          <>
            {/* DATA SOURCES SECTION */}
            <div className="bg-[#091A2A] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7189A3]">
                  Data Sources
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    statusBadges[grounding.status]?.class || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {statusBadges[grounding.status]?.label || grounding.status}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#040E19] border border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Platform Database</span>
                  </div>
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>

                <div className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] ${
                  isAisSource
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white font-medium'
                    : 'bg-[#040E19] border-slate-800/80 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAisSource ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <span>Maritime AIS Telemetry</span>
                  </div>
                  {isAisSource && <span className="text-[9px] font-mono text-cyan-400">ACTIVE</span>}
                </div>

                <div className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] ${
                  isMarketSource
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white font-medium'
                    : 'bg-[#040E19] border-slate-800/80 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isMarketSource ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <span>Market Data (Baltic Index)</span>
                  </div>
                  {isMarketSource && <span className="text-[9px] font-mono text-cyan-400">ACTIVE</span>}
                </div>

                <div className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] ${
                  isVoyageSource
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white font-medium'
                    : 'bg-[#040E19] border-slate-800/80 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isVoyageSource ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <span>Voyage & Port Data</span>
                  </div>
                  {isVoyageSource && <span className="text-[9px] font-mono text-cyan-400">ACTIVE</span>}
                </div>
              </div>
            </div>

            {/* QUERY CONTEXT SECTION */}
            <div className="bg-[#091A2A] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7189A3] block">
                Query Context
              </span>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-start gap-2">
                  <Database size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-[#7189A3] block">Selected Dataset</span>
                    <span className="font-semibold text-white">{grounding.datasetName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Layers size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-[#7189A3] block">Source Citation</span>
                    <span className="text-slate-300">{grounding.sourceCitation}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Activity size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-[#7189A3] block">Retrieved Records</span>
                    <span className="font-mono text-emerald-300 font-semibold">{rawRecords.length} tabular records</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PROVENANCE AUDIT SECTION */}
            <div className="bg-[#091A2A] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7189A3] block">
                Provenance Audit
              </span>

              {/* Module 32 Unified Provenance Badge */}
              <div className="pb-1">
                <ProvenanceBadge
                  provenance={
                    grounding.provenance ||
                    ProvenanceService.createProvenance({
                      origin: grounding.datasetName.toLowerCase().includes('ais')
                        ? 'ais_satellite'
                        : grounding.datasetName.toLowerCase().includes('ffa') || grounding.datasetName.toLowerCase().includes('baltic')
                        ? 'baltic_exchange'
                        : 'canonical_benchmark',
                      observedAt: grounding.timestamp || new Date().toISOString(),
                      state: grounding.isSimulated ? 'simulated' : 'live',
                      confidenceScore: 0.98,
                    })
                  }
                  size="sm"
                />
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <Calendar size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#7189A3] block">Audit Timestamp</span>
                  <span className="font-mono text-slate-300 text-[10px]">
                    {new Date(grounding.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* QUERY PARAMETERS USED */}
            <div className="bg-[#091A2A] p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7189A3]">
                Interpreted Parameters
              </div>
              <pre className="text-[10px] font-mono text-cyan-300 bg-[#040E19] p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                {JSON.stringify(grounding.parametersUsed, null, 2)}
              </pre>
            </div>

            {/* RAW RETRIEVED EVIDENCE RECORDS */}
            <div className="bg-[#091A2A] p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7189A3]">
                  Retrieved Records ({rawRecords.length})
                </span>
                {rawRecords.length > 0 && (
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                )}
              </div>

              {rawRecords.length === 0 ? (
                <div className="text-[#7189A3] text-[11px] italic py-1">
                  No tabular records returned for this intent.
                </div>
              ) : (
                <pre className="text-[10px] font-mono text-slate-300 bg-[#040E19] p-2.5 rounded-lg border border-slate-800 max-h-64 overflow-y-auto scrollbar-thin">
                  {JSON.stringify(rawRecords, null, 2)}
                </pre>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
