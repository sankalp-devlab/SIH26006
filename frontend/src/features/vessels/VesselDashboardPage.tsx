import { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVessel } from '../../hooks/useVessels';
import { VesselIntelligenceService } from '../../services/vessels/vessel-intelligence.service';
import type { VesselDashboardTab, EnrichedVesselDetail } from '../../types/vessel-detail';

import { VesselHeader } from './components/VesselHeader';
import { VesselDashboardTabs } from './components/VesselDashboardTabs';
import { OverviewTab } from './components/tabs/OverviewTab';
import { ParticularsTab } from './components/tabs/ParticularsTab';
import { VoyagesTab } from './components/tabs/VoyagesTab';
import { CargoTab } from './components/tabs/CargoTab';
import { CommercialTab } from './components/tabs/CommercialTab';
import { ValuationTab } from './components/tabs/ValuationTab';
import { SanctionsTab } from './components/tabs/SanctionsTab';
import { EmissionsTab } from './components/tabs/EmissionsTab';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';

const VALID_TABS: VesselDashboardTab[] = [
  'overview',
  'particulars',
  'voyages',
  'cargo',
  'commercial',
  'valuation',
  'sanctions',
  'emissions',
];

export function VesselDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const vesselId = id ? Number(id) : undefined;
  const { data: vessel, isLoading, error, refetch } = useVessel(vesselId);

  // Sync tab with URL query param ?tab=
  const tabParam = searchParams.get('tab') as VesselDashboardTab;
  const activeTab: VesselDashboardTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview';

  const handleTabChange = (newTab: VesselDashboardTab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', newTab);
    setSearchParams(newParams);
  };

  // Enrich vessel with operational intelligence
  const enriched: EnrichedVesselDetail | null = useMemo(() => {
    if (!vessel) return null;
    return VesselIntelligenceService.enrich(vessel);
  }, [vessel]);

  // Loading State
  if (isLoading) {
    return (
      <div className="vdb-page-container">
        <div className="vdb-header-skeleton">
          <Skeleton height={24} width={200} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Skeleton type="circle" height={56} width={56} />
            <div style={{ flex: 1 }}>
              <Skeleton height={28} width={320} style={{ marginBottom: 8 }} />
              <Skeleton height={18} width={450} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <Skeleton height={42} width="100%" />
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <Skeleton height={44} width="100%" style={{ marginBottom: 20 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Skeleton height={280} />
            <Skeleton height={280} />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !vessel || !enriched) {
    return (
      <div className="vdb-page-container">
        <div style={{ padding: '2rem 0' }}>
          <Link to="/vessels" className="vdb-back-link" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <ArrowLeft size={14} />
            <span>Return to Vessel Registry</span>
          </Link>

          <ErrorState
            title="Vessel Record Not Found"
            message={
              error
                ? 'Unable to connect to the vessel intelligence database. Please check connection and retry.'
                : `Vessel with identification ID ${id ?? 'unknown'} could not be found in active maritime registries.`
            }
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="vdb-page-container">
      {/* 1. PERSISTENT VESSEL HEADER WITH TELEMETRY & ACTIONS */}
      <VesselHeader data={enriched} />

      {/* 2. HORIZONTAL DASHBOARD NAVIGATION TABS */}
      <VesselDashboardTabs
        activeTab={activeTab}
        onChange={handleTabChange}
        voyageCount={enriched.commercial.recent_voyages.length + 1}
        cargoCount={enriched.cargo.cargo_history.length + 1}
      />

      {/* 3. ACTIVE INTELLIGENCE WORKSPACE PANE */}
      <main className="vdb-main-content">
        {activeTab === 'overview' && (
          <OverviewTab
            data={enriched}
            mode="dashboard"
            onNavigateTab={(t) => handleTabChange(t as VesselDashboardTab)}
          />
        )}
        {activeTab === 'particulars' && <ParticularsTab data={enriched} />}
        {activeTab === 'voyages' && <VoyagesTab data={enriched} />}
        {activeTab === 'cargo' && <CargoTab data={enriched} />}
        {activeTab === 'commercial' && <CommercialTab data={enriched} />}
        {activeTab === 'valuation' && <ValuationTab data={enriched} />}
        {activeTab === 'sanctions' && <SanctionsTab data={enriched} />}
        {activeTab === 'emissions' && <EmissionsTab data={enriched} />}
      </main>
    </div>
  );
}
