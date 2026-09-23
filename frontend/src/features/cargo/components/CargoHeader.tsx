import React from 'react';
import {
  Plus,
  RefreshCw,
  Download,
  Radio,
  Boxes,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { CargoAnalyticsSummary, CargoRecord } from '../../../types/cargo';

interface CargoHeaderProps {
  analytics: CargoAnalyticsSummary;
  viewMode?: 'table' | 'zones' | 'duplicates';
  onViewModeChange?: (mode: 'table' | 'zones' | 'duplicates') => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenCreate: () => void;
  onOpenIngest: () => void;
  cargos: CargoRecord[];
}

export const CargoHeader: React.FC<CargoHeaderProps> = ({
  analytics: _analytics,
  onRefresh,
  isLoading,
  onOpenCreate,
  onOpenIngest,
  cargos,
}) => {
  const handleExportCSV = () => {
    if (cargos.length === 0) return;
    const headers = [
      'Reference ID',
      'Source',
      'Shipper',
      'Consignee',
      'Commodity',
      'Category',
      'Weight (MT)',
      'Volume (m3)',
      'Origin Port',
      'Origin UNLOCODE',
      'Destination Port',
      'Dest UNLOCODE',
      'Ready Date',
      'Deadline',
      'Status',
      'Priority',
      'Zone',
      'Validation Status',
      'Matched Vessel',
    ];

    const rows = cargos.map((c) => [
      `"${c.reference_number}"`,
      `"${c.source}"`,
      `"${c.shipper.replace(/"/g, '""')}"`,
      `"${c.consignee.replace(/"/g, '""')}"`,
      `"${c.commodity.replace(/"/g, '""')}"`,
      `"${c.cargo_type}"`,
      c.weight_tons,
      c.volume_m3 || '',
      `"${c.origin_port.name}"`,
      `"${c.origin_port.unlocode || ''}"`,
      `"${c.destination_port.name}"`,
      `"${c.destination_port.unlocode || ''}"`,
      `"${c.ready_date}"`,
      `"${c.deadline}"`,
      `"${c.status}"`,
      `"${c.priority}"`,
      `"${c.zone}"`,
      `"${c.validation_status}"`,
      `"${c.matched_vessel?.vessel_name || 'Unassigned'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OceanLens_Cargo_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ciw-header">
      <div className="ciw-header-left">
        <div className="ciw-eyebrow">
          <Boxes size={14} color="#00d8ff" />
          <span>MODULE 09 &middot; CARGO INTELLIGENCE</span>
        </div>
        <h1 className="ciw-title">Cargo Allocation</h1>
        <p className="ciw-subtitle">
          Manage cargo demand, validate inquiries and match maritime capacity across global corridors.
        </p>
      </div>

      <div className="ciw-header-actions">
        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          className="btn btn-sm btn-ghost"
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            backgroundColor: '#091A2A',
            border: '1px solid rgba(80, 180, 255, 0.16)',
            color: '#cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}
          title="Refresh cargo dataset"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>

        {/* CSV Export */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="btn btn-sm btn-ghost"
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            backgroundColor: '#091A2A',
            border: '1px solid rgba(80, 180, 255, 0.16)',
            color: '#cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}
          title="Export CSV"
        >
          <Download size={13} />
          <span>Export</span>
        </button>

        {/* Ingest Channel Data */}
        <button
          type="button"
          onClick={onOpenIngest}
          className="btn btn-sm btn-secondary"
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            color: '#38bdf8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}
          title="Simulate Ingestion from Email/WhatsApp/Slack"
        >
          <Radio size={13} />
          <span>Ingest Data</span>
        </button>

        {/* Register Consignment / New Cargo Inquiry */}
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onOpenCreate}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          New Cargo Inquiry
        </Button>
      </div>
    </div>
  );
};

