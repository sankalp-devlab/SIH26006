import { useState } from 'react';
import {
  Globe,
  Anchor,
  Shield,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { DataTable, type Column } from '../../../components/data-display/DataTable';
import type {
  VoyageAnalyticsSummary,
  CountryTradeMetric,
  PortAggregationMetric,
  OperatorAnalysisMetric,
  TradeCorridorMetric,
} from '../../../types/voyage';

interface VoyageAnalyticsPanelProps {
  analytics: VoyageAnalyticsSummary;
  onSelectCountry?: (country: string) => void;
  onSelectPort?: (portName: string) => void;
  onSelectOperator?: (operator: string) => void;
}

export function VoyageAnalyticsPanel({
  analytics,
  onSelectCountry,
  onSelectPort,
  onSelectOperator,
}: VoyageAnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'countries' | 'ports' | 'operators' | 'corridors'>('countries');

  const { country_metrics, port_metrics, operator_metrics, trade_corridors, total_ton_miles_m } = analytics;

  // 1. Country Columns
  const countryColumns: Column<CountryTradeMetric>[] = [
    {
      key: 'country',
      header: 'Trading Nation',
      sortable: true,
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={15} color="var(--color-brand-accent)" />
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.country}</span>
        </div>
      ),
    },
    {
      key: 'voyage_count',
      header: 'Voyage Count',
      sortable: true,
      render: (c) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.voyage_count}</span>,
    },
    {
      key: 'total_volume_mt',
      header: 'Cargo Volume (MT)',
      sortable: true,
      render: (c) => <span style={{ fontFamily: 'monospace' }}>{c.total_volume_mt.toLocaleString()} MT</span>,
    },
    {
      key: 'active_vessels',
      header: 'Active Fleet',
      render: (c) => <span>{c.active_vessels} vessels</span>,
    },
    {
      key: 'primary_commodity',
      header: 'Dominant Commodity',
      render: (c) => <span className="badge badge-outline">{c.primary_commodity}</span>,
    },
    {
      key: 'actions',
      header: 'Filter',
      render: (c) => (
        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onSelectCountry && onSelectCountry(c.country)}
            style={{ padding: '3px 8px', fontSize: '11px' }}
          >
            Filter
          </button>
        </div>
      ),
    },
  ];

  // 2. Port Columns
  const portColumns: Column<PortAggregationMetric>[] = [
    {
      key: 'port_name',
      header: 'Seaport Hub',
      sortable: true,
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Anchor size={15} color="var(--color-brand-accent)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.port_name}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.country}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'calls_count',
      header: 'Total Port Calls',
      sortable: true,
      render: (p) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.calls_count}</span>,
    },
    {
      key: 'avg_waiting_hours',
      header: 'Avg Waiting Time',
      render: (p) => (
        <span style={{ fontFamily: 'monospace', color: p.avg_waiting_hours > 8 ? '#f59e0b' : 'inherit' }}>
          {p.avg_waiting_hours} hrs
        </span>
      ),
    },
    {
      key: 'avg_berth_hours',
      header: 'Avg Berth Duration',
      render: (p) => <span style={{ fontFamily: 'monospace' }}>{p.avg_berth_hours} hrs</span>,
    },
    {
      key: 'total_cargo_handled_mt',
      header: 'Throughput (MT)',
      render: (p) => <span style={{ fontFamily: 'monospace' }}>{p.total_cargo_handled_mt.toLocaleString()} MT</span>,
    },
    {
      key: 'actions',
      header: 'Filter',
      render: (p) => (
        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onSelectPort && onSelectPort(p.port_name)}
            style={{ padding: '3px 8px', fontSize: '11px' }}
          >
            Filter
          </button>
        </div>
      ),
    },
  ];

  // 3. Operator Columns
  const operatorColumns: Column<OperatorAnalysisMetric>[] = [
    {
      key: 'operator',
      header: 'Commercial Operator',
      sortable: true,
      render: (o) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={15} color="var(--color-brand-accent)" />
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{o.operator}</span>
        </div>
      ),
    },
    {
      key: 'fleet_size',
      header: 'Fleet Vessels',
      render: (o) => <span style={{ fontFamily: 'monospace' }}>{o.fleet_size}</span>,
    },
    {
      key: 'active_voyages',
      header: 'Active Voyages',
      render: (o) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#10b981' }}>{o.active_voyages}</span>,
    },
    {
      key: 'laden_ratio_pct',
      header: 'Laden Efficiency',
      render: (o) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{o.laden_ratio_pct}%</span>
          <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ width: `${o.laden_ratio_pct}%`, height: '100%', background: '#10b981' }} />
          </div>
        </div>
      ),
    },
    {
      key: 'primary_trades',
      header: 'Core Corridors',
      render: (o) => (
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          {o.primary_trades.join(' &middot; ')}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Filter',
      render: (o) => (
        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onSelectOperator && onSelectOperator(o.operator)}
            style={{ padding: '3px 8px', fontSize: '11px' }}
          >
            Filter
          </button>
        </div>
      ),
    },
  ];

  // 4. Corridors Columns
  const corridorColumns: Column<TradeCorridorMetric>[] = [
    {
      key: 'corridor',
      header: 'Seaway Corridor (Origin → Destination)',
      sortable: true,
      render: (tc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <span>{tc.origin}</span>
          <ArrowRight size={13} color="var(--color-text-muted)" />
          <span>{tc.destination}</span>
        </div>
      ),
    },
    {
      key: 'voyage_count',
      header: 'Voyage Frequency',
      sortable: true,
      render: (tc) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{tc.voyage_count} transits</span>,
    },
    {
      key: 'avg_transit_days',
      header: 'Avg Transit Duration',
      render: (tc) => <span style={{ fontFamily: 'monospace' }}>{tc.avg_transit_days} days</span>,
    },
    {
      key: 'dominant_cargo',
      header: 'Primary Cargo',
      render: (tc) => <span className="badge badge-outline">{tc.dominant_cargo}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Analytics Subnavigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'countries' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('countries')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Globe size={14} />
            <span>Country Aggregation</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'ports' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ports')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Anchor size={14} />
            <span>Port Aggregation</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'operators' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('operators')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Shield size={14} />
            <span>Commercial Operators</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'corridors' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('corridors')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <TrendingUp size={14} />
            <span>Trading Corridors</span>
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Total Ton-Miles Calculated: <strong style={{ color: 'var(--color-brand-accent)', fontFamily: 'monospace' }}>{total_ton_miles_m.toLocaleString()} M</strong>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'countries' && (
          <DataTable
            columns={countryColumns}
            data={country_metrics}
            keyExtractor={(c) => c.country}
            emptyMessage="No country trade records match the active filters."
          />
        )}

        {activeTab === 'ports' && (
          <DataTable
            columns={portColumns}
            data={port_metrics}
            keyExtractor={(p) => p.port_id}
            emptyMessage="No port metrics match the active filters."
          />
        )}

        {activeTab === 'operators' && (
          <DataTable
            columns={operatorColumns}
            data={operator_metrics}
            keyExtractor={(o) => o.operator}
            emptyMessage="No commercial operators match the active filters."
          />
        )}

        {activeTab === 'corridors' && (
          <DataTable
            columns={corridorColumns}
            data={trade_corridors}
            keyExtractor={(tc) => tc.corridor}
            emptyMessage="No trade corridors match the active filters."
          />
        )}
      </div>
    </div>
  );
}
