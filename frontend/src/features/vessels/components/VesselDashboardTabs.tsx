import {
  LayoutDashboard,
  FileText,
  Navigation,
  Package,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import type { VesselDashboardTab } from '../../../types/vessel-detail';

interface VesselDashboardTabsProps {
  activeTab: VesselDashboardTab;
  onChange: (tab: VesselDashboardTab) => void;
  voyageCount?: number;
  cargoCount?: number;
}

interface TabDef {
  id: VesselDashboardTab;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export function VesselDashboardTabs({
  activeTab,
  onChange,
  voyageCount,
  cargoCount,
}: VesselDashboardTabsProps) {
  const tabs: TabDef[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard size={15} />,
    },
    {
      id: 'particulars',
      label: 'Particulars',
      icon: <FileText size={15} />,
    },
    {
      id: 'voyages',
      label: 'Voyages',
      icon: <Navigation size={15} />,
      badge: voyageCount,
    },
    {
      id: 'cargo',
      label: 'Cargo',
      icon: <Package size={15} />,
      badge: cargoCount,
    },
    {
      id: 'commercial',
      label: 'Commercial',
      icon: <Briefcase size={15} />,
    },
    {
      id: 'valuation',
      label: 'Valuation',
      icon: <DollarSign size={15} />,
    },
    {
      id: 'sanctions',
      label: 'Sanctions / Compliance',
      icon: <ShieldCheck size={15} />,
    },
    {
      id: 'emissions',
      label: 'Emissions & CII',
      icon: <Leaf size={15} />,
    },
  ];

  return (
    <div className="vdb-tabs-container">
      <nav className="vdb-tabs-nav" role="tablist" aria-label="Vessel Intelligence Sections">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`vdb-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              <span className="vdb-tab-icon">{tab.icon}</span>
              <span className="vdb-tab-label">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="vdb-tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
