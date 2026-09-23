/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Emissions Command Center Header
 */

import { useState } from 'react';
import {
  Leaf,
  Download,
  RefreshCw,
  GitCompare,
  FileSpreadsheet,
  FileCode,
  Radio,
} from 'lucide-react';
import type {
  EmissionsScope,
  DataFreshnessStatus,
} from '../../../../types/emissions';

interface EmissionsHeaderProps {
  freshnessStatus: DataFreshnessStatus;
  lastUpdated: string;
  scope: EmissionsScope;
  onScopeChange: (scope: EmissionsScope) => void;
  isLive: boolean;
  onLiveChange: (isLive: boolean) => void;
  onRefresh: () => void;
  onExportVesselsCsv: () => void;
  onExportVoyagesCsv: () => void;
  onExportReportJson: () => void;
  onOpenCompare: () => void;
  compareCount: number;
  isLoading: boolean;
}

export function EmissionsHeader({
  freshnessStatus,
  lastUpdated,
  scope,
  onScopeChange,
  isLive,
  onLiveChange,
  onRefresh,
  onExportVesselsCsv,
  onExportVoyagesCsv,
  onExportReportJson,
  onOpenCompare,
  compareCount,
  isLoading,
}: EmissionsHeaderProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, #0b192c 0%, #0f243e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Title & Subtitle */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <Leaf size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: '#f8fafc',
                }}
              >
                EMISSIONS INTELLIGENCE
              </h1>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(0, 102, 204, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  letterSpacing: '0.05em',
                }}
              >
                MODULE 21
              </span>
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: '#94a3b8',
                margin: 0,
              }}
            >
              Vessel, voyage, operational and fleet-level emissions analytics
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls & Freshness Badge */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
        {/* Data Freshness Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '6px 12px',
            borderRadius: '6px',
            background: freshnessStatus === 'LIVE_SIGNAL_API' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.1)',
            border: `1px solid ${freshnessStatus === 'LIVE_SIGNAL_API' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`,
            fontSize: '0.75rem',
            color: freshnessStatus === 'LIVE_SIGNAL_API' ? '#10b981' : '#38bdf8',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: freshnessStatus === 'LIVE_SIGNAL_API' ? '#10b981' : '#38bdf8',
              boxShadow: freshnessStatus === 'LIVE_SIGNAL_API' ? '0 0 8px #10b981' : '0 0 8px #38bdf8',
            }}
          />
          <span style={{ fontWeight: 600 }}>
            {freshnessStatus === 'LIVE_SIGNAL_API' ? '● LIVE SIGNAL API' : '● SIMULATED DATA (Signal Compatible)'}
          </span>
          <span style={{ color: '#64748b' }}>&bull; {lastUpdated}</span>
        </div>

        {/* Emissions Scope Selector */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {(
            [
              { id: 'tank_to_wake', label: 'Tank-to-Wake' },
              { id: 'well_to_wake', label: 'Well-to-Wake' },
              { id: 'eu_ets', label: 'EU ETS Scope' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onScopeChange(s.id)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: scope === s.id ? '#0066cc' : 'transparent',
                color: scope === s.id ? '#ffffff' : '#94a3b8',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Live / Historical Toggle */}
        <button
          type="button"
          onClick={() => onLiveChange(!isLive)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: isLive ? 'rgba(0, 102, 204, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            color: isLive ? '#38bdf8' : '#94a3b8',
          }}
        >
          <Radio size={14} className={isLive ? 'animate-pulse' : ''} />
          {isLive ? 'Live Stream' : 'Historical Mode'}
        </button>

        {/* Comparison Trigger Button */}
        <button
          type="button"
          onClick={onOpenCompare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: compareCount > 0 ? '#1e3e62' : 'rgba(255, 255, 255, 0.05)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <GitCompare size={14} />
          Compare Matrix
          {compareCount > 0 && (
            <span
              style={{
                background: '#0066cc',
                color: '#fff',
                fontSize: '0.6875rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              {compareCount}
            </span>
          )}
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh emissions intelligence"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#cbd5e1',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>

        {/* Export Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: '#0066cc',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 102, 204, 0.3)',
            }}
          >
            <Download size={14} />
            Export
          </button>

          {isExportOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                width: '210px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                padding: '4px',
                zIndex: 100,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onExportVesselsCsv();
                  setIsExportOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <FileSpreadsheet size={14} style={{ color: '#10b981' }} />
                Export Vessels (CSV)
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportVoyagesCsv();
                  setIsExportOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <FileSpreadsheet size={14} style={{ color: '#38bdf8' }} />
                Export Voyages (CSV)
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportReportJson();
                  setIsExportOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <FileCode size={14} style={{ color: '#f59e0b' }} />
                Full Dossier (JSON)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
