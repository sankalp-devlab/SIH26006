/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Maritime Waypoints & Geographic Chokepoints Intelligence Domain Types
 */

export type WaypointType = 'CANAL' | 'STRAIT' | 'CAPE' | 'CHOKEPOINT' | 'PASSAGE';

export type WaypointMode = 'tanker' | 'dry' | 'lng' | 'lpg';

export type WaypointCongestionLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type WaypointTimeHorizon = '7d' | '30d' | '90d' | '1y';

export type WaypointsTab = 'overview' | 'activity' | 'trends' | 'congestion' | 'comparison';

export interface WaypointPhysicalConstraints {
  maxDraftMeters: number | null; // null = unrestricted deepwater
  maxBeamMeters: number | null;
  maxLengthMeters: number | null;
  maxAirDraftMeters: number | null;
  transitDurationHours: number;
  nominalDailyCapacity: number;
  locksRequired: boolean;
  tollRequired: boolean;
}

export interface WaypointRelatedPort {
  name: string;
  unlocode: string;
  country: string;
  distanceNm: number;
}

export interface WaypointRelatedRoute {
  code: string;
  name: string;
  corridor: string;
}

export interface WaypointRelatedMarket {
  marketRoutes: string[]; // e.g. ['C3', 'C5', 'TD3']
  primaryCargo: string;
}

export interface WaypointRelatedFlow {
  tradeLaneCodes: string[];
  description: string;
}

export interface MaritimeWaypointRecord {
  id: string; // e.g. 'wp-suez'
  name: string; // e.g. 'Suez Canal'
  type: WaypointType;
  region: string; // e.g. 'Middle East / Red Sea'
  country: string; // e.g. 'Egypt'
  latitude: number;
  longitude: number;
  supportedModes: WaypointMode[];
  primaryVesselClasses: string[];
  physicalConstraints: WaypointPhysicalConstraints;
  strategicContext: string;
  securityRiskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  relatedPorts: WaypointRelatedPort[];
  relatedRoutes: WaypointRelatedRoute[];
  relatedMarkets: WaypointRelatedMarket;
  relatedFlows: WaypointRelatedFlow;
}

export interface WaypointVesselClassActivity {
  vesselClass: string;
  activeVessels: number;
  transits24h: number;
  waitingCount: number;
  avgSpeedKnots: number;
}

export interface WaypointModeShare {
  mode: WaypointMode;
  vesselCount: number;
  percentage: number;
}

export interface WaypointLiveActivity {
  waypointId: string;
  timestamp: string; // ISO 8601
  activeVesselsInZone: number;
  transits24h: number;
  transits7dAvg: number;
  waitingVessels: number;
  medianWaitingHours: number;
  congestionScore: number; // 0 - 100
  congestionLevel: WaypointCongestionLevel;
  vesselClassDistribution: WaypointVesselClassActivity[];
  modeBreakdown: WaypointModeShare[];
  dataFreshnessStatus: 'LIVE_TELEMETRY' | 'AIS_BENCHMARK' | 'HISTORICAL_EXTRAPOLATION';
  lastUpdated: string;
}

export interface WaypointHistoricalObservation {
  timestamp: string; // YYYY-MM-DD
  transitsCount: number;
  waitingCount: number;
  avgWaitHours: number;
  congestionIndex: number; // 0 - 100
  dailyTonnageMt: number;
}

export interface WaypointFiltersState {
  search: string;
  mode: WaypointMode | 'all';
  vesselClass: string | 'all';
  region: string | 'all';
  country: string | 'all';
  waypointType: WaypointType | 'all';
  timeHorizon: WaypointTimeHorizon;
  congestionLevel: WaypointCongestionLevel | 'all';
}

export interface WaypointSummaryMetrics {
  activeChokepointsCount: number;
  totalVesselsInChokepoints: number;
  totalWaitingVessels: number;
  globalCongestionIndex: number; // 0 - 100
  topBottleneckName: string;
  topBottleneckId: string;
  capeDetourVolumePct: number;
  totalTransits24h: number;
  lastUpdated: string;
}

export interface WaypointComparisonMetric {
  waypointId: string;
  name: string;
  type: WaypointType;
  region: string;
  transits24h: number;
  waitingVessels: number;
  avgWaitHours: number;
  congestionScore: number;
  topVesselClass: string;
  maxDraft: number | null;
  transitHours: number;
}

export interface WaypointComparisonResult {
  waypoints: MaritimeWaypointRecord[];
  metrics: WaypointComparisonMetric[];
  generatedAt: string;
}

export interface WaypointPayload {
  waypoints: MaritimeWaypointRecord[];
  activities: Record<string, WaypointLiveActivity>;
  historicalTrends: Record<string, WaypointHistoricalObservation[]>;
  timestamp: string;
}
