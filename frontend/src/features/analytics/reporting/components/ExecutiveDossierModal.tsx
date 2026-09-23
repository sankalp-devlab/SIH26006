import React from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type { ExecutiveDossierReport } from '../../../../types/reporting';

interface ExecutiveDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: ExecutiveDossierReport;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const ExecutiveDossierModal: React.FC<ExecutiveDossierModalProps> = ({
  isOpen,
  onClose,
  dossier,
  onExportCsv,
  onExportJson,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => { if (typeof window !== 'undefined') window.print(); };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(6px)',
      overflowY: 'auto',
    }}>
      <div style={{
        backgroundColor: 'var(--ol-surface-primary)',
        border: '1px solid rgba(0,217,255,0.35)',
        borderRadius: 'var(--ol-radius-xl)',
        maxWidth: '860px',
        width: '100%',
        boxShadow: 'var(--ol-shadow-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        margin: '32px 0',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--ol-border)',
          backgroundColor: 'var(--ol-surface-secondary)',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ padding: '8px', borderRadius: 'var(--ol-radius-md)', backgroundColor: 'var(--ol-cyan-subtle)', color: 'var(--ol-cyan)', border: '1px solid rgba(0,217,255,0.2)', flexShrink: 0 }}>
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--ol-text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Consolidated Executive Dossier
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
                Formal maritime intelligence digest &amp; strategic directives
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              id="btn-print-dossier"
              onClick={handlePrint}
              className="ol-btn ol-btn-primary ol-btn-sm"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
            <button
              onClick={onExportCsv}
              className="ol-btn ol-btn-secondary ol-btn-sm"
              title="Export Ledger CSV"
            >
              <FileSpreadsheet size={14} />
            </button>
            <button
              onClick={onExportJson}
              className="ol-btn ol-btn-secondary ol-btn-sm"
              title="Export JSON"
            >
              <Download size={14} />
            </button>
            <button
              onClick={onClose}
              className="ol-btn ol-btn-ghost ol-btn-sm"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Dossier Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--ol-text-secondary)', flex: 1 }}
          className="printable-area">

          {/* Document Header */}
          <div style={{ borderBottom: '1px solid var(--ol-border)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ol-text-muted)', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{dossier.id}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={12} style={{ color: 'var(--ol-cyan)' }} />
                {new Date(dossier.generatedAt).toLocaleString()}
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--ol-text-primary)', letterSpacing: '-0.01em' }}>{dossier.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: 'var(--ol-cyan-subtle)',
                color: 'var(--ol-cyan)',
                border: '1px solid rgba(0,217,255,0.2)',
                fontSize: '11px',
                fontWeight: 700,
              }}>
                {dossier.activeHorizon}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ol-text-muted)' }}>{dossier.activeFiltersSummary}</span>
            </div>
          </div>

          {/* Section 1: Executive KPI Digest */}
          <div>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ol-text-muted)' }}>
              1. Macro Fleet &amp; Earnings Performance Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {dossier.kpiSummary.map((kpi) => (
                <div key={kpi.id} style={{
                  backgroundColor: 'var(--ol-surface-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--ol-radius-md)',
                  border: '1px solid var(--ol-border)',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--ol-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ol-text-primary)' }}>{kpi.value}</div>
                  <div style={{ fontSize: '10px', color: 'var(--ol-cyan)', marginTop: '4px' }}>{kpi.benchmark}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Corridor Breakdown */}
          <div>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ol-text-muted)' }}>
              2. Key Shipping Corridors &amp; Performance
            </h4>
            <div style={{ backgroundColor: 'var(--ol-surface-secondary)', borderRadius: 'var(--ol-radius-md)', border: '1px solid var(--ol-border)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '480px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--ol-border)' }}>
                      {['Route Code', 'Corridor Name', 'Basin', 'Performance Metric', 'Audited Fixtures'].map((h, i) => (
                        <th key={h} style={{ padding: '9px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--ol-text-muted)', textAlign: i >= 3 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dossier.topCorridors.map((c) => (
                      <tr key={c.routeCode} style={{ borderBottom: '1px solid rgba(100,190,240,0.07)' }}>
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: 'var(--ol-cyan)' }}>{c.routeCode}</td>
                        <td style={{ padding: '9px 12px', color: 'var(--ol-text-primary)' }}>{c.routeName}</td>
                        <td style={{ padding: '9px 12px', color: 'var(--ol-text-muted)' }}>{c.basin}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--ol-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{c.value.toLocaleString()} {c.unit}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--ol-text-muted)' }}>{c.fixtureCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: Drill-Down Findings (conditional) */}
          {dossier.drillDownSummary && (
            <div style={{
              backgroundColor: 'rgba(0,217,255,0.04)',
              border: '1px solid rgba(0,217,255,0.25)',
              borderRadius: 'var(--ol-radius-lg)',
              padding: '16px 20px',
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ol-cyan)' }}>
                3. Isolated Drill-Down Scope Findings
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--ol-text-secondary)' }}>
                Focus Scope: <strong style={{ color: 'var(--ol-text-primary)' }}>{dossier.drillDownSummary.context.label}</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                {[
                  { label: 'Verified Fixtures', value: String(dossier.drillDownSummary.filteredCount), color: 'var(--ol-text-primary)' },
                  { label: 'Average Voyage TCE', value: `$${dossier.drillDownSummary.avgTce.toLocaleString()}/day`, color: 'var(--ol-green)' },
                  { label: 'Payload Lifted', value: `${(dossier.drillDownSummary.totalVolumeMt / 1000).toFixed(0)}k MT`, color: 'var(--ol-text-primary)' },
                  { label: 'Active Charterers', value: dossier.drillDownSummary.primaryCharterers.join(', '), color: 'var(--ol-text-secondary)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ backgroundColor: 'var(--ol-surface-primary)', padding: '10px 12px', borderRadius: 'var(--ol-radius-md)', border: '1px solid var(--ol-border)' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--ol-text-muted)', marginBottom: '4px' }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Algorithmic Decisions */}
          <div>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ol-text-muted)' }}>
              4. Algorithmic Commercial Directives &amp; Operational Strategy
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dossier.recommendations.map((rec) => (
                <div key={rec.id} style={{
                  backgroundColor: 'var(--ol-surface-secondary)',
                  padding: '14px 16px',
                  borderRadius: 'var(--ol-radius-md)',
                  border: '1px solid var(--ol-border)',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--ol-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={13} style={{ color: 'var(--ol-cyan)', flexShrink: 0 }} />
                      {rec.title}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--ol-cyan-subtle)',
                      color: 'var(--ol-cyan)',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      {rec.category.toUpperCase()} · {rec.impactScore} Impact
                    </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--ol-text-secondary)', lineHeight: 1.6 }}>{rec.guidance}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ol-text-muted)', paddingTop: '6px', borderTop: '1px solid var(--ol-border)', flexWrap: 'wrap', gap: '8px' }}>
                    <span>Target: <strong style={{ color: 'var(--ol-cyan)' }}>{rec.metricTarget}</strong></span>
                    <span>Window: <strong style={{ color: 'var(--ol-text-primary)' }}>{rec.actionableWindow}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidentiality Footer */}
          <div style={{ borderTop: '1px solid var(--ol-border)', paddingTop: '14px', fontSize: '10px', color: 'var(--ol-text-muted)', textAlign: 'center' }}>
            {dossier.confidentialityNotice}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '14px 20px',
          borderTop: '1px solid var(--ol-border)',
          backgroundColor: 'var(--ol-surface-secondary)',
          flexShrink: 0,
        }}>
          <button onClick={onClose} className="ol-btn ol-btn-secondary ol-btn-sm">
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
