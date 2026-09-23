import { useSkipper } from '../../hooks/useSkipper';
import { SkipperLeftPanel } from './components/SkipperLeftPanel';
import { SkipperCenterChat } from './components/SkipperCenterChat';
import { SkipperRightInspector } from './components/SkipperRightInspector';
import { AnalyticsBreadcrumb } from '../analytics/components/AnalyticsBreadcrumb';
import './skipper.css';

export default function SkipperPage() {
  const {
    sessions,
    filteredSessions,
    groupedSessions,
    activeSession,
    activeSessionId,
    searchQuery,
    setSearchQuery,
    selectSession,
    createNewConsultation,
    renameSession,
    deleteSession,
    askQuestion,
    dispatchQuickPrompt,
    quickPrompts,
    isLoading,
    pipelineStage,
    selectedMessageForInspection,
    inspectMessage,
    rightPanelOpen,
    setRightPanelOpen,
    leftPanelOpen,
    setLeftPanelOpen,
  } = useSkipper();

  return (
    <div className="skipper-workspace-root">
      {/* Top Breadcrumb Navigation */}
      <div className="skipper-breadcrumb-strip">
        <AnalyticsBreadcrumb currentModule="Skipper AI Assistant" moduleBadge="M26" />
      </div>

      {/* 3-Zone Intelligence Workspace Layout */}
      <div className="skipper-main-layout">
        {/* Left Panel: ChatGPT-Style Chat History Sidebar */}
        <SkipperLeftPanel
          sessions={filteredSessions}
          groupedSessions={groupedSessions}
          activeSessionId={activeSessionId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectSession={selectSession}
          onNewSession={createNewConsultation}
          onRenameSession={renameSession}
          onDeleteSession={deleteSession}
          quickPrompts={quickPrompts}
          onSelectQuickPrompt={dispatchQuickPrompt}
          isOpen={leftPanelOpen}
          onClose={() => setLeftPanelOpen(false)}
        />

        {/* Mobile/Tablet Backdrop when Left Panel is open */}
        {leftPanelOpen && (
          <div
            className="skipper-drawer-backdrop md:hidden"
            onClick={() => setLeftPanelOpen(false)}
            title="Close sidebar"
          />
        )}

        {/* Center Panel: Active Conversation Workspace */}
        <SkipperCenterChat
          session={activeSession}
          onSendMessage={askQuestion}
          isLoading={isLoading}
          pipelineStage={pipelineStage}
          onInspectMessage={inspectMessage}
          leftPanelOpen={leftPanelOpen}
          onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
          rightPanelOpen={rightPanelOpen}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        />

        {/* Mobile/Tablet Backdrop when Right Inspector is open */}
        {rightPanelOpen && (
          <div
            className="skipper-drawer-backdrop lg:hidden"
            onClick={() => setRightPanelOpen(false)}
            title="Close inspector"
          />
        )}

        {/* Right Panel: Data Grounding & Provenance Inspector */}
        <SkipperRightInspector
          message={selectedMessageForInspection}
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
        />
      </div>
    </div>
  );
}
