/**
 * Vessel Detail & Intelligence Types
 * SIH 26006 Maritime Intelligence Platform
 */

import type { Vessel } from './vessel';

export type VesselDetailTab = 'overview' | 'commercial' | 'environment' | 'valuation' | 'compliance';

export type VesselDashboardTab =
  | 'overview'
  | 'particulars'
  | 'voyages'
  | 'cargo'
  | 'commercial'
  | 'valuation'
  | 'sanctions'
  | 'emissions';

export interface VesselTechnicalSpecs {
  loa_m: number | null;
  beam_m: number | null;
  depth_m: number | null;
  summer_draft_m: number | null;
  dwt_mt: number | null;
  gross_tonnage: number | null;
  net_tonnage: number | null;
  lightweight_tons: number | null;
  year_built: number | null;
  shipyard: string;
  hull_type: string;
  classification_society: string;
  class_notation: string;
  main_engine_model: string;
  main_engine_power_kw: number;
  aux_engines: string;
  propeller_type: string;
  bow_thruster: boolean;
}

export interface VesselCommercialIntel {
  commercial_operator: string;
  technical_manager: string;
  registered_owner: string;
  commercial_pool: string | null;
  current_voyage: {
    voyage_number: string;
    origin_port: string;
    destination_port: string;
    departure_date: string;
    eta_date: string;
    distance_to_go_nm: number;
    cargo_name: string;
    cargo_quantity_mt: number;
    charterer: string;
    fixture_rate: string;
    laycan_window: string;
    status: 'In Transit' | 'Discharging' | 'Loading' | 'Awaiting Berth';
  };
  recent_voyages: {
    voyage_id: string;
    route: string;
    cargo: string;
    completed_date: string;
    charterer: string;
  }[];
}

export interface VesselEnvironmentalIntel {
  cii_rating: 'A' | 'B' | 'C' | 'D' | 'E';
  cii_score: number; // e.g. 3.42
  cii_target: number; // e.g. 4.10
  aer_metric: number; // gCO2 / dwt-nm
  daily_fuel_consumption_laden_mt: number;
  daily_fuel_consumption_ballast_mt: number;
  daily_co2_emissions_mt: number; // fuel * 3.114
  fuel_type: string;
  scrubber_fitted: boolean;
  ballast_water_treatment: boolean;
  seca_compliance_status: 'Compliant' | 'Requires LSFO / Scrubber';
  co2_reduction_trend: number; // percentage vs benchmark
}

export interface VesselValuationIntel {
  current_market_value_usd_m: number;
  historical_1y_ago_usd_m: number;
  historical_3y_ago_usd_m: number;
  newbuilding_parity_usd_m: number;
  demolition_scrap_value_usd_m: number;
  scrap_rate_per_ldt: number;
  valuation_confidence: 'High' | 'Medium';
  last_appraisal_date: string;
  valuation_trend: { year: number; value_m: number }[];
}

export interface VesselComplianceIntel {
  sanctions_status: 'CLEAR' | 'FLAGGED' | 'UNKNOWN';
  ofac_sdn_check: 'PASS' | 'FAIL';
  eu_maritime_check: 'PASS' | 'FAIL';
  un_security_check: 'PASS' | 'FAIL';
  flag_state_risk: 'Low Risk (White List)' | 'Medium Risk' | 'High Risk (Black List)';
  psc_inspection_deficiencies: number;
  last_psc_inspection_date: string;
  last_psc_port: string;
  regulatory_notes: string[];
}

export interface VesselCargoIntel {
  current_cargo: {
    commodity: string;
    category: string;
    quantity_mt: number;
    stowage_factor: number;
    loading_port: string;
    discharge_port: string;
    laycan: string;
    status: 'Loaded' | 'Discharging' | 'Ballast Transit' | 'Stowed';
    hazard_class: string;
  };
  cargo_history: {
    voyage_id: string;
    commodity: string;
    quantity_mt: number;
    route: string;
    completed_date: string;
  }[];
}

export interface EnrichedVesselDetail {
  vessel: Vessel;
  technical: VesselTechnicalSpecs;
  commercial: VesselCommercialIntel;
  cargo: VesselCargoIntel;
  environmental: VesselEnvironmentalIntel;
  valuation: VesselValuationIntel;
  compliance: VesselComplianceIntel;
}
