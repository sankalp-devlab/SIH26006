/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Insights & Structured Corridor Intelligence Types
 */

export type MarketSector = 'dry' | 'tanker';

export type DryVesselClass = 'Capesize' | 'Panamax' | 'Supramax' | 'Handysize';
export type TankerVesselClass = 'VLCC' | 'Aframax' | 'MR';
export type MarketVesselClass = DryVesselClass | TankerVesselClass | 'all';

export type MarketRouteCode =
  | 'C3'
  | 'C5'
  | 'P1'
  | 'P2'
  | 'P3'
  | 'S8'
  | 'TD3'
  | 'TD15'
  | 'TD19'
  | 'TD25'
  | 'TC2'
  | 'TC14';

export type FreightRateBasis = 'per_mt' | 'per_day_tce' | 'worldscale' | 'lumpsum';
export type FreightCurrency = 'USD';

export type SignalDirection = 'up' | 'down' | 'neutral';

export type MarketBalanceState =
  | 'tightening'           // Demand growth > Supply growth
  | 'widening'             // Supply growth > Demand growth
  | 'balanced'             // Equilibrium
  | 'supply_constrained'   // High fleet utilization & port delays
  | 'demand_softening';    // Cargo volume deceleration

export type MarketTimeHorizon = 'today' | '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export type MarketInsightsTab =
  | 'overview'
  | 'supply'
  | 'demand'
  | 'freight'
  | 'congestion'
  | 'routes';

/**
 * Structured Market Route Entity
 */
export interface MarketRoute {
  route_code: MarketRouteCode;
  route_name: string;
  sector: MarketSector;
  vessel_class: MarketVesselClass;
  commodity: string;
  origin_port: string;
  origin_country: string;
  destination_port: string;
  destination_country: string;
  distance_nm: number;
  typical_transit_days: number;
  rate_basis: FreightRateBasis;
  rate_currency: FreightCurrency;
  benchmark_unit: string;
  standard_cargo_size_mt: number;
  description: string;
  related_routes: MarketRouteCode[];
  chokepoints: string[];
}

/**
 * Historical Observation Point for Rates and Volume
 */
export interface MarketHistoricalObservation {
  date: string;
  rate: number;
  volume_kt?: number;
  observed: boolean;
}

/**
 * Corridor Freight Metrics
 */
export interface RouteFreightDetails {
  route_code: MarketRouteCode;
  current_rate: number;
  rate_basis: FreightRateBasis;
  rate_currency: FreightCurrency;
  benchmark_unit: string;
  change_1d_pct: number;
  change_30d_pct: number;
  high_52w: number;
  low_52w: number;
  volatility_30d_pct: number;
  sparkline_30d: number[];
  historical_series: MarketHistoricalObservation[];
  last_fixture_date: string;
}

/**
 * Supply Intelligence Metrics
 */
export interface MarketSupplyMetrics {
  total_fleet_vessels: number;
  total_fleet_dwt: number;
  available_open_vessels: number;
  available_open_dwt: number;
  ballast_vessels: number;
  ballast_dwt: number;
  laden_vessels: number;
  laden_dwt: number;
  waiting_anchorage_vessels: number;
  waiting_anchorage_dwt: number;
  operating_vessels: number;
  open_next_10d: number;
  supply_change_pct: number;
  supply_trend: 'increasing' | 'stable' | 'decreasing';
  fleet_utilization_pct: number;
  regional_distribution: {
    region_id: string;
    region_name: string;
    vessel_count: number;
    dwt: number;
    share_pct: number;
    waiting_count: number;
    ballast_count: number;
  }[];
  historical_trend: {
    date: string;
    total_dwt: number;
    active_dwt: number;
    open_count: number;
  }[];
}

/**
 * Demand Intelligence Metrics
 */
export interface MarketDemandMetrics {
  total_cargo_demand_mt: number;
  active_cargo_openings: number;
  reported_fixtures_count: number;
  reported_fixtures_volume_mt: number;
  demand_change_pct: number;
  demand_trend: 'increasing' | 'stable' | 'contracting';
  ton_mile_demand_billion_nm: number;
  commodity_breakdown: {
    commodity: string;
    volume_mt: number;
    share_pct: number;
  }[];
  origin_basin_demand: {
    basin: string;
    volume_mt: number;
    fixture_count: number;
  }[];
  historical_trend: {
    date: string;
    demand_mt: number;
    fixture_count: number;
  }[];
}

/**
 * Port & Chokepoint Congestion Metrics
 */
export interface MarketCongestionMetrics {
  global_congestion_index_pct: number;
  waiting_vessels_count: number;
  avg_waiting_time_hours: number;
  waiting_time_change_hours: number;
  congestion_change_pct: number;
  congestion_trend: 'increasing' | 'stable' | 'easing';
  chokepoint_delay_days: number;
  key_congested_ports: {
    port_name: string;
    waiting_vessels: number;
    avg_delay_hours: number;
    congestion_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  }[];
  historical_trend: {
    date: string;
    congestion_index: number;
    avg_waiting_hours: number;
  }[];
}

/**
 * Vessel Availability Breakdown
 */
export interface MarketVesselAvailabilityMetrics {
  open_prompt: number;          // 0-5 days
  open_next_10d: number;        // 6-10 days
  ballast_en_route: number;
  anchorage_waiting: number;
  laden_committed: number;
  total_tracked: number;
  availability_change_pct: number;
  availability_trend: 'increasing' | 'stable' | 'tightening';
}

/**
 * Single Synthesized Commercial Signal
 */
export interface MarketSignalItem {
  key: 'supply' | 'demand' | 'freight' | 'congestion' | 'availability';
  title: string;
  current_value: number;
  previous_value: number;
  delta: number;
  delta_pct: number;
  direction: SignalDirection;
  unit: string;
  status: 'tightening' | 'easing' | 'neutral' | 'elevated' | 'subdued';
  summary: string;
}

/**
 * Multi-Signal Synthesis & Supply-Demand Balance Narrative
 */
export interface MarketSignalSummary {
  signals: MarketSignalItem[];
  supply_demand_ratio: number;
  directional_pressure: MarketBalanceState;
  pressure_narrative: string;
  confidence_score_pct: number;
  last_calculated: string;
}

/**
 * Consolidated Market Workspace Payload
 */
export interface MarketWorkspacePayload {
  selectedSector: MarketSector | 'all';
  selectedVesselClass: MarketVesselClass;
  selectedRoute: (MarketRoute & { freight: RouteFreightDetails }) | null;
  routes: (MarketRoute & { freight: RouteFreightDetails })[];
  supply: MarketSupplyMetrics;
  demand: MarketDemandMetrics;
  congestion: MarketCongestionMetrics;
  availability: MarketVesselAvailabilityMetrics;
  signals: MarketSignalSummary;
  data_freshness: {
    last_updated: string;
    source: string;
    is_live_connected: boolean;
  };
}

/**
 * Multi-Entity Comparison
 */
export interface ComparisonMetricRow {
  label: string;
  unit: string;
  value_a: number;
  value_b: number;
  delta: number;
  delta_pct: number;
  advantage: 'entity_a' | 'entity_b' | 'neutral';
}

export interface MarketComparisonResult {
  type: 'market' | 'vessel_class' | 'route' | 'current_vs_historical';
  entity_a_label: string;
  entity_b_label: string;
  metrics: ComparisonMetricRow[];
  analytical_commentary: string[];
}

/**
 * Workspace Filter State
 */
export interface MarketFilterState {
  sector: MarketSector | 'all';
  vesselClass: MarketVesselClass;
  routeCode: string; // 'all' or specific route code
  timeHorizon: MarketTimeHorizon;
  region: string;
  searchQuery: string;
}

/**
 * Watchlist Item
 */
export interface MarketWatchlistItem {
  id: string;
  type: 'sector' | 'vessel_class' | 'route';
  code: string;
  title: string;
  sector: MarketSector;
  vessel_class?: string;
  benchmark_rate?: number;
  rate_unit?: string;
  change_1d_pct?: number;
  pinned_at: string;
}
