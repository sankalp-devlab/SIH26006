/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator & Maritime Routing Workspace
 */

import { useState } from 'react';
import { useDistanceCalculator } from '../../hooks/useDistanceCalculator';
import { DistanceCalculatorHeader } from './components/DistanceCalculatorHeader';
import { DistanceKPISummary } from './components/DistanceKPISummary';
import { DistanceInputSection } from './components/DistanceInputSection';
import { DistanceRouteMap } from './components/DistanceRouteMap';
import { DistanceRoutingPointsTable } from './components/DistanceRoutingPointsTable';
import { DistanceRouteComparison } from './components/DistanceRouteComparison';
import { DistanceAlertsPanel } from './components/DistanceAlertsPanel';
import { DistanceWorkbooksModal } from './components/DistanceWorkbooksModal';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';

export default function DistanceCalculatorPage() {
  const {
    ports,
    vessels,
    enrichedVessels,
    workbook,
    currentRecord,
    calculationResult,
    routeAlternatives,
    selectedVessel,
    selectedVesselPosition,
    setMode,
    setOriginPortId,
    setDestinationPortId,
    setOriginPoint,
    setVesselId,
    setSpeedKnots,
    setWeatherMarginPct,
    setDepartureTime,
    setRoutePreference,
    toggleAvoidPiracy,
    toggleAllowSuez,
    toggleAllowPanama,
    toggleAllowKiel,
    setManualDistance,
    resetManualDistance,
    addCustomWaypoint,
    removeCustomWaypoint,
    renameCalculation,
    duplicateCalculation,
    switchCalculation,
    deleteCalculation,
    exportCsv,
    exportToVoyageCalculator,
  } = useDistanceCalculator();

  const [isWorkbooksOpen, setIsWorkbooksOpen] = useState(false);

  return (
    <div
      className="oceanlens-operational-page-wrapper"
      style={{
        padding: '24px',
        maxWidth: '1680px',
        margin: '0 auto',
        minHeight: '100vh',
        color: '#f8fafc',
        position: 'relative',
      }}
    >
      <MaritimePageBackground variant="voyage" />
      {/* 1. Header with Mode Switcher and Actions */}
      <DistanceCalculatorHeader
        record={currentRecord}
        onModeChange={setMode}
        onRename={renameCalculation}
        onOpenWorkbooks={() => setIsWorkbooksOpen(true)}
        onDuplicate={duplicateCalculation}
        onExportCsv={exportCsv}
        onExportToVoyageCalculator={exportToVoyageCalculator}
      />

      {/* 2. Hero KPI Metric Cards */}
      <DistanceKPISummary result={calculationResult} />

      {/* 3. Main Workspace Grid: Inputs + Map */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          alignItems: 'start',
          marginBottom: '20px',
        }}
      >
        {/* Left: Commercial Inputs & Progressive Disclosure Constraints */}
        <div style={{ minWidth: '340px' }}>
          <DistanceInputSection
            record={currentRecord}
            ports={ports}
            vessels={vessels}
            enrichedVessels={enrichedVessels}
            selectedVessel={selectedVessel}
            selectedVesselPosition={selectedVesselPosition}
            onSetOriginPortId={setOriginPortId}
            onSetDestinationPortId={setDestinationPortId}
            onSetOriginPoint={setOriginPoint}
            onSetVesselId={setVesselId}
            onSetSpeed={setSpeedKnots}
            onSetWeatherMargin={setWeatherMarginPct}
            onSetDepartureTime={setDepartureTime}
            onSetPreference={setRoutePreference}
            onToggleAvoidPiracy={toggleAvoidPiracy}
            onToggleAllowSuez={toggleAllowSuez}
            onToggleAllowPanama={toggleAllowPanama}
            onToggleAllowKiel={toggleAllowKiel}
          />
        </div>

        {/* Right: Interactive Leaflet Maritime Route Map */}
        <div style={{ flex: 1, minWidth: '340px' }}>
          <DistanceRouteMap
            result={calculationResult}
            mode={currentRecord.mode}
            selectedVesselPosition={selectedVesselPosition}
          />
        </div>
      </div>

      {/* 4. Route Alternatives Comparison Matrix */}
      <div style={{ marginBottom: '20px' }}>
        <DistanceRouteComparison
          alternatives={routeAlternatives}
          activePreference={currentRecord.route_preference}
          onSelectPreference={setRoutePreference}
        />
      </div>

      {/* 5. Centralized Alerts Panel */}
      <div style={{ marginBottom: '20px' }}>
        <DistanceAlertsPanel result={calculationResult} />
      </div>

      {/* 6. Ordered Routing Points & Manual Adjustment Table */}
      <div style={{ marginBottom: '30px' }}>
        <DistanceRoutingPointsTable
          result={calculationResult}
          isManual={currentRecord.is_distance_manual}
          onSetManualDistance={setManualDistance}
          onResetManualDistance={resetManualDistance}
          onAddCustomWaypoint={addCustomWaypoint}
          onRemoveCustomWaypoint={removeCustomWaypoint}
        />
      </div>

      {/* 7. Workbooks Modal Dialog */}
      <DistanceWorkbooksModal
        isOpen={isWorkbooksOpen}
        onClose={() => setIsWorkbooksOpen(false)}
        workbook={workbook}
        onSelectCalculation={switchCalculation}
        onDuplicateCalculation={duplicateCalculation}
        onDeleteCalculation={deleteCalculation}
      />
    </div>
  );
}
