import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Ship, Calculator, TrendingUp, Anchor, Menu } from 'lucide-react';
import type { MobileTab } from '../../types/mobile';

interface MobileBottomNavProps {
  onOpenMore?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMore }) => {
  const location = useLocation();
  const path = location.pathname;

  const isTabActive = (tab: MobileTab): boolean => {
    switch (tab) {
      case 'tracking':
        return path === '/m' || path === '/m/vessels' || path.startsWith('/m/vessels/');
      case 'voyages':
        return path.startsWith('/m/calculator') || path.startsWith('/m/distance');
      case 'market':
        return path.startsWith('/m/fixtures');
      case 'ports':
        return path.startsWith('/m/ports');
      case 'more':
        return (
          path.startsWith('/m/lists') ||
          path.startsWith('/m/updater') ||
          path.startsWith('/m/skipper') ||
          path.startsWith('/m/more')
        );
      default:
        return false;
    }
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/m/vessels"
        className={`mobile-nav-item ${isTabActive('tracking') ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <Ship size={20} />
        </div>
        <span>Tracking</span>
      </NavLink>

      <NavLink
        to="/m/calculator"
        className={`mobile-nav-item ${isTabActive('voyages') ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <Calculator size={20} />
        </div>
        <span>Voyages</span>
      </NavLink>

      <NavLink
        to="/m/fixtures"
        className={`mobile-nav-item ${isTabActive('market') ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <TrendingUp size={20} />
        </div>
        <span>Market</span>
      </NavLink>

      <NavLink
        to="/m/ports"
        className={`mobile-nav-item ${isTabActive('ports') ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <Anchor size={20} />
        </div>
        <span>Ports</span>
      </NavLink>

      {onOpenMore ? (
        <button
          type="button"
          onClick={onOpenMore}
          className={`mobile-nav-item ${isTabActive('more') ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div className="mobile-nav-icon-wrap">
            <Menu size={20} />
          </div>
          <span>More</span>
        </button>
      ) : (
        <NavLink
          to="/m/lists"
          className={`mobile-nav-item ${isTabActive('more') ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon-wrap">
            <Menu size={20} />
          </div>
          <span>More</span>
        </NavLink>
      )}
    </nav>
  );
};
