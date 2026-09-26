/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights & Operational Analytics Workspace
 */

import React from 'react';
import './ports.css';
import {
  LayoutDashboard,
  Ship,
  Building2,
  Receipt,
  Calendar,
  Layers,
  Anchor,
} from 'lucide-react';
import { usePortInsights, type PortWorkspaceTab } from '../../hooks/usePortInsights';
import { PortInsightsHeader } from './components/PortInsightsHeader';
import { PortKPISummary } from './components/PortKPISummary';
import { PortOverviewTab } from './components/PortOverviewTab';
import { PortVesselActivityTab } from './components/PortVesselActivityTab';
import { PortTerminalsTab } from './components/PortTerminalsTab';
import { PortCommercialTab } from './components/PortCommercialTab';
import { PortHistoricalTab } from './components/PortHistoricalTab';
import { PortComparisonModal } from './components/PortComparisonModal';
import { GlobalPortsDirectoryModal } from './components/GlobalPortsDirectoryModal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Button } from '../../components/ui/Button';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';

export function PortsPage() {
  const {
    ports,
    activePort,
    comparePort: _comparePort,
    payload,
    comparePayload,
    comparisonResult,
    filteredActivities,
    filteredHistoricalVisits,
    isLoading,
    isError,
    error,

    // State
    activeTab,
    dateRange,
    isCompareModalOpen,
    isDirectoryOpen,

    // Actions & Setters
    setActiveTab,
    setDateRange,
    setActivityStatusFilter,
    setIsCompareModalOpen,
    setIsDirectoryOpen,
    setComparePortId,
    handleSelectPort,
    handleClearPort,
    handleExportCsv,
    handleRefresh,
  } = usePortInsights();

  const tabItems: {
    id: PortWorkspaceTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[] = [
    {
      id: 'overview',
      label: 'Overview & Congestion',
      icon: LayoutDashboard,
    },
    {
      id: 'activity',
      label: 'Live Vessel Activity',
      icon: Ship,
      badge: payload?.activities?.length,
    },
    {
      id: 'terminals',
      label: 'Terminals & Berthing Lineup',
      icon: Building2,
      badge: payload?.terminals?.length,
    },
    {
      id: 'commercial',
      label: 'Port Tariffs & Bunkers',
      icon: Receipt,
    },
    {
      id: 'historical',
      label: 'Historical Calls & Turnaround',
      icon: Calendar,
      badge: filteredHistoricalVisits.length,
    },
  ];

  return (
    <div className="piw-container oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="port" />
      {/* 1. Workspace Header (Port Identity, Time Range, Controls, Workflows) */}
      <PortInsightsHeader
        ports={ports}
        activePort={activePort}
        dateRange={dateRange}
        onSelectPort={handleSelectPort}
        onClearPort={handleClearPort}
        onSelectDateRange={setDateRange}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onExportCsv={handleExportCsv}
        onRefresh={handleRefresh}
      />

      {/* 2. State-Driven Body Content */}
      {isError ? (
        <ErrorState
          title="Failed to Load Port Intelligence"
          message={
            error instanceof Error
              ? error.message
              : 'Unable to communicate with the port catalog or backend service. Check network connection and try again.'
          }
          onRetry={handleRefresh}
        />
      ) : isLoading && !payload ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* KPI Skeleton Strip */}
          <div className="piw-kpi-grid">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="piw-kpi-card"
                style={{ background: '#091A2A', opacity: 0.6 }}
              />
            ))}
          </div>
          {/* Main Area Skeleton */}
          <div
            className="piw-card"
            style={{
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid #00d8ff',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
              Loading Port Intelligence Telemetry...
            </span>
          </div>
        </div>
      ) : !activePort || !payload ? (
        <EmptyState
          title="No Port Selected"
          description="Please select a seaport from the search selector above or browse the global directory to inspect real-time congestion, terminal lineups, marine weather, and bunker rates."
          icon={<Anchor size={48} color="#00d8ff" style={{ opacity: 0.6 }} />}
          action={
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Layers size={14} />}
                onClick={() => setIsDirectoryOpen(true)}
              >
                Browse Global Ports Directory
              </Button>
              {ports.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectPort(ports[0].id)}
                >
                  Load {ports[0].name}
                </Button>
              )}
            </div>
          }
        />
      ) : (
        <>
          {/* 2a. Hero KPI Strip (Strict 6 equal cards in 1 row on desktop) */}
          <PortKPISummary
            payload={payload}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onFilterActivity={setActivityStatusFilter}
          />

          {/* 2b. Operational Navigation Tabs Bar */}
          <div className="piw-tabs">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`piw-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge != null && (
                    <span className="piw-tab-badge">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 2c. Active Tab Content Area */}
          <div style={{ width: '100%' }}>
            {activeTab === 'overview' && (
              <PortOverviewTab
                payload={payload}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'activity' && (
              <PortVesselActivityTab
                activities={filteredActivities}
                terminals={payload.terminals}
                portName={activePort.name}
              />
            )}

            {activeTab === 'terminals' && (
              <PortTerminalsTab
                terminals={payload.terminals}
                lineups={payload.lineups}
              />
            )}

            {activeTab === 'commercial' && (
              <PortCommercialTab
                portCosts={payload.portCosts || payload.costs || []}
                bunkerPrices={payload.bunkerPrices || payload.bunkers || []}
                portName={activePort.name}
              />
            )}

            {activeTab === 'historical' && (
              <PortHistoricalTab
                historicalVisits={filteredHistoricalVisits}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                portName={activePort.name}
              />
            )}
          </div>
        </>
      )}

      {/* 3. Modals */}
      {/* Side-by-Side Port Comparison Modal */}
      {payload && comparePayload && comparisonResult && (
        <PortComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          ports={ports}
          portA={payload}
          portB={comparePayload}
          comparisonResult={comparisonResult}
          onSelectPortB={setComparePortId}
        />
      )}

      {/* Global 200+ Ports Directory Modal */}
      <GlobalPortsDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        ports={ports}
        activePortId={activePort ? activePort.id : null}
        onSelectPort={handleSelectPort}
      />
    </div>
  );
}
