import { useState } from 'react';
import {
  RefreshCw,
  Download,
  Share2,
  Check,
  RotateCcw,
  Radio,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Tooltip } from '../../../components/ui/Tooltip';
import { VoyagesService } from '../../../services/voyages/voyages.service';
import type { VoyageRecord, VoyageFiltersState } from '../../../types/voyage';
import type { Vessel } from '../../../types/vessel';

interface VoyagesHeaderProps {
  voyages: VoyageRecord[];
  allVoyages: VoyageRecord[];
  vessels: Vessel[];
  filters: VoyageFiltersState;
  onFilterChange: (filters: VoyageFiltersState) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function VoyagesHeader({
  voyages,
  allVoyages: _allVoyages,
  vessels,
  filters,
  onFilterChange,
  onRefresh,
  isLoading = false,
}: VoyagesHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleExportCsv = () => {
    VoyagesService.exportVoyagesCsv(voyages);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vesselOptions = [
    { value: 'all', label: 'All Fleet Vessels' },
    ...vessels.map((v) => ({
      value: v.id.toString(),
      label: `${v.name} (${v.vessel_type || 'Bulk'})`,
    })),
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'active_now', label: 'Active Now' },
    { value: 'last_7d', label: 'Last 7 Days' },
    { value: 'last_30d', label: 'Last 30 Days' },
    { value: 'last_90d', label: 'Last 90 Days' },
  ];

  const hasToolbarFilters = filters.vesselId !== 'all' || filters.dateRange !== 'all';

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Page Header */}
      <div className="cvi-header">
        <div className="cvi-header-left">
          <div className="cvi-eyebrow">
            <span>COMMERCIAL VOYAGE INTELLIGENCE</span>
          </div>

          <div className="cvi-title-row">
            <h1 className="cvi-title">Commercial Voyages</h1>
            <div className="cvi-badge-telemetry">
              <span className="cvi-badge-telemetry-dot" />
              <span>Live Telemetry</span>
            </div>
            <span className="cvi-badge-module">MODULE 07</span>
          </div>

          <p className="cvi-subtitle">
            Monitor active, predicted and historical voyages, commercial port activity and vessel movement.
          </p>
        </div>

        {/* Header Action Buttons on the Right */}
        <div className="cvi-header-actions">
          <Tooltip content="Synchronize with FastAPI Backend" position="bottom">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
              onClick={onRefresh}
              disabled={isLoading}
            >
              Sync
            </Button>
          </Tooltip>

          <Tooltip content="Export Current Voyages Dataset to CSV" position="bottom">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
          </Tooltip>

          <Tooltip content="Copy Deep-Link to Clipboard" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
              onClick={handleShareLink}
            >
              {copied ? 'Copied' : 'Share'}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 2. Dedicated Filter / Control Bar Toolbar */}
      <div className="cvi-control-bar">
        <div className="cvi-control-group">
          {/* FLEET */}
          <div className="cvi-control-item">
            <span className="cvi-control-label">FLEET</span>
            <div style={{ width: '220px' }}>
              <Select
                options={vesselOptions}
                value={filters.vesselId || 'all'}
                onChange={(e) => onFilterChange({ ...filters, vesselId: e.target.value })}
              />
            </div>
          </div>

          {/* DATE RANGE */}
          <div className="cvi-control-item">
            <span className="cvi-control-label">DATE RANGE</span>
            <div style={{ width: '160px' }}>
              <Select
                options={dateOptions}
                value={filters.dateRange}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    dateRange: e.target.value as VoyageFiltersState['dateRange'],
                  })
                }
              />
            </div>
          </div>

          {/* STATUS STREAMING PILL */}
          <div className="cvi-control-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', paddingLeft: '8px' }}>
            <Radio size={14} color="#10b981" className="animate-pulse" />
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Live AIS Stream</span>
            <span style={{ color: '#64748b' }}>&middot; {voyages.length} Active Records</span>
          </div>
        </div>

        {/* ACTIONS / RESET */}
        {hasToolbarFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onFilterChange({ ...filters, vesselId: 'all', dateRange: 'all' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#38bdf8' }}
          >
            <RotateCcw size={13} />
            <span>Reset Controls</span>
          </button>
        )}
      </div>
    </div>
  );
}
