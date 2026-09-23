import React from 'react';
import {
  Plus,
  RefreshCw,
  Download,
} from 'lucide-react';
import type { FixtureAnalyticsSummary, FixtureRecord } from '../../../types/fixture';

interface FixturesHeaderProps {
  analytics?: FixtureAnalyticsSummary;
  activeTab?: 'active' | 'historical' | 'multi_port';
  onTabChange?: (tab: 'active' | 'historical' | 'multi_port') => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenCreate: () => void;
  fixtures?: FixtureRecord[];
  onExportCSV?: () => void;
  totalCount?: number;
}

export const FixturesHeader: React.FC<FixturesHeaderProps> = ({
  onRefresh,
  isLoading,
  onOpenCreate,
  fixtures = [],
  onExportCSV,
}) => {
  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    if (fixtures.length === 0) return;

    const headers = [
      'Fixture Reference',
      'Status',
      'Vessel Name',
      'Vessel IMO',
      'Vessel Type',
      'Vessel DWT',
      'Charterer',
      'Commodity',
      'Category',
      'Tonnage (MT)',
      'Port Rotation',
      'Rate Formatted',
      'Currency',
      'Rate Type',
      'Charter Party Form',
      'Fixture Date',
      'Laycan Start',
      'Laycan End',
    ];

    const rows = fixtures.map((f) => [
      `"${f.fixture_reference}"`,
      `"${f.status}"`,
      `"${f.vessel_name.replace(/"/g, '""')}"`,
      `"${f.vessel_imo}"`,
      `"${f.vessel_type}"`,
      f.vessel_dwt,
      `"${f.charterer.replace(/"/g, '""')}"`,
      `"${f.commodity.replace(/"/g, '""')}"`,
      `"${f.cargo_type}"`,
      f.quantity_tons,
      `"${f.ports.map((p) => `${p.port_name} (${p.port_type})`).join(' -> ')}"`,
      `"${f.rate_formatted}"`,
      `"${f.rate_currency}"`,
      `"${f.rate_type}"`,
      `"${f.charter_party_form}"`,
      `"${f.fixture_date}"`,
      `"${f.laycan_start}"`,
      `"${f.laycan_end}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SIH26006_Commercial_Fixtures_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="cfw-header">
      <div className="cfw-header-left">
        <div className="cfw-eyebrow">
          <span>COMMERCIAL INTELLIGENCE</span>
          <span className="cfw-module-badge">MODULE 10</span>
        </div>
        <h1 className="cfw-title">Fixtures & Chartering Desk</h1>
        <p className="cfw-subtitle">
          Monitor active fixtures, vessel employment, cargo commitments, laycans and commercial rate benchmarks.
        </p>
      </div>

      <div className="cfw-header-actions">
        {/* Refresh */}
        <button
          type="button"
          className="cfw-btn cfw-btn-ghost"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh fixtures dataset"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>

        {/* Export CSV */}
        <button
          type="button"
          className="cfw-btn cfw-btn-secondary"
          onClick={handleExportCSV}
          title="Export CSV Fixture Register"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>

        {/* New Fixture Button */}
        <button
          type="button"
          className="cfw-btn cfw-btn-primary"
          onClick={onOpenCreate}
          title="Create New Commercial Fixture Contract"
        >
          <Plus size={15} />
          <span>+ New Fixture Contract</span>
        </button>
      </div>
    </div>
  );
};

