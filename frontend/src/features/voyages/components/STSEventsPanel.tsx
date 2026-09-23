import { Layers, MapPin } from 'lucide-react';
import { DataTable, type Column } from '../../../components/data-display/DataTable';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import type { STSEvent, VoyageRecord } from '../../../types/voyage';

interface STSEventsPanelProps {
  voyages: VoyageRecord[];
  onLocateSTS?: (lat: number, lng: number, label: string) => void;
  onSelectVoyage?: (voyage: VoyageRecord) => void;
}

export function STSEventsPanel({
  voyages,
  onLocateSTS,
  onSelectVoyage,
}: STSEventsPanelProps) {
  const allSTSEvents: (STSEvent & { voyage_ref: VoyageRecord })[] = [];
  voyages.forEach((v) => {
    v.sts_events.forEach((sts) => {
      allSTSEvents.push({ ...sts, voyage_ref: v });
    });
  });

  const columns: Column<STSEvent & { voyage_ref: VoyageRecord }>[] = [
    {
      key: 'location',
      header: 'STS Offshore Location',
      render: (sts) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899',
            }}
          >
            <Layers size={13} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
              {sts.location_name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              {sts.latitude.toFixed(3)}° N, {sts.longitude.toFixed(3)}° E
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'vessels',
      header: 'Partner Vessels (Mother ⇄ Daughter)',
      render: (sts) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)', width: '50px' }}>Mother:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{sts.mother_vessel_name}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)', width: '50px' }}>Daughter:</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {sts.daughter_vessel_name} (IMO {sts.daughter_vessel_imo || '9518290'})
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'cargo',
      header: 'Transferred Commodity',
      render: (sts) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
            {sts.cargo_commodity}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#ec4899', fontFamily: 'monospace', fontWeight: 600 }}>
            {sts.quantity_mt.toLocaleString()} MT Transfer
          </span>
        </div>
      ),
    },
    {
      key: 'window',
      header: 'Operation Window',
      render: (sts) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Start: </span>
            <span style={{ fontFamily: 'monospace' }}>{sts.start_time}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Duration: </span>
            <span style={{ fontFamily: 'monospace' }}>{sts.duration_hours} hrs</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (sts) => <StatusBadge status={sts.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (sts) => (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onLocateSTS && onLocateSTS(sts.latitude, sts.longitude, sts.location_name)}
            title="Locate STS Event on Map"
            style={{ padding: '4px 8px' }}
          >
            <MapPin size={14} color="#ec4899" />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onSelectVoyage && onSelectVoyage(sts.voyage_ref)}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Voyage
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <DataTable
        columns={columns}
        data={allSTSEvents}
        keyExtractor={(sts) => sts.id}
        emptyMessage="No offshore ship-to-ship transshipment or lightering events recorded for the current fleet voyages."
      />
    </div>
  );
}
