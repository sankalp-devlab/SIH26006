import { X, SlidersHorizontal, Check } from 'lucide-react';

export interface DashboardSectionsVisibility {
  ticker: boolean;
  kpis: boolean;
  map: boolean;
  marketIntelligence: boolean;
  freightMarket: boolean;
  tradeFlows: boolean;
  portActivity: boolean;
  vesselActivity: boolean;
  tradeFreightCorrelation: boolean;
  globalActivity: boolean;
  alerts: boolean;
  marketEvents: boolean;
  quickAccess: boolean;
}

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: DashboardSectionsVisibility;
  onToggleSection: (key: keyof DashboardSectionsVisibility) => void;
  onResetToDefault: () => void;
}

export function CustomizeDashboardModal({
  isOpen,
  onClose,
  visibility,
  onToggleSection,
  onResetToDefault,
}: CustomizeDashboardModalProps) {
  if (!isOpen) return null;

  const sections: { key: keyof DashboardSectionsVisibility; label: string; desc: string }[] = [
    { key: 'ticker', label: 'Live Market Ticker', desc: 'Real-time horizontal index ticker tape' },
    { key: 'kpis', label: 'Executive KPI Strip', desc: 'Terminal metrics for fleet, volume, TCE, and utilization' },
    { key: 'map', label: 'Global Maritime Map', desc: 'Geospatial visualization of vessels, lanes, and ports' },
    { key: 'marketIntelligence', label: 'Market Intelligence & What\'s Moving', desc: '87% bullish sentiment gauge and high-velocity corridors' },
    { key: 'freightMarket', label: 'Freight Market Analytics', desc: 'Interactive Spot, FFA, and TCE time-series chart' },
    { key: 'tradeFlows', label: 'Global Trade Flows Table', desc: 'Active shipping corridors by volume and commodity' },
    { key: 'portActivity', label: 'Port Activity Hubs', desc: 'Turnaround waiting times and congestion indices' },
    { key: 'vesselActivity', label: 'Vessel Activity & Segments', desc: 'Operational status breakdown and fleet utilization' },
    { key: 'tradeFreightCorrelation', label: 'Trade vs Freight Matrix', desc: 'Volume and rate elasticity correlation' },
    { key: 'globalActivity', label: 'Global Density Heatmap', desc: 'Hotspots across vessels, trade, and freight' },
    { key: 'alerts', label: 'Attention Required Alerts', desc: 'High-priority operational warnings' },
    { key: 'marketEvents', label: 'Market Events Timeline', desc: 'UTC chronological feed of freight and market changes' },
    { key: 'quickAccess', label: 'Quick Operations Access', desc: 'Shortcuts to specialized workspace modules' },
  ];

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div className="cc-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '0.85rem 1rem',
            background: '#081a33',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SlidersHorizontal size={15} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              CUSTOMIZE COMMAND CENTER
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Toggle modules to customize your command center density. Preferences persist in local session.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sections.map((s) => {
              const isChecked = visibility[s.key];
              return (
                <div
                  key={s.key}
                  onClick={() => onToggleSection(s.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '4px',
                    background: isChecked ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isChecked
                      ? '1px solid rgba(56, 189, 248, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isChecked ? '#f8fafc' : '#64748b' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{s.desc}</div>
                  </div>

                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '3px',
                      border: isChecked ? '1px solid #38bdf8' : '1px solid #475569',
                      background: isChecked ? '#0284c7' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isChecked && <Check size={12} color="#ffffff" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(6, 19, 37, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            className="cc-btn-action"
            onClick={onResetToDefault}
            style={{ fontSize: '0.7rem' }}
          >
            Reset All to Default
          </button>

          <button
            type="button"
            className="cc-btn-action"
            onClick={onClose}
            style={{ background: '#0284c7', borderColor: '#38bdf8', color: '#ffffff' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
