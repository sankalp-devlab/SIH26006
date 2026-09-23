import { Anchor, MapPin } from 'lucide-react';
import { DataTable, type Column } from '../../../components/data-display/DataTable';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import type { PortCall, VoyageRecord } from '../../../types/voyage';

interface PortCallsPanelProps {
  voyages: VoyageRecord[];
  onLocatePort?: (lat: number, lng: number, label: string) => void;
  onSelectVoyage?: (voyage: VoyageRecord) => void;
}

export function PortCallsPanel({
  voyages,
  onLocatePort,
  onSelectVoyage,
}: PortCallsPanelProps) {
  // Flatten port calls across voyages
  const allCalls: (PortCall & { voyage_ref: VoyageRecord })[] = [];
  voyages.forEach((v) => {
    v.port_calls.forEach((pc) => {
      allCalls.push({ ...pc, voyage_ref: v });
    });
  });

  const columns: Column<PortCall & { voyage_ref: VoyageRecord }>[] = [
    {
      key: 'port',
      header: 'Seaport & Country',
      render: (pc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Anchor size={16} color="var(--color-brand-accent)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
              {pc.port.name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              {pc.port.country} {pc.port.unlocode ? `&middot; ${pc.port.unlocode}` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'vessel',
      header: 'Vessel / Voyage',
      render: (pc) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>
            {pc.vessel_name}
          </span>
          <span
            style={{ fontSize: '0.6875rem', color: 'var(--color-brand-accent)', cursor: 'pointer', fontFamily: 'monospace' }}
            onClick={() => onSelectVoyage && onSelectVoyage(pc.voyage_ref)}
          >
            {pc.voyage_id}
          </span>
        </div>
      ),
    },
    {
      key: 'operation',
      header: 'Operation',
      render: (pc) => {
        let color = '#10b981';
        if (pc.operation_type === 'Discharging') color = '#38bdf8';
        if (pc.operation_type === 'Bunkering') color = '#f59e0b';
        return (
          <span
            className="badge"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}44`,
              fontSize: '0.6875rem',
              fontWeight: 600,
            }}
          >
            {pc.operation_type}
          </span>
        );
      },
    },
    {
      key: 'schedule',
      header: 'Arrival / Departure Dates',
      render: (pc) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Arr: </span>
            <span style={{ fontFamily: 'monospace' }}>{pc.arrival_date}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Dep: </span>
            <span style={{ fontFamily: 'monospace' }}>{pc.departure_date}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'durations',
      header: 'Turnaround Times',
      render: (pc) => (
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.6875rem' }}>At Berth</span>
            <strong style={{ fontFamily: 'monospace' }}>{pc.berth_duration_hours}h</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.6875rem' }}>Waiting</span>
            <strong style={{ fontFamily: 'monospace', color: pc.waiting_time_hours > 8 ? '#f59e0b' : 'inherit' }}>
              {pc.waiting_time_hours}h
            </strong>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (pc) => <StatusBadge status={pc.status} />,
    },
    {
      key: 'actions',
      header: 'Locate',
      render: (pc) => (
        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onLocatePort && onLocatePort(pc.port.latitude, pc.port.longitude, pc.port.name)}
            title="Locate Port on Map"
            style={{ padding: '4px 8px' }}
          >
            <MapPin size={14} color="var(--color-brand-accent)" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <DataTable
        columns={columns}
        data={allCalls}
        keyExtractor={(pc) => pc.id}
        emptyMessage="No port calls match current fleet voyages or filters."
      />
    </div>
  );
}
