import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  badge?: string | number;
}

export interface IntelligenceTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  rightElement?: React.ReactNode;
}

export function IntelligenceTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  rightElement,
}: IntelligenceTabsProps<T>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ol-border)', marginBottom: '20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
      <div className="ol-tabs-bar" style={{ borderBottom: 'none', marginBottom: 0 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const renderTabIcon = () => {
            if (!tab.icon) return null;
            if (React.isValidElement(tab.icon)) {
              return tab.icon;
            }
            if (typeof tab.icon === 'string' || typeof tab.icon === 'number') {
              return <span>{tab.icon}</span>;
            }
            const IconComp = tab.icon as React.ComponentType<{ size?: number; className?: string }>;
            return <IconComp size={15} />;
          };

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`ol-tab-btn ${isActive ? 'active' : ''}`}
            >
              {renderTabIcon()}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(0, 217, 255, 0.2)' : 'var(--ol-surface-secondary)',
                    color: isActive ? 'var(--ol-cyan)' : 'var(--ol-text-muted)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {rightElement && (
        <div style={{ paddingBottom: '6px' }}>
          {rightElement}
        </div>
      )}
    </div>
  );
}
