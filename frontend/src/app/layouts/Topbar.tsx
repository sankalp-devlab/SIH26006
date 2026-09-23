import {
  Menu,
  Search,
  ChevronRight,
  User,
  Settings,
  LogOut,
  ExternalLink,
  Bot,
  Smartphone,
  MoreVertical,
  Anchor,
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Dropdown } from '../../components/ui/Dropdown';
import { NotificationCenter } from '../../features/notifications/NotificationCenter';
import { ApiStatusBadge } from '../../features/api-status/ApiStatusBadge';

interface TopbarProps {
  onOpenMobile: () => void;
  onOpenSearch: () => void;
}

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: 'Overview Dashboard',
  vessels: 'Vessels',
  map: 'Live Vessel Map',
  ports: 'Port Insights',
  cargo: 'Cargo Allocation',
  routes: 'Corridor Optimization',
  fixtures: 'Charter Fixtures',
  'voyage-calculator': 'Voyage Calculator',
  'distance-calculator': 'Distance Calculator',
  analytics: 'Analytics & Intelligence',
  freight: 'Freight Analytics',
  'freight-analytics': 'Freight Analytics',
  market: 'Market Insights',
  'market-insights': 'Market Insights',
  flows: 'Commodity Flows',
  'trade-flows': 'Trade Flows',
  emissions: 'Emissions & CII',
  cii: 'Emissions & CII',
  valuations: 'Asset Valuations',
  orderbook: 'Fleet Orderbook',
  'order-book': 'Fleet Orderbook',
  waypoints: 'Waypoints & Corridors',
  canals: 'Waypoints & Canals',
  storage: 'Floating Storage',
  'floating-storage': 'Floating Storage',
  fleet: 'Fleet Intelligence',
  fleets: 'Fleet Intelligence',
  'fleet-intelligence': 'Fleet Intelligence',
  prices: 'Market Prices',
  pricing: 'Market Prices',
  'market-prices': 'Market Prices',
  bookings: 'Commercial Bookings',
  'commercial-bookings': 'Commercial Bookings',
  voyages: 'Voyages Analytics',
  'voyages-analytics': 'Voyages Analytics',
  reports: 'Intelligence Reports',
  reporting: 'Intelligence Reports',
  'data-query': 'Maritime Data Query',
  skipper: 'Skipper AI Assistant',
  'skipper-ai': 'Skipper AI Assistant',
  notifications: 'Notifications & Alerts',
  alerts: 'Notifications & Alerts',
  workspace: 'Personal Workspace',
  personalization: 'Personal Workspace',
  tracking: 'Live Vessel Tracking',
  settings: 'Platform Settings',
  m: 'Mobile Workspace',
};

export function Topbar({ onOpenMobile, onOpenSearch }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumbs from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const name = ROUTE_NAME_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, url, isLast: index === pathSegments.length - 1 };
  });

  const userMenuItems = [
    {
      key: 'header',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Command Officer</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>officer@maritime.gov.in</span>
        </div>
      ),
      header: true,
    },
    { key: 'div1', label: '', divider: true },
    {
      key: 'settings',
      label: 'Platform Settings',
      icon: <Settings size={14} />,
      onClick: () => {
        navigate('/settings');
      },
    },
    {
      key: 'landing',
      label: 'Public Portal',
      icon: <ExternalLink size={14} />,
      onClick: () => {
        navigate('/');
      },
    },
    { key: 'div2', label: '', divider: true },
    {
      key: 'logout',
      label: 'Switch Operator Session',
      icon: <LogOut size={14} />,
      danger: true,
      onClick: () => {
        navigate('/settings');
      },
    },
  ];

  // Secondary actions overflow menu for mobile viewports
  const moreActionsItems = [
    {
      key: 'skipper',
      label: 'Skipper AI Assistant',
      icon: <Bot size={14} color="#06b6d4" />,
      onClick: () => navigate('/skipper'),
    },
    {
      key: 'mobile_app',
      label: 'Mobile App View',
      icon: <Smartphone size={14} color="#6366f1" />,
      onClick: () => navigate('/m'),
    },
    {
      key: 'search_cmd',
      label: 'Search Palette (Cmd+K)',
      icon: <Search size={14} />,
      onClick: onOpenSearch,
    },
  ];

  return (
    <header className="app-topbar">
      {/* Left: Mobile toggle + Breadcrumb / Logo */}
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-collapse-btn mobile-menu-toggle"
          onClick={onOpenMobile}
          aria-label="Open mobile navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Mobile Mini Brand Badge (Only visible on small viewports) */}
        <Link to="/" className="topbar-mobile-brand" title="OCEAN LENS Home">
          <Anchor size={16} className="topbar-mobile-brand-icon" />
          <span className="topbar-mobile-brand-name">OCEAN LENS</span>
        </Link>

        {/* Desktop / Tablet Dynamic Breadcrumbs */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/dashboard" className="breadcrumb-item">
            Maritime Ops
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.url} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ChevronRight size={12} className="breadcrumb-separator" />
              {crumb.isLast ? (
                <span className="breadcrumb-item current">{crumb.name}</span>
              ) : (
                <Link to={crumb.url} className="breadcrumb-item">
                  {crumb.name}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Center: Global Search Trigger */}
      <div className="topbar-center">
        <button
          type="button"
          className="topbar-search-trigger"
          onClick={onOpenSearch}
          aria-label="Open global search (Cmd+K)"
        >
          <div className="topbar-search-left">
            <Search size={14} />
            <span className="topbar-search-placeholder">Search vessels, IMO, ports, cargo...</span>
          </div>
          <span className="topbar-search-kbd">
            <span>&#8984;</span>K
          </span>
        </button>
      </div>

      {/* Right: Actions, API Status, Notifications, User Profile */}
      <div className="topbar-right">
        {/* Mobile Search Icon Button (visible only when center search bar is hidden) */}
        <button
          type="button"
          className="topbar-icon-btn topbar-mobile-search-btn"
          onClick={onOpenSearch}
          title="Search (Cmd+K)"
          aria-label="Open search"
        >
          <Search size={16} />
        </button>

        {/* API Health Status Badge: Responsive (Full on desktop, compact on mobile) */}
        <div className="topbar-api-badge-desktop">
          <ApiStatusBadge compact={false} />
        </div>
        <div className="topbar-api-badge-mobile">
          <ApiStatusBadge compact={true} />
        </div>

        {/* Desktop Quick Launcher: Skipper AI */}
        <Link
          to="/skipper"
          className="topbar-action-pill topbar-pill-skipper"
          title="Launch Skipper AI Maritime Assistant"
        >
          <Bot size={14} />
          <span className="topbar-pill-label">Skipper AI</span>
        </Link>

        {/* Desktop Quick Launcher: Mobile App */}
        <Link
          to="/m"
          className="topbar-action-pill topbar-pill-mobile"
          title="Launch Mobile Maritime View"
        >
          <Smartphone size={14} />
          <span className="topbar-pill-label">Mobile App</span>
        </Link>

        {/* Mobile Overflow Menu (⋯) containing secondary items */}
        <div className="topbar-mobile-more">
          <Dropdown
            trigger={
              <button
                type="button"
                className="topbar-icon-btn"
                title="More actions"
                aria-label="More actions"
              >
                <MoreVertical size={16} />
              </button>
            }
            items={moreActionsItems}
            align="right"
          />
        </div>

        {/* Notifications Center */}
        <NotificationCenter />

        {/* User Profile Menu */}
        <Dropdown
          trigger={
            <button
              type="button"
              className="topbar-icon-btn topbar-avatar-btn"
              aria-label="User Profile"
            >
              <User size={15} />
            </button>
          }
          items={userMenuItems}
          align="right"
        />
      </div>
    </header>
  );
}
