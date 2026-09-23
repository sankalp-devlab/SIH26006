import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileMoreMenuModal } from './MobileMoreMenuModal';
import { MobileNotificationSheet } from './MobileNotificationSheet';
import { CommandPalette } from '../../features/search/CommandPalette';

export const MobileAppShell: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();

  // Derive title from pathname
  const getTitle = (): string => {
    const p = location.pathname;
    if (p === '/m' || p === '/m/home') return 'Maritime Overview';
    if (p.startsWith('/m/vessels/') && p.length > 11) return 'Vessel Dossier';
    if (p.startsWith('/m/vessels')) return 'Live Vessel Fleet';
    if (p.startsWith('/m/distance')) return 'Routing & Distance';
    if (p.startsWith('/m/calculator')) return 'Voyage Calculator';
    if (p.startsWith('/m/fixtures')) return 'Market Fixtures';
    if (p.startsWith('/m/lists')) return 'Fleet Watchlists';
    if (p.startsWith('/m/updater')) return 'Position & Notes';
    if (p.startsWith('/m/ports/') && p.length > 9) return 'Port Terminal Lineup';
    if (p.startsWith('/m/ports')) return 'Port Congestion';
    if (p.startsWith('/m/skipper')) return 'Skipper AI';
    if (p.startsWith('/m/workspace')) return 'Personal Workspace';
    return 'Maritime Intelligence';
  };

  return (
    <div className="mobile-app-shell">
      <MobileHeader
        title={getTitle()}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      <main className="mobile-content">
        <Outlet />
      </main>

      <MobileBottomNav onOpenMore={() => setIsMoreOpen(true)} />

      <MobileMoreMenuModal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
      />

      <MobileNotificationSheet
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};
