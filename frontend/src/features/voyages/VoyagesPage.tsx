import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Navigation,
  Anchor,
  Layers,
  BarChart3,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useVoyages } from '../../hooks/useVoyages';
import { VoyagesHeader } from './components/VoyagesHeader';
import { VoyageKPISummary } from './components/VoyageKPISummary';
import { VoyageFilters } from './components/VoyageFilters';
import { VoyageTable } from './components/VoyageTable';
import { VoyageTimeline } from './components/VoyageTimeline';
import { VoyageMapWidget } from './components/VoyageMapWidget';
import { PortCallsPanel } from './components/PortCallsPanel';
import { STSEventsPanel } from './components/STSEventsPanel';
import { VoyageAnalyticsPanel } from './components/VoyageAnalyticsPanel';
import { VoyageDetailDrawer } from './components/VoyageDetailDrawer';
import { ErrorState } from '../../components/feedback/ErrorState';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';
import type { VoyageRecord, VoyageFiltersState } from '../../types/voyage';

export function VoyagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialTab = (searchParams.get('tab') as 'voyages' | 'port_calls' | 'sts_events' | 'analytics') || 'voyages';
  const initialVesselId = searchParams.get('vesselId') || 'all';
  const initialVoyageId = searchParams.get('voyageId') || '';

  const [activeTab, setActiveTab] = useState<'voyages' | 'port_calls' | 'sts_events' | 'analytics'>(initialTab);
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [focusCoord, setFocusCoord] = useState<{ lat: number; lng: number; label: string } | null>(null);

  const [filters, setFilters] = useState<VoyageFiltersState>({
    searchQuery: '',
    vesselId: initialVesselId,
    status: 'all',
    legType: 'all',
    originPort: 'all',
    destinationPort: 'all',
    operator: '',
    dateRange: 'all',
  });

  const {
    voyages,
    allVoyages,
    analytics,
    vessels,
    isLoading,
    isError,
    error,
    refetch,
  } = useVoyages(filters);

  // Derive unique commercial operators for filter dropdown
  const operators = useMemo(() => {
    const set = new Set<string>();
    allVoyages.forEach((v) => {
      if (v.operator) set.add(v.operator);
    });
    return Array.from(set);
  }, [allVoyages]);

  // Sync selected voyage with initial URL param or default to first voyage
  useEffect(() => {
    if (allVoyages.length > 0) {
      if (initialVoyageId) {
        const match = allVoyages.find((v) => v.id === initialVoyageId);
        if (match) {
          setSelectedVoyage(match);
          setIsDrawerOpen(true);
          return;
        }
      }
      if (!selectedVoyage) {
        setSelectedVoyage(allVoyages[0]);
      }
    }
  }, [allVoyages, initialVoyageId]);

  // Keep search params in sync with active tab and selections
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (activeTab !== 'voyages') {
      nextParams.set('tab', activeTab);
    } else {
      nextParams.delete('tab');
    }

    if (filters.vesselId !== 'all') {
      nextParams.set('vesselId', filters.vesselId);
    } else {
      nextParams.delete('vesselId');
    }

    if (selectedVoyage && isDrawerOpen) {
      nextParams.set('voyageId', selectedVoyage.id);
    } else {
      nextParams.delete('voyageId');
    }

    setSearchParams(nextParams, { replace: true });
  }, [activeTab, filters.vesselId, selectedVoyage, isDrawerOpen]);

  const handleSelectVoyage = (voyage: VoyageRecord) => {
    setSelectedVoyage(voyage);
    setIsDrawerOpen(true);
    setFocusCoord({
      lat: voyage.current_latitude || voyage.origin_port.latitude,
      lng: voyage.current_longitude || voyage.origin_port.longitude,
      label: voyage.voyage_number,
    });
  };

  const handleOpenMap = (voyage: VoyageRecord) => {
    setSelectedVoyage(voyage);
    setShowRouteMap(true);
    setFocusCoord({
      lat: voyage.current_latitude || voyage.origin_port.latitude,
      lng: voyage.current_longitude || voyage.origin_port.longitude,
      label: voyage.voyage_number,
    });
  };

  const handleLocateEvent = (lat: number, lng: number, label: string) => {
    setFocusCoord({ lat, lng, label });
    setShowRouteMap(true);
  };

  const totalPortCalls = analytics.port_metrics.reduce((a, b) => a + b.calls_count, 0);

  return (
    <div className="cvi-workspace oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="voyage" />
      {/* 1. Page Header + Control Bar Toolbar */}
      <VoyagesHeader
        voyages={voyages}
        allVoyages={allVoyages}
        vessels={vessels}
        filters={filters}
        onFilterChange={setFilters}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* 2. KPI Intelligence Grid (Strict 6 equal cards in 1 row on desktop) */}
      <VoyageKPISummary
        analytics={analytics}
        selectedStatus={filters.status}
        onSelectStatus={(st) => setFilters({ ...filters, status: st as VoyageFiltersState['status'] })}
      />

      {/* 3. Voyage Workspace Navigation Tabs */}
      <div className="cvi-tabs">
        <button
          type="button"
          className={`cvi-tab-btn ${activeTab === 'voyages' ? 'active' : ''}`}
          onClick={() => setActiveTab('voyages')}
        >
          <Navigation size={14} />
          <span>Fleet Voyages ({voyages.length})</span>
        </button>

        <button
          type="button"
          className={`cvi-tab-btn ${activeTab === 'port_calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('port_calls')}
        >
          <Anchor size={14} />
          <span>Port Calls ({totalPortCalls})</span>
        </button>

        <button
          type="button"
          className={`cvi-tab-btn ${activeTab === 'sts_events' ? 'active' : ''}`}
          onClick={() => setActiveTab('sts_events')}
        >
          <Layers size={14} />
          <span>Ship-to-Ship (STS) Events</span>
        </button>

        <button
          type="button"
          className={`cvi-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={14} />
          <span>Trade & Operator Analytics</span>
        </button>
      </div>

      {/* 4. Unified Data Workspace Card */}
      <div className="cvi-workspace-card">
        {isError ? (
          <ErrorState
            title="Failed to Load Maritime Voyages"
            message={error instanceof Error ? error.message : 'Unable to connect to FastAPI /vessels or /ports endpoints.'}
            onRetry={refetch}
          />
        ) : (
          <>
            {activeTab === 'voyages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Search Toolbar + Filter Chips */}
                <VoyageFilters filters={filters} onChange={setFilters} operators={operators} />

                {/* Optional Interactive Seaway Corridor Map & Lifecycle Strip */}
                {selectedVoyage && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      background: '#061321',
                      border: '1px solid rgba(80, 180, 255, 0.12)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <MapPin size={14} color="#00d8ff" />
                        <span style={{ color: '#94a3b8' }}>Inspecting Seaway Corridor:</span>
                        <strong style={{ color: '#ffffff' }}>
                          {selectedVoyage.origin_port?.name} &rarr; {selectedVoyage.destination_port?.name}
                        </strong>
                        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                          ({selectedVoyage.voyage_number})
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowRouteMap(!showRouteMap)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          color: '#00d8ff',
                          height: '28px',
                          padding: '0 8px',
                        }}
                      >
                        <span>{showRouteMap ? 'Hide Route Map' : 'Show Route Map & Lifecycle'}</span>
                        {showRouteMap ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>

                    {showRouteMap && (
                      <div
                        className="vdb-voyages-split-grid"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(320px, 1fr)',
                          gap: '14px',
                          marginTop: '6px',
                        }}
                      >
                        <VoyageMapWidget
                          selectedVoyage={selectedVoyage}
                          allVoyages={voyages}
                          height={350}
                          focusCoord={focusCoord}
                        />
                        <VoyageTimeline voyage={selectedVoyage} onLocateEvent={handleLocateEvent} />
                      </div>
                    )}
                  </div>
                )}

                {/* Table Header Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', letterSpacing: '0.01em' }}>
                    Commercial Voyage Registry & Operational Intelligence
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing <strong style={{ color: '#38bdf8' }}>{voyages.length}</strong> of {allVoyages.length} fleet voyages
                  </span>
                </div>

                {/* Primary Voyage Table */}
                <VoyageTable
                  voyages={voyages}
                  selectedVoyageId={selectedVoyage?.id}
                  onSelectVoyage={handleSelectVoyage}
                  onOpenMap={handleOpenMap}
                  isLoading={isLoading}
                />
              </div>
            )}

            {activeTab === 'port_calls' && (
              <PortCallsPanel
                voyages={voyages}
                onLocatePort={(lat, lng, name) => {
                  setActiveTab('voyages');
                  setShowRouteMap(true);
                  handleLocateEvent(lat, lng, name);
                }}
                onSelectVoyage={handleSelectVoyage}
              />
            )}

            {activeTab === 'sts_events' && (
              <STSEventsPanel
                voyages={voyages}
                onLocateSTS={(lat, lng, name) => {
                  setActiveTab('voyages');
                  setShowRouteMap(true);
                  handleLocateEvent(lat, lng, name);
                }}
                onSelectVoyage={handleSelectVoyage}
              />
            )}

            {activeTab === 'analytics' && (
              <VoyageAnalyticsPanel
                analytics={analytics}
                onSelectCountry={(country) => {
                  setFilters({ ...filters, searchQuery: country });
                  setActiveTab('voyages');
                }}
                onSelectPort={(portName) => {
                  setFilters({ ...filters, searchQuery: portName });
                  setActiveTab('voyages');
                }}
                onSelectOperator={(op) => {
                  setFilters({ ...filters, operator: op });
                  setActiveTab('voyages');
                }}
              />
            )}
          </>
        )}
      </div>

      {/* 5. Contextual Voyage Detail Slide-out Drawer */}
      <VoyageDetailDrawer
        voyage={selectedVoyage}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLocateEvent={handleLocateEvent}
      />
    </div>
  );
}
