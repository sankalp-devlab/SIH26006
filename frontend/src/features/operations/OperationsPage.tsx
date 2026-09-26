/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 29: Fleet Operations & Corridor Navigation (/operations)
 * Premium Maritime Operations Command Center
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Ship,
  Route,
  Anchor,
  Navigation,
  FileText,
  Calculator,
  Ruler,
  Package,
  Search,
  LayoutGrid,
  Sparkles,
  BookmarkCheck,
  Radio,
  ArrowRight,
  Activity,
  Compass,
  X,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import { useVessels } from '../../hooks/useVessels';
import { usePorts } from '../../hooks/usePorts';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';
import './operations.css';

interface OperationModuleConfig {
  id: string;
  badge: string;
  title: string;
  desc: string;
  route: string;
  icon: LucideIcon;
  metrics: string[];
  cta: string;
  tier: 'primary' | 'secondary' | 'special';
  category: 'CORE' | 'NAVIGATION' | 'CHARTER' | 'CARGO';
  status: 'LIVE' | 'READY' | 'DATA';
}

const MODULES: OperationModuleConfig[] = [
  {
    id: 'vessels',
    badge: 'OP-01',
    title: 'Fleet Vessels',
    desc: 'Authoritative commercial fleet register with technical specifications, deadweight tonnage, engine class, and real-time live AIS telemetry.',
    route: '/vessels',
    icon: Ship,
    metrics: ['Fleet Registry', 'DWT Specifications', 'AIS Telemetry'],
    cta: 'Open Vessels Register →',
    tier: 'primary',
    category: 'CORE',
    status: 'LIVE',
  },
  {
    id: 'voyages',
    badge: 'OP-02',
    title: 'Voyages & Movements',
    desc: 'Live commercial voyage tracking, corridor waypoints, departure and arrival schedules, and real-time transit status monitoring.',
    route: '/voyages',
    icon: Route,
    metrics: ['Active Voyages', 'Transit Schedules', 'Corridor Waypoints'],
    cta: 'Track Voyages →',
    tier: 'primary',
    category: 'NAVIGATION',
    status: 'LIVE',
  },
  {
    id: 'ports',
    badge: 'OP-03',
    title: 'Port Insights & Terminals',
    desc: 'Global deepwater seaport directory, max draft clearances, berth handling limits, terminal restrictions, and port congestion telemetry.',
    route: '/ports',
    icon: Anchor,
    metrics: ['UN/LOCODE Ports', 'Draft Clearances', 'Terminal Facilities'],
    cta: 'Inspect Seaports →',
    tier: 'primary',
    category: 'CORE',
    status: 'DATA',
  },
  {
    id: 'routes',
    badge: 'OP-04',
    title: 'Maritime Route Network',
    desc: 'Geodesic and canal-aware routing corridors connecting international hub seaports, strategic straits, and maritime chokepoints.',
    route: '/routes',
    icon: Navigation,
    metrics: ['Corridor Optimization', 'Suez / Panama', 'Chokepoints'],
    cta: 'Explore Maritime Routes →',
    tier: 'secondary',
    category: 'NAVIGATION',
    status: 'READY',
  },
  {
    id: 'fixtures',
    badge: 'OP-05',
    title: 'Charter Fixtures',
    desc: 'Commercial charter fixtures, time-charter agreements, spot fixtures, laycan terms, and charter party rate documentation archives.',
    route: '/fixtures',
    icon: FileText,
    metrics: ['Charter Parties', 'Spot Contracts', 'Rate Archives'],
    cta: 'Review Fixtures →',
    tier: 'secondary',
    category: 'CHARTER',
    status: 'DATA',
  },
  {
    id: 'voyage_calculator',
    badge: 'OP-06',
    title: 'Voyage Calculator',
    desc: 'Empirical voyage economics calculator: compute bunker consumption, daily fuel burn rates, charter party TCE economics, and voyage operating profit.',
    route: '/voyage-calculator',
    icon: Calculator,
    metrics: ['Bunker Fuel MT', 'TCE Calculator', 'Operating Margins'],
    cta: 'Calculate Voyage Economics →',
    tier: 'secondary',
    category: 'CHARTER',
    status: 'READY',
  },
  {
    id: 'distance_calculator',
    badge: 'OP-07',
    title: 'Distance Calculator',
    desc: 'Precise nautical distance matrix across major deep-sea shipping corridors, maritime canals, and international transit corridors.',
    route: '/distance-calculator',
    icon: Ruler,
    metrics: ['Nautical Miles (NM)', 'Canal Waypoints', 'Transit Matrices'],
    cta: 'Compute Nautical Distance →',
    tier: 'secondary',
    category: 'NAVIGATION',
    status: 'READY',
  },
  {
    id: 'cargo',
    badge: 'OP-08',
    title: 'Cargo Consignments',
    desc: 'Consignment manifests, commodity specifications, stowage requirements, dangerous goods compliance, and commercial cargo tracking.',
    route: '/cargo',
    icon: Package,
    metrics: ['Consignment Manifests', 'Metric Tons', 'Stowage Profiles'],
    cta: 'Manage Cargo →',
    tier: 'secondary',
    category: 'CARGO',
    status: 'DATA',
  },
];

type CategoryFilter = 'ALL' | 'CORE' | 'NAVIGATION' | 'CHARTER' | 'CARGO';

interface CategoryTabConfig {
  key: CategoryFilter;
  label: string;
  icon: LucideIcon;
}

const CATEGORY_TABS: CategoryTabConfig[] = [
  { key: 'ALL', label: 'ALL', icon: LayoutGrid },
  { key: 'CORE', label: 'CORE', icon: Ship },
  { key: 'NAVIGATION', label: 'NAVIGATION', icon: Compass },
  { key: 'CHARTER', label: 'CHARTER', icon: FileText },
  { key: 'CARGO', label: 'CARGO', icon: Package },
];

export function OperationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real authoritative counts
  const { data: vesselsData } = useVessels(100);
  const { data: portsData } = usePorts(100);

  const registeredFleetCount = vesselsData?.count ?? vesselsData?.vessels?.length ?? '4';
  const deepwaterPortsCount = portsData?.count ?? portsData?.ports?.length ?? '100';

  const filteredModules = useMemo(() => {
    return MODULES.filter((m) => {
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.desc.toLowerCase().includes(q) ||
          m.badge.toLowerCase().includes(q) ||
          m.metrics.some((metric) => metric.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="ops-root oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="operations" />
      {/* ============================================================== */}
      {/* 1. HERO COMMAND CENTER (2-COLUMN BALANCED DESKTOP LAYOUT)      */}
      {/* ============================================================== */}
      <div className="ops-hero">
        <div className="ops-hero-grid">
          {/* Left Column (~65% width) */}
          <div className="ops-hero-left">
            <div className="ops-hero-eyebrow ops-mono">
              <span className="ops-live-dot" />
              <span>MARITIME OPERATIONS COMMAND HUB</span>
            </div>

            <h1 className="ops-hero-title">Fleet Operations &amp; Corridor Navigation</h1>
            <p className="ops-hero-desc">
              Unified operational interface for fleet monitoring, voyages, ports, charter fixtures, cargo and navigational routing.
            </p>

            {/* Primary Operations Actions (Booking Intelligence, Bookings, Tracking) */}
            <div className="ops-actions">
              <Link to="/vessel-intelligence" className="ops-action-btn ops-action-btn-cyan ops-mono">
                <Sparkles size={14} />
                <span>Booking Intelligence</span>
                <ArrowRight size={12} />
              </Link>
              <Link to="/bookings" className="ops-action-btn ops-action-btn-green ops-mono">
                <BookmarkCheck size={14} />
                <span>Commercial Bookings</span>
                <ArrowRight size={12} />
              </Link>
              <Link to="/tracking" className="ops-action-btn ops-action-btn-amber ops-mono">
                <Radio size={14} />
                <span>Live Vessel Tracking</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Right Column (~35% width): Compact Operations Status Panel */}
          <div className="ops-status-panel">
            <div className="ops-status-header">
              <span className="ops-status-label ops-mono">OPERATIONS STATUS</span>
              <span className="ops-status-badge ops-mono">
                <span className="ops-status-pulse" />
                ONLINE
              </span>
            </div>

            <div className="ops-status-subline ops-mono">
              <span>AIS &amp; Decision Engine</span>
              <span className="ops-status-subval">SYNCHRONIZED</span>
            </div>

            <div className="ops-status-mini-row ops-mono">
              <div className="ops-status-mini-tile">
                <span className="ops-status-mini-label">FLEET</span>
                <span className="ops-status-mini-val">{registeredFleetCount}</span>
              </div>
              <div className="ops-status-mini-tile">
                <span className="ops-status-mini-label">PORTS</span>
                <span className="ops-status-mini-val">{deepwaterPortsCount}</span>
              </div>
              <div className="ops-status-mini-tile">
                <span className="ops-status-mini-label">CORRIDORS</span>
                <span className="ops-status-mini-val" style={{ color: '#00d8ff' }}>14+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. OPERATIONAL STATISTICS KPI STRIP (4-COLUMN HORIZONTAL GRID) */}
      {/* ============================================================== */}
      <div className="ops-kpi-strip">
        {/* KPI 1: REGISTERED FLEET */}
        <div className="ops-kpi-card ops-kpi-card-cyan">
          <div className="ops-kpi-header">
            <span className="ops-kpi-label ops-mono">REGISTERED FLEET</span>
            <div className="ops-kpi-icon-wrap">
              <Ship size={14} />
            </div>
          </div>
          <div className="ops-kpi-val ops-mono">{registeredFleetCount}</div>
          <div className="ops-kpi-sub ops-mono">Active commercial vessels</div>
        </div>

        {/* KPI 2: DEEPWATER SEAPORTS */}
        <div className="ops-kpi-card ops-kpi-card-cyan">
          <div className="ops-kpi-header">
            <span className="ops-kpi-label ops-mono">DEEPWATER SEAPORTS</span>
            <div className="ops-kpi-icon-wrap">
              <Anchor size={14} />
            </div>
          </div>
          <div className="ops-kpi-val ops-mono">{deepwaterPortsCount}</div>
          <div className="ops-kpi-sub ops-mono">International terminal entries</div>
        </div>

        {/* KPI 3: NAVIGATIONAL CORRIDORS */}
        <div className="ops-kpi-card ops-kpi-card-amber">
          <div className="ops-kpi-header">
            <span className="ops-kpi-label ops-mono">NAVIGATIONAL CORRIDORS</span>
            <div
              className="ops-kpi-icon-wrap"
              style={{
                color: '#f59e0b',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                background: 'rgba(245, 158, 11, 0.1)',
              }}
            >
              <Navigation size={14} />
            </div>
          </div>
          <div className="ops-kpi-val ops-mono" style={{ color: '#f59e0b' }}>
            14+
          </div>
          <div className="ops-kpi-sub ops-mono">Geodesic &amp; chokepoints</div>
        </div>

        {/* KPI 4: OPERATIONS STATUS */}
        <div className="ops-kpi-card ops-kpi-card-green">
          <div className="ops-kpi-header">
            <span className="ops-kpi-label ops-mono">OPERATIONS STATUS</span>
            <div
              className="ops-kpi-icon-wrap"
              style={{
                color: '#10b981',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.1)',
              }}
            >
              <Activity size={14} />
            </div>
          </div>
          <div className="ops-kpi-val ops-kpi-val-green ops-mono">
            <span className="ops-status-pulse" />
            <span>ONLINE</span>
          </div>
          <div className="ops-kpi-sub ops-mono">AIS &amp; Decision Engine synced</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CATEGORY NAVIGATION + SEARCH TOOLBAR (SINGLE UNIFIED ROW)   */}
      {/* ============================================================== */}
      <div className="ops-toolbar">
        {/* Segmented Category Tabs */}
        <div className="ops-tabs">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`ops-tab-btn ops-mono ${isActive ? 'active' : ''}`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Search Bar */}
        <div className="ops-search-wrap">
          <Search size={14} className="ops-search-icon" />
          <input
            type="text"
            placeholder="Search operational tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ops-search-input ops-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="ops-search-clear"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. OPERATIONAL MODULES & TOOLS HEADER                          */}
      {/* ============================================================== */}
      <div className="ops-section-header">
        <h2 className="ops-section-title ops-mono">
          <LayoutGrid size={15} color="#00d8ff" />
          <span>OPERATIONAL MODULES &amp; TOOLS</span>
          <span className="ops-section-badge ops-mono">
            {filteredModules.length} WORKSPACES
          </span>
        </h2>
        <span className="ops-section-sub ops-mono">
          Select an operational workspace to launch tools
        </span>
      </div>

      {/* ============================================================== */}
      {/* 5. MODULE CARD GRID (3-COLUMN RESPONSIVE LAYOUT)               */}
      {/* ============================================================== */}
      {filteredModules.length === 0 ? (
        <div className="ops-empty-state">
          <div className="ops-empty-icon">
            <Search size={22} />
          </div>
          <h3 className="ops-empty-title ops-mono">No Operational Workspaces Found</h3>
          <p className="ops-empty-desc">
            No operational modules match your current filter or search criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="ops-empty-reset-btn ops-mono"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="ops-card-grid">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const statusClass =
              module.status === 'LIVE'
                ? 'ops-card-status-live'
                : module.status === 'READY'
                ? 'ops-card-status-ready'
                : 'ops-card-status-data';

            return (
              <Link
                key={module.id}
                to={module.route}
                className="ops-card"
                title={`Launch ${module.title}`}
              >
                <div>
                  {/* Card Header: Icon, Badge & Status */}
                  <div className="ops-card-top">
                    <div className="ops-card-icon-wrap">
                      <Icon size={18} />
                    </div>
                    <div className="ops-card-badges ops-mono">
                      <span className="ops-card-badge">{module.badge}</span>
                      <span className={`ops-card-status ${statusClass}`}>
                        ● {module.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Operational Description */}
                  <h3 className="ops-card-title ops-mono">{module.title}</h3>
                  <p className="ops-card-desc">{module.desc}</p>
                </div>

                <div>
                  {/* Operational Capabilities / Metadata Chips */}
                  <div className="ops-card-metrics">
                    {module.metrics.map((metric, i) => (
                      <span key={i} className="ops-metric-chip ops-mono">
                        {metric}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer CTA */}
                  <div className="ops-card-cta ops-mono">
                    <span>{module.cta}</span>
                    <ArrowRight size={13} className="ops-card-arrow" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OperationsPage;
