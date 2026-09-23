/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights & Maritime Intelligence Domain Types
 */

import type { Port } from './port';

export type PortCongestionSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface PortVesselActivity {
  id: string;
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  imo?: string;
  dwt: number;
  flag: string;
  status: 'arriving' | 'waiting' | 'operating' | 'departed';
  terminal_id?: number;
  terminal_name: string;
  berth: string;
  berth_assigned?: string;
  cargo_type: string;
  cargo_quantity_mt: number;
  eta?: string;
  arrival_time?: string;
  waiting_hours: number;
  operation_type: 'loading' | 'discharging' | 'bunkering' | 'repairs';
  operation?: 'loading' | 'discharging' | 'bunkering' | 'repairs';
  operation_start?: string;
  estimated_completion?: string;
  origin_port: string;
  destination_port: string;
  delay_reason?: string;
}

export interface PortTerminalDetail {
  id: number;
  port_id: number;
  name: string;
  terminal_type: 'Container' | 'Dry Bulk' | 'Crude Oil' | 'LNG' | 'General Cargo' | 'Chemical';
  terminalType?: 'Container' | 'Dry Bulk' | 'Crude Oil' | 'LNG' | 'General Cargo' | 'Chemical';
  max_draft_m: number;
  maxDraftMeters?: number;
  max_loa_m: number;
  maxLoaMeters?: number;
  berths_total: number;
  totalBerths?: number;
  berths_occupied: number;
  occupiedBerths?: number;
  operating_vessels_count: number;
  waiting_vessels_count: number;
  utilization_pct: number;
  handling_rate_mt_day: number;
  handlingRateTph?: number;
  restrictions?: string;
  activeVessels?: Array<{ name: string; dwt: number; operation: string }>;
}

export interface PortLineupItem {
  id?: string;
  queue_position: number;
  queue_sequence?: number;
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  imo?: string;
  terminal_name: string;
  berth_name?: string;
  eta: string;
  cargo_desc: string;
  cargo_type?: string;
  cargo_quantity_mt?: number;
  operation: 'loading' | 'discharging';
  estimated_berthing: string;
  estimated_departure?: string;
  waiting_hours: number;
  estimated_turnaround_hours?: number;
  priority: 'normal' | 'express' | 'delayed';
  status?: string;
}

export interface PortCostItem {
  id?: string;
  category: 'Port Dues' | 'Pilotage' | 'Towage / Tugboat' | 'Berth Hire' | 'Agency Fees' | 'Waste Disposal / Security';
  item_name: string;
  basis: 'per_gt' | 'per_call' | 'per_day' | 'per_hour' | 'flat';
  rate_usd: number;
  standard_amount_usd?: number;
  mandatory?: boolean;
  currency: 'USD';
  notes: string;
  last_updated: string;
}

export interface PortBunkerPrice {
  id?: string;
  fuel_type: 'VLSFO' | 'LSMGO' | 'MGO' | 'HFO' | 'LNG';
  fuel_grade?: string;
  price_usd_mt: number;
  price_per_mt_usd?: number;
  availability?: 'GOOD' | 'NORMAL' | 'LIMITED' | 'TIGHT';
  supplier?: string;
  change_pct?: number;
  delta_usd: number;
  source: string;
  timestamp: string;
  is_live: boolean;
}

export interface PortWeatherData {
  temperature_c: number;
  temperatureC?: number;
  condition: 'Clear' | 'Partly Cloudy' | 'Rain' | 'Heavy Swell' | 'Fog' | 'Gale / Storm';
  wind_speed_knots: number;
  windSpeedKnots?: number;
  wind_direction: string;
  windDirectionDeg?: number;
  visibility_nm: number;
  visibilityNm?: number;
  wave_height_m: number;
  waveHeightMeters?: number;
  precipitation_mm: number;
  potential_operational_impact: string;
  impact_level: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  forecast: { day: string; temp_c: number; condition: string; wind_knots: number }[];
}

export interface PortCongestionAnalytics {
  current_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  congestion_index_pct: number; // 0-100%
  avg_waiting_hours: number;
  median_waiting_hours: number;
  max_waiting_hours: number;
  vessels_in_anchorage: number;
  vessels_at_berth: number;
  vessels_expected_48h: number;
  historical_trend: {
    date: string;
    waiting_hours: number;
    vessels_waiting: number;
    congestion_pct: number;
  }[];
}

export interface PortHistoricalVisit {
  id: string;
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  imo?: string;
  dwt?: number;
  arrival_date: string;
  departure_date: string;
  terminal_name: string;
  cargo_handled: string;
  cargo_type?: string;
  quantity_mt: number;
  cargo_volume_mt?: number;
  turnaround_days: number;
  turnaround_hours?: number;
  waiting_hours: number;
  status: 'completed';
}

export interface PortPhysicalSpecs {
  maxDraftMeters: number;
  maxLoaMeters: number;
  maxBeamMeters: number;
  tidalRangeMeters: number;
  waterDensity: number;
  channelType: string;
  pilotageCompulsory: boolean;
  tugRequirement: boolean;
}

export interface PortAnalyticsData {
  congestion: {
    severity: PortCongestionSeverity;
    indexScore: number;
    trend: string;
    waitingVesselsCount: number;
    berthOccupancyPct: number;
    contributingFactors?: {
      anchorageQueue?: number;
      berthOccupancyPct?: number;
    };
  };
  waitingTimeStats: {
    averageHours: number;
    medianHours: number;
    maxHours: number;
    trendVsLastWeekPct: number;
    meanHours?: number;
    trendPct?: number;
  };
  weatherImpact: {
    impactLevel: 'OPTIMAL' | 'CAUTION' | 'DELAY_RISK' | 'OPERATIONS_SUSPENDED';
    summary: string;
    windImpact: string;
    swellImpact: string;
    visibilityImpact: string;
    advisoryNote?: string;
  };
  overallBerthUtilizationPct?: number;
  operationalBreakdown?: {
    loadingPct: number;
    dischargingPct: number;
    bunkeringPct: number;
    repairsPct: number;
  };
}

export interface PortComparisonResult {
  delta: {
    congestionScore: number;
    meanWaitHours: number;
    berthOccupancyPct: number;
    bunkerPriceDeltaUsd: number;
    daCostDeltaUsd: number;
  };
  winner: 'PORT_A' | 'PORT_B' | 'TIED';
  comparisonNotes: string[];
  port_a: {
    id: number;
    name: string;
    country: string;
    avg_waiting_hours: number;
    congestion_level: string;
    congestion_pct: number;
    waiting_count: number;
    operating_count: number;
    arriving_count: number;
    vlsfo_price_usd: number;
    lsmgo_price_usd: number;
    est_port_dues_usd: number;
    weather_impact: string;
    physicalSpecs?: PortPhysicalSpecs;
  };
  port_b: {
    id: number;
    name: string;
    country: string;
    avg_waiting_hours: number;
    congestion_level: string;
    congestion_pct: number;
    waiting_count: number;
    operating_count: number;
    arriving_count: number;
    vlsfo_price_usd: number;
    lsmgo_price_usd: number;
    est_port_dues_usd: number;
    weather_impact: string;
    physicalSpecs?: PortPhysicalSpecs;
  };
  advantages: {
    faster_turnaround: string;
    lower_bunker_cost: string;
    lower_port_dues: string;
    lower_congestion: string;
  };
}

export type PortDateRange = 'today' | '7d' | '30d' | '90d';

export interface PortSummaryStats {
  waitingVesselsCount: number;
  operatingVesselsCount: number;
  expectedVessels48h: number;
  totalBerths: number;
  occupiedBerths: number;
  anchorageCount: number;
  arrivingVesselsCount?: number;
  totalEnRouteDwt?: number;
  lineupQueueCount?: number;
  totalLineupCargoTons?: number;
}

export interface PortInsightPayload {
  port: Port;
  activities: PortVesselActivity[];
  terminals: PortTerminalDetail[];
  lineups: PortLineupItem[];
  costs: PortCostItem[];
  bunkers: PortBunkerPrice[];
  portCosts?: PortCostItem[];
  bunkerPrices?: PortBunkerPrice[];
  weather: PortWeatherData;
  congestion: PortCongestionAnalytics;
  historicalVisits: PortHistoricalVisit[];
  physicalSpecs?: PortPhysicalSpecs;
  analytics?: PortAnalyticsData;
  summary?: PortSummaryStats;
}
