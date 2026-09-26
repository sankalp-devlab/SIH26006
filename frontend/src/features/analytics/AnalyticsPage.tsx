import { useState, useMemo } from 'react';
import {
  TrendingUp,
  LineChart,
  Waves,
  Leaf,
  DollarSign,
  BookOpen,
  Milestone,
  Warehouse,
  Shield,
  Activity,
  FileSpreadsheet,
  Database,
  Bot,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { useVessels } from '../../hooks/useVessels';
import { AnalyticsHubHero } from './components/AnalyticsHubHero';
import {
  AnalyticsModuleCard,
  type AnalyticsModuleConfig,
  type ModuleCategory,
} from './components/AnalyticsModuleCard';
import { AnalyticsCommandCenter } from './components/AnalyticsCommandCenter';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';

// Stylesheet
import './analytics-hub.css';

const MODULES: AnalyticsModuleConfig[] = [
  // 1. Primary Feature Modules
  {
    id: 'freight_analytics',
    badge: 'M14',
    title: 'Freight Analytics',
    desc: 'Analyze freight rates, TCE, route economics and commercial vessel supply balances across dry and liquid corridors.',
    route: '/analytics/freight',
    icon: TrendingUp,
    metrics: ['Spot Rates', 'TCE Index', 'FFA Derivatives'],
    cta: 'Open Freight Analytics →',
    tier: 'primary',
    category: 'MARKETS',
  },
  {
    id: 'market_insights',
    badge: 'M5',
    title: 'Market Insights',
    desc: 'Track market momentum, price movements, supply-demand elasticities and volatility across commodity corridors.',
    route: '/analytics/market',
    icon: LineChart,
    metrics: ['Market Momentum', 'Supply-Demand', 'Volatility Index'],
    cta: 'Open Market Insights →',
    tier: 'primary',
    category: 'MARKETS',
  },
  {
    id: 'trade_flows',
    badge: 'M16',
    title: 'Trade Flows',
    desc: 'Visualize global commodity movement, origins, destinations, origin-destination matrix and maritime trade corridors.',
    route: '/analytics/trade-flows',
    icon: Waves,
    metrics: ['Trade Volume', 'Major Corridors', 'Commodity Flows'],
    cta: 'Explore Trade Flows →',
    tier: 'primary',
    category: 'TRADE',
  },

  // 2. Secondary Modules
  {
    id: 'emissions',
    badge: 'M21',
    title: 'Emissions Intelligence',
    desc: 'Analyze vessel emissions, operational carbon intensity (CII ratings) and environmental compliance under SECA/ECA zones.',
    route: '/analytics/emissions',
    icon: Leaf,
    metrics: ['CO₂ Telemetry', 'CII Ratings', 'Carbon Intensity'],
    cta: 'Open Emissions →',
    tier: 'secondary',
    category: 'VESSELS',
  },
  {
    id: 'valuations',
    badge: 'M22',
    title: 'Vessel Valuations',
    desc: 'Estimate vessel market valuation dynamically using hull age, deadweight class, historical earnings and scrap values.',
    route: '/analytics/valuations',
    icon: DollarSign,
    metrics: ['Current Value', 'Historical Value', 'Demolition Value'],
    cta: 'Open Valuations →',
    tier: 'secondary',
    category: 'FLEET',
  },
  {
    id: 'orderbook',
    badge: 'M17',
    title: 'Orderbook Intelligence',
    desc: 'Track global shipyard newbuilding orders, scheduled deliveries, fleet replacement ratios and shipyard berth capacity.',
    route: '/analytics/orderbook',
    icon: BookOpen,
    metrics: ['Orders Indexed', 'Deliveries Q4', 'Fleet Growth %'],
    cta: 'Open Orderbook →',
    tier: 'secondary',
    category: 'FLEET',
  },
  {
    id: 'fleets',
    badge: 'M19',
    title: 'Fleet Intelligence',
    desc: 'Analyze owner fleet composition, commercial utilization, age profile, drydock schedules and operational performance.',
    route: '/analytics/fleet',
    icon: Shield,
    metrics: ['Fleet Size', 'Utilization %', 'Age Profile'],
    cta: 'Open Fleet Intelligence →',
    tier: 'secondary',
    category: 'FLEET',
  },
  {
    id: 'market_prices',
    badge: 'M23',
    title: 'Market Prices v2',
    desc: 'Compare multi-asset spot physical prices, forward FFA contracts, bunker benchmarks and historical time-series pricing.',
    route: '/analytics/market-prices',
    icon: Activity,
    metrics: ['Physical Spot', 'Forward FFA', 'Historical Series'],
    cta: 'Open Market Prices →',
    tier: 'secondary',
    category: 'MARKETS',
  },

  // 3. Compact Modules
  {
    id: 'waypoints',
    badge: 'M18',
    title: 'Waypoints',
    desc: 'Analyze maritime waypoints, choke point checkpoints, congestion bottlenecks and vessel passage patterns.',
    route: '/analytics/waypoints',
    icon: Milestone,
    metrics: ['Waypoints', 'Canal Transits', 'Chokepoint Density'],
    cta: 'Open Waypoints →',
    tier: 'compact',
    category: 'VESSELS',
  },
  {
    id: 'floating_storage',
    badge: 'M20',
    title: 'Floating Storage',
    desc: 'Monitor vessels deployed for offshore oil/gas floating storage and regional inventory accumulations.',
    route: '/analytics/floating-storage',
    icon: Warehouse,
    metrics: ['Storage Vessels', 'Barrels Held', 'Utilization %'],
    cta: 'Open Floating Storage →',
    tier: 'compact',
    category: 'TRADE',
  },
  {
    id: 'reporting',
    badge: 'M25',
    title: 'Reporting & Analytics',
    desc: 'Generate structured commercial PDF/CSV reports, automated fixture summaries and operational exports.',
    route: '/analytics/reporting',
    icon: FileSpreadsheet,
    metrics: ['Custom Reports', 'Scheduled KPIs', 'CSV/PDF Exports'],
    cta: 'Open Reporting →',
    tier: 'compact',
    category: 'REPORTING',
  },
  {
    id: 'data_query',
    badge: 'M24',
    title: 'Data Query Workbench',
    desc: 'Query raw maritime datasets with custom filters, SQL-like parameter builders and tabular exports.',
    route: '/analytics/data-query',
    icon: Database,
    metrics: ['Indexed Tables', 'Query Builder', 'Raw Telemetry'],
    cta: 'Open Data Query →',
    tier: 'compact',
    category: 'OPERATIONS',
  },

  // 4. Special Module
  {
    id: 'skipper_ai',
    badge: 'M26',
    title: 'Skipper AI Assistant',
    desc: 'Ask natural-language questions about vessels, markets, corridor risks, voyage economics and maritime intelligence.',
    route: '/analytics/skipper-ai',
    icon: Bot,
    metrics: ['Maritime LLM', 'Natural Language', 'Actionable Insights'],
    cta: 'Open Skipper AI Assistant →',
    tier: 'special',
    category: 'OPERATIONS',
  },
];

type CategoryFilter = 'ALL' | ModuleCategory;

export function AnalyticsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real active vessels count from backend
  const { data: vesselsData } = useVessels(50);

  const categories: CategoryFilter[] = [
    'ALL',
    'MARKETS',
    'TRADE',
    'FLEET',
    'VESSELS',
    'OPERATIONS',
    'REPORTING',
  ];

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
    <div className="hub-root oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="market" />
      {/* 1. Hero Overview Area with KPIs */}
      <AnalyticsHubHero />

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
            placeholder="Search analytics modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Section Title */}
      <div className="hub-section-title-wrap">
        <h2 className="hub-section-title">
          <LayoutGrid size={14} color="#38bdf8" />
          <span>INTELLIGENCE MODULES</span>
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
        <span className="hub-section-sub">Select an intelligence workspace</span>
      </div>

      {/* 4. Analytics Module Card Grid */}
      <div className="hub-module-grid">
        {filteredModules.map((module) => (
          <AnalyticsModuleCard key={module.id} module={module} />
        ))}
      </div>

      {/* 5. Market Command Center (3 Compact Panels) */}
      <AnalyticsCommandCenter activeVesselsCount={vesselsData?.count} />
    </div>
  );
}
export default AnalyticsPage;
