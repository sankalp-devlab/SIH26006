/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION / USER WORKSPACE — Storage Adapter Layer
 *
 * Implements a pluggable storage interface:
 * - Current implementation: LocalStorageWorkspaceAdapter with multi-tab event broadcast
 * - Future capability: Swappable for Authenticated REST / GraphQL Cloud Adapter
 */

import type { PersonalWorkspace } from '../../types/personalization';

export interface IWorkspaceStorageAdapter {
  loadWorkspace(): Promise<PersonalWorkspace>;
  saveWorkspace(workspace: PersonalWorkspace): Promise<void>;
  clearWorkspace(): Promise<void>;
  subscribe(listener: (workspace: PersonalWorkspace) => void): () => void;
}

export const WORKSPACE_STORAGE_KEY = 'sih26006_user_workspace_v1';
export const WORKSPACE_EVENT_NAME = 'sih26006_workspace_changed';

/**
 * Initial Realistic Seed Data for Professional Maritime Workspace
 */
export const DEFAULT_PERSONAL_WORKSPACE: PersonalWorkspace = {
  version: 1,
  userId: 'usr_operator_maritime_01',
  userEmail: 'charterer.desk@maritime26006.org',
  lastSyncedAt: new Date().toISOString(),
  favourites: [
    {
      id: 'fav-vessel-1',
      entityType: 'vessel',
      entityId: '1',
      title: 'PACIFIC DISCOVERY',
      subtitle: 'IMO 9412345 · VLCC · Laden',
      badge: 'Crude Carrier',
      path: '/vessels/1',
      tags: ['Priority', 'Watchlist'],
      notes: 'Monitored for upcoming discharge at Singapore Jurong.',
      pinned: true,
      createdAt: '2026-08-15T09:00:00Z',
      updatedAt: '2026-08-15T09:00:00Z',
    },
    {
      id: 'fav-port-SGSIN',
      entityType: 'port',
      entityId: 'SGSIN',
      title: 'Port of Singapore',
      subtitle: 'UN/LOCODE: SGSIN · Bunker Hub',
      badge: 'Major Hub',
      path: '/ports',
      tags: ['Refueling', 'Asia-Pacific'],
      notes: 'Key bunker and transshipment checkpoint.',
      pinned: true,
      createdAt: '2026-08-20T10:30:00Z',
      updatedAt: '2026-08-20T10:30:00Z',
    },
    {
      id: 'fav-route-me-fe',
      entityType: 'route',
      entityId: 'me-fe',
      title: 'Ras Tanura to Ningbo (VLCC)',
      subtitle: 'TD3C · 6,850 NM · Via Malacca Strait',
      badge: 'Benchmark Corridor',
      path: '/routes',
      tags: ['Crude Corridor'],
      pinned: false,
      createdAt: '2026-08-22T14:15:00Z',
      updatedAt: '2026-08-22T14:15:00Z',
    },
    {
      id: 'fav-fixture-fix-001',
      entityType: 'fixture',
      entityId: 'FIX-2026-089',
      title: 'PACIFIC DISCOVERY Fixture',
      subtitle: 'ME Gulf -> Ningbo · WS 62.5 · Shell',
      badge: 'Reported Clean',
      path: '/fixtures',
      tags: ['Benchmark'],
      pinned: false,
      createdAt: '2026-09-01T11:00:00Z',
      updatedAt: '2026-09-01T11:00:00Z',
    },
  ],
  vesselLists: [
    {
      id: 'list-vlcc-core',
      name: 'VLCC Arabian Gulf Core Pool',
      description: 'Active crude carriers positioned or heading towards AG terminals.',
      vesselIds: [1, 2, 5],
      vesselCount: 3,
      tags: ['Crude', 'Priority Fleet'],
      color: '#38bdf8',
      isPinned: true,
      createdAt: '2026-08-10T08:00:00Z',
      updatedAt: '2026-09-10T12:00:00Z',
    },
    {
      id: 'list-mr-product',
      name: 'Singapore Clean Product Traders',
      description: 'Medium Range product tankers trading gasoil/jet fuel in SE Asia.',
      vesselIds: [3, 4],
      vesselCount: 2,
      tags: ['Clean Tankers'],
      color: '#34d399',
      isPinned: false,
      createdAt: '2026-08-25T11:20:00Z',
      updatedAt: '2026-09-05T09:40:00Z',
    },
  ],
  tags: [
    { id: 'tag-priority', name: 'Priority', color: '#ef4444', description: 'Urgent monitoring or operational priority', createdAt: '2026-08-01T00:00:00Z' },
    { id: 'tag-watchlist', name: 'Watchlist', color: '#f59e0b', description: 'Active fleet watch candidates', createdAt: '2026-08-01T00:00:00Z' },
    { id: 'tag-clean', name: 'Clean Tankers', color: '#34d399', description: 'Refined petroleum products fleet', createdAt: '2026-08-01T00:00:00Z' },
    { id: 'tag-crude', name: 'Crude', color: '#38bdf8', description: 'Crude oil carrier classification', createdAt: '2026-08-01T00:00:00Z' },
    { id: 'tag-charter', name: 'Potential Charter', color: '#818cf8', description: 'Candidate vessels for upcoming tenders', createdAt: '2026-08-01T00:00:00Z' },
  ],
  tagAssignments: [
    { tagId: 'tag-priority', entityType: 'vessel', entityId: '1', assignedAt: '2026-08-15T09:00:00Z' },
    { tagId: 'tag-watchlist', entityType: 'vessel', entityId: '1', assignedAt: '2026-08-15T09:00:00Z' },
    { tagId: 'tag-crude', entityType: 'vessel_list', entityId: 'list-vlcc-core', assignedAt: '2026-08-10T08:00:00Z' },
  ],
  savedQueries: [
    {
      id: 'query-vlcc-spot-tce',
      name: 'VLCC 12-Year Spot TCE Trend',
      description: 'Monthly average spot TCE earnings across VLCC class from 2014 to 2026.',
      dataset: 'freight_rates',
      mode: 'time_series',
      queryConfig: {
        mode: 'time_series',
        entity: 'freight_rates',
        fields: ['date', 'corridorOrRoute', 'vesselClass', 'rateTceUsdPerDay'],
        dimensions: ['vesselClass'],
        metrics: [{ field: 'rateTceUsdPerDay', aggregation: 'AVG', alias: 'Average Spot TCE ($/day)' }],
        transform: 'NONE',
        granularity: 'monthly',
        timeRange: { startDate: '2014-01-01', endDate: '2026-09-01', preset: '2014_PRESENT' },
        filters: [{ id: 'f1', field: 'vesselClass', operator: '=', value: 'VLCC' }],
        pivot: { rowDimension: 'vesselClass', colDimension: 'year', valueMetric: 'rateTceUsdPerDay', aggregation: 'AVG' },
        limit: 100,
      },
      tags: ['Crude', 'Freight Rates'],
      isPinned: true,
      shareableUrl: '/data-query?mode=time_series&entity=freight_rates&granularity=monthly&vesselClass=VLCC',
      createdAt: '2026-08-12T15:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z',
      lastExecutedAt: '2026-09-12T14:30:00Z',
    },
  ],
  templates: [
    {
      id: 'tmpl-voyage-ras-ningbo',
      name: 'Standard Ras Tanura -> Ningbo VLCC Run',
      description: 'Voyage calculator template configured for 270,000 MT crude parcel at 13.5 kts.',
      type: 'voyage',
      config: {
        loadPort: 'Ras Tanura (SA RTT)',
        dischargePort: 'Ningbo (CN NGB)',
        cargoVolume: 270000,
        cargoType: 'Arabian Light Crude',
        speedLaden: 13.5,
        speedBallast: 14.0,
        bunkerPriceVlsfo: 620,
      },
      tags: ['Voyage Calc', 'Crude'],
      createdAt: '2026-08-18T16:00:00Z',
      updatedAt: '2026-08-18T16:00:00Z',
    },
    {
      id: 'tmpl-screening-aframax',
      name: 'Mediterranean Aframax Pre-Screening',
      description: 'Screening criteria for ice-class or vetted Aframax tankers in Black Sea/Med.',
      type: 'screening',
      config: {
        vesselClass: 'Aframax',
        maxAgeYears: 15,
        requiredApprovals: ['SIRE', 'CDI'],
        minDwt: 105000,
      },
      tags: ['Screening'],
      createdAt: '2026-08-28T10:00:00Z',
      updatedAt: '2026-08-28T10:00:00Z',
    },
  ],
  privateCargo: [
    {
      id: 'cargo-priv-001',
      cargoName: 'Murban Crude Parcel #418',
      cargoType: 'Crude Oil',
      volume: 135000,
      unit: 'MT',
      originPort: 'Fujairah (AE FUJ)',
      destinationPort: 'Ulsan (KR USN)',
      associatedVesselId: 1,
      associatedVesselName: 'PACIFIC DISCOVERY',
      voyageRef: 'VYG-2026-084',
      estimatedArrival: '2026-09-24T18:00:00Z',
      status: 'in_transit',
      notes: 'Discharge window confirmed with terminal. Bill of Lading BL-77290.',
      isPrivate: true,
      tags: ['Priority', 'Charter Client A'],
      createdAt: '2026-09-02T08:00:00Z',
      updatedAt: '2026-09-12T11:00:00Z',
    },
    {
      id: 'cargo-priv-002',
      cargoName: 'Low Sulfur Gasoil Batch 12',
      cargoType: 'Clean Petroleum',
      volume: 42000,
      unit: 'MT',
      originPort: 'Singapore (SGSIN)',
      destinationPort: 'Sydney (AU SYD)',
      associatedVesselId: 3,
      associatedVesselName: 'NORDIC BREEZE',
      voyageRef: 'VYG-2026-102',
      estimatedArrival: '2026-10-04T06:00:00Z',
      status: 'planned',
      notes: 'Pending final letter of credit approval.',
      isPrivate: true,
      tags: ['Clean Tankers'],
      createdAt: '2026-09-10T14:30:00Z',
      updatedAt: '2026-09-10T14:30:00Z',
    },
  ],
  userNotes: {
    'vessel-1': 'Operator flagged for drydock inspection scheduled Q4 2026.',
  },
};

export class LocalStorageWorkspaceAdapter implements IWorkspaceStorageAdapter {
  private listeners: Set<(workspace: PersonalWorkspace) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
      window.addEventListener(WORKSPACE_EVENT_NAME, this.handleCustomEvent as EventListener);
    }
  }

  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === WORKSPACE_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        this.notify(parsed);
      } catch {
        // ignore parse error
      }
    }
  };

  private handleCustomEvent = (e: CustomEvent<PersonalWorkspace>) => {
    if (e.detail) {
      this.notify(e.detail);
    }
  };

  private notify(workspace: PersonalWorkspace) {
    this.listeners.forEach((listener) => {
      try {
        listener(workspace);
      } catch (err) {
        console.error('[LocalStorageWorkspaceAdapter] listener error:', err);
      }
    });
  }

  public async loadWorkspace(): Promise<PersonalWorkspace> {
    if (typeof window === 'undefined') {
      return DEFAULT_PERSONAL_WORKSPACE;
    }

    try {
      const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (!raw) {
        // Initialize with default workspace
        await this.saveWorkspace(DEFAULT_PERSONAL_WORKSPACE);
        return DEFAULT_PERSONAL_WORKSPACE;
      }

      const parsed: PersonalWorkspace = JSON.parse(raw);
      // Validate core structure
      if (!parsed || !Array.isArray(parsed.favourites) || !Array.isArray(parsed.vesselLists)) {
        console.warn('[LocalStorageWorkspaceAdapter] Invalid workspace structure. Resetting to defaults.');
        await this.saveWorkspace(DEFAULT_PERSONAL_WORKSPACE);
        return DEFAULT_PERSONAL_WORKSPACE;
      }

      return parsed;
    } catch (err) {
      console.error('[LocalStorageWorkspaceAdapter] Failed to load workspace:', err);
      return DEFAULT_PERSONAL_WORKSPACE;
    }
  }

  public async saveWorkspace(workspace: PersonalWorkspace): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const serialized = JSON.stringify(workspace);
      localStorage.setItem(WORKSPACE_STORAGE_KEY, serialized);

      // Broadcast to current tab components
      window.dispatchEvent(
        new CustomEvent<PersonalWorkspace>(WORKSPACE_EVENT_NAME, {
          detail: workspace,
        })
      );
    } catch (err) {
      console.error('[LocalStorageWorkspaceAdapter] Failed to save workspace:', err);
      throw err;
    }
  }

  public async clearWorkspace(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      await this.saveWorkspace(DEFAULT_PERSONAL_WORKSPACE);
    } catch (err) {
      console.error('[LocalStorageWorkspaceAdapter] Failed to clear workspace:', err);
    }
  }

  public subscribe(listener: (workspace: PersonalWorkspace) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
