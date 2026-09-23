/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 32: DATA SOURCES, PROVENANCE & FRESHNESS ARCHITECTURE
 * Core Domain Types & Contracts
 *
 * Enforces a decoupled, platform-wide taxonomy separating:
 * 1. Data Origin (Where did it come from?)
 * 2. Data Temporal State (Live, Historical, Predicted, Simulated)
 * 3. Freshness Level (Dynamic staleness based on observation timestamp)
 * 4. Privacy Scope (Public, Authenticated, Workspace Private)
 * 5. Derivation Type (Raw, Extracted, Empirical, Scraped, Calculated)
 * 6. Lineage & Multi-Source Synthesis (Inputs and mathematical formulas)
 * 7. Conflict Tracking (When telemetry and commercial reports disagree)
 */

export const DataSourceOrigin = {
  AIS_TERRESTRIAL: 'ais_terrestrial',
  AIS_SATELLITE: 'ais_satellite',
  IOT_TELEMETRY: 'iot_telemetry',
  RADAR_TRACKING: 'radar_tracking',
  EMAIL_PARSER: 'email_parser',
  WHATSAPP_CONNECTOR: 'whatsapp_connector',
  SLACK_CONNECTOR: 'slack_connector',
  TEAMS_CONNECTOR: 'ms_teams_connector',
  MS_TEAMS_CONNECTOR: 'ms_teams_connector',
  FIXTURE_REPORTS: 'fixture_reports',
  BALTIC_EXCHANGE: 'baltic_exchange',
  PORT_LINEUP_AUTHORITY: 'port_lineup_authority',
  PORT_LINEUP_SCRAPER: 'port_lineup_authority',
  SCRAPED_PORT_DATA: 'port_lineup_authority',
  CUSTOMS_MANIFEST: 'customs_manifest',
  MANUAL_USER_INPUT: 'user_manual_input',
  USER_MANUAL_INPUT: 'user_manual_input',
  USER_WORKSPACE_PRIVATE: 'user_workspace_private',
  IMO_GISIS: 'imo_gisis',
  CLASS_SOCIETY: 'class_society',
  PUBLIC_MARITIME_REGISTRY: 'class_society',
  SANCTIONS_LIST_OFAC: 'sanctions_list_ofac',
  CALCULATED_ANALYTICS: 'calculated_analytics',
  PREDICTIVE_MODEL: 'predictive_model',
  CANONICAL_BENCHMARK: 'canonical_benchmark',
} as const;

export type DataSourceOrigin =
  | (typeof DataSourceOrigin)[keyof typeof DataSourceOrigin]
  | 'ais_terrestrial'
  | 'ais_satellite'
  | 'iot_telemetry'
  | 'radar_tracking'
  | 'email_parser'
  | 'whatsapp_connector'
  | 'slack_connector'
  | 'ms_teams_connector'
  | 'fixture_reports'
  | 'baltic_exchange'
  | 'port_lineup_authority'
  | 'customs_manifest'
  | 'user_manual_input'
  | 'user_workspace_private'
  | 'imo_gisis'
  | 'class_society'
  | 'sanctions_list_ofac'
  | 'calculated_analytics'
  | 'predictive_model'
  | 'canonical_benchmark';

/**
 * Macro temporal state of the observation
 */
export const DataTemporalState = {
  LIVE: 'live',
  HISTORICAL: 'historical',
  PREDICTED: 'predicted',
  SIMULATED: 'simulated',
} as const;

export type DataTemporalState =
  | (typeof DataTemporalState)[keyof typeof DataTemporalState]
  | 'live'
  | 'historical'
  | 'predicted'
  | 'simulated';

/**
 * Computed freshness classification dynamically derived from observation age
 */
export const DataFreshnessLevel = {
  LIVE: 'LIVE',
  RECENT: 'RECENT',
  STALE: 'STALE',
  HISTORICAL: 'HISTORICAL',
  PREDICTED: 'PREDICTED',
  UNKNOWN: 'UNKNOWN',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type DataFreshnessLevel =
  | (typeof DataFreshnessLevel)[keyof typeof DataFreshnessLevel]
  | 'LIVE'
  | 'RECENT'
  | 'STALE'
  | 'HISTORICAL'
  | 'PREDICTED'
  | 'UNKNOWN'
  | 'UNAVAILABLE';

/**
 * Tenancy and privacy boundary
 */
export const DataPrivacyScope = {
  PUBLIC: 'public',
  AUTHENTICATED_PLATFORM: 'authenticated_platform',
  WORKSPACE_PRIVATE: 'workspace_private',
} as const;

export type DataPrivacyScope =
  | (typeof DataPrivacyScope)[keyof typeof DataPrivacyScope]
  | 'public'
  | 'authenticated_platform'
  | 'workspace_private';

/**
 * Degree of algorithmic or physical derivation
 */
export const DataDerivationType = {
  RAW_SENSOR: 'raw_sensor',
  UNSTRUCTURED_EXTRACTED: 'unstructured_extracted',
  CURATED_EMPIRICAL: 'curated_empirical',
  SCRAPED_FEED: 'scraped_feed',
  CALCULATED_FORMULA: 'calculated_formula',
  MACHINE_LEARNING_FORECAST: 'machine_learning_forecast',
} as const;

export type DataDerivationType =
  | (typeof DataDerivationType)[keyof typeof DataDerivationType]
  | 'raw_sensor'
  | 'unstructured_extracted'
  | 'curated_empirical'
  | 'scraped_feed'
  | 'calculated_formula'
  | 'machine_learning_forecast';

/**
 * Lineage input record for multi-source composite metrics (e.g. Voyage TCE)
 */
export interface DataLineageInput {
  field: string;
  label: string;
  sourceOrigin: DataSourceOrigin;
  observedAt?: string;
  contributingValue?: string | number;
}

/**
 * Mathematical or composite lineage documentation
 */
export interface DataLineage {
  targetMetric: string;
  formulaName: string;
  formulaDescription: string;
  inputs: DataLineageInput[];
}

/**
 * Details for conflicting telemetry vs reported figures
 */
export interface DataConflictSource {
  origin: DataSourceOrigin;
  value: string | number;
  observedAt: string;
  confidence?: number;
  label: string;
}

export interface DataConflictInfo {
  hasConflict: boolean;
  primaryValue: string | number;
  conflictingSources: DataConflictSource[];
  resolutionStrategy: 'primary_source_precedence' | 'latest_timestamp' | 'user_manual_override';
  warningMessage?: string;
}

/**
 * Primary Provenance Envelope attached to entities, records, and metrics
 */
export interface DataProvenance {
  origin: DataSourceOrigin;
  originLabel: string;
  state: DataTemporalState;
  freshness: DataFreshnessLevel;
  privacy: DataPrivacyScope;
  derivation: DataDerivationType;
  observedAt: string; // ISO 8601 UTC
  receivedAt?: string; // ISO 8601 UTC
  ageSeconds?: number;
  ageHumanized?: string;
  confidenceScore?: number; // 0.0 - 1.0 (empirical only)
  isPlannedConnector?: boolean; // For WhatsApp / Slack / Teams connectors
  lineage?: DataLineage;
  conflict?: DataConflictInfo;
  metadataNotes?: string;
}

/**
 * Freshness threshold specification for domain entities
 */
export interface DomainFreshnessThresholds {
  liveSecondsMax: number;
  recentSecondsMax: number;
  staleSecondsThreshold: number;
}
