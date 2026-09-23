export type SearchCategory = 'ALL' | 'VESSELS' | 'PORTS' | 'CARGO' | 'ROUTES' | 'NAVIGATION';

export type VesselStatus = 'active' | 'scrapped' | 'orderbook' | 'reference' | 'in-transit' | 'anchored';

export type MatchType =
  | 'exact_imo'
  | 'exact_name'
  | 'partial_name'
  | 'ex_name'
  | 'unlocode'
  | 'port'
  | 'cargo'
  | 'route'
  | 'navigation';

export interface SearchResultItem {
  id: string | number;
  entityId: string | number;
  title: string;
  subtitle: string;
  category: 'Vessels' | 'Ports' | 'Cargo' | 'Routes' | 'Navigation';
  path: string;
  imo?: string | null;
  exNames?: string[];
  matchedExName?: string;
  status?: VesselStatus | string;
  matchType: MatchType;
  metadata?: {
    dwt?: number | null;
    vesselType?: string | null;
    flag?: string | null;
    yearBuilt?: number | null;
    unlocode?: string | null;
    country?: string | null;
    portType?: string | null;
  };
}

export interface GroupedSearchResults {
  vessels: SearchResultItem[];
  ports: SearchResultItem[];
  cargo: SearchResultItem[];
  routes: SearchResultItem[];
  navigation: SearchResultItem[];
}

export interface RecentSearchItem {
  id: string;
  query: string;
  category?: SearchCategory;
  timestamp: number;
  resultTitle?: string;
  path?: string;
}
