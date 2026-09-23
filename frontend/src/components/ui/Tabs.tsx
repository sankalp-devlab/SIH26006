import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`tabs-nav ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const renderIcon = () => {
          if (!tab.icon) return null;
          if (React.isValidElement(tab.icon)) return tab.icon;
          if (typeof tab.icon === 'function' || (typeof tab.icon === 'object' && tab.icon !== null && ('render' in tab.icon || '$$typeof' in tab.icon))) {
            const IconComp = tab.icon as unknown as React.ComponentType<{ size?: number; className?: string }>;
            return <IconComp size={15} />;
          }
          return <span>{tab.icon}</span>;
        };

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span>{renderIcon()}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="nav-badge-pill" style={{ marginLeft: 4 }}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
