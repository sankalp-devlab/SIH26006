import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVessels } from '../../hooks/useVessels';
import { MobilePositionUpdaterService } from '../../services/mobile/mobile-position-updater.service';
import {
  ListFilter,
  Star,
  PlusCircle,
  Ship,
  ArrowRight,
  Trash2,
  Share2,
} from 'lucide-react';
import { MobileBottomSheet } from '../../components/mobile/MobileBottomSheet';
import { MobileExportSheet } from '../../components/export';
import type { Vessel } from '../../types/vessel';
import type { ExportColumnDefinition } from '../../types/export-sharing';

const MOBILE_VESSEL_EXPORT_COLUMNS: ExportColumnDefinition<Vessel>[] = [
  { key: 'name', label: 'Vessel Name', defaultVisible: true },
  { key: 'imo_number', label: 'IMO Number', defaultVisible: true },
  { key: 'vessel_type', label: 'Vessel Type', defaultVisible: true },
  { key: 'flag', label: 'Flag', defaultVisible: true },
  { key: 'status', label: 'Status', formatter: 'status', defaultVisible: true },
  { key: 'capacity_tons', label: 'DWT (MT)', formatter: 'number', defaultVisible: true },
  { key: 'year_built', label: 'Year Built', defaultVisible: true },
  { key: 'speed_laden_knots', label: 'Speed Laden (kts)', formatter: 'number', defaultVisible: false },
];

export const MobileListsView: React.FC = () => {
  const navigate = useNavigate();
  const { data: vesselsData } = useVessels(50);
  const allVessels: Vessel[] = useMemo(() => vesselsData?.vessels || [], [vesselsData]);

  const [activeTab, setActiveTab] = useState<'desktop_pools' | 'my_watchlists'>('my_watchlists');
  const [selectedPool, setSelectedPool] = useState<string>('vlcc');

  const [watchlists, setWatchlists] = useState<typeof MobilePositionUpdaterService extends { getWatchlists: () => infer R } ? R : any>(() =>
    MobilePositionUpdaterService.getWatchlists()
  );
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>(
    watchlists[0]?.id || 'watchlist-crude'
  );

  const [isNewListOpen, setIsNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);

  const DESKTOP_POOLS = [
    { id: 'vlcc', name: 'VLCC Crude Pool', class: 'VLCC' },
    { id: 'clean', name: 'Clean Product Tankers', class: 'MR' },
    { id: 'capesize', name: 'Capesize Ore Fleets', class: 'Capesize' },
    { id: 'lng', name: 'LNG Gas Carriers', class: 'LNG' },
  ];

  // Active vessels displayed
  const displayedVessels = useMemo(() => {
    if (activeTab === 'desktop_pools') {
      const pool = DESKTOP_POOLS.find((p) => p.id === selectedPool);
      if (!pool) return allVessels.slice(0, 5);
      return allVessels.filter(
        (v) =>
          v.vessel_type?.toLowerCase().includes(pool.class.toLowerCase()) ||
          v.name.toLowerCase().includes(pool.id)
      ).slice(0, 10);
    } else {
      const activeList = watchlists.find((w) => w.id === selectedWatchlistId);
      if (!activeList || activeList.vesselIds.length === 0) {
        return allVessels.slice(0, 3);
      }
      return allVessels.filter((v) => activeList.vesselIds.includes(v.id));
    }
  }, [activeTab, selectedPool, selectedWatchlistId, allVessels, watchlists]);

  const handleCreateWatchlist = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: `watchlist-${Date.now()}`,
      name: newListName.trim(),
      vesselIds: [1, 2],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...watchlists, newList];
    MobilePositionUpdaterService.saveWatchlists(updated);
    setWatchlists(updated);
    setSelectedWatchlistId(newList.id);
    setNewListName('');
    setIsNewListOpen(false);
  };

  const handleRemoveVesselFromWatchlist = (vesselId: number) => {
    MobilePositionUpdaterService.toggleVesselInWatchlist(selectedWatchlistId, vesselId);
    setWatchlists(MobilePositionUpdaterService.getWatchlists());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Tab Switcher */}
      <div className="mobile-segmented-control">
        <button
          onClick={() => setActiveTab('my_watchlists')}
          className={`mobile-segment-chip ${activeTab === 'my_watchlists' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Star size={16} />
          My Watchlists ({watchlists.length})
        </button>
        <button
          onClick={() => setActiveTab('desktop_pools')}
          className={`mobile-segment-chip ${activeTab === 'desktop_pools' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <ListFilter size={16} />
          Commercial Pools
        </button>
      </div>

      {/* Sub-selectors */}
      {activeTab === 'my_watchlists' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {watchlists.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWatchlistId(w.id)}
              className={`mobile-segment-chip ${selectedWatchlistId === w.id ? 'active' : ''}`}
            >
              {w.name} ({w.vesselIds.length})
            </button>
          ))}
          <button
            onClick={() => setIsNewListOpen(true)}
            className="mobile-segment-chip"
            style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
          >
            <PlusCircle size={15} />
            New List
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {DESKTOP_POOLS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPool(p.id)}
              className={`mobile-segment-chip ${selectedPool === p.id ? 'active' : ''}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* List Action Bar: Count & Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {displayedVessels.length} {displayedVessels.length === 1 ? 'vessel' : 'vessels'} enrolled
        </span>
        <button
          onClick={() => setIsExportSheetOpen(true)}
          disabled={displayedVessels.length === 0}
          style={{
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Share2 size={13} />
          <span>Export &amp; Share</span>
        </button>
      </div>

      {/* Vessels In Selected List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayedVessels.length === 0 ? (
          <div className="mobile-card" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
            No vessels in this list yet. Browse the Live Vessel Fleet and tap the Star icon to bookmark ships.
          </div>
        ) : (
          displayedVessels.map((v) => (
            <div
              key={v.id}
              className="mobile-card"
              onClick={() => navigate(`/m/vessels/${v.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                    }}
                  >
                    <Ship size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      IMO {v.imo_number || '9845120'} • {v.vessel_type || 'Tanker'}
                    </div>
                  </div>
                </div>

                {activeTab === 'my_watchlists' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveVesselFromWatchlist(v.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                    title="Remove from list"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.6)',
                  fontSize: '0.76rem',
                }}
              >
                <span style={{ color: '#cbd5e1' }}>
                  Destination: <strong>{v.id % 2 === 0 ? 'Rotterdam (NLRTM)' : 'Singapore (SGSIN)'}</strong>
                </span>
                <span style={{ color: '#34d399' }}>
                  {v.speed_laden_knots || 13.2} kts • {(v as any).heading_degrees || 85}°
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                <span className="mobile-badge mobile-badge-live">Underway</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8', fontSize: '0.74rem', fontWeight: 600 }}>
                  <span>View Dossier</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Watchlist Bottom Sheet Modal */}
      <MobileBottomSheet
        isOpen={isNewListOpen}
        onClose={() => setIsNewListOpen(false)}
        title="Create Custom Vessel Watchlist"
        footer={
          <button onClick={handleCreateWatchlist} className="mobile-btn-primary">
            Create Watchlist
          </button>
        }
      >
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
            Watchlist Name
          </label>
          <input
            type="text"
            placeholder="e.g. Red Sea Transit Convoy, Persian Gulf VLCCs"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="mobile-input"
          />
        </div>
      </MobileBottomSheet>

      {/* Mobile Export Sheet */}
      {isExportSheetOpen && (
        <MobileExportSheet
          isOpen={isExportSheetOpen}
          onClose={() => setIsExportSheetOpen(false)}
          title={`Export ${
            activeTab === 'my_watchlists'
              ? watchlists.find((w) => w.id === selectedWatchlistId)?.name || 'Watchlist'
              : DESKTOP_POOLS.find((p) => p.id === selectedPool)?.name || 'Commercial Pool'
          }`}
          dataset={
            activeTab === 'my_watchlists'
              ? watchlists.find((w) => w.id === selectedWatchlistId)?.name || 'Watchlist'
              : DESKTOP_POOLS.find((p) => p.id === selectedPool)?.name || 'Commercial Pool'
          }
          data={displayedVessels}
          columns={MOBILE_VESSEL_EXPORT_COLUMNS}
          metadata={{
            source: 'Mobile Intelligence Fleet View',
            totalRecordCount: displayedVessels.length,
          }}
        />
      )}
    </div>
  );
};
