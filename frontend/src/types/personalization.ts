/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION / USER WORKSPACE — Domain Types & Data Contracts
 *
 * Provides strongly typed contracts for:
 * - Generic Favourites System (vessels, fixtures, ports, routes, queries, reports, instruments)
 * - Saved Vessel Lists / Custom Fleet Pools
 * - User-Specific Object Tagging System
 * - Saved Data Queries & Analytic Configurations
 * - Custom Templates (Report, Analytics, Query, Screening, Voyage Calculator)
 * - Private Cargo Tracking Records (Strictly isolated from global platform datasets)
 * - Workspace Export / Import Payloads
 */

export type WorkspaceEntityType =
  | 'vessel'
  | 'fixture'
  | 'port'
  | 'route'
  | 'query'
  | 'report'
  | 'instrument';

export interface WorkspaceFavouriteItem {
  id: string; // Deterministic or UUID e.g. fav-vessel-9412345
  entityType: WorkspaceEntityType;
  entityId: string;
  title: string;
  subtitle?: string;
  badge?: string;
  path: string; // Navigation target e.g. /vessels/9412345 or /ports/SGSIN
  metadata?: Record<string, any>;
  tags: string[];
  notes?: string;
  pinned: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface SavedVesselList {
  id: string;
  name: string;
  description?: string;
  vesselIds: number[]; // References to vessel master IDs
  vesselCount: number;
  tags: string[];
  color?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface WorkspaceTagAssignment {
  tagId: string;
  entityType: WorkspaceEntityType | 'private_cargo' | 'vessel_list';
  entityId: string;
  assignedAt: string;
}

export interface SavedQueryRecord {
  id: string;
  name: string;
  description?: string;
  dataset: string;
  mode: string;
  queryConfig: Record<string, any>; // Serialized DataQueryConfig
  tags: string[];
  isPinned: boolean;
  shareableUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
}

export type WorkspaceTemplateType =
  | 'report'
  | 'analytics'
  | 'query'
  | 'screening'
  | 'voyage'
  | 'export';

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkspaceTemplateType;
  config: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type CargoTrackingStatus =
  | 'planned'
  | 'in_transit'
  | 'discharging'
  | 'completed'
  | 'cancelled';

export interface PrivateCargoRecord {
  id: string;
  cargoName: string;
  cargoType: string;
  volume: number;
  unit: 'MT' | 'BBL' | 'CBM' | 'TEU';
  originPort: string;
  destinationPort: string;
  associatedVesselId?: number;
  associatedVesselName?: string;
  voyageRef?: string;
  estimatedArrival?: string;
  status: CargoTrackingStatus;
  notes?: string;
  isPrivate: true; // Strict boundary: Never exposed globally
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalWorkspace {
  version: number;
  userId: string;
  userEmail?: string;
  favourites: WorkspaceFavouriteItem[];
  vesselLists: SavedVesselList[];
  tags: WorkspaceTag[];
  tagAssignments: WorkspaceTagAssignment[];
  savedQueries: SavedQueryRecord[];
  templates: WorkspaceTemplate[];
  privateCargo: PrivateCargoRecord[];
  userNotes?: Record<string, string>; // entityId -> private note
  lastSyncedAt: string;
}

export interface WorkspaceExportPayload {
  version: number;
  exportedAt: string;
  schema: 'SIH26006_WORKSPACE_V1';
  data: PersonalWorkspace;
}

export interface WorkspaceFilterState {
  searchQuery: string;
  entityType?: WorkspaceEntityType | 'all';
  selectedTagId?: string;
  pinnedOnly?: boolean;
}
