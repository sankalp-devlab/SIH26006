/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 32: DATA SOURCES, PROVENANCE & FRESHNESS ARCHITECTURE
 * Reusable Provenance Badge Component
 */

import React, { useState } from 'react';
import {
  Radio,
  Satellite,
  Mail,
  FileSpreadsheet,
  TrendingUp,
  Anchor,
  ShieldAlert,
  Cpu,
  Lock,
  Info,
  AlertTriangle,
} from 'lucide-react';
import type { DataProvenance, DataFreshnessLevel } from '../../types/provenance';
import { ProvenanceInspectorModal } from './ProvenanceInspectorModal';

export interface ProvenanceBadgeProps {
  provenance: DataProvenance;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  showInspector?: boolean;
  showFreshnessOnly?: boolean;
  interactive?: boolean; // opens inspector modal on click
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  size,
  compact = false,
  showInspector,
  showFreshnessOnly = false,
  interactive,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const effectiveSize = size || (compact ? 'sm' : 'md');
  const isInteractive = showInspector !== undefined ? showInspector : (interactive !== undefined ? interactive : true);

  // Origin icon resolution
  const getOriginIcon = (sizePx: number) => {
    switch (provenance.origin) {
      case 'ais_terrestrial':
        return <Radio size={sizePx} color="#38bdf8" />;
      case 'ais_satellite':
        return <Satellite size={sizePx} color="#0284c7" />;
      case 'email_parser':
      case 'whatsapp_connector':
      case 'slack_connector':
      case 'ms_teams_connector':
        return <Mail size={sizePx} color="#f59e0b" />;
      case 'fixture_reports':
      case 'port_lineup_authority':
      case 'customs_manifest':
        return <FileSpreadsheet size={sizePx} color="#10b981" />;
      case 'baltic_exchange':
        return <TrendingUp size={sizePx} color="#6366f1" />;
      case 'sanctions_list_ofac':
      case 'class_society':
      case 'imo_gisis':
        return <ShieldAlert size={sizePx} color="#ef4444" />;
      case 'calculated_analytics':
        return <Cpu size={sizePx} color="#06b6d4" />;
      case 'user_workspace_private':
        return <Lock size={sizePx} color="#a855f7" />;
      default:
        return <Anchor size={sizePx} color="#94a3b8" />;
    }
  };

  // Freshness color theme
  const getFreshnessStyles = (level: DataFreshnessLevel) => {
    switch (level) {
      case 'LIVE':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          dot: '#10b981',
          pulse: true,
        };
      case 'RECENT':
        return {
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          dot: '#0284c7',
          pulse: false,
        };
      case 'STALE':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          color: '#fbbf24',
          dot: '#f59e0b',
          pulse: false,
        };
      case 'HISTORICAL':
        return {
          bg: 'rgba(129, 140, 248, 0.12)',
          border: 'rgba(129, 140, 248, 0.3)',
          color: '#818cf8',
          dot: '#6366f1',
          pulse: false,
        };
      case 'PREDICTED':
        return {
          bg: 'rgba(168, 85, 247, 0.12)',
          border: 'rgba(168, 85, 247, 0.3)',
          color: '#c084fc',
          dot: '#a855f7',
          pulse: false,
        };
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.1)',
          border: 'rgba(148, 163, 184, 0.2)',
          color: '#94a3b8',
          dot: '#64748b',
          pulse: false,
        };
    }
  };

  const fStyle = getFreshnessStyles(provenance.freshness);
  const isPrivate = provenance.privacy === 'workspace_private';
  const hasConflict = !!provenance.conflict?.hasConflict;
  const isCalculated = provenance.derivation === 'calculated_formula';

  const sizeClasses = {
    sm: { padding: '2px 6px', fontSize: '0.68rem', iconSize: 11, gap: 4 },
    md: { padding: '3px 9px', fontSize: '0.74rem', iconSize: 13, gap: 6 },
    lg: { padding: '5px 12px', fontSize: '0.82rem', iconSize: 15, gap: 8 },
  }[effectiveSize];

  return (
    <>
      <div
        className={`provenance-badge-wrap ${className}`}
        onClick={() => isInteractive && setIsModalOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: sizeClasses.gap,
          padding: sizeClasses.padding,
          borderRadius: 6,
          background: isPrivate ? 'rgba(139, 92, 246, 0.12)' : fStyle.bg,
          border: `1px solid ${isPrivate ? 'rgba(139, 92, 246, 0.4)' : fStyle.border}`,
          color: isPrivate ? '#c084fc' : fStyle.color,
          fontSize: sizeClasses.fontSize,
          fontWeight: 500,
          cursor: isInteractive ? 'pointer' : 'default',
          userSelect: 'none',
          transition: 'all 0.15s ease',
        }}
        title={`${provenance.originLabel} • ${provenance.freshness} (${provenance.ageHumanized || 'Observed'}) • Click for audit details`}
      >
        {/* Origin Icon */}
        {!showFreshnessOnly && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {getOriginIcon(sizeClasses.iconSize)}
          </span>
        )}

        {/* Private Shield Pill */}
        {isPrivate && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
            <Lock size={sizeClasses.iconSize - 2} /> PRIVATE
          </span>
        )}

        {/* Origin Label */}
        {!showFreshnessOnly && !isPrivate && (
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
            {provenance.originLabel}
          </span>
        )}

        {/* Calculated indicator */}
        {isCalculated && !showFreshnessOnly && (
          <span
            style={{
              fontSize: '0.65rem',
              padding: '1px 4px',
              borderRadius: 3,
              background: 'rgba(6, 182, 212, 0.2)',
              color: '#22d3ee',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            CALCULATED
          </span>
        )}

        {/* Freshness Status Pill */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: '0.9em',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: fStyle.dot,
              display: 'inline-block',
              boxShadow: fStyle.pulse ? `0 0 6px ${fStyle.dot}` : 'none',
            }}
          />
          {provenance.freshness}
        </span>

        {/* Relative Age */}
        {provenance.ageHumanized && (
          <span style={{ opacity: 0.8, fontSize: '0.88em', fontWeight: 400 }}>
            ({provenance.ageHumanized})
          </span>
        )}

        {/* Conflict Warning Indicator */}
        {hasConflict && (
          <span title="Variance detected between multiple sources" style={{ color: '#f59e0b', display: 'flex' }}>
            <AlertTriangle size={sizeClasses.iconSize} />
          </span>
        )}

        {/* Info hover trigger indicator */}
        {interactive && (
          <Info size={sizeClasses.iconSize - 2} style={{ opacity: 0.6, marginLeft: 2 }} />
        )}
      </div>

      {/* Audit Modal */}
      {interactive && (
        <ProvenanceInspectorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          provenance={provenance}
        />
      )}
    </>
  );
};
