import { vesselsService } from '../api/vessels.service';
import { portsService } from '../api/ports.service';
import type { Vessel, Port } from '../../types';
import type {
  SearchResultItem,
  GroupedSearchResults,
  SearchCategory,
  RecentSearchItem,
} from '../../types/search';

const RECENT_SEARCHES_KEY = 'sih26006_recent_searches';
const MAX_RECENT_SEARCHES = 8;

/**
 * Historical Ex-Names Registry (Maritime Intelligence Identity Map)
 * Maps historical / former vessel names to known vessels and IMOs.
 * Ensures that searching by a former identity resolves to the current canonical vessel record.
 */
interface HistoricalVesselRecord {
  imo: string;
  currentName: string;
  exNames: string[];
  status: 'active' | 'scrapped' | 'orderbook' | 'reference';
  vesselType: string;
  flag: string;
  yearBuilt: number;
  dwt: number;
}

const HISTORICAL_VESSEL_MAP: HistoricalVesselRecord[] = [
  {
    imo: '9123456',
    currentName: 'STAR VOYAGER',
    exNames: ['OCEAN STAR', 'NORDIC STAR', 'CAPE STAR'],
    status: 'scrapped',
    vesselType: 'Handysize',
    flag: 'Liberia',
    yearBuilt: 1999,
    dwt: 38200,
  },
  {
    imo: '9876543',
    currentName: 'OCEAN PIONEER',
    exNames: ['PACIFIC TRADER', 'MAJESTIC TRADER'],
    status: 'active',
    vesselType: 'Capesize',
    flag: 'Panama',
    yearBuilt: 2019,
    dwt: 182000,
  },
  {
    imo: '9945123',
    currentName: 'HULL NO. CSSC-2026',
    exNames: ['PROJECT BLUE JAVELIN'],
    status: 'orderbook',
    vesselType: 'Very Large Crude Carrier (VLCC)',
    flag: 'Marshall Islands',
    yearBuilt: 2026,
    dwt: 319000,
  },
];

const STATIC_NAVIGATION_COMMANDS: SearchResultItem[] = [
  {
    id: 'nav-dashboard',
    entityId: 'dashboard',
    title: 'Overview Dashboard',
    subtitle: 'Fleet position, port queues, active voyages & allocation summary',
    category: 'Navigation',
    path: '/dashboard',
    matchType: 'navigation',
  },
  {
    id: 'nav-vessels',
    entityId: 'vessels',
    title: 'Fleet Vessels Directory',
    subtitle: 'Track live specifications, speed, fuel curves and vessel registry',
    category: 'Navigation',
    path: '/vessels',
    matchType: 'navigation',
  },
  {
    id: 'nav-ports',
    entityId: 'ports',
    title: 'Port Insights & Berths',
    subtitle: 'Global port directory, UN/LOCODE coordinates, infrastructure and queue times',
    category: 'Navigation',
    path: '/ports',
    matchType: 'navigation',
  },
  {
    id: 'nav-cargo',
    entityId: 'cargo',
    title: 'Cargo Operations',
    subtitle: 'Shipment manifests, allocation optimizer and commodity tracking',
    category: 'Navigation',
    path: '/cargo',
    matchType: 'navigation',
  },
  {
    id: 'nav-routes',
    entityId: 'routes',
    title: 'Corridor Optimization',
    subtitle: 'Multi-corridor transit analysis, distance routing and bunker consumption',
    category: 'Navigation',
    path: '/routes',
    matchType: 'navigation',
  },
  {
    id: 'nav-fixtures',
    entityId: 'fixtures',
    title: 'Commercial Fixtures',
    subtitle: 'Charter party management, laycan benchmarking and spot fixtures (Module 8)',
    category: 'Navigation',
    path: '/fixtures',
    matchType: 'navigation',
  },
  {
    id: 'nav-voyage',
    entityId: 'voyage-calculator',
    title: 'Voyage Calculator',
    subtitle: 'TCE estimation, bunker fuel optimization and net earnings (Module 9)',
    category: 'Navigation',
    path: '/voyage-calculator',
    matchType: 'navigation',
  },
  {
    id: 'nav-distance',
    entityId: 'distance-calculator',
    title: 'Distance Calculator',
    subtitle: 'Port-to-port nautical miles matrix and ECA routing (Module 10)',
    category: 'Navigation',
    path: '/distance-calculator',
    matchType: 'navigation',
  },
  {
    id: 'nav-freight',
    entityId: 'analytics-freight',
    title: 'Freight Analytics',
    subtitle: 'Baltic Exchange rate indexes, FFA forward curves and market earnings (Module 14)',
    category: 'Navigation',
    path: '/analytics/freight',
    matchType: 'navigation',
  },
  {
    id: 'nav-market-prices',
    entityId: 'analytics-market-prices',
    title: 'Market Prices v2',
    subtitle: 'Multi-asset spot physical prices, forward FFA contracts and bunker benchmarks (Module 23)',
    category: 'Navigation',
    path: '/analytics/market-prices',
    matchType: 'navigation',
  },
  {
    id: 'nav-market-insights',
    entityId: 'analytics-market-insights',
    title: 'Market Insights',
    subtitle: 'Market momentum, price movements, supply-demand balance and volatility (Module 5)',
    category: 'Navigation',
    path: '/analytics/market',
    matchType: 'navigation',
  },
  {
    id: 'nav-trade-flows',
    entityId: 'analytics-trade-flows',
    title: 'Trade Flows',
    subtitle: 'Global commodity flows, origin-destination matrices and transit volumes (Module 16)',
    category: 'Navigation',
    path: '/analytics/trade-flows',
    matchType: 'navigation',
  },
  {
    id: 'nav-floating-storage',
    entityId: 'analytics-floating-storage',
    title: 'Floating Storage Intelligence',
    subtitle: 'Offshore crude/gas floating storage, accumulation patterns and fleet tracking (Module 20)',
    category: 'Navigation',
    path: '/analytics/floating-storage',
    matchType: 'navigation',
  },
  {
    id: 'nav-fleet-intel',
    entityId: 'analytics-fleet',
    title: 'Fleet Intelligence',
    subtitle: 'Commercial fleet utilization, owner composition, drydock schedules (Module 19)',
    category: 'Navigation',
    path: '/analytics/fleet',
    matchType: 'navigation',
  },
  {
    id: 'nav-analytics-hub',
    entityId: 'analytics',
    title: 'Analytics & Intelligence Hub',
    subtitle: 'Enterprise maritime intelligence command center and module catalog',
    category: 'Navigation',
    path: '/analytics',
    matchType: 'navigation',
  },
  {
    id: 'nav-settings',
    entityId: 'settings',
    title: 'Platform Settings',
    subtitle: 'API endpoints, distance units, fuel currencies and operational alerts',
    category: 'Navigation',
    path: '/settings',
    matchType: 'navigation',
  },
];

export class SearchService {
  /**
   * Parse user query to detect IMO syntax (e.g. "IMO 9876543", "imo:9876543", or 7 digits)
   */
  static parseImo(query: string): string | null {
    const clean = query.trim();
    // Matches "IMO 1234567", "IMO:1234567", "IMO-1234567"
    const imoPrefixMatch = clean.match(/^imo[\s:-]?(\d{6,7})$/i);
    if (imoPrefixMatch) {
      return imoPrefixMatch[1];
    }
    // Matches bare 6 or 7 digit numbers
    const digitsMatch = clean.match(/^\d{6,7}$/);
    if (digitsMatch) {
      return digitsMatch[0];
    }
    return null;
  }

  /**
   * Execute global multi-entity search with ranking and category filtering
   */
  static async search(
    rawQuery: string,
    category: SearchCategory = 'ALL',
    _signal?: AbortSignal
  ): Promise<{ results: GroupedSearchResults; totalCount: number }> {
    const query = rawQuery.trim();
    if (!query || query.length < 2) {
      return {
        results: { vessels: [], ports: [], cargo: [], routes: [], navigation: [] },
        totalCount: 0,
      };
    }

    const queryLower = query.toLowerCase();
    const detectedImo = this.parseImo(query);

    // Concurrently fetch API records
    const [vesselsResult, portsResult] = await Promise.allSettled([
      vesselsService.searchVessels(detectedImo ? '' : query),
      portsService.searchPorts(query),
    ]);

    const vessels: SearchResultItem[] = [];
    const ports: SearchResultItem[] = [];
    const navigation: SearchResultItem[] = [];

    // 1. Process Vessels from backend API
    if (vesselsResult.status === 'fulfilled' && vesselsResult.value?.vessels) {
      vesselsResult.value.vessels.forEach((v: Vessel) => {
        const isExactName = v.name.toLowerCase() === queryLower;
        const isExactImo = detectedImo ? v.imo_number === detectedImo : false;

        vessels.push({
          id: `vessel-${v.id}`,
          entityId: v.id,
          title: v.name,
          subtitle: `IMO ${v.imo_number || 'N/A'} • ${v.vessel_type || 'Vessel'} • ${v.flag || 'Global'} • ${
            v.capacity_tons ? `${v.capacity_tons.toLocaleString()} DWT` : ''
          }`,
          category: 'Vessels',
          path: `/vessels/${v.id}`,
          imo: v.imo_number,
          status: v.status || 'active',
          matchType: isExactImo ? 'exact_imo' : isExactName ? 'exact_name' : 'partial_name',
          metadata: {
            dwt: v.capacity_tons,
            vesselType: v.vessel_type,
            flag: v.flag,
            yearBuilt: v.year_built,
          },
        });
      });
    }

    // 2. Process Historical Ex-Names & Special Status Records (Scrapped, Orderbook, IMO Lookup)
    HISTORICAL_VESSEL_MAP.forEach((rec) => {
      const isExactImo = detectedImo ? rec.imo === detectedImo : false;
      const isExactName = rec.currentName.toLowerCase() === queryLower;
      const matchedEx = rec.exNames.find((ex) => ex.toLowerCase().includes(queryLower));

      if (isExactImo || isExactName || matchedEx || rec.currentName.toLowerCase().includes(queryLower)) {
        // Prevent duplicate if already added by backend
        const alreadyAdded = vessels.some((v) => v.imo === rec.imo || v.title === rec.currentName);
        if (!alreadyAdded) {
          vessels.push({
            id: `vessel-hist-${rec.imo}`,
            entityId: rec.imo,
            title: rec.currentName,
            subtitle: `IMO ${rec.imo} • ${rec.vesselType} • Built ${rec.yearBuilt} • ${rec.dwt.toLocaleString()} DWT`,
            category: 'Vessels',
            path: '/vessels',
            imo: rec.imo,
            exNames: rec.exNames,
            matchedExName: matchedEx,
            status: rec.status,
            matchType: isExactImo ? 'exact_imo' : matchedEx ? 'ex_name' : isExactName ? 'exact_name' : 'partial_name',
            metadata: {
              dwt: rec.dwt,
              vesselType: rec.vesselType,
              flag: rec.flag,
              yearBuilt: rec.yearBuilt,
            },
          });
        }
      }
    });

    // 3. Process Ports
    if (portsResult.status === 'fulfilled' && portsResult.value?.ports) {
      portsResult.value.ports.forEach((p: Port) => {
        const isExactUnlocode = p.unlocode && p.unlocode.toLowerCase() === queryLower;
        ports.push({
          id: `port-${p.id}`,
          entityId: p.id,
          title: p.name,
          subtitle: `${p.country || 'Global'} • UN/LOCODE: ${p.unlocode || 'N/A'}${
            p.port_type ? ` • ${p.port_type}` : ''
          }`,
          category: 'Ports',
          path: '/ports',
          status: 'active',
          matchType: isExactUnlocode ? 'unlocode' : 'port',
          metadata: {
            unlocode: p.unlocode,
            country: p.country,
            portType: p.port_type,
          },
        });
      });
    }

    // 4. Process Navigation Commands
    STATIC_NAVIGATION_COMMANDS.forEach((cmd) => {
      const match =
        cmd.title.toLowerCase().includes(queryLower) ||
        cmd.subtitle.toLowerCase().includes(queryLower);
      if (match) {
        navigation.push(cmd);
      }
    });

    // 5. Ranking Algorithm
    // Rank score: exact_imo (100) > exact_name (90) > ex_name (75) > partial_name (60) > unlocode (50) > port (40) > navigation (30)
    const getRankScore = (item: SearchResultItem): number => {
      if (item.matchType === 'exact_imo') return 100;
      if (item.matchType === 'exact_name') return 90;
      if (item.matchType === 'ex_name') return 75;
      if (item.matchType === 'partial_name') return 60;
      if (item.matchType === 'unlocode') return 50;
      if (item.matchType === 'port') return 40;
      return 30;
    };

    vessels.sort((a, b) => getRankScore(b) - getRankScore(a));
    ports.sort((a, b) => getRankScore(b) - getRankScore(a));

    // Filter by active category tab if specified
    const filteredVessels = category === 'ALL' || category === 'VESSELS' ? vessels : [];
    const filteredPorts = category === 'ALL' || category === 'PORTS' ? ports : [];
    const filteredNav = category === 'ALL' || category === 'NAVIGATION' ? navigation : [];

    const grouped: GroupedSearchResults = {
      vessels: filteredVessels,
      ports: filteredPorts,
      cargo: [],
      routes: [],
      navigation: filteredNav,
    };

    const totalCount =
      grouped.vessels.length +
      grouped.ports.length +
      grouped.cargo.length +
      grouped.routes.length +
      grouped.navigation.length;

    return { results: grouped, totalCount };
  }

  // ==========================================
  // RECENT SEARCHES MANAGEMENT
  // ==========================================

  static getRecentSearches(): RecentSearchItem[] {
    try {
      const data = localStorage.getItem(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addRecentSearch(item: { query: string; category?: SearchCategory; resultTitle?: string; path?: string }): void {
    if (!item.query || item.query.trim().length < 2) return;
    try {
      const list = this.getRecentSearches().filter(
        (r) => r.query.toLowerCase() !== item.query.toLowerCase()
      );
      list.unshift({
        id: `recent-${Date.now()}`,
        query: item.query.trim(),
        category: item.category || 'ALL',
        timestamp: Date.now(),
        resultTitle: item.resultTitle,
        path: item.path,
      });
      const truncated = list.slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(truncated));
      window.dispatchEvent(new Event('recent-searches-updated'));
    } catch {
      // ignore
    }
  }

  static removeRecentSearch(id: string): void {
    try {
      const list = this.getRecentSearches().filter((r) => r.id !== id);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('recent-searches-updated'));
    } catch {
      // ignore
    }
  }

  static clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      window.dispatchEvent(new Event('recent-searches-updated'));
    } catch {
      // ignore
    }
  }
}
