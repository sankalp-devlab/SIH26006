import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Anchor,
  Compass,
  Ship,
  Package,
  Clock,
  CloudOff,
  Waves,
  FileText,
  CheckCircle2,
  XCircle,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { RiskAssessmentResponse, FindingSeverity } from '../../../types/risk';

interface MaritimeRiskPanelProps {
  assessment: RiskAssessmentResponse | null;
  isLoading: boolean;
  onAssess?: () => void;
}

export const MaritimeRiskPanel: React.FC<MaritimeRiskPanelProps> = ({
  assessment,
  isLoading,
  onAssess,
}) => {
  const [showFindings, setShowFindings] = useState(false);
  const [showMissingDataNotice, setShowMissingDataNotice] = useState(false);

  if (!assessment) return null;

  const overallScore = assessment.overall_risk?.score ?? 0;
  const overallLevel = assessment.overall_risk?.level ?? 'LOW';

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)' };
      case 'MEDIUM':
        return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)' };
      case 'HIGH':
        return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)' };
      default:
        return { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.35)' };
    }
  };

  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return { text: '#f87171', bg: 'rgba(239, 68, 68, 0.2)', label: 'CRITICAL' };
      case 'HIGH':
        return { text: '#fb923c', bg: 'rgba(249, 115, 22, 0.2)', label: 'HIGH' };
      case 'MEDIUM':
        return { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.2)', label: 'MEDIUM' };
      case 'LOW':
      default:
        return { text: '#34d399', bg: 'rgba(16, 185, 129, 0.2)', label: 'LOW' };
    }
  };

  const levelTheme = getLevelColor(overallLevel);
  const recHook = assessment.recommendation_hook;
  const factors = assessment.factors;

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-surface-alt)',
        borderRadius: '8px',
        border: `1px solid ${levelTheme.border}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldAlert size={12} />
              MODULE 17 • MARITIME RISK ENGINE
            </span>
            <span
              style={{
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                color: '#94a3b8',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {assessment.risk_engine?.type || 'RULE_BASED'} v{assessment.risk_engine?.version || '1.0.0'}
            </span>
            <span
              style={{
                backgroundColor: levelTheme.bg,
                color: levelTheme.text,
                border: `1px solid ${levelTheme.border}`,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.05em',
              }}
            >
              OVERALL RISK: {overallLevel} ({overallScore}/100)
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Multi-factor navigational, canal draft, vessel fit, cargo deadweight, and security assessment
          </div>
        </div>

        {onAssess && (
          <Button
            size="sm"
            variant="secondary"
            icon={<ShieldCheck size={13} />}
            disabled={isLoading}
            onClick={onAssess}
            style={{ borderColor: levelTheme.border }}
          >
            {isLoading ? 'Assessing...' : 'Re-assess Risk'}
          </Button>
        )}
      </div>

      {/* Hero Risk Score & Recommendation Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '12px',
          padding: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: '1rem',
        }}
      >
        {/* Score Gauge */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              COMPOSITE VOYAGE RISK SCORE
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: levelTheme.text }}>
              {overallScore} <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>/ 100</span>
            </span>
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '8px 0',
            }}
          >
            <div
              style={{
                width: `${Math.min(overallScore, 100)}%`,
                height: '100%',
                backgroundColor: levelTheme.text,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)' }}>
            <span>LOW (0–25)</span>
            <span>MEDIUM (26–60)</span>
            <span>HIGH (61–100)</span>
          </div>
        </div>

        {/* Module 18 Recommendation Hook */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {recHook?.can_proceed ? (
              <CheckCircle2 size={15} color="#10b981" />
            ) : (
              <XCircle size={15} color="#ef4444" />
            )}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: recHook?.can_proceed ? '#10b981' : '#ef4444',
              }}
            >
              {recHook?.can_proceed ? 'Voyage Feasible & Cleared' : 'Operational Review Advised'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
            {recHook?.primary_concern || 'No critical transit restrictions detected across nautical corridor.'}
          </div>
        </div>
      </div>

      {/* 4 Active Empirical Factor Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '1rem',
        }}
      >
        {/* Route Risk */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
              <Compass size={12} /> Route & Canal
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Wt: 40%</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px', color: getLevelColor(factors.route_risk.level || 'LOW').text }}>
            {factors.route_risk.score ?? '—'} <span style={{ fontSize: '10px', fontWeight: 600 }}>({factors.route_risk.level})</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Draft clearance & chokepoint security
          </div>
        </div>

        {/* Vessel Risk */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#a78bfa', fontWeight: 600 }}>
              <Ship size={12} /> Vessel Fit
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Wt: 30%</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px', color: getLevelColor(factors.vessel_risk.level || 'LOW').text }}>
            {factors.vessel_risk.score ?? '—'} <span style={{ fontSize: '10px', fontWeight: 600 }}>({factors.vessel_risk.level})</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Cargo certification & maneuverability
          </div>
        </div>

        {/* Cargo Risk */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>
              <Package size={12} /> Cargo Load
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Wt: 20%</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px', color: getLevelColor(factors.cargo_risk.level || 'LOW').text }}>
            {factors.cargo_risk.score ?? '—'} <span style={{ fontSize: '10px', fontWeight: 600 }}>({factors.cargo_risk.level})</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Deadweight capacity & loadline safety
          </div>
        </div>

        {/* Port Risk */}
        <div
          style={{
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
              <Anchor size={12} /> Port Logistics
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Wt: 10%</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px', color: getLevelColor(factors.port_risk.level || 'LOW').text }}>
            {factors.port_risk.score ?? '—'} <span style={{ fontSize: '10px', fontWeight: 600 }}>({factors.port_risk.level})</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Terminal facilities & border clearance
          </div>
        </div>
      </div>

      {/* Missing Data Disclosure Banner (Rule 33 Zero Synthetic Data Guarantee) */}
      <div
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: 'rgba(148, 163, 184, 0.08)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          marginBottom: '1rem',
          fontSize: '11px',
        }}
      >
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setShowMissingDataNotice(!showMissingDataNotice)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontWeight: 600 }}>
            <CloudOff size={13} />
            Data Integrity Disclosure: 4 Factors Excluded (Zero Synthetic Data)
          </span>
          <Button size="xs" variant="ghost">
            {showMissingDataNotice ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </Button>
        </div>

        {showMissingDataNotice && (
          <div style={{ marginTop: '8px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            <p style={{ margin: '0 0 6px 0' }}>
              In compliance with platform data authenticity mandates, the following factors are explicitly marked <code>DATA_UNAVAILABLE</code> rather than fabricating synthetic scores:
            </p>
            <ul style={{ margin: '0', paddingLeft: '1.25rem' }}>
              <li><strong>Weather & Storm Telemetry:</strong> No live meteorological sensor or satellite feed in project database.</li>
              <li><strong>Ocean Swell & Currents:</strong> Live wave height and oceanic current telemetry unavailable.</li>
              <li><strong>Live Port Congestion:</strong> Dynamic berth queues and AIS waiting times not connected.</li>
              <li><strong>Historical Incidents:</strong> Zero historical accident logs available in Module 14 dataset.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Explainability Findings Accordion */}
      <div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowFindings(!showFindings)}
          style={{ width: '100%', justifyContent: 'space-between', fontSize: '11px' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={13} />
            Explainability Findings & Audit Log ({assessment.explanations?.length || 0})
          </span>
          {showFindings ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </Button>

        {showFindings && assessment.explanations && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '6px',
              border: '1px solid var(--color-border-subtle)',
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {assessment.explanations.map((finding, idx) => {
              const badge = getSeverityBadge(finding.severity);
              return (
                <div
                  key={idx}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderLeft: `3px solid ${badge.text}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {finding.message}
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: badge.bg,
                      color: badge.text,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Persistence and Timestamp Footer */}
      {assessment.persisted_assessment_id && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          <span>Record ID: #{assessment.persisted_assessment_id} (Supabase risk_assessments)</span>
          <span>{assessment.assessed_at ? new Date(assessment.assessed_at).toLocaleTimeString() : ''}</span>
        </div>
      )}
    </div>
  );
};
