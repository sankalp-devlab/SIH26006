/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Workspace Segmented Navigation Bar
 */

import React from 'react';
import {
  LayoutDashboard,
  Package,
  Navigation,
  Ship,
  Fuel,
  Sliders,
  FileText,
} from 'lucide-react';

export type VoyageTabId =
  | 'overview'
  | 'cargo'
  | 'legs'
  | 'commercial'
  | 'bunkers'
  | 'scenarios'
  | 'notes';

interface VoyageWorkspaceTabsProps {
  activeTab: VoyageTabId;
  onSelectTab: (tabId: VoyageTabId) => void;
  cargoCount: number;
  legCount: number;
}

export const VoyageWorkspaceTabs: React.FC<VoyageWorkspaceTabsProps> = ({
  activeTab,
  onSelectTab,
  cargoCount,
  legCount,
}) => {
  const tabs: Array<{
    id: VoyageTabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'overview',
      label: 'Commercial P&L',
      icon: <LayoutDashboard size={15} />,
    },
    {
      id: 'cargo',
      label: 'Cargo Parcels',
      icon: <Package size={15} />,
      badge: cargoCount,
    },
    {
      id: 'legs',
      label: 'Passage Legs',
      icon: <Navigation size={15} />,
      badge: legCount,
    },
    {
      id: 'commercial',
      label: 'Vessel & Commercial',
      icon: <Ship size={15} />,
    },
    {
      id: 'bunkers',
      label: 'Bunkers & Emissions',
      icon: <Fuel size={15} />,
    },
    {
      id: 'scenarios',
      label: 'Scenario Matrix',
      icon: <Sliders size={15} />,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <FileText size={15} />,
    },
  ];

  return (
    <nav className="voyage-workspace-nav-bar" aria-label="Voyage Calculator Workspaces">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`voyage-workspace-tab ${isActive ? 'active' : ''}`}
            aria-selected={isActive}
            role="tab"
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="voyage-tab-badge">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
