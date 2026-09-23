/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Data-Driven Emissions Intelligence & Insights Panel
 */

import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { EmissionsAnalyticalInsight } from '../../../../types/emissions';

interface EmissionsInsightsPanelProps {
  insights: EmissionsAnalyticalInsight[];
}

export function EmissionsInsightsPanel({ insights }: EmissionsInsightsPanelProps) {
  if (!insights || insights.length === 0) return null;

  const urgencyStyles = {
    info: {
      border: 'rgba(56, 189, 248, 0.25)',
      bg: 'rgba(56, 189, 248, 0.05)',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeColor: '#38bdf8',
      icon: Info,
    },
    warning: {
      border: 'rgba(245, 158, 11, 0.3)',
      bg: 'rgba(245, 158, 11, 0.05)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeColor: '#f59e0b',
      icon: AlertTriangle,
    },
    positive: {
      border: 'rgba(16, 185, 129, 0.3)',
      bg: 'rgba(16, 185, 129, 0.05)',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeColor: '#10b981',
      icon: CheckCircle2,
    },
  };

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <Sparkles size={16} style={{ color: '#38bdf8' }} />
        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '0.02em' }}>
          DYNAMIC EMISSIONS INTELLIGENCE
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' }}>
          Data-driven operational observations derived from active filters
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {insights.map((ins) => {
          const style = urgencyStyles[ins.urgency] || urgencyStyles.info;
          const Icon = style.icon;

          return (
            <div
              key={ins.id}
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: style.badgeBg,
                      color: style.badgeColor,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {ins.badge}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: style.badgeColor, fontSize: '0.6875rem', fontWeight: 600 }}>
                    <Icon size={12} />
                    <span>{ins.impactValue}</span>
                  </div>
                </div>

                <h4 style={{ margin: '0.25rem 0 0.35rem 0', fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  {ins.title}
                </h4>

                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  {ins.narrative}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '0.625rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.6875rem',
                  color: '#64748b',
                }}
              >
                <span>Metric:</span>
                <strong style={{ color: '#cbd5e1' }}>{ins.impactMetric}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
