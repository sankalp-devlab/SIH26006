import {
  Eye,
  MapPin,
  TrendingUp,
  Ship,
} from 'lucide-react';
import { DataTable, type Column } from '../../../components/data-display/DataTable';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import { Tooltip } from '../../../components/ui/Tooltip';
import type { VoyageRecord } from '../../../types/voyage';

interface VoyageTableProps {
  voyages: VoyageRecord[];
  selectedVoyageId?: string;
  onSelectVoyage: (voyage: VoyageRecord) => void;
  onOpenMap: (voyage: VoyageRecord) => void;
  isLoading?: boolean;
}

export function VoyageTable({
  voyages,
  selectedVoyageId: _selectedVoyageId,
  onSelectVoyage,
  onOpenMap,
  isLoading = false,
}: VoyageTableProps) {
  const columns: Column<VoyageRecord>[] = [
    // 1. VOYAGE
    {
      key: 'voyage_number',
      header: 'VOYAGE',
      sortable: true,
      width: '13%',
      render: (v) => {
        const isPredicted = v.status === 'predicted';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: isPredicted ? '#c084fc' : '#38bdf8',
                  letterSpacing: '0.02em',
                }}
              >
                {v.voyage_number}
              </span>
            </div>
            {isPredicted ? (
              <Tooltip content="Forecasted voyage under forward fixture" position="top">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 600,
                    width: 'fit-content',
                  }}
                >
                  <TrendingUp size={9} />
                  {v.confidence_pct}% Forward Projected
                </span>
              </Tooltip>
            ) : (
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Leg {v.current_leg_index || 1} of {v.legs.length || 1}
              </span>
            )}
          </div>
        );
      },
    },

    // 2. VESSEL
    {
      key: 'vessel_name',
      header: 'VESSEL',
      sortable: true,
      width: '15%',
      render: (v) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Ship size={13} color="#64748b" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
              {v.vessel_name}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
            IMO {v.imo_number} &middot; {v.vessel_type || 'Bulk Carrier'}
          </span>
        </div>
      ),
    },

    // 3. ROUTE (ORIGIN -> DESTINATION)
    {
      key: 'origin_port',
      header: 'ROUTE (ORIGIN → DESTINATION)',
      width: '22%',
      render: (v) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>
            <span style={{ color: '#ffffff' }}>{v.origin_port?.name || 'Origin'}</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>&rarr;</span>
            <span style={{ color: '#ffffff' }}>{v.destination_port?.name || 'Destination'}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{v.origin_port?.unlocode ? `${v.origin_port.unlocode}` : v.origin_port?.country || 'Origin Port'}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>{v.destination_port?.unlocode ? `${v.destination_port.unlocode}` : v.destination_port?.country || 'Destination Port'}</span>
          </div>
        </div>
      ),
    },

    // 5. ETA
    {
      key: 'eta_date',
      header: 'ETA',
      sortable: true,
      width: '12%',
      render: (v) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#64748b' }}>ETA: </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: v.status === 'completed' ? '#94a3b8' : '#34d399',
              }}
            >
              {v.eta_date || 'Unavailable'}
            </span>
          </div>
          <div>
            <span style={{ color: '#475569' }}>Dep: </span>
            <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
              {v.departure_date || 'Unavailable'}
            </span>
          </div>
        </div>
      ),
    },

    // 6. STATUS
    {
      key: 'status',
      header: 'STATUS',
      width: '11%',
      render: (v) => <StatusBadge status={v.status} />,
    },

    // 7. CARGO
    {
      key: 'cargo',
      header: 'CARGO',
      width: '12%',
      render: (v) => {
        const isLaden = v.current_leg_type === 'laden';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
              {v.cargo_manifest?.commodity || (isLaden ? 'Dry Bulk' : 'In Ballast')}
            </span>
            <span style={{ fontSize: '11px', color: isLaden ? '#38bdf8' : '#64748b', fontFamily: 'monospace' }}>
              {v.cargo_manifest?.quantity_mt && v.cargo_manifest.quantity_mt > 0
                ? `${v.cargo_manifest.quantity_mt.toLocaleString()} MT`
                : 'Ballast (Empty)'}
            </span>
          </div>
        );
      },
    },

    // 8. OPERATOR
    {
      key: 'operator',
      header: 'OPERATOR',
      width: '13%',
      render: (v) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0' }}>
            {v.operator || 'Unavailable'}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Charterer: {v.charterer || 'Spot'}
          </span>
        </div>
      ),
    },

    // 9. ACTIONS
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (v) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMap(v);
            }}
            title="Inspect on Seaway Map"
            style={{ padding: '4px 7px', color: '#38bdf8' }}
          >
            <MapPin size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelectVoyage(v);
            }}
            title="View Full Voyage Intelligence Dossier"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 9px', fontSize: '11px' }}
          >
            <Eye size={12} />
            <span>Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <DataTable
        columns={columns}
        data={voyages}
        keyExtractor={(v) => v.id}
        isLoading={isLoading}
        onRowClick={(v) => onSelectVoyage(v)}
        emptyMessage="No commercial voyages match your filter criteria. Try clearing search filters or selecting All Fleet."
      />
    </div>
  );
}
