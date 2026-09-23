/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Calculator & TCE Estimation Types
 */

export type VoyageMode = 'dry' | 'tanker';

export type FreightRateType = 'per_mt' | 'lumpsum' | 'worldscale';

export type RateCurrency = 'USD' | 'EUR' | 'GBP' | 'SGD';

export type FuelType = 'VLSFO' | 'MGO' | 'LSMGO' | 'HFO' | 'LNG';

export type CanalType = 'none' | 'suez' | 'panama' | 'kiel' | 'custom';

export type VoyageLegType = 'ballast' | 'laden';

export type ScenarioType = 'base' | 'optimistic' | 'pessimistic' | 'custom';

export interface VoyageCargoItem {
  id: string;
  name: string;
  commodity: string;
  quantity_mt: number;
  freight_rate: number;
  freight_rate_type: FreightRateType;
  worldscale_flat_rate?: number; // Used for tanker WS calculations ($/MT baseline)
  worldscale_pct?: number; // e.g. WS 65
  currency: RateCurrency;
  commission_pct: number;
  load_port_id: number;
  load_port_name: string;
  load_rate_mt_day: number;
  discharge_port_id: number;
  discharge_port_name: string;
  discharge_rate_mt_day: number;
}

export interface VoyageLegItem {
  id: string;
  sequence: number;
  leg_type: VoyageLegType;
  origin_port_id: number;
  origin_port_name: string;
  origin_country: string;
  origin_lat: number;
  origin_lng: number;
  destination_port_id: number;
  destination_port_name: string;
  destination_country: string;
  destination_lat: number;
  destination_lng: number;
  distance_nm: number;
  is_distance_manual: boolean;
  auto_distance_nm: number;
  speed_knots: number;
  is_seca: boolean;
  fuel_type: FuelType;
  canal: CanalType;
  canal_cost: number;
  weather_margin_pct: number;
}

export interface BunkerFuelPrices {
  vlsfo_usd_mt: number;
  mgo_usd_mt: number;
  lsmgo_usd_mt: number;
  hfo_usd_mt: number;
  lng_usd_mt: number;
}

export interface EmissionsConfig {
  eu_ets_enabled: boolean;
  eu_ets_price_eur_mt: number;
  eur_usd_rate: number;
  eu_ets_scope_pct: number; // 50 for extra-EU, 100 for intra-EU
  co2_factor_vlsfo: number;
  co2_factor_mgo: number;
  co2_factor_lsmgo: number;
  co2_factor_hfo: number;
  co2_factor_lng: number;
}

export interface ScenarioOverrides {
  freight_rate_multiplier?: number; // 1.10 = +10%
  speed_knots_delta?: number; // +1.0 or -1.0 knot
  fuel_price_multiplier?: number; // 0.90 = -10%
  port_delay_days?: number; // +2.0 days
  hire_rate_delta?: number;
  weather_margin_delta?: number;
  ets_price_delta?: number;
}

export interface VoyageScenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  overrides: ScenarioOverrides;
}

export interface VoyageCalculationRecord {
  id: string;
  workbook_id: string;
  name: string;
  mode: VoyageMode;
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  vessel_dwt: number;
  speed_laden_knots: number;
  speed_ballast_knots: number;
  fuel_laden_mt_day: number;
  fuel_ballast_mt_day: number;
  fuel_port_idle_mt_day: number;
  fuel_port_working_mt_day: number;
  daily_hire_usd: number;
  ballast_bonus_usd: number;
  weather_margin_pct: number;
  cargoes: VoyageCargoItem[];
  legs: VoyageLegItem[];
  fuel_prices: BunkerFuelPrices;
  port_costs: Record<number, number>; // port_id -> port disbursements USD
  extra_costs: Array<{ id: string; name: string; amount: number }>;
  emissions_config: EmissionsConfig;
  scenarios: VoyageScenario[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CargoEconomicsResult {
  cargo_id: string;
  gross_revenue: number;
  commission_amount: number;
  net_revenue: number;
  load_days: number;
  discharge_days: number;
  total_port_days: number;
}

export interface LegEconomicsResult {
  leg_id: string;
  sequence: number;
  sea_hours: number;
  sea_days: number;
  fuel_consumed_mt: number;
  fuel_cost_usd: number;
  canal_cost_usd: number;
  co2_tons: number;
  ets_cost_usd: number;
}

export interface VoyageEconomicsResult {
  total_sea_days: number;
  total_port_days: number;
  total_voyage_days: number;
  total_distance_nm: number;
  total_fuel_consumed_mt: number;
  sea_fuel_cost_usd: number;
  port_fuel_cost_usd: number;
  total_fuel_cost_usd: number;
  gross_freight_revenue: number;
  total_commissions_usd: number;
  net_freight_revenue: number;
  ballast_bonus_usd: number;
  total_revenue_usd: number;
  canal_costs_usd: number;
  port_costs_usd: number;
  vessel_hire_cost_usd: number;
  extra_costs_usd: number;
  co2_emissions_mt: number;
  ets_taxable_emissions_mt: number;
  eu_ets_cost_usd: number;
  total_voyage_costs_usd: number;
  voyage_costs_ex_hire_usd: number;
  net_pnl_usd: number;
  daily_pnl_usd: number;
  tce_usd_day: number;
  cargo_results: CargoEconomicsResult[];
  leg_results: LegEconomicsResult[];
  total_allocated_cargo_mt: number;
  capacity_utilization_pct: number;
  is_overloaded: boolean;
}

export interface VoyageWorkbook {
  id: string;
  name: string;
  description: string;
  voyages: VoyageCalculationRecord[];
  active_voyage_id: string;
  created_at: string;
  updated_at: string;
}
