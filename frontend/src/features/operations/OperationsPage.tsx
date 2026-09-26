/**
 * SIH 26006 Maritime Intelligence Platform
 * Module: Fleet Operations & Corridor Navigation (/operations)
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
    cta: 'Open Vessels Register',
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
    cta: 'Track Voyages',
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
    cta: 'Inspect Seaports',
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
    cta: 'Explore Maritime Routes',
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
    cta: 'Review Fixtures',
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
    cta: 'Calculate Voyage Economics',
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
    cta: 'Compute Nautical Distance',
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
    cta: 'Manage Cargo',
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 text-slate-200">
      {/* ============================================================== */}
      {/* 1. HERO / COMMAND CENTER HEADER (2-COLUMN BALANCED LAYOUT)     */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#061527] via-[#091d36] to-[#040e1b] border border-cyan-500/25 p-5 sm:p-6 shadow-2xl">
        {/* Subtle Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left Column (~65% width on desktop) */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                Maritime Operations Command Hub
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight uppercase font-mono">
                Fleet Operations &amp; Corridor Navigation
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 max-w-2xl leading-relaxed mt-1">
                Unified operational interface for fleet monitoring, voyages, ports, charter fixtures, cargo and navigational routing.
              </p>
            </div>

            {/* Primary Action Buttons (Semantic Hierarchy) */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              {/* Primary: Booking Intelligence */}
              <Link
                to="/vessel-intelligence"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 hover:border-cyan-400 text-xs font-semibold font-mono transition-all shadow-sm shadow-cyan-950/50 group"
              >
                <Sparkles size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Booking Intelligence</span>
                <ArrowRight size={12} className="text-cyan-400/80 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Secondary: Commercial Bookings */}
              <Link
                to="/bookings"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 hover:border-emerald-400 text-xs font-semibold font-mono transition-all shadow-sm shadow-emerald-950/50 group"
              >
                <BookmarkCheck size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Commercial Bookings</span>
                <ArrowRight size={12} className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Tertiary: Live Vessel Tracking */}
              <Link
                to="/tracking"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 hover:border-amber-400 text-xs font-semibold font-mono transition-all shadow-sm shadow-amber-950/50 group"
              >
                <Radio size={14} className="text-amber-400 animate-pulse" />
                <span>Live Vessel Tracking</span>
                <ArrowRight size={12} className="text-amber-400/80 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column (~35% width on desktop: Compact Operations Status Panel) */}
          <div className="lg:col-span-4">
            <div className="rounded-xl bg-slate-950/75 border border-slate-800/90 p-4 space-y-3.5 shadow-lg">
              {/* Header Status Row */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Operations Status
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>

              {/* Sub-Indicator */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">AIS &amp; Decision Engine</span>
                <span className="text-emerald-400 font-bold tracking-wider">SYNCHRONIZED</span>
              </div>

              {/* Mini Metrics Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-center font-mono">
                <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/70">
                  <span className="text-[9px] text-slate-400 block uppercase">Fleet</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{registeredFleetCount}</span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/70">
                  <span className="text-[9px] text-slate-400 block uppercase">Ports</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{deepwaterPortsCount}</span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/70">
                  <span className="text-[9px] text-slate-400 block uppercase">Corridors</span>
                  <span className="text-sm font-bold text-cyan-400 mt-0.5 block">14+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. OPERATIONAL STATISTICS KPI STRIP (4 HORIZONTAL COLUMNS)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: REGISTERED FLEET */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Registered Fleet
            </span>
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Ship size={13} className="text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 tracking-tight">
            {registeredFleetCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Active commercial vessels
          </div>
        </div>

        {/* KPI 2: DEEPWATER SEAPORTS */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Deepwater Seaports
            </span>
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Anchor size={13} className="text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 tracking-tight">
            {deepwaterPortsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            International terminal entries
          </div>
        </div>

        {/* KPI 3: NAVIGATIONAL CORRIDORS */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Navigational Corridors
            </span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Navigation size={13} className="text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1.5 tracking-tight">
            14+
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Geodesic &amp; chokepoints
          </div>
        </div>

        {/* KPI 4: OPERATIONS STATUS */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Operations Status
            </span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity size={13} className="text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            AIS &amp; Decision Engine synced
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CATEGORY NAVIGATION + SEARCH TOOLBAR (UNIFIED SINGLE ROW)   */}
      {/* ============================================================== */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800/90 p-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md">
        {/* Segmented Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/45 shadow-sm shadow-cyan-950/60'
                    : 'bg-slate-950/70 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Search Bar */}
        <div className="relative w-full md:w-72 flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search operational tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. OPERATIONAL MODULES & TOOLS HEADER                          */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LayoutGrid size={14} />
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Operational Modules &amp; Tools</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              {filteredModules.length} WORKSPACES
            </span>
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Select an operational workspace to launch tools
        </span>
      </div>

      {/* ============================================================== */}
      {/* 5. MODULE CARD GRID (3-COLUMN RESPONSIVE LAYOUT)               */}
      {/* ============================================================== */}
      {filteredModules.length === 0 ? (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-400">
            <Search size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            No Operational Workspaces Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            No operational modules match your current filter or search criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                to={module.route}
                className="group flex flex-col justify-between rounded-xl bg-slate-900/85 hover:bg-[#0c1e36] border border-slate-800/80 hover:border-cyan-500/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/30"
                title={`Launch ${module.title}`}
              >
                <div className="space-y-3">
                  {/* Card Header: Icon, Badge & Status */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-cyan-950/50 border border-cyan-500/25 text-cyan-400 flex items-center justify-center group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                      <Icon size={18} />
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-cyan-300 border border-slate-800 font-bold">
                        {module.badge}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold border ${
                          module.status === 'LIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : module.status === 'READY'
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        ● {module.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Operational Description */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-mono">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-300/85 leading-relaxed mt-1 line-clamp-2">
                      {module.desc}
                    </p>
                  </div>

                  {/* Operational Capabilities / Metadata Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {module.metrics.map((metric, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/70 text-slate-300 border border-slate-800/80"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>{module.cta}</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
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
