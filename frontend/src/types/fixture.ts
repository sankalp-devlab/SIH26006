/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixtures & Commercial Chartering Types
 */

export type FixtureStatus = 'draft' | 'on_subjects' | 'fully_fixed' | 'failed';

export type RateType = 'per_day' | 'per_mt' | 'lumpsum' | 'worldscale';

export type RateCurrency = 'USD' | 'EUR' | 'GBP' | 'SGD';

export type PortNodeType = 'load' | 'discharge' | 'bunkering' | 'transit';

export interface FixturePortNode {
  sequence: number;
  port_id: number;
  port_name: string;
  country: string;
  unlocode?: string;
  port_type: PortNodeType;
  eta?: string;
  etd?: string;
  draft_m?: number;
  berth_notes?: string;
}

export interface FixtureAuditItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  from_status?: FixtureStatus;
  to_status?: FixtureStatus;
  note: string;
}

export interface FixtureRecord {
  id: string;
  fixture_reference: string; // e.g. FX-2026-1024
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  vessel_imo: string;
  vessel_dwt: number;
  cargo_id?: number;
  cargo_reference?: string;
  commodity: string;
  cargo_type: string;
  quantity_tons: number;
  ports: FixturePortNode[];
  rate_value: number;
  rate_currency: RateCurrency;
  rate_type: RateType;
  rate_formatted: string;
  rate_notes?: string;
  demurrage_usd_day?: number;
  commission_percent?: number;
  charterer: string;
  charterer_broker?: string;
  owner_entity?: string;
  charter_party_form: string; // e.g. GENCON 94, NYPE 93, SHELLTIME 4
  fixture_date: string; // ISO 8601
  laycan_start: string;
  laycan_end: string;
  status: FixtureStatus;
  is_historical: boolean;
  notes: string;
  history: FixtureAuditItem[];
  created_at: string;
  updated_at: string;
  created_by: string;
  last_updated_by: string;
}

export interface CreateFixturePayload {
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  vessel_imo: string;
  vessel_dwt: number;
  cargo_id?: number;
  cargo_reference?: string;
  commodity: string;
  cargo_type: string;
  quantity_tons: number;
  ports: FixturePortNode[];
  rate_value: number;
  rate_currency: RateCurrency;
  rate_type: RateType;
  rate_notes?: string;
  demurrage_usd_day?: number;
  commission_percent?: number;
  charterer: string;
  charterer_broker?: string;
  owner_entity?: string;
  charter_party_form?: string;
  fixture_date: string;
  laycan_start: string;
  laycan_end: string;
  status?: FixtureStatus;
  notes?: string;
}

export interface FixtureFiltersState {
  searchQuery: string;
  status: string; // 'all' | FixtureStatus
  vesselId: string; // 'all' | vesselId
  charterer: string; // 'all' | charterer name
  currency: string; // 'all' | RateCurrency
  rateType: string; // 'all' | RateType
  portName: string; // 'all' | portName
  cargoCategory: string; // 'all' | category
  minRate?: number;
  maxRate?: number;
  laycanRange: 'all' | 'next_7_days' | 'next_14_days' | 'next_30_days';
}

export interface FixtureAnalyticsSummary {
  totalFixturesCount: number;
  activeCount: number;
  historicalCount: number;
  draftCount: number;
  onSubjectsCount: number;
  fullyFixedCount: number;
  failedCount: number;
  averageRatePerDayUSD: number;
  totalAgreedTonnageMT: number;
  urgentLaycanAlertsCount: number;
}
