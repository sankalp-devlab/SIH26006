/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Calculator & TCE Estimation Workspace
 */

import {
  Check,
  AlertTriangle,
  X,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useVoyageCalculator } from '../../hooks/useVoyageCalculator';
import { VoyageCalculatorHeader } from './components/VoyageCalculatorHeader';
import { VoyageScenarioControl } from './components/VoyageScenarioControl';
import { VoyageKPISummary } from './components/VoyageKPISummary';
import { VoyageWorkspaceTabs, type VoyageTabId } from './components/VoyageWorkspaceTabs';
import { VoyageVesselCommercialSection } from './components/VoyageVesselCommercialSection';
import { VoyageCargoSection } from './components/VoyageCargoSection';
import { VoyageLegsSection } from './components/VoyageLegsSection';
import { VoyageBunkerEmissionsSection } from './components/VoyageBunkerEmissionsSection';
import { VoyageEconomicsBreakdown } from './components/VoyageEconomicsBreakdown';
import { VoyageScenarioComparison } from './components/VoyageScenarioComparison';
import { VoyageWorkbooksModal } from './components/VoyageWorkbooksModal';
import { VoyageNotesPanel } from './components/VoyageNotesPanel';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';
import './styles/voyage-calculator.css';

export default function VoyageCalculatorPage() {
  const {
    workbooks,
    activeWorkbookId,
    activeVoyage,
    activeTab,
    setActiveTab,
    activeScenarioId,
    setActiveScenarioId,
    isLoading,
    vessels,
    ports,
    toasts,

    isWorkbookModalOpen,
    setIsWorkbookModalOpen,

    scenarioResults,
    currentResult,

    updateVoyage,
    setVoyageMode,
    selectVessel,
    addCargo,
    updateCargo,
    removeCargo,
    addLeg,
    updateLeg,
    toggleManualDistance,
    removeLeg,
    saveCurrentVoyage,
    duplicateCurrentVoyage,
    switchWorkbook,
    exportCSV,
  } = useVoyageCalculator();

  // Premium Skeleton Loading State
  if (isLoading || !activeVoyage) {
    return (
      <div className="voyage-master-container">
        {/* Header Skeleton */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px',
            height: '110px',
            animation: 'pulse 1.5s infinite',
          }}
        />

        {/* Scenario Strip Skeleton */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '22px',
            height: '46px',
            animation: 'pulse 1.5s infinite',
          }}
        />

        {/* 6 KPI Cards Skeleton Grid */}
        <div className="voyage-kpi-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="voyage-kpi-card"
              style={{ animation: 'pulse 1.5s infinite' }}
            />
          ))}
        </div>

        {/* Workspace Nav Skeleton */}
        <div
          style={{
            backgroundColor: 'var(--voyage-surface)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '12px',
            height: '52px',
            marginBottom: '24px',
            animation: 'pulse 1.5s infinite',
          }}
        />

        {/* Dual-column content skeleton */}
        <div className="voyage-financial-workspace-grid">
          <div
            style={{
              backgroundColor: 'var(--voyage-surface)',
              border: '1px solid var(--voyage-border)',
              borderRadius: '12px',
              height: '420px',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <div
            style={{
              backgroundColor: 'var(--voyage-surface)',
              border: '1px solid var(--voyage-border)',
              borderRadius: '12px',
              height: '420px',
              animation: 'pulse 1.5s infinite',
            }}
          />
        </div>
      </div>
    );
  }

  // Error boundary fallback if calculation result fails
  if (!currentResult) {
    return (
      <div className="voyage-master-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: 'var(--voyage-surface)',
            border: '1px solid var(--voyage-border)',
            borderRadius: '12px',
            padding: '32px',
          }}
        >
          <AlertTriangle size={36} style={{ color: 'var(--voyage-amber)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--voyage-text)', marginBottom: '8px' }}>
            VOYAGE CALCULATION UNAVAILABLE
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--voyage-text-secondary)', marginBottom: '20px' }}>
            Unable to compute market voyage economics with current parameters. Please verify passage leg coordinates and bunker price models.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{ height: '38px', padding: '0 20px', gap: '8px' }}
          >
            <RotateCcw size={15} />
            <span>Retry Calculation</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voyage-master-container oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="voyage" />
      {/* Toast Feedback Notification Stack */}
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
                    ? 'rgba(6, 78, 59, 0.95)'
                    : toast.type === 'warning'
                    ? 'rgba(120, 53, 15, 0.95)'
                    : toast.type === 'error'
                    ? 'rgba(127, 29, 29, 0.95)'
                    : 'rgba(30, 41, 59, 0.95)',
                color: '#F5F8FC',
                padding: '10px 14px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {toast.type === 'success' && <Check size={16} style={{ color: 'var(--voyage-green)', flexShrink: 0 }} />}
              {toast.type === 'warning' && <AlertTriangle size={16} style={{ color: 'var(--voyage-amber)', flexShrink: 0 }} />}
              {toast.type === 'error' && <X size={16} style={{ color: 'var(--voyage-red)', flexShrink: 0 }} />}
              {toast.type === 'info' && <Info size={16} style={{ color: 'var(--voyage-cyan)', flexShrink: 0 }} />}
              <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* 1. Page Header: Eyebrow, Title, Vessel Metadata, Mode Switcher & Global Actions */}
      <VoyageCalculatorHeader
        voyage={activeVoyage}
        workbooks={workbooks}
        activeWorkbookId={activeWorkbookId}
        onUpdateName={(name) => updateVoyage({ name })}
        onSetMode={setVoyageMode}
        onOpenWorkbooks={() => setIsWorkbookModalOpen(true)}
        onSave={saveCurrentVoyage}
        onDuplicate={duplicateCurrentVoyage}
        onExportCSV={exportCSV}
        onReset={() => {}}
      />

      {/* 2. Dedicated Calculation Scenario Selector Strip */}
      <VoyageScenarioControl
        scenarios={activeVoyage.scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={setActiveScenarioId}
      />

      {/* 3. 6-Column Voyage KPI Intelligence Grid (All 6 on One Row on Desktop) */}
      <VoyageKPISummary
        result={currentResult}
        vesselDwt={activeVoyage.vessel_dwt}
      />

      {/* 4. Full-Width Segmented Workspace Sub-Navigation */}
      <VoyageWorkspaceTabs
        activeTab={activeTab as VoyageTabId}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        cargoCount={activeVoyage.cargoes.length}
        legCount={activeVoyage.legs.length}
      />

      {/* 5. Main Active Calculation Workspace Panels */}
      {activeTab === 'overview' && (
        <div>
          {/* Primary Commercial P&L Statement & Waterfall */}
          <VoyageEconomicsBreakdown voyage={activeVoyage} result={currentResult} />

          {/* Connected Quick Inspection Cards for Cargo Parcels & Passage Legs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
            <VoyageCargoSection
              voyage={activeVoyage}
              ports={ports}
              result={currentResult}
              onAddCargo={addCargo}
              onUpdateCargo={updateCargo}
              onRemoveCargo={removeCargo}
            />
            <VoyageLegsSection
              voyage={activeVoyage}
              ports={ports}
              result={currentResult}
              onAddLeg={addLeg}
              onUpdateLeg={updateLeg}
              onToggleManualDistance={toggleManualDistance}
              onRemoveLeg={removeLeg}
            />
          </div>
        </div>
      )}

      {activeTab === 'cargo' && (
        <VoyageCargoSection
          voyage={activeVoyage}
          ports={ports}
          result={currentResult}
          onAddCargo={addCargo}
          onUpdateCargo={updateCargo}
          onRemoveCargo={removeCargo}
        />
      )}

      {activeTab === 'legs' && (
        <VoyageLegsSection
          voyage={activeVoyage}
          ports={ports}
          result={currentResult}
          onAddLeg={addLeg}
          onUpdateLeg={updateLeg}
          onToggleManualDistance={toggleManualDistance}
          onRemoveLeg={removeLeg}
        />
      )}

      {activeTab === 'commercial' && (
        <VoyageVesselCommercialSection
          voyage={activeVoyage}
          vessels={vessels}
          result={currentResult}
          onSelectVessel={selectVessel}
          onUpdate={updateVoyage}
        />
      )}

      {activeTab === 'bunkers' && (
        <VoyageBunkerEmissionsSection
          voyage={activeVoyage}
          result={currentResult}
          onUpdateFuelPrices={(prices) =>
            updateVoyage({
              fuel_prices: { ...activeVoyage.fuel_prices, ...prices },
            })
          }
          onUpdateEmissionsConfig={(emissions) =>
            updateVoyage({
              emissions_config: { ...activeVoyage.emissions_config, ...emissions },
            })
          }
          onUpdateVoyage={updateVoyage}
        />
      )}

      {activeTab === 'scenarios' && (
        <VoyageScenarioComparison
          voyage={activeVoyage}
          scenarioResults={scenarioResults}
          activeScenarioId={activeScenarioId}
          onSelectScenario={setActiveScenarioId}
        />
      )}

      {activeTab === 'notes' && (
        <VoyageNotesPanel notes={activeVoyage.notes} onChange={(notes) => updateVoyage({ notes })} />
      )}

      {/* Workbooks Dialog */}
      <VoyageWorkbooksModal
        isOpen={isWorkbookModalOpen}
        onClose={() => setIsWorkbookModalOpen(false)}
        workbooks={workbooks}
        activeWorkbookId={activeWorkbookId}
        onSwitchWorkbook={switchWorkbook}
      />
    </div>
  );
}
