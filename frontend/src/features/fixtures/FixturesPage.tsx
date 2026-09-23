/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixtures & Commercial Chartering Management Workspace
 */

import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Share2,
  AlertTriangle,
  UploadCloud,
  DownloadCloud,
  Fuel,
  Compass,
  Check,
  X,
  Info,
  FileText,
  Archive,
  Layers,
} from 'lucide-react';
import { useFixtures } from '../../hooks/useFixtures';
import { FixturesService } from '../../services/fixtures/fixtures.service';
import { FixturesHeader } from './components/FixturesHeader';
import { FixturesKPISummary } from './components/FixturesKPISummary';
import { FixturesFilters } from './components/FixturesFilters';
import { FixturesTable } from './components/FixturesTable';
import { FixtureDetailDrawer } from './components/FixtureDetailDrawer';
import { FixtureModal } from './components/FixtureModal';
import { FixtureStatusTransitionModal } from './components/FixtureStatusTransitionModal';
import { FixtureShareModal } from './components/FixtureShareModal';
import type { PortNodeType, FixtureFiltersState } from '../../types/fixture';

export default function FixturesPage() {
  const {
    allFixtures,
    filteredFixtures,
    analytics,
    vessels,
    ports,
    isLoading,
    refetch,
    filterOptions,

    activeTab,
    setActiveTab,

    filters,
    setFilters,

    selectedFixture,
    isDrawerOpen,
    handleOpenDetail,
    handleCloseDetail,

    isModalOpen,
    setIsModalOpen,
    editingFixture,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveFixture,

    isStatusModalOpen,
    setIsStatusModalOpen,
    statusTarget,
    handleOpenStatusModal,
    handleTransitionStatus,

    isShareModalOpen,
    setIsShareModalOpen,
    shareTarget,
    handleOpenShare,

    toasts,
    showToast,
  } = useFixtures();

  const [searchParams] = useSearchParams();
  const deepLinkedFixtureId = searchParams.get('fixtureId');

  // Deep-link navigation to fixture from notifications
  useEffect(() => {
    if (!deepLinkedFixtureId || isLoading || allFixtures.length === 0) return;
    const match = allFixtures.find((f) => f.id === deepLinkedFixtureId);
    if (match) {
      handleOpenDetail(match);
    } else {
      showToast(`Fixture "${deepLinkedFixtureId}" was not found or is no longer available.`, 'warning');
    }
  }, [deepLinkedFixtureId, allFixtures, isLoading]);

  const handleFilterChange = (partial: Partial<FixtureFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'all',
      vesselId: 'all',
      charterer: 'all',
      currency: 'all',
      rateType: 'all',
      portName: 'all',
      cargoCategory: 'all',
      laycanRange: 'all',
    });
  };

  const handleFilterByStatus = (status: string) => {
    if (status === 'all') {
      setActiveTab('active');
      setFilters((prev) => ({ ...prev, status: 'all' }));
    } else if (status === 'failed') {
      setActiveTab('historical');
      setFilters((prev) => ({ ...prev, status: 'failed' }));
    } else {
      setActiveTab('active');
      setFilters((prev) => ({ ...prev, status }));
    }
  };

  const handleFilterByLaycanAlerts = () => {
    setActiveTab('active');
    setFilters((prev) => ({ ...prev, laycanRange: 'next_7_days' }));
  };

  const handleExportCSV = () => {
    try {
      FixturesService.exportToCSV(filteredFixtures);
      showToast(`Exported ${filteredFixtures.length} fixtures to CSV.`, 'success');
    } catch {
      showToast('Failed to export fixtures to CSV.', 'error');
    }
  };

  const vesselOptions = useMemo(() => {
    return vessels.map((v) => ({ id: v.id, name: v.name }));
  }, [vessels]);

  const availableVesselsForModal = useMemo(() => {
    return vessels.map((v) => ({
      id: v.id,
      name: v.name,
      type: v.vessel_type || 'Bulk Carrier',
      imo: v.imo_number || 'N/A',
      dwt: v.capacity_tons || 0,
    }));
  }, [vessels]);

  const availablePortsForModal = useMemo(() => {
    return ports.map((p) => ({
      id: p.id,
      name: p.name,
      country: p.country || 'Unknown',
      unlocode: p.unlocode || undefined,
      max_draft: undefined,
    }));
  }, [ports]);

  const getPortTypeIcon = (type: PortNodeType) => {
    switch (type) {
      case 'load':
        return <UploadCloud size={13} style={{ color: '#00d8ff' }} />;
      case 'discharge':
        return <DownloadCloud size={13} style={{ color: '#22c98a' }} />;
      case 'bunkering':
        return <Fuel size={13} style={{ color: '#ffb020' }} />;
      case 'transit':
      default:
        return <Compass size={13} style={{ color: '#a855f7' }} />;
    }
  };

  return (
    <div className="cfw-container">
      {/* Toast Notification Stack */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '380px',
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                backgroundColor:
                  toast.type === 'success'
                    ? '#064e3b'
                    : toast.type === 'warning'
                    ? '#78350f'
                    : toast.type === 'error'
                    ? '#7f1d1d'
                    : '#091a2a',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8125rem',
                border: '1px solid rgba(80, 180, 255, 0.2)',
                animation: 'slideInUp 0.2s ease',
              }}
            >
              {toast.type === 'success' && <Check size={16} style={{ color: '#34d399', flexShrink: 0 }} />}
              {toast.type === 'warning' && <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />}
              {toast.type === 'error' && <X size={16} style={{ color: '#f87171', flexShrink: 0 }} />}
              {toast.type === 'info' && <Info size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />}
              <span style={{ flex: 1 }}>{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* 1. Chartering Desk Header */}
      <FixturesHeader
        analytics={analytics}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportCSV={handleExportCSV}
        onRefresh={() => {
          refetch();
          showToast('Fixtures workspace refreshed.');
        }}
        isLoading={isLoading}
        onOpenCreate={handleOpenCreate}
        fixtures={filteredFixtures}
        totalCount={allFixtures.length}
      />

      {/* 2. Segmented Workspace Navigation */}
      <div className="cfw-tabs">
        <button
          type="button"
          className={`cfw-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <FileText size={15} />
          <span>Active Fixtures</span>
          <span className="cfw-tab-badge">{analytics.activeCount}</span>
        </button>

        <button
          type="button"
          className={`cfw-tab-btn ${activeTab === 'historical' ? 'active' : ''}`}
          onClick={() => setActiveTab('historical')}
        >
          <Archive size={15} />
          <span>Historical Archive</span>
          <span className="cfw-tab-badge">{analytics.historicalCount}</span>
        </button>

        <button
          type="button"
          className={`cfw-tab-btn ${activeTab === 'multi_port' ? 'active' : ''}`}
          onClick={() => setActiveTab('multi_port')}
        >
          <Layers size={15} />
          <span>Multi-Port Rotations</span>
        </button>
      </div>

      {/* 3. Fixture KPI Intelligence Grid (Strict 5 Cards on Desktop) */}
      <FixturesKPISummary
        analytics={analytics}
        filters={filters}
        onFilterChange={(f) => setFilters(f)}
        onFilterByStatus={handleFilterByStatus}
        onFilterByLaycanAlerts={handleFilterByLaycanAlerts}
      />

      {/* 4. Filter / Search Command Bar */}
      <FixturesFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        chartererOptions={filterOptions.charterers}
        cargoCategories={filterOptions.cargoCategories}
        vesselOptions={vesselOptions}
        totalCount={allFixtures.length}
        filteredCount={filteredFixtures.length}
      />

      {/* 5. Fixture Workspace Table or Dedicated Multi-Port Workspace */}
      {activeTab === 'multi_port' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#091a2a',
              borderRadius: '10px',
              border: '1px solid rgba(80, 180, 255, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Multi-Port Rotation Operational View
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                Visualizing complete ordered rotations with load ports, bunkering anchorages, canal transits, and discharge terminals.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: '#00d8ff', fontWeight: 700, background: 'rgba(0, 216, 255, 0.12)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(0, 216, 255, 0.3)' }}>
              {filteredFixtures.length} Voyage Rotations Tracked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '16px' }}>
            {filteredFixtures.map((fixture) => (
              <div
                key={fixture.id}
                style={{
                  backgroundColor: '#091a2a',
                  borderRadius: '10px',
                  border: '1px solid rgba(80, 180, 255, 0.14)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#00d8ff', fontFamily: 'monospace', fontSize: '14px' }}>
                        {fixture.fixture_reference}
                      </span>
                      <span
                        className={`cfw-badge ${
                          fixture.status === 'fully_fixed'
                            ? 'cfw-badge-fully-fixed'
                            : fixture.status === 'on_subjects'
                            ? 'cfw-badge-on-subjects'
                            : fixture.status === 'failed'
                            ? 'cfw-badge-failed'
                            : 'cfw-badge-draft'
                        }`}
                      >
                        <span className="cfw-badge-dot" />
                        <span>{fixture.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                      <strong style={{ color: '#ffffff' }}>{fixture.vessel_name}</strong> • {fixture.charterer}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#00d8ff' }}>{fixture.rate_formatted}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Laycan: {fixture.laycan_start}
                    </div>
                  </div>
                </div>

                {/* Port Sequence Chain */}
                <div
                  style={{
                    backgroundColor: '#0b1d2e',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    border: '1px solid rgba(80, 180, 255, 0.12)',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                    ORDERED ROTATION STOPS ({fixture.ports.length}):
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {fixture.ports.map((port) => (
                      <div
                        key={port.sequence}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#00d8ff',
                              color: '#061321',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            {port.sequence}
                          </span>
                          {getPortTypeIcon(port.port_type)}
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{port.port_name}</span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>
                            ({port.country})
                          </span>
                        </div>

                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          <span style={{ textTransform: 'uppercase', fontWeight: 600, marginRight: '8px', color: '#38bdf8' }}>
                            [{port.port_type}]
                          </span>
                          {port.eta ? `ETA: ${port.eta.split('T')[0]}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cargo & Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Cargo: <strong style={{ color: '#ffffff' }}>{fixture.commodity}</strong> ({fixture.quantity_tons.toLocaleString()} MT)
                  </div>

                  <div className="cfw-action-btn-group">
                    <button
                      type="button"
                      className="cfw-icon-btn"
                      onClick={() => handleOpenDetail(fixture)}
                      title="View Complete Fixture Details"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      className="cfw-icon-btn"
                      onClick={() => handleOpenEdit(fixture)}
                      title="Edit Fixture"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="cfw-icon-btn"
                      onClick={() => handleOpenShare(fixture)}
                      title="Generate Fixture Recap"
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TAB VIEW: Standard Fixtures Table (Active / Historical) */
        <FixturesTable
          fixtures={filteredFixtures}
          onOpenDetail={handleOpenDetail}
          onOpenEdit={handleOpenEdit}
          onOpenStatusModal={handleOpenStatusModal}
          onOpenShare={handleOpenShare}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
        />
      )}

      {/* Slide-Out Detail Drawer */}
      <FixtureDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDetail}
        fixture={selectedFixture}
        onOpenEdit={handleOpenEdit}
        onOpenStatusModal={handleOpenStatusModal}
        onOpenShare={handleOpenShare}
      />

      {/* Create / Edit Modal */}
      <FixtureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFixture}
        editingFixture={editingFixture}
        vessels={availableVesselsForModal}
        ports={availablePortsForModal}
      />

      {/* Controlled Status Transition Modal */}
      <FixtureStatusTransitionModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        fixture={statusTarget}
        onTransition={handleTransitionStatus}
      />

      {/* Commercial Fixture Recap Modal */}
      <FixtureShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fixture={shareTarget}
      />
    </div>
  );
}

