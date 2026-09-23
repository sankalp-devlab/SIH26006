import { CheckCircle, Package, Plus } from 'lucide-react';
import { useCargoWorkspace } from '../../hooks/useCargoWorkspace';
import { CargoHeader } from './components/CargoHeader';
import { CargoKPISummary } from './components/CargoKPISummary';
import { CargoFilters } from './components/CargoFilters';
import { CargoTable } from './components/CargoTable';
import { CargoZoneGrouping } from './components/CargoZoneGrouping';
import { CargoDuplicateClusters } from './components/CargoDuplicateClusters';
import { CargoDetailDrawer } from './components/CargoDetailDrawer';
import { CargoMergeModal } from './components/CargoMergeModal';
import { CargoVesselMatchModal } from './components/CargoVesselMatchModal';
import { CargoCompareModal } from './components/CargoCompareModal';
import { CargoShareModal } from './components/CargoShareModal';
import { CargoCreateModal } from './components/CargoCreateModal';
import { CargoIngestModal } from './components/CargoIngestModal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Button } from '../../components/ui/Button';

export function CargoPage() {
  const {
    allCargos,
    filteredCargos,
    analytics,
    ports,
    vessels,
    isLoading,
    isError,
    error,
    refetch,
    filterOptions,

    // View mode
    viewMode,
    setViewMode,

    // Filter controls
    filters,
    setFilters,

    // Selection
    selectedIds,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,

    // Modals & Drawers
    selectedCargo,
    isDrawerOpen,
    handleOpenDetail,
    handleCloseDetail,

    mergeTarget,
    isMergeModalOpen,
    setIsMergeModalOpen,
    handleOpenMerge,
    handleConfirmMerge,

    vesselMatchTarget,
    isVesselMatchModalOpen,
    setIsVesselMatchModalOpen,
    handleOpenVesselMatch,
    handleAssignVessel,
    handleUnmatchVessel,

    compareTargets,
    isCompareModalOpen,
    setIsCompareModalOpen,
    handleOpenCompare,

    shareTarget,
    isShareModalOpen,
    setIsShareModalOpen,
    handleOpenShare,

    isCreateModalOpen,
    setIsCreateModalOpen,

    isIngestModalOpen,
    setIsIngestModalOpen,
    handleIngestNewCargo,

    // Operational Actions
    handleValidateSingle,
    handleValidateSelected,
    handleArchiveSingle,
    handleArchiveSelected,
    handleRestoreSingle,

    // Feedback
    toasts,
  } = useCargoWorkspace();

  return (
    <div className="ciw-container">
      {/* 1. Header Toolbar */}
      <CargoHeader
        analytics={analytics}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refetch}
        isLoading={isLoading}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenIngest={() => setIsIngestModalOpen(true)}
        cargos={filteredCargos}
      />

      {/* 2. Operational KPI Strip (Strict 5 equal cards on desktop >= 1280px) */}
      <CargoKPISummary
        analytics={analytics}
        filters={filters}
        onFilterChange={setFilters}
        onSelectDuplicatesView={() => setViewMode('duplicates')}
      />

      {/* 3. Search & Filter Command Bar */}
      <CargoFilters
        filters={filters}
        onChange={setFilters}
        filterOptions={filterOptions}
      />

      {/* 4. Workspace Navigation Tabs */}
      <div className="ciw-tabs">
        <button
          type="button"
          className={`ciw-tab-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
        >
          <Package size={14} />
          <span>Cargo Demand Table</span>
          <span className="ciw-tab-badge">{filteredCargos.length}</span>
        </button>

        <button
          type="button"
          className={`ciw-tab-btn ${viewMode === 'zones' ? 'active' : ''}`}
          onClick={() => setViewMode('zones')}
        >
          <span style={{ fontSize: '13px' }}>🗺️</span>
          <span>Corridor Zones</span>
        </button>

        <button
          type="button"
          className={`ciw-tab-btn ${viewMode === 'duplicates' ? 'active' : ''}`}
          onClick={() => setViewMode('duplicates')}
        >
          <span style={{ fontSize: '13px' }}>🔍</span>
          <span>Duplicate Clusters</span>
          {analytics.duplicateClustersCount > 0 && (
            <span
              className="ciw-tab-badge"
              style={{ backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#c084fc' }}
            >
              {analytics.duplicateClustersCount}
            </span>
          )}
        </button>
      </div>

      {/* 5. Main Workspace Content */}
      {isError ? (
        <ErrorState
          title="Failed to Load Cargo Registry"
          message={error instanceof Error ? error.message : 'Unable to connect to FastAPI /cargo or /ports endpoints.'}
          onRetry={refetch}
        />
      ) : allCargos.length === 0 && !isLoading ? (
        <EmptyState
          title="No Active Cargo Inquiries"
          description="The platform currently contains no cargo freight inquiries. Use the buttons below to register a consignment or simulate incoming message stream ingestion."
          icon={<Package className="feedback-icon" />}
          action={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setIsCreateModalOpen(true)}>
                New Consignment
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setIsIngestModalOpen(true)}>
                Simulate Ingestion
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {viewMode === 'table' && (
            <CargoTable
              cargos={filteredCargos}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onOpenDetail={handleOpenDetail}
              onOpenVesselMatch={handleOpenVesselMatch}
              onOpenShare={handleOpenShare}
              onValidateSingle={handleValidateSingle}
              onArchiveSingle={handleArchiveSingle}
              onRestoreSingle={handleRestoreSingle}
              onValidateSelected={handleValidateSelected}
              onArchiveSelected={handleArchiveSelected}
              onOpenCompare={handleOpenCompare}
              isLoading={isLoading}
            />
          )}

          {viewMode === 'zones' && (
            <CargoZoneGrouping
              cargos={filteredCargos}
              onOpenDetail={handleOpenDetail}
              onOpenVesselMatch={handleOpenVesselMatch}
              onOpenShare={handleOpenShare}
            />
          )}

          {viewMode === 'duplicates' && (
            <CargoDuplicateClusters
              cargos={allCargos}
              onOpenMerge={handleOpenMerge}
              onOpenDetail={handleOpenDetail}
            />
          )}
        </>
      )}

      {/* 5. Detail Slide-out Drawer */}
      <CargoDetailDrawer
        cargo={selectedCargo}
        isOpen={isDrawerOpen}
        onClose={handleCloseDetail}
        onOpenVesselMatch={handleOpenVesselMatch}
        onUnmatchVessel={handleUnmatchVessel}
        onValidateSingle={handleValidateSingle}
        onArchiveSingle={handleArchiveSingle}
        onOpenShare={handleOpenShare}
        onAssignVessel={handleAssignVessel}
      />

      {/* 6. Controlled Merge Modal */}
      <CargoMergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        primary={mergeTarget?.primary || null}
        duplicate={mergeTarget?.duplicate || null}
        onConfirmMerge={handleConfirmMerge}
      />

      {/* 7. Vessel Allocation Modal */}
      <CargoVesselMatchModal
        isOpen={isVesselMatchModalOpen}
        onClose={() => setIsVesselMatchModalOpen(false)}
        cargo={vesselMatchTarget}
        availableVessels={vessels}
        onAssignVessel={handleAssignVessel}
      />

      {/* 8. Comparison Matrix Modal */}
      <CargoCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        cargos={compareTargets}
        onOpenDetail={handleOpenDetail}
      />

      {/* 9. Share Freight Recap Modal */}
      <CargoShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        cargo={shareTarget}
      />

      {/* 10. Register Consignment Modal */}
      <CargoCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        ports={ports}
        onCreateCargo={handleIngestNewCargo}
      />

      {/* 11. Multi-Channel Ingest Modal */}
      <CargoIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        ports={ports}
        onIngestCargo={handleIngestNewCargo}
      />

      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              backgroundColor: toast.type === 'success' ? '#065f46' : toast.type === 'error' ? '#991b1b' : '#1e3e62',
              color: 'white',
              fontSize: '0.8125rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'auto',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <CheckCircle size={16} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default CargoPage;
