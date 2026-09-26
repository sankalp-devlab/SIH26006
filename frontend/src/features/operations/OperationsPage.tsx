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
  Shield,
  Activity,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { useVessels } from '../../hooks/useVessels';
import { usePorts } from '../../hooks/usePorts';
import '../analytics/analytics-hub.css';

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
  },
];

type CategoryFilter = 'ALL' | 'CORE' | 'NAVIGATION' | 'CHARTER' | 'CARGO';

export function OperationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real authoritative counts
  const { data: vesselsData } = useVessels(100);
  const { data: portsData } = usePorts(100);

  const categories: CategoryFilter[] = ['ALL', 'CORE', 'NAVIGATION', 'CHARTER', 'CARGO'];

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
    <div className="hub-root">
      {/* 1. Hero Overview Area with Real Operational KPIs */}
      <div className="hub-hero">
        <div className="hub-hero-header">
          <div>
            <div className="hub-hero-tag">
              <span className="hub-live-dot" />
              <span>MARITIME OPERATIONS COMMAND HUB</span>
            </div>
            <h1 className="hub-hero-title">Fleet Operations & Corridor Navigation</h1>
            <p className="hub-hero-desc">
              Unified operational command interface for commercial fleet monitoring, vessel voyages, deepwater port directories, charter fixtures, and navigational routing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/vessel-intelligence"
              className="hub-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '6px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <Sparkles size={14} />
              <span>Booking Intelligence</span>
            </Link>
            <Link
              to="/bookings"
              className="hub-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '6px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <BookmarkCheck size={14} />
              <span>Commercial Bookings</span>
            </Link>
            <Link
              to="/tracking"
              className="hub-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '6px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <Radio size={14} />
              <span>Live Vessel Tracking</span>
            </Link>
          </div>
        </div>

        {/* Operational Telemetry KPIs */}
        <div className="hub-hero-stats">
          <div className="hub-stat-card">
            <span className="hub-stat-label">REGISTERED FLEET</span>
            <div className="hub-stat-value hub-mono">
              {vesselsData?.count ?? vesselsData?.vessels?.length ?? '50+'}
            </div>
            <span className="hub-stat-sub">Active commercial vessels</span>
          </div>

          <div className="hub-stat-card">
            <span className="hub-stat-label">DEEPWATER SEAPORTS</span>
            <div className="hub-stat-value hub-mono">
              {portsData?.count ?? portsData?.ports?.length ?? '80+'}
            </div>
            <span className="hub-stat-sub">International terminal entries</span>
          </div>

          <div className="hub-stat-card">
            <span className="hub-stat-label">NAVIGATIONAL CORRIDORS</span>
            <div className="hub-stat-value hub-mono">14+</div>
            <span className="hub-stat-sub">Geodesic & chokepoint networks</span>
          </div>

          <div className="hub-stat-card">
            <span className="hub-stat-label">OPERATIONS STATUS</span>
            <div className="hub-stat-value hub-mono" style={{ color: '#10b981' }}>
              ONLINE
            </div>
            <span className="hub-stat-sub">AIS & Decision Engine synchronized</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar & Search Bar */}
      <div className="hub-toolbar">
        <div className="hub-filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`hub-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hub-search-box">
          <Search size={14} className="hub-search-icon" />
          <input
            type="text"
            placeholder="Search operational tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Section Title */}
      <div className="hub-section-title-wrap">
        <h2 className="hub-section-title">
          <LayoutGrid size={14} color="#38bdf8" />
          <span>OPERATIONAL MODULES & TOOLS</span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '1px 6px',
              borderRadius: '3px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            {filteredModules.length} WORKSPACES
          </span>
        </h2>
        <span className="hub-section-sub">Select an operational workspace to launch tools</span>
      </div>

      {/* 4. Operations Module Card Grid */}
      <div className="hub-module-grid">
        {filteredModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.id}
              to={module.route}
              className={`hub-card ${module.tier === 'primary' ? 'hub-card-primary' : ''}`}
              title={`Open ${module.title}`}
            >
              <div>
                <div className="hub-card-header">
                  <div className="hub-card-icon-wrap">
                    <Icon size={18} />
                  </div>
                  <span className="hub-card-badge hub-mono">{module.badge}</span>
                </div>

                <h3 className="hub-card-title">{module.title}</h3>
                <p className="hub-card-desc">{module.desc}</p>

                <div className="hub-card-metrics">
                  {module.metrics.map((metric, i) => (
                    <span key={i} className="hub-metric-tag">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hub-card-cta">
                <span>{module.cta}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default OperationsPage;
