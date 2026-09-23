import React from 'react';
import {
  Compass,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { DecisionRecommendation } from '../../../../types/reporting';

interface DecisionGuidancePanelProps {
  recommendations: DecisionRecommendation[];
  hasDrillDown: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  chartering: TrendingUp,
  hedging: ShieldCheck,
  decarbonization: Leaf,
  allocation: Compass,
};

const categoryColors: Record<string, { color: string; bg: string; border: string }> = {
  chartering:      { color: 'var(--ol-cyan)',   bg: 'var(--ol-cyan-subtle)',              border: 'rgba(0,217,255,0.2)' },
  hedging:         { color: '#818cf8',           bg: 'rgba(129,140,248,0.1)',              border: 'rgba(129,140,248,0.2)' },
  decarbonization: { color: 'var(--ol-green)',   bg: 'var(--ol-green-subtle)',             border: 'rgba(32,201,138,0.2)' },
  allocation:      { color: 'var(--ol-amber)',   bg: 'var(--ol-amber-subtle)',             border: 'rgba(255,176,32,0.2)' },
};

const impactColors: Record<string, { color: string; bg: string; border: string }> = {
  High:      { color: 'var(--ol-red)',   bg: 'var(--ol-red-subtle)',   border: 'rgba(255,77,85,0.25)' },
  Medium:    { color: 'var(--ol-amber)', bg: 'var(--ol-amber-subtle)', border: 'rgba(255,176,32,0.25)' },
  Strategic: { color: 'var(--ol-cyan)',  bg: 'var(--ol-cyan-subtle)',  border: 'rgba(0,217,255,0.25)' },
};

export const DecisionGuidancePanel: React.FC<DecisionGuidancePanelProps> = ({
  recommendations,
  hasDrillDown,
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--ol-surface-primary)',
      border: '1px solid var(--ol-border)',
      borderRadius: 'var(--ol-radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--ol-shadow-sm)',
      marginBottom: '24px',
      boxSizing: 'border-box',
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--ol-border)',
        paddingBottom: '14px',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '7px',
              borderRadius: 'var(--ol-radius-sm)',
              backgroundColor: 'var(--ol-cyan-subtle)',
              color: 'var(--ol-cyan)',
              border: '1px solid rgba(0,217,255,0.2)',
              flexShrink: 0,
            }}>
              <Target size={15} />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--ol-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              Strategic Decision Guidance Matrix
              <Sparkles size={13} style={{ color: 'var(--ol-cyan)' }} />
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
            Step 8 of Funnel — Algorithmic operational directives derived from active reporting scope and drill-down audit
          </p>
        </div>

        {hasDrillDown && (
          <span style={{
            fontSize: '11px',
            padding: '5px 12px',
            borderRadius: 'var(--ol-radius-md)',
            backgroundColor: 'var(--ol-cyan-subtle)',
            color: 'var(--ol-cyan)',
            border: '1px solid rgba(0,217,255,0.25)',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            Contextual Drill-Down Mode
          </span>
        )}
      </div>

      {/* Decision Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}
        className="m25-decision-grid"
      >
        {recommendations.map((rec) => {
          const Icon = categoryIcons[rec.category] || Compass;
          const catStyle = categoryColors[rec.category] || { color: 'var(--ol-text-muted)', bg: 'var(--ol-surface-secondary)', border: 'var(--ol-border)' };
          const impStyle = impactColors[rec.impactScore] || { color: 'var(--ol-text-muted)', bg: 'var(--ol-surface-secondary)', border: 'var(--ol-border)' };

          return (
            <div
              key={rec.id}
              style={{
                backgroundColor: 'var(--ol-surface-secondary)',
                border: '1px solid var(--ol-border)',
                borderRadius: 'var(--ol-radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxSizing: 'border-box',
                minWidth: 0,
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ol-border-strong)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ol-border)')}
            >
              {/* Card header row: category badge + impact badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: catStyle.color,
                  backgroundColor: catStyle.bg,
                  border: `1px solid ${catStyle.border}`,
                  maxWidth: '55%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  <Icon size={11} style={{ flexShrink: 0 }} />
                  {rec.category}
                </span>

                <span style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: impStyle.color,
                  backgroundColor: impStyle.bg,
                  border: `1px solid ${impStyle.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {rec.impactScore} Impact
                </span>
              </div>

              {/* Title */}
              <h4 style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--ol-text-primary)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {rec.title}
              </h4>

              {/* Directive description */}
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: 'var(--ol-text-secondary)',
                lineHeight: 1.6,
              }}>
                {rec.guidance}
              </p>

              {/* Data Rationale box */}
              <div style={{
                fontSize: '10px',
                color: 'var(--ol-text-muted)',
                backgroundColor: 'var(--ol-surface-elevated)',
                padding: '8px 10px',
                borderRadius: 'var(--ol-radius-sm)',
                border: '1px solid var(--ol-border)',
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-secondary)', marginRight: '4px' }}>Data Rationale:</span>
                {rec.rationale}
              </div>

              {/* Footer: execution window + target metric */}
              <div style={{
                borderTop: '1px solid var(--ol-border)',
                paddingTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                fontSize: '11px',
                marginTop: 'auto',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--ol-text-muted)' }}>Execution Window:</span>
                  <span style={{ fontWeight: 700, color: 'var(--ol-text-primary)' }}>{rec.actionableWindow}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ol-cyan)', fontWeight: 700 }}>
                    <ArrowRight size={10} />
                    Target:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--ol-cyan)' }}>{rec.metricTarget}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
