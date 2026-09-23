/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 31: EXCEL INTEGRATION & ANALYTICAL WORKBOOK ENGINE
 * Microsoft Office Excel Task Pane Page
 *
 * Designed to render seamlessly inside Microsoft Excel's side pane (320px–420px):
 * - Live connection to Platform Data Query engine (Module 24)
 * - Saved queries & custom fleet pools from Personal Workspace (Module 29)
 * - Direct range insertion via Office.js (Excel.run)
 * - Built-in interactive Excel Sheet Simulator when tested in standalone browser
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Play,
  Download,
  Copy,
  Check,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import { OfficeJsService } from '../../services/excel/office-js.service';
import { ExcelIntegrationService } from '../../services/excel/excel-integration.service';
import { DataQueryService } from '../../services/data-query/data-query.service';
import { useWorkspace } from '../../hooks/useWorkspace';
import type { MaritimeDatasetEntity } from '../../types/data-query';
import type { OfficeTaskpaneState } from '../../types/excel-integration';

export const ExcelTaskpanePage: React.FC = () => {
  const { savedQueries } = useWorkspace();
  const [taskpaneState, setTaskpaneState] = useState<OfficeTaskpaneState>({
    isOfficeInitialized: false,
    isHostExcel: false,
    platform: 'BrowserSimulator',
  });

  const [selectedEntity, setSelectedEntity] = useState<MaritimeDatasetEntity>('freight_rates');
  const [selectedVesselClass, setSelectedVesselClass] = useState<string>('All');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('All');
  const [selectedSavedQueryId, setSelectedSavedQueryId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulator state: records inserted
  const [simulatedSheet, setSimulatedSheet] = useState<{
    tableName: string;
    address: string;
    headers: string[];
    rows: any[][];
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    OfficeJsService.initialize().then((state) => {
      setTaskpaneState(state);
    });
  }, []);

  const handleInsertData = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const config = DataQueryService.getDefaultConfig();
      config.entity = selectedEntity;

      if (selectedVesselClass !== 'All') {
        config.filters.push({
          id: 'f-vclass',
          field: 'vesselClass',
          operator: '=',
          value: selectedVesselClass,
        });
      }

      if (selectedCorridor !== 'All') {
        config.filters.push({
          id: 'f-corridor',
          field: 'corridorOrRoute',
          operator: '=',
          value: selectedCorridor,
        });
      }

      const queryRes = await DataQueryService.executeQuery(config, 1, 30);
      const records = queryRes.rawDataResult?.records || [];

      const headers = ['Date', 'Corridor', 'Vessel Class', 'TCE Rate ($/day)', 'Volume (MT)', 'Status'];
      const rows = records.map((r: any) => [
        r.date || '2026-03-01',
        r.corridorOrRoute || 'TD3C',
        r.vesselClass || 'VLCC',
        r.rateTceUsdPerDay || 45000,
        r.volumeMetricTons || 270000,
        r.status || 'Completed',
      ]);

      const insertRes = await OfficeJsService.insertTableIntoActiveWorksheet({
        tableName: `Maritime_${selectedEntity.toUpperCase()}`,
        startCell: 'A1',
        headers,
        rows,
        includeTotalsRow: true,
      });

      if (insertRes.success) {
        setStatusMessage({
          type: 'success',
          text: `Inserted ${rows.length} records into active Excel worksheet!`,
        });

        // Update simulator preview
        setSimulatedSheet({
          tableName: `Maritime_${selectedEntity.toUpperCase()}`,
          address: insertRes.insertedAddress || 'Sheet1!A1:F31',
          headers,
          rows: rows.slice(0, 5), // Preview first 5 rows in simulator
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: insertRes.error || 'Failed to write table to Excel worksheet.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error executing query.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPowerQueryM = () => {
    const config = DataQueryService.getDefaultConfig();
    config.entity = selectedEntity;
    const connection = ExcelIntegrationService.generateRefreshConnection(config);
    navigator.clipboard.writeText(connection.powerQueryMCode);
    setCopiedCode(true);
    setStatusMessage({
      type: 'info',
      text: 'Copied Power Query M formula to clipboard! Paste into Excel Advanced Editor.',
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadIqy = () => {
    const config = DataQueryService.getDefaultConfig();
    config.entity = selectedEntity;
    ExcelIntegrationService.downloadWebQueryIqy(config);
    setStatusMessage({
      type: 'success',
      text: 'Downloaded Microsoft Excel Web Query (.iqy) file!',
    });
  };

  const handleLoadSavedQuery = (id: string) => {
    setSelectedSavedQueryId(id);
    const sq = savedQueries.find((q) => q.id === id);
    if (sq) {
      setSelectedEntity((sq.dataset || 'freight_rates') as MaritimeDatasetEntity);
      setStatusMessage({
        type: 'info',
        text: `Loaded saved query: "${sq.name}"`,
      });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: 16,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSpreadsheet size={18} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
              Maritime Explorer
            </h2>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Excel Task Pane Add-in v1.0
            </div>
          </div>
        </div>

        {/* Runtime Badge */}
        <span
          style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: 12,
            background: taskpaneState.isHostExcel
              ? 'rgba(16, 185, 129, 0.2)'
              : 'rgba(56, 189, 248, 0.15)',
            color: taskpaneState.isHostExcel ? '#34d399' : '#38bdf8',
            border: taskpaneState.isHostExcel
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Zap size={10} />
          {taskpaneState.isHostExcel ? 'Office Connected' : 'Browser Simulator'}
        </span>
      </div>

      {/* Workspace Saved Queries Dropdown */}
      {savedQueries.length > 0 && (
        <div>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
            Load from Personal Workspace (Module 29)
          </label>
          <select
            value={selectedSavedQueryId}
            onChange={(e) => handleLoadSavedQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 6,
              background: '#131b2e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '0.78rem',
            }}
          >
            <option value="">-- Choose a Saved Query --</option>
            {savedQueries.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name} ({q.dataset})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Entity Selector */}
      <div>
        <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
          Maritime Dataset Entity
        </label>
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value as MaritimeDatasetEntity)}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 6,
            background: '#131b2e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            fontSize: '0.78rem',
          }}
        >
          <option value="freight_rates">Spot Freight Rates &amp; TCE ($/day)</option>
          <option value="trade_flows">Commodity Trade Flows (Metric Tons)</option>
          <option value="fleet_movements">Fleet Movements &amp; Ton-Miles</option>
          <option value="port_congestion">Port Congestion &amp; Waiting Times</option>
          <option value="fleet_emissions">Decarbonization &amp; CO2 Emissions</option>
        </select>
      </div>

      {/* Filters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
            Vessel Class
          </label>
          <select
            value={selectedVesselClass}
            onChange={(e) => setSelectedVesselClass(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              background: '#131b2e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '0.74rem',
            }}
          >
            <option value="All">All Classes</option>
            <option value="VLCC">VLCC</option>
            <option value="Suezmax">Suezmax</option>
            <option value="Aframax">Aframax</option>
            <option value="Capesize">Capesize</option>
            <option value="Panamax">Panamax</option>
            <option value="LNG Carrier">LNG Carrier</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
            Route / Corridor
          </label>
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              background: '#131b2e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '0.74rem',
            }}
          >
            <option value="All">All Corridors</option>
            <option value="TD3C">TD3C (MEG → China)</option>
            <option value="TD20">TD20 (WAF → UKC)</option>
            <option value="TC2">TC2 (Cont → USAC)</option>
            <option value="C5">C5 (W.Aus → Qingdao)</option>
            <option value="C3">C3 (Tubarao → Qingdao)</option>
          </select>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={handleInsertData}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.82rem',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
        }}
      >
        <Play size={14} fill="#ffffff" />
        {isLoading ? 'Fetching Data...' : 'Insert Table into Worksheet'}
      </button>

      {/* Live Refresh Tools Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          type="button"
          onClick={handleDownloadIqy}
          style={{
            padding: '7px 10px',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Download size={12} /> Web Query (.iqy)
        </button>

        <button
          type="button"
          onClick={handleCopyPowerQueryM}
          style={{
            padding: '7px 10px',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {copiedCode ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
          Power Query M
        </button>
      </div>

      {/* Feedback Messages */}
      {statusMessage && (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            fontSize: '0.74rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background:
              statusMessage.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : statusMessage.type === 'info'
                ? 'rgba(56, 189, 248, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            border:
              statusMessage.type === 'success'
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : statusMessage.type === 'info'
                ? '1px solid rgba(56, 189, 248, 0.3)'
                : '1px solid rgba(239, 68, 68, 0.3)',
            color:
              statusMessage.type === 'success'
                ? '#34d399'
                : statusMessage.type === 'info'
                ? '#38bdf8'
                : '#ef4444',
          }}
        >
          <Info size={12} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Interactive In-Browser Excel Simulator */}
      {simulatedSheet && (
        <div
          style={{
            marginTop: 4,
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: '0.72rem',
              color: '#94a3b8',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Layers size={12} color="#38bdf8" /> Active Sheet Preview
            </span>
            <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{simulatedSheet.address}</span>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: 140 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#38bdf8' }}>
                  {simulatedSheet.headers.map((h, i) => (
                    <th key={i} style={{ padding: '4px 6px', whiteSpace: 'nowrap', border: '1px solid #1e293b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {simulatedSheet.rows.map((r, rIdx) => (
                  <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#1e293b' : '#111827' }}>
                    {r.map((val, cIdx) => (
                      <td key={cIdx} style={{ padding: '4px 6px', whiteSpace: 'nowrap', border: '1px solid #334155' }}>
                        {typeof val === 'number' ? val.toLocaleString() : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sideload Instruction Link */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.68rem',
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        <span>To install in Excel: Insert &gt; Add-ins &gt; Upload Manifest (<code style={{ color: '#38bdf8' }}>manifest.xml</code>)</span>
      </div>
    </div>
  );
};
