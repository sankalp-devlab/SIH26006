export type ReportingDashboardView =
  | 'commercial'
  | 'trade_flows'
  | 'emissions'
  | 'valuations';

export type ReportTimeHorizon = 'YTD' | '1Y' | '3Y' | '5Y' | 'ALL';

export type ReportMarketSegment =
  | 'all'
  | 'Crude Tanker'
  | 'Product Tanker'
  | 'Dry Bulk'
  | 'LNG';

export type ReportVesselClass =
  | 'all'
  | 'VLCC'
  | 'Suezmax'
  | 'Aframax'
  | 'Capesize'
  | 'Panamax'
  | 'MR'
  | 'LNG Carrier';

export type ReportGeographicalBasin =
  | 'all'
  | 'Middle East'
  | 'Atlantic'
  | 'Pacific'
  | 'Europe'
  | 'US Gulf';

export type ReportMetricFocus =
  | 'tce_rate'
  | 'cargo_volume'
  | 'co2_emissions'
  | 'ton_miles';

export interface ReportFilterState {
  view: ReportingDashboardView;
  timeHorizon: ReportTimeHorizon;
  segment: ReportMarketSegment;
  vesselClass: ReportVesselClass;
  basin: ReportGeographicalBasin;
  metricFocus: ReportMetricFocus;
}

export type FixtureCommercialStatus =
  | 'Completed'
  | 'In-Transit'
  | 'Discharging'
  | 'Fixed';

export interface DetailedTransactionRecord {
  id: string;
  date: string;
  vesselName: string;
  vesselImo: string;
  vesselClass: string;
  segment: ReportMarketSegment;
  routeCode: string;
  routeName: string;
  basin: ReportGeographicalBasin;
  originPort: string;
  destinationPort: string;
  cargo: string;
  cargoSubType: string;
  tceRate: number; // USD / day
  cargoVolume: number; // Metric Tons
  tonMiles: number; // Millions ton-miles
  bunkerCostPerDay: number; // USD / day
  co2PerDay: number; // MT CO2 / day
  totalCo2Mt: number; // MT
  commercialStatus: FixtureCommercialStatus;
  charterer: string;
  speedKnots: number;
  durationDays: number;
  ciiRating: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface DrillDownContext {
  datePeriod: string; // e.g. "2024-10" or "Oct 2024"
  routeCode?: string; // e.g. "TD3C"
  routeName?: string;
  segment?: ReportMarketSegment;
  vesselClass?: string;
  metricValue?: number;
  recordCount: number;
  label: string; // e.g. "October 2024 — VLCC Arabian Gulf to China"
}

export interface DrillDownFilterState {
  status: 'all' | FixtureCommercialStatus;
  cargoSubType: string;
  minTce: number;
  searchTerm: string;
}

export interface ReportKpiItem {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  unit?: string;
  changeYoY: number; // percentage, e.g. +14.2
  trend: 'up' | 'down' | 'neutral';
  status: 'positive' | 'negative' | 'neutral';
  benchmark: string;
  subtext: string;
}

export interface MonthlyTimeSeriesPoint {
  period: string; // YYYY-MM
  label: string; // "Oct 24"
  value: number; // aggregate metric value
  baseline: number;
  fixtureCount: number;
  vesselCount: number;
  topRoute: string;
  topSegment: string;
}

export interface CorridorBarPoint {
  routeCode: string;
  routeName: string;
  basin: ReportGeographicalBasin;
  value: number; // avg TCE or cargo volume
  fixtureCount: number;
  unit: string;
  vesselClass: string;
}

export interface SegmentSharePoint {
  segment: ReportMarketSegment;
  value: number;
  sharePct: number;
  color: string;
  count: number;
}

export interface DecisionRecommendation {
  id: string;
  category: 'chartering' | 'hedging' | 'decarbonization' | 'allocation';
  title: string;
  guidance: string;
  rationale: string;
  impactScore: 'High' | 'Medium' | 'Strategic';
  actionableWindow: string;
  metricTarget: string;
}

export interface ExecutiveDossierReport {
  id: string;
  title: string;
  generatedAt: string;
  activeHorizon: string;
  activeFiltersSummary: string;
  kpiSummary: ReportKpiItem[];
  topCorridors: CorridorBarPoint[];
  drillDownSummary?: {
    context: DrillDownContext;
    filteredCount: number;
    avgTce: number;
    totalVolumeMt: number;
    primaryCharterers: string[];
  };
  recommendations: DecisionRecommendation[];
  confidentialityNotice: string;
}
