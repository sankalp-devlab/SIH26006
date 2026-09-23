/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics & Market Intelligence Domain Types
 */

export type FreightDateRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export type MarketSegment = 'all' | 'dry_bulk' | 'tanker' | 'container';

export type FreightVesselClass = 
  | 'all' 
  | 'capesize' 
  | 'panamax' 
  | 'supramax' 
  | 'handysize' 
  | 'vlcc' 
  | 'suezmax' 
  | 'aframax' 
  | 'mr_tanker' 
  | 'ultra_large_container';

export type FreightRegion = 
  | 'all' 
  | 'atlantic' 
  | 'pacific' 
  | 'indian_ocean' 
  | 'mediterranean' 
  | 'middle_east_gulf';

export type FreightRateBasis = 'all' | 'per_mt' | 'per_day_tce' | 'worldscale' | 'lumpsum';

export type MarketStructureSentiment = 'bullish' | 'bearish' | 'neutral' | 'contango' | 'backwardation';

export interface FreightMarketSummary {
  total_vessels_tracked: number;
  active_commercial_supply_dwt: number;
  supply_change_pct: number;
  benchmark_freight_rate_usd: number;
  rate_change_pct: number;
  global_congestion_index_pct: number;
  avg_anchorage_wait_hours: number;
  wait_change_hours: number;
  ffa_benchmark_usd: number;
  spot_benchmark_usd: number;
  ffa_spot_spread_usd: number;
  market_sentiment: MarketStructureSentiment;
  last_updated: string;
}

export interface RegionalSupplyItem {
  region_id: string;
  region_name: string;
  vessel_count: number;
  supply_dwt: number;
  share_pct: number;
  ballast_count: number;
  laden_count: number;
  waiting_count: number;
  avg_congestion_pct: number;
  trend_pct: number;
  key_ports: string[];
  primary_routes: string[];
}

export interface SegmentSupplyItem {
  segment: string;
  vessel_class: string;
  vessel_count: number;
  total_dwt: number;
  share_pct: number;
  avg_daily_earnings_usd: number;
  open_next_10d: number;
  trend_pct: number;
}

export interface HistoricalSupplyPoint {
  date: string;
  total_supply_dwt: number;
  active_supply_dwt: number;
  ballast_supply_dwt: number;
  waiting_supply_dwt: number;
  vessel_count: number;
}

export interface VesselSupplyBreakdown {
  total_vessels: number;
  total_dwt_mt: number;
  laden_operating_count: number;
  laden_operating_dwt: number;
  ballast_open_count: number;
  ballast_open_dwt: number;
  waiting_anchorage_count: number;
  waiting_anchorage_dwt: number;
  inactive_drydock_count: number;
  inactive_drydock_dwt: number;
  supply_utilization_pct: number;
  regional_distribution: RegionalSupplyItem[];
  segment_distribution: SegmentSupplyItem[];
  historical_trend: HistoricalSupplyPoint[];
}

export interface HistoricalRateObservation {
  date: string;
  rate: number;
  volume_kt?: number;
  observed: boolean; // true = actual fixture observation; false = modeled interpolation
}

export interface FreightRateBenchmark {
  id: string;
  route_code: string; // e.g. C5, C3, P1A, TD3C, TD20, TC2
  route_name: string;
  commodity: string;
  origin_port: string;
  destination_port: string;
  distance_nm: number;
  vessel_class: string;
  segment: 'dry_bulk' | 'tanker' | 'container';
  region: FreightRegion;
  rate_value: number;
  rate_basis: 'per_mt' | 'per_day_tce' | 'worldscale' | 'lumpsum';
  rate_currency: 'USD';
  change_1d_pct: number;
  change_30d_pct: number;
  high_52w: number;
  low_52w: number;
  sparkline_30d: number[];
  historical_series: HistoricalRateObservation[];
  last_fixture_date: string;
}

export interface FFACurveItem {
  id: string;
  contract_period: 'Prompt (M0)' | 'M+1' | 'M+2' | 'Q1' | 'Q2' | 'Q3' | 'Cal+1';
  route_code: string;
  vessel_class: string;
  forward_rate_usd: number;
  spot_equivalent_usd: number;
  spread_usd: number;
  spread_pct: number;
  market_structure: 'contango' | 'backwardation' | 'par';
  open_interest_lots: number;
  settlement_date: string;
  historical_curve: { date: string; forward_rate: number; spot_rate: number }[];
}

export interface SpotFFASpread {
  route_code: string;
  route_name: string;
  vessel_class: string;
  spot_rate: number;
  ffa_prompt: number;
  ffa_m1: number;
  ffa_q1: number;
  basis_spread: number;
  premium_pct: number;
  state: 'contango' | 'backwardation' | 'neutral';
}

export interface MarketDriverFactor {
  id: string;
  name: string;
  category: 'canal' | 'port_congestion' | 'geopolitical' | 'weather_ice';
  location: string;
  impact_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
  affected_routes: string[];
  affected_vessel_classes: string[];
  delay_impact_days: number;
  freight_premium_pct: number;
  ton_mile_expansion_pct: number;
  last_status_update: string;
}

export interface FreightForecastPoint {
  horizon: '7d' | '14d' | '30d' | '60d' | '90d';
  route_code: string;
  projected_rate_usd: number;
  confidence_lower_usd: number;
  confidence_upper_usd: number;
  confidence_score_pct: number;
  projected_supply_dwt: number;
  driver_summary: string;
  is_forecast: true;
}

export interface ComparisonMetricItem {
  name: string;
  unit: string;
  value_a: number;
  value_b: number;
  delta: number;
  delta_pct: number;
  advantage: 'entity_a' | 'entity_b' | 'neutral';
}

export interface FreightComparisonResult {
  type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa';
  entity_a_label: string;
  entity_b_label: string;
  metrics: ComparisonMetricItem[];
  analytical_commentary: string[];
}

export interface FreightFilterState {
  dateRange: FreightDateRange;
  segment: MarketSegment;
  vesselClass: FreightVesselClass;
  region: FreightRegion;
  rateBasis: FreightRateBasis;
  searchQuery: string;
  showOnlyCongested: boolean;
}
