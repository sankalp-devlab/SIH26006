/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Templates Tab
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Calculator,
  Shield,
  Layers,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { DataQueryService } from '../../../services/data-query/data-query.service';
import { ExcelIntegrationService } from '../../../services/excel/excel-integration.service';
import type { WorkspaceTemplateType, WorkspaceTemplate } from '../../../types/personalization';

export const TemplatesTab: React.FC = () => {
  const navigate = useNavigate();
  const { templates, deleteTemplate } = useWorkspace();
  const [selectedType, setSelectedType] = useState<WorkspaceTemplateType | 'all'>('all');

  const filtered = templates.filter(
    (t) => selectedType === 'all' || t.type === selectedType
  );

  const getTemplateIcon = (type: WorkspaceTemplateType) => {
    switch (type) {
      case 'voyage':
        return <Calculator size={18} color="#f59e0b" />;
      case 'screening':
        return <Shield size={18} color="#34d399" />;
      case 'report':
        return <FileSpreadsheet size={18} color="#38bdf8" />;
      default:
        return <Layers size={18} color="#818cf8" />;
    }
  };

  const handleLaunch = (t: WorkspaceTemplate) => {
    if (t.type === 'voyage') {
      navigate('/voyage-calculator');
    } else if (t.type === 'report') {
      navigate('/reports');
    } else if (t.type === 'query') {
      navigate('/data-query');
    } else {
      navigate('/analytics');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header & Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSpreadsheet size={18} color="#f59e0b" /> Custom Workspace Templates ({templates.length})
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Reusable operational presets for voyage estimation, fleet screening, and reporting.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'voyage', 'screening', 'report', 'analytics'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: '0.78rem',
                textTransform: 'capitalize',
                background:
                  selectedType === type ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedType === type ? '#f59e0b' : '#94a3b8',
                border:
                  selectedType === type
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--card-bg, #111827)',
            borderRadius: 10,
            border: '1px dashed rgba(255, 255, 255, 0.12)',
          }}
        >
          <FileSpreadsheet size={36} color="#64748b" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h4 style={{ margin: '0 0 6px', color: '#e2e8f0', fontSize: '0.95rem' }}>
            No templates in this category
          </h4>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
            Save calculation workbooks or report configurations as reusable user templates.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filtered.map((tmpl) => (
            <div
              key={tmpl.id}
              style={{
                background: 'var(--card-bg, #111827)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getTemplateIcon(tmpl.type)}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          textTransform: 'uppercase',
                          color: '#f59e0b',
                          fontWeight: 600,
                        }}
                      >
                        {tmpl.type} Template
                      </span>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', color: '#f8fafc' }}>
                        {tmpl.name}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete template "${tmpl.name}"?`)) deleteTemplate(tmpl.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  {tmpl.description}
                </p>

                {/* Configuration Summary Key-Values */}
                <div
                  style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.02)',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {Object.entries(tmpl.config).slice(0, 3).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ textTransform: 'capitalize', color: '#64748b' }}>
                        {k.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{String(v)}</span>
                    </div>
                  ))}
                </div>

                {tmpl.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {tmpl.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: '#f59e0b',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Created {new Date(tmpl.createdAt).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {tmpl.type === 'export' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={async () => {
                        const config = DataQueryService.getDefaultConfig();
                        if (tmpl.config.targetDataset) {
                          config.entity = tmpl.config.targetDataset as any;
                        }
                        const res = await DataQueryService.executeQuery(config, 1, 100);
                        const cols = (tmpl.config.selectedColumnKeys || []).map((k: string) => ({
                          key: k,
                          header: k.toUpperCase(),
                          defaultVisible: true,
                        }));
                        await ExcelIntegrationService.generateAnalyticalWorkbook(
                          res,
                          res.rawDataResult?.records || [],
                          cols.length > 0 ? cols : [{ key: 'date', header: 'Date' }],
                          { workbookTitle: tmpl.name }
                        );
                      }}
                      style={{ padding: '5px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8' }}
                      title="Export Workbook using this template"
                    >
                      <FileSpreadsheet size={12} color="#38bdf8" /> Excel
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleLaunch(tmpl)}
                    style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    Launch Template <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
