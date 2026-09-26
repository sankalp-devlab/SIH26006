import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Ship,
  Compass,
  Anchor,
  Navigation,
  Route,
  FileText,
  Calculator,
  Ruler,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Radio,
  Star,
  Pin,
  FolderKanban,
  BarChart2,
  BookmarkCheck,
  TrendingUp,
  Globe,
  Wind,
  Layers,
  FileSpreadsheet,
  Database,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';
import { useFavourites } from '../../hooks/useFavourites';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

const ROUTE_ALIASES: Record<string, string[]> = {
  '/analytics': [
    '/analytics',
    '/analytics/',
    '/analytics/market-prices',
    '/analytics/prices',
    '/analytics/pricing',
    '/market-prices',
    '/prices',
    '/pricing',
  ],
  '/freight': [
    '/freight',
    '/freight-analytics',
    '/analytics/freight',
    '/analytics/freight-analytics',
  ],
  '/market': [
    '/market',
    '/market-insights',
    '/analytics/market',
    '/analytics/market-insights',
  ],
  '/trade-flows': [
    '/trade-flows',
    '/flows',
    '/analytics/trade-flows',
    '/analytics/flows',
  ],
  '/emissions': [
    '/emissions',
    '/cii',
    '/analytics/emissions',
    '/analytics/cii',
  ],
  '/fleet': [
    '/fleet',
    '/fleets',
    '/fleet-intelligence',
    '/analytics/fleet',
    '/analytics/fleets',
    '/analytics/fleet-intelligence',
  ],
  '/reports': [
    '/reports',
    '/reporting',
    '/analytics/reports',
    '/analytics/reporting',
  ],
  '/data-query': [
    '/data-query',
    '/analytics/data-query',
  ],
  '/skipper': [
    '/skipper',
    '/analytics/skipper',
    '/analytics/skipper-ai',
  ],
  '/bookings': [
    '/bookings',
    '/commercial-bookings',
    '/analytics/bookings',
    '/analytics/commercial-bookings',
  ],
  '/vessel-intelligence': [
    '/vessel-intelligence',
    '/booking-intelligence',
    '/vessel-booking-intelligence',
  ],
  '/map': [
    '/map',
    '/live-map',
    '/vessel-map',
    '/vessels/map',
    '/fleet-map',
    '/tracking/map',
  ],
  '/voyages': [
    '/voyages',
    '/voyages-analytics',
    '/analytics/voyages',
    '/analytics/voyages-analytics',
  ],
  '/operations': [
    '/operations',
    '/vessels',
    '/voyages',
    '/ports',
    '/cargo',
    '/routes',
    '/fixtures',
    '/voyage-calculator',
    '/distance-calculator',
  ],
  '/analytics': [
    '/analytics',
    '/freight',
    '/freight-analytics',
    '/market',
    '/market-insights',
    '/trade-flows',
    '/emissions',
    '/fleet',
    '/reports',
    '/data-query',
    '/valuations',
    '/orderbook',
  ],
  '/notifications': [
    '/notifications',
    '/alerts',
  ],
};

function isItemActive(targetPath: string, currentPath: string): boolean {
  if (targetPath === currentPath) return true;
  if (targetPath !== '/' && currentPath.startsWith(targetPath + '/')) return true;
  const aliases = ROUTE_ALIASES[targetPath];
  if (aliases && aliases.includes(currentPath)) return true;
  return false;
}

const NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: 'Control Center',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/map', label: 'Live Vessel Map', icon: Compass },
    ],
  },
  {
    title: 'Commercial & Tracking',
    items: [
      { to: '/vessel-intelligence', label: 'Booking Intelligence', icon: Sparkles },
      { to: '/bookings', label: 'Commercial Bookings', icon: BookmarkCheck },
      { to: '/tracking', label: 'Live Vessel Tracking', icon: Radio },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/operations', label: 'Operations Hub', icon: Ship },
    ],
  },
  {
    title: 'Intelligence & Analytics',
    items: [
      { to: '/analytics', label: 'Analytics Hub', icon: BarChart2 },
    ],
  },
  {
    title: 'Maritime AI',
    items: [
      { to: '/skipper', label: 'Skipper AI Assistant', icon: Bot },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/workspace', label: 'Personal Workspace', icon: FolderKanban },
      { to: '/notifications', label: 'Notifications & Alerts', icon: Bell },
      { to: '/settings', label: 'Platform Settings', icon: Settings },
    ],
  },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { favourites, toggle, isFavourite } = useFavourites();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header — OCEAN LENS */}
        <div className="sidebar-brand">
          {collapsed ? (
            <Tooltip content="OCEAN LENS Home" position="right">
              <NavLink
                to="/"
                className="brand-link"
                onClick={onCloseMobile}
                title="OCEAN LENS Home"
                aria-label="OCEAN LENS Home"
              >
                <div className="brand-icon">
                  <Ship size={18} />
                </div>
              </NavLink>
            </Tooltip>
          ) : (
            <NavLink
              to="/"
              className="brand-link"
              onClick={onCloseMobile}
              title="OCEAN LENS Home"
              aria-label="OCEAN LENS Home"
            >
              <div className="brand-icon">
                <Ship size={18} />
              </div>
              <div className="brand-text-block">
                <span className="brand-title">OCEAN LENS</span>
                <span className="brand-subtitle">MARITIME INTELLIGENCE</span>
              </div>
            </NavLink>
          )}

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {/* Pinned Favourites Section */}
          {mounted && favourites.length > 0 && (
            <div className="sidebar-section">
              <div
                className="sidebar-section-title"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Pin size={10} color="#f59e0b" />
                {!collapsed && <span>Pinned Fast Access</span>}
              </div>
              {favourites.map((fav) => {
                const navContent = (
                  <NavLink
                    key={fav.id}
                    to={fav.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `nav-item ${isActive || isItemActive(fav.path, location.pathname) ? 'active' : ''}`
                    }
                  >
                    <Star size={16} className="nav-icon" color="#f59e0b" fill="#f59e0b" />
                    {!collapsed && <span className="nav-label">{fav.name}</span>}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={fav.id} content={`Pinned: ${fav.name}`} position="right">
                      {navContent}
                    </Tooltip>
                  );
                }
                return navContent;
              })}
            </div>
          )}

          {/* Standard Navigation Sections */}
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-title">
                {!collapsed ? section.title : section.title.slice(0, 3)}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isFav = isFavourite(item.to);

                const navLink = (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `nav-item ${isActive || isItemActive(item.to, location.pathname) ? 'active' : ''}`
                    }
                  >
                    <Icon className="nav-icon" />
                    {!collapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
                        <button
                          type="button"
                          className={`nav-fav-btn ${isFav ? 'is-favourited' : ''}`}
                          title={isFav ? 'Remove from pinned' : 'Pin to fast access'}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggle({ id: item.to, name: item.label, path: item.to });
                          }}
                        >
                          <Star size={13} fill={isFav ? '#f59e0b' : 'none'} />
                        </button>
                      </>
                    )}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip
                      key={item.to}
                      content={
                        <span>
                          {item.label}
                          {item.badge ? ` (${item.badge})` : ''}
                        </span>
                      }
                      position="right"
                    >
                      {navLink}
                    </Tooltip>
                  );
                }

                return navLink;
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {!collapsed ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}
            >
              <Radio size={14} color="var(--color-status-success)" />
              <span>FastAPI Backend Active</span>
            </div>
          ) : (
            <Tooltip content="FastAPI Backend Active (Port 8000)" position="right">
              <div style={{ textAlign: 'center', cursor: 'default' }}>
                <Radio size={14} color="var(--color-status-success)" />
              </div>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
}
