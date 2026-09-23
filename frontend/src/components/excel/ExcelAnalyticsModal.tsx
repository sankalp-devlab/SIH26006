/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 31: EXCEL INTEGRATION & ANALYTICAL WORKBOOK ENGINE
 * Desktop Excel Analytics Modal
 *
 * Provides a unified interface for:
 * 1. Generating 5-Sheet Analytical Workbooks (Data, Query Config, Pivot, Charts, Metadata)
 * 2. Live Refreshable Connections (Microsoft Web Query .iqy, Power Query M code)
 * 3. Microsoft Office Add-in Sideloading & Taskpane Launch
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import {
  FileSpreadsheet,
  Zap,
  Download,
  Copy,
  Check,
  Layers,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Table,
  LineChart,
  Settings2,
} from 'lucide-react';
import { ExcelIntegrationService } from '../../services/excel/excel-integration.service';
import type {
  ExcelSheetSelection,
  ExcelWorkbookResult,
} from '../../types/excel-integration';
import type {
  DataQueryExecutionResponse,
} from '../../types/data-query';
import type { ExportColumnDefinition } from '../../types/export-sharing';

interface ExcelAnalyticsModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  queryResponse: DataQueryExecutionResponse;
  data: T[];
  columns: ExportColumnDefinition<T>[];
  title?: string;
}

export const ExcelAnalyticsModal: React.FC<ExcelAnalyticsModalProps> = ({
  isOpen,
  onClose,
  queryResponse,
  data,
  columns,
  title = 'Maritime Excel Analytics',
}) => {
  const [activeTab, setActiveTab] = useState<'workbook' | 'refresh' | 'addin'>('workbook');
  const [sheets, setSheets] = useState<ExcelSheetSelection>({
    dataLedger: true,
    queryConfig: true,
    pivotAnalysis: true,
    chartsAndVisuals: true,
    provenanceMetadata: true,
  });

  const [includeFormulas, setIncludeFormulas] = useState(true);
  const [includeZebra, setIncludeZebra] = useState(true);
  const [customFilename, setCustomFilename] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMCode, setCopiedMCode] = useState(false);
  const [result, setResult] = useState<ExcelWorkbookResult | null>(null);

  const datasetValidation = ExcelIntegrationService.validateDatasetLimits(data.length);

  const handleGenerateWorkbook = async () => {
    setIsGenerating(true);
    setResult(null);

    const res = await ExcelIntegrationService.generateAnalyticalWorkbook(
      queryResponse,
      data,
      columns,
      {
        workbookTitle: title,
        customFilename: customFilename.trim() || undefined,
        sheets,
        includeFormulas,
        includeZebraStriping: includeZebra,
      }
    );

    setIsGenerating(false);
    setResult(res);

    if (res.success) {
      setTimeout(() => {
        onClose();
        setResult(null);
      }, 2000);
    }
  };

  const handleDownloadIqy = () => {
    ExcelIntegrationService.downloadWebQueryIqy(queryResponse.queryConfig);
  };

  const handleCopyPowerQuery = () => {
    const conn = ExcelIntegrationService.generateRefreshConnection(queryResponse.queryConfig);
    navigator.clipboard.writeText(conn.powerQueryMCode);
    setCopiedMCode(true);
    setTimeout(() => setCopiedMCode(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="780px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="#34d399" />
            Zero-Credential Security Architecture
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isGenerating}>
              Close
            </button>
            {activeTab === 'workbook' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateWorkbook}
                disabled={isGenerating || !datasetValidation.valid}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} />
                {isGenerating ? 'Building Sheets...' : 'Download Analytical Workbook (.xls)'}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            background: 'rgba(0, 0, 0, 0.3)',
            padding: 4,
            borderRadius: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('workbook')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: activeTab === 'workbook' ? '#0284c7' : 'transparent',
              color: activeTab === 'workbook' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <FileSpreadsheet size={15} /> 5-Sheet Analytical Workbook
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refresh')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: activeTab === 'refresh' ? '#0284c7' : 'transparent',
              color: activeTab === 'refresh' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={15} /> Live Refreshable Connection
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addin')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: activeTab === 'addin' ? '#0284c7' : 'transparent',
              color: activeTab === 'addin' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} /> Microsoft Office Add-in
          </button>
        </div>

        {/* TAB 1: 5-Sheet Workbook Configuration */}
        {activeTab === 'workbook' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Summary notification banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.82rem',
              }}
            >
              <div>
                <span style={{ color: '#94a3b8' }}>Target Query: </span>
                <strong style={{ color: '#ffffff' }}>{queryResponse.queryConfig.entity.replace('_', ' ').toUpperCase()}</strong>
                <span style={{ color: '#94a3b8' }}> ({data.length.toLocaleString()} rows)</span>
              </div>
              <span style={{ color: '#38bdf8', fontSize: '0.76rem' }}>SpreadsheetML 2003 (.xls)</span>
            </div>

            {/* Sheets Checklist */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                Included Analytical Sheets (Select all desired tabs):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {[
                  { key: 'dataLedger', label: '1. Data Ledger', desc: 'Full records with auto-fit widths & footer formulas', icon: Table },
                  { key: 'queryConfig', label: '2. Query Configuration', desc: 'Preserved filters, dimensions & execution time', icon: Settings2 },
                  { key: 'pivotAnalysis', label: '3. Pivot Analysis', desc: '2D Matrix with shipping dimensions & dynamic sum formulas', icon: Layers },
                  { key: 'chartsAndVisuals', label: '4. Charts & Visuals', desc: 'Sparkbars, delta trend tables & native chart blueprint', icon: LineChart },
                  { key: 'provenanceMetadata', label: '5. Provenance & Audit', desc: 'Security isolation, ISO timestamps & provenance status', icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = sheets[item.key as keyof ExcelSheetSelection];
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setSheets((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof ExcelSheetSelection],
                        }))
                      }
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: isChecked ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isChecked ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by container
                        style={{ marginTop: 2 }}
                      />
                      <Icon size={15} color={isChecked ? '#38bdf8' : '#64748b'} style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isChecked ? '#ffffff' : '#cbd5e1' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workbook Options */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeFormulas}
                  onChange={(e) => setIncludeFormulas(e.target.checked)}
                />
                Embed Excel Formulas (<code style={{ color: '#38bdf8' }}>=SUBTOTAL</code> &amp; <code style={{ color: '#38bdf8' }}>=SUM</code>)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeZebra}
                  onChange={(e) => setIncludeZebra(e.target.checked)}
                />
                Zebra Row Striping
              </label>
            </div>

            {/* Custom Filename */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Custom Filename (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={`sih26006_analytics_${queryResponse.queryConfig.entity}_${new Date().toISOString().slice(0, 10)}.xls`}
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                style={{ width: '100%', fontSize: '0.82rem' }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Live Refreshable Connection */}
        {activeTab === 'refresh' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              Establish a live, authenticated connection directly from Microsoft Excel. When refreshed via{' '}
              <strong style={{ color: '#38bdf8' }}>Data &gt; Refresh All</strong> in Excel, queries are re-executed against the platform's maritime data service.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Option A: Web Query .iqy */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Download size={18} color="#38bdf8" />
                  <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#ffffff' }}>Excel Web Query (.iqy)</h4>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, flexGrow: 1 }}>
                  Native Microsoft Excel connection file. Double-click or open from Excel to establish an auto-refreshing table.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadIqy}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem' }}
                >
                  <Download size={14} /> Download .iqy Connection File
                </button>
              </div>

              {/* Option B: Power Query M Script */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Copy size={18} color="#818cf8" />
                  <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#ffffff' }}>Power Query M Formula</h4>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, flexGrow: 1 }}>
                  Advanced Editor M script for Power Query. Supports scheduled background refresh, automated schema typing, and caching.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCopyPowerQuery}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.78rem' }}
                >
                  {copiedMCode ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  {copiedMCode ? 'Copied M Code!' : 'Copy Power Query M Code'}
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.76rem',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ShieldCheck size={16} />
              <span>Zero-Credential Guarantee: Queries use scoped capability tokens. Passwords and API secrets are never embedded.</span>
            </div>
          </div>
        )}

        {/* TAB 3: Microsoft Office Add-in */}
        {activeTab === 'addin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              Use our real Microsoft Office Task Pane Add-in to query shipping metrics, inspect fleet registries, and insert tables directly into open workbooks without leaving Excel.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', color: '#ffffff' }}>Add-in Manifest</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px' }}>
                  Upload <code style={{ color: '#38bdf8' }}>manifest.xml</code> into Excel via <strong>Insert &gt; Add-ins &gt; My Add-ins &gt; Upload My Add-in</strong>.
                </p>
                <a
                  href="/excel/manifest.xml"
                  download="manifest.xml"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', textDecoration: 'none' }}
                >
                  <Download size={14} /> Download manifest.xml
                </a>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', color: '#ffffff' }}>Taskpane Simulator</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px' }}>
                  Open the dedicated Excel Taskpane view in your browser to test interactive querying and insertion.
                </p>
                <a
                  href="/excel-taskpane"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} /> Open Excel Taskpane
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Result notification */}
        {result && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: result.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: result.success ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              color: result.success ? '#34d399' : '#ef4444',
            }}
          >
            {result.success ? <Check size={16} /> : null}
            <span>
              {result.success
                ? `Successfully generated ${result.sheetCount}-sheet workbook (${(result.byteSize / 1024).toFixed(1)} KB with ${result.formulaCount} formulas)!`
                : result.error || 'Failed to generate workbook.'}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
