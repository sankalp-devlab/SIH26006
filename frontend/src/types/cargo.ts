/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 9: Cargo List & Operational Logistics Types
 */

export interface PortRef {
  id: number;
  name: string;
  country: string;
  unlocode?: string;
  latitude: number;
  longitude: number;
}

export type CargoSource = 'email' | 'whatsapp' | 'slack' | 'manual' | 'api' | 'edi';

export type CargoStatus =
  | 'draft'
  | 'validated'
  | 'matched'
  | 'planned'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'archived';

export type CargoPriority = 'low' | 'standard' | 'high' | 'urgent';

export type CargoZone =
  | 'Zone A - Arabian Gulf'
  | 'Zone B - Bay of Bengal'
  | 'Zone C - Far East'
  | 'Zone D - Med & Europe'
  | 'Zone E - Atlantic & Americas';

export type ValidationStatus = 'valid' | 'warning' | 'incomplete' | 'invalid';

export interface ValidationIssue {
  id: string;
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface VesselMatchInfo {
  vessel_id: number;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  capacity_dwt: number;
  match_score: number; // 0 - 100
  capacity_match_percent: number;
  route_match_percent: number;
  timing_match_percent: number;
  eta: string;
  status: 'suggested' | 'confirmed';
}

export interface DuplicateClusterInfo {
  cluster_id: string;
  similarity_score: number; // 0 - 100
  primary_id: number;
  candidate_ids: number[];
  matching_signals: string[];
  reason: string;
}

export interface CargoLifecycleStage {
  stage: 'created' | 'validated' | 'matched' | 'planned' | 'in_transit' | 'delivered';
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  location?: string;
  description: string;
}

export interface CargoActivityItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  note: string;
}

/**
 * Base database representation matching Supabase cargo table
 */
export interface Cargo {
  id: number;
  cargo_type: string;
  description: string | null;
  weight_tons: number;
  volume_m3: number | null;
  origin_port_id: number | null;
  destination_port_id: number | null;
  created_at: string | null;
}

/**
 * Full operational workspace cargo consignment model
 */
export interface CargoRecord extends Cargo {
  reference_number: string;
  source: CargoSource;
  source_message_id?: string;
  source_sender?: string;
  shipper: string;
  consignee: string;
  commodity: string;
  quantity: number;
  unit: string;
  origin_port: PortRef;
  destination_port: PortRef;
  pickup_location?: string;
  delivery_location?: string;
  ready_date: string; // ISO 8601
  deadline: string; // Laycan end (ISO 8601)
  status: CargoStatus;
  priority: CargoPriority;
  zone: CargoZone;
  is_private: boolean;
  matched_vessel?: VesselMatchInfo | null;
  confidence_score: number; // 0 - 100
  duplicate_group_id?: string | null;
  duplicate_cluster?: DuplicateClusterInfo | null;
  validation_status: ValidationStatus;
  validation_issues: ValidationIssue[];
  lifecycle_stages: CargoLifecycleStage[];
  activity_log: CargoActivityItem[];
  updated_at: string;
  provenance?: import('./provenance').DataProvenance;
}

export interface CreateCargoPayload {
  cargo_type: string;
  description?: string | null;
  weight_tons: number;
  volume_m3?: number | null;
  origin_port_id?: number | null;
  destination_port_id?: number | null;
  // Optional extended attributes
  reference_number?: string;
  source?: CargoSource;
  shipper?: string;
  consignee?: string;
  commodity?: string;
  quantity?: number;
  unit?: string;
  ready_date?: string;
  deadline?: string;
  priority?: CargoPriority;
  zone?: CargoZone;
  is_private?: boolean;
}

export interface CargoFiltersState {
  searchQuery: string;
  source: string; // 'all' or specific CargoSource
  status: string; // 'all' or specific CargoStatus
  priority: string; // 'all' or specific CargoPriority
  zone: string; // 'all' or specific CargoZone
  cargoType: string; // 'all' or specific cargo_type
  validationStatus: string; // 'all' or specific ValidationStatus
  vesselMatchStatus: 'all' | 'matched' | 'unmatched';
  scope: 'all' | 'public' | 'private';
  showArchived: boolean;
}

export interface CargoAnalyticsSummary {
  totalCount: number;
  activeCount: number;
  archivedCount: number;
  totalWeightMT: number;
  validatedCount: number;
  needsValidationCount: number;
  matchedCount: number;
  unmatchedCount: number;
  matchRatePercent: number;
  duplicateClustersCount: number;
  urgentLaycanCount: number;
  privateCount: number;
}
