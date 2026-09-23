/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Maritime Fleet Intelligence, Deployment & Benchmarking Domain Types
 */

export type FleetVesselClass =
  | 'Capesize'
  | 'Panamax'
  | 'Supramax'
  | 'Handysize'
  | 'VLCC'
  | 'Suezmax'
  | 'Aframax'
  | 'MR Product Tanker'
  | 'LNG Carrier'
  | 'VLGC LPG Carrier';

export type FleetCargoCategory =
  | 'Dry Bulk'
  | 'Crude Oil'
  | 'Clean Petroleum Products'
  | 'LNG Gas'
  | 'LPG Gas'
  | 'Chemicals';

export type FleetDeploymentStatus =
  | 'underway'
  | 'anchored'
  | 'loading'
  | 'discharging'
  | 'in_repair';

export type FleetsTab =
  | 'overview'
  | 'deployment'
  | 'composition'
  | 'regional'
  | 'benchmarking';

export interface FleetDeploymentLocation {
  region: string;
  country: string;
  subArea: string;
  latitude: number;
  longitude: number;
  status: FleetDeploymentStatus;
  destinationPort: string;
  eta: string;
  speedKnots: number;
  heading: number;
}

export interface FleetVesselRecord {
  id: number;
  name: string;
  imoNumber: string;
  vesselClass: FleetVesselClass;
  vesselType: string;
  dwt: number;
  grossTonnage: number;
  yearBuilt: number;
  flag: string;
  ownerId: string;
  ownerName: string;
  ownerCountry: string;
  operatorId: string;
  operatorName: string;
  operatorCountry: string;
  fleetId: string;
  fleetName: string;
  cargoCategory: FleetCargoCategory;
  primaryCommodity: string;
  deployment: FleetDeploymentLocation;
  ciiRating: 'A' | 'B' | 'C' | 'D' | 'E';
  dailyFuelConsumptionMt: number;
}

export interface FleetOwnerEntity {
  id: string;
  name: string;
  country: string;
  headquarters: string;
  vesselCount: number;
  totalDwt: number;
  vesselClasses: FleetVesselClass[];
  primaryOperators: string[];
}

export interface FleetOperatorEntity {
  id: string;
  name: string;
  country: string;
  headquarters: string;
  vesselCount: number;
  totalDwt: number;
  vesselClasses: FleetVesselClass[];
  primaryOwners: string[];
}

export interface FleetSummaryKPIs {
  totalVessels: number;
  totalDwt: number;
  activeOwnersCount: number;
  activeOperatorsCount: number;
  monitoredRegionsCount: number;
  underwayPct: number;
  avgFleetAgeYears: number;
  dominantVesselClass: string;
}

export interface FleetFiltersState {
  search: string;
  ownerId: string | 'all';
  operatorId: string | 'all';
  vesselClass: FleetVesselClass | 'all';
  cargoCategory: FleetCargoCategory | 'all';
  region: string | 'all';
  country: string | 'all';
  deploymentStatus: FleetDeploymentStatus | 'all';
}

export interface RegionalDeploymentRecord {
  region: string;
  vesselCount: number;
  totalDwt: number;
  sharePct: number;
  topVesselClass: string;
  topOperator: string;
  countries: Array<{ country: string; count: number }>;
}

export interface FleetBenchmarkMetrics {
  entityId: string;
  entityName: string;
  entityType: 'owner' | 'operator' | 'fleet' | 'region';
  vesselCount: number;
  totalDwt: number;
  avgDwt: number;
  avgAgeYears: number;
  underwayPct: number;
  dominantVesselClass: string;
  dominantCargoCategory: string;
  classBreakdown: Array<{ vesselClass: string; count: number; pct: number }>;
}

export interface FleetBenchmarkResult {
  entityA: FleetBenchmarkMetrics;
  entityB: FleetBenchmarkMetrics;
  dwtDelta: number;
  vesselDelta: number;
  ageDelta: number;
  generatedAt: string;
}

export interface FleetPayload {
  vessels: FleetVesselRecord[];
  owners: FleetOwnerEntity[];
  operators: FleetOperatorEntity[];
  timestamp: string;
}
