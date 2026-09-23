/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Saved Queries Tab (Module 24 Integration)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Play,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Filter,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { ExcelIntegrationService } from '../../../services/excel/excel-integration.service';

export const SavedQueriesTab: React.FC = () => {
  const navigate = useNavigate();
  const { savedQueries, deleteQuery, touchQueryExecution } = useWorkspace();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRunQuery = (query: (typeof savedQueries)[0]) => {
    touchQueryExecution(query.id);
    if (query.shareableUrl) {
      navigate(query.shareableUrl);
    } else {
      navigate('/data-query');
    }
  };

  const handleCopyLink = (query: (typeof savedQueries)[0]) => {
    const url = window.location.origin + (query.shareableUrl || '/data-query');
    navigator.clipboard.writeText(url);
    setCopiedId(query.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} color="#818cf8" /> Saved Data Queries ({savedQueries.length})
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Bookmarked structured query models from Module 24 Data Query Workbench.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/data-query')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
        >
          <Plus size={14} /> Open Data Query Workbench
        </button>
      </div>

      {/* Query Cards */}
      {savedQueries.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--card-bg, #111827)',
            borderRadius: 10,
            border: '1px dashed rgba(255, 255, 255, 0.12)',
          }}
        >
          <Database size={36} color="#64748b" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h4 style={{ margin: '0 0 6px', color: '#e2e8f0', fontSize: '0.95rem' }}>
            No saved queries in your workspace
          </h4>
          <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.82rem', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
            Build time-series, pivot aggregates, or raw data extracts in the Data Query Workbench, then save them here for one-click re-execution.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/data-query')}
          >
            Launch Query Workbench
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {savedQueries.map((q) => (
            <div
              key={q.id}
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#818cf8',
                        fontWeight: 600,
                      }}
                    >
                      {q.dataset} · {q.mode.replace('_', ' ')}
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '0.98rem', color: '#f8fafc' }}>
                      {q.name}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete saved query "${q.name}"?`)) deleteQuery(q.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {q.description && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    {q.description}
                  </p>
                )}

                {/* Query Parameters Preview */}
                <div
                  style={{
                    marginTop: 12,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} color="#64748b" />
                    <span>Time Range: {q.queryConfig?.timeRange?.preset || 'Custom Range'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={12} color="#64748b" />
                    <span>Granularity: {q.queryConfig?.granularity || 'Monthly'}</span>
                  </div>
                  {q.queryConfig?.filters && q.queryConfig.filters.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Filter size={12} color="#64748b" />
                      <span>{q.queryConfig.filters.length} Applied Filter(s)</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {q.tags && q.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                    {q.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(129, 140, 248, 0.1)',
                          color: '#818cf8',
                          border: '1px solid rgba(129, 140, 248, 0.2)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Footer */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleCopyLink(q)}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Share2 size={12} /> {copiedId === q.id ? 'Copied' : 'Share URL'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={async () => {
                      touchQueryExecution(q.id);
                      await ExcelIntegrationService.exportSavedQueryToExcel(q);
                    }}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8' }}
                    title="Export 5-sheet analytical workbook for Microsoft Excel"
                  >
                    <FileSpreadsheet size={12} color="#38bdf8" /> Open in Excel
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleRunQuery(q)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Play size={12} fill="#ffffff" /> Run in Workbench
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
