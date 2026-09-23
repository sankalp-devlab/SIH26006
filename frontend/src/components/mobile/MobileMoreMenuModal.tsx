import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileBottomSheet } from './MobileBottomSheet';
import {
  ListFilter,
  Radio,
  Ruler,
  Bot,
  Monitor,
  Settings,
  ShieldCheck,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';

interface MobileMoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMoreMenuModal: React.FC<MobileMoreMenuModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const MENU_ITEMS = [
    {
      label: 'Personal Workspace',
      description: 'Saved favourites, fleet pools, queries, tags & cargo',
      icon: FolderKanban,
      path: '/m/workspace',
      color: '#38bdf8',
    },
    {
      label: 'Vessel Watchlists & Lists',
      description: 'Fleet pools, custom lists and saved ships',
      icon: ListFilter,
      path: '/m/lists',
      color: '#38bdf8',
    },
    {
      label: 'Position & Notes Updater',
      description: 'Field override coordinates, status & operator journal',
      icon: Radio,
      path: '/m/updater',
      color: '#34d399',
    },
    {
      label: 'Port-to-Port Distance Calculator',
      description: 'Nautical routing, canal options & voyage transit ETA',
      icon: Ruler,
      path: '/m/distance',
      color: '#f59e0b',
    },
    {
      label: 'Skipper AI Assistant',
      description: 'Natural language maritime intelligence workstation',
      icon: Bot,
      path: '/m/skipper',
      color: '#818cf8',
    },
    {
      label: 'Desktop Workstation Mode',
      description: 'Switch to full multi-monitor desktop layout',
      icon: Monitor,
      path: '/dashboard',
      color: '#94a3b8',
    },
    {
      label: 'Platform Settings & Preferences',
      description: 'Units, notification rules and display options',
      icon: Settings,
      path: '/settings',
      color: '#64748b',
    },
  ];

  return (
    <MobileBottomSheet isOpen={isOpen} onClose={onClose} title="More Operations & Tools">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                color: '#f8fafc',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${item.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{item.description}</div>
                </div>
              </div>
              <ChevronRight size={18} color="#64748b" />
            </button>
          );
        })}

        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.75rem',
            color: '#93c5fd',
          }}
        >
          <ShieldCheck size={18} color="#38bdf8" />
          <span>SIH 26006 Mobile Intelligence • Live AIS Telemetry Connected</span>
        </div>
      </div>
    </MobileBottomSheet>
  );
};
