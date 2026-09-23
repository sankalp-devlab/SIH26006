/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION / USER WORKSPACE — Core Service
 *
 * Professional state and business logic layer for user personalization:
 * - Deterministic operations, optimistic memory cache, and asynchronous persistence
 * - Zero mutation of global platform master records
 * - Complete CRUD across Favourites, Lists, Tags, Saved Queries, Templates, Private Cargo
 * - Cross-tab synchronization via storage adapter events
 * - Import/Export schema validation
 */

import type {
  PersonalWorkspace,
  WorkspaceFavouriteItem,
  WorkspaceEntityType,
  SavedVesselList,
  WorkspaceTag,
  WorkspaceTagAssignment,
  SavedQueryRecord,
  WorkspaceTemplate,
  WorkspaceTemplateType,
  PrivateCargoRecord,
  WorkspaceExportPayload,
} from '../../types/personalization';
import {
  LocalStorageWorkspaceAdapter,
  DEFAULT_PERSONAL_WORKSPACE,
  type IWorkspaceStorageAdapter,
} from './workspace-storage.adapter';

export class PersonalizationService {
  private static instance: PersonalizationService;
  private adapter: IWorkspaceStorageAdapter;
  private currentWorkspace: PersonalWorkspace = DEFAULT_PERSONAL_WORKSPACE;
  private isInitialized = false;
  private listeners: Set<(workspace: PersonalWorkspace) => void> = new Set();

  private constructor(adapter?: IWorkspaceStorageAdapter) {
    this.adapter = adapter || new LocalStorageWorkspaceAdapter();
    this.init();
  }

  public static getInstance(adapter?: IWorkspaceStorageAdapter): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService(adapter);
    }
    return PersonalizationService.instance;
  }

  private async init() {
    try {
      this.currentWorkspace = await this.adapter.loadWorkspace();
      this.isInitialized = true;
      this.notify();
    } catch (err) {
      console.error('[PersonalizationService] Failed to initialize:', err);
    }

    // Subscribe to external storage changes (e.g. other tabs)
    this.adapter.subscribe((updatedWorkspace) => {
      this.currentWorkspace = updatedWorkspace;
      this.notify();
    });
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l(this.currentWorkspace);
      } catch (err) {
        console.error('[PersonalizationService] Listener error:', err);
      }
    });
  }

  private async persist() {
    this.currentWorkspace.lastSyncedAt = new Date().toISOString();
    try {
      await this.adapter.saveWorkspace(this.currentWorkspace);
      this.notify();
    } catch (err) {
      console.error('[PersonalizationService] Failed to persist workspace:', err);
    }
  }

  public subscribe(listener: (workspace: PersonalWorkspace) => void): () => void {
    this.listeners.add(listener);
    // Send current workspace immediately
    if (this.isInitialized) {
      listener(this.currentWorkspace);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getWorkspace(): PersonalWorkspace {
    return this.currentWorkspace;
  }

  // ==========================================
  // FAVOURITES MANAGEMENT
  // ==========================================

  public getFavourites(filterType?: WorkspaceEntityType): WorkspaceFavouriteItem[] {
    if (!filterType || filterType === ('all' as any)) {
      return [...this.currentWorkspace.favourites];
    }
    return this.currentWorkspace.favourites.filter((f) => f.entityType === filterType);
  }

  public isFavourite(entityType: WorkspaceEntityType, entityId: string): boolean {
    return this.currentWorkspace.favourites.some(
      (f) => f.entityType === entityType && String(f.entityId) === String(entityId)
    );
  }

  public addFavourite(
    item: Omit<WorkspaceFavouriteItem, 'id' | 'createdAt' | 'updatedAt'>
  ): WorkspaceFavouriteItem {
    const existing = this.currentWorkspace.favourites.find(
      (f) => f.entityType === item.entityType && String(f.entityId) === String(item.entityId)
    );
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const newFav: WorkspaceFavouriteItem = {
      ...item,
      id: `fav-${item.entityType}-${item.entityId}`,
      createdAt: now,
      updatedAt: now,
    };

    this.currentWorkspace.favourites = [newFav, ...this.currentWorkspace.favourites];
    this.persist();
    return newFav;
  }

  public removeFavourite(id: string): void {
    this.currentWorkspace.favourites = this.currentWorkspace.favourites.filter((f) => f.id !== id);
    this.persist();
  }

  public removeFavouriteByEntity(entityType: WorkspaceEntityType, entityId: string): void {
    this.currentWorkspace.favourites = this.currentWorkspace.favourites.filter(
      (f) => !(f.entityType === entityType && String(f.entityId) === String(entityId))
    );
    this.persist();
  }

  public toggleFavourite(
    item: Omit<WorkspaceFavouriteItem, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'pinned'> & {
      tags?: string[];
      pinned?: boolean;
    }
  ): WorkspaceFavouriteItem | null {
    if (this.isFavourite(item.entityType, item.entityId)) {
      this.removeFavouriteByEntity(item.entityType, item.entityId);
      return null;
    } else {
      return this.addFavourite({
        ...item,
        tags: item.tags || [],
        pinned: item.pinned || false,
      });
    }
  }

  public togglePinFavourite(id: string): void {
    const fav = this.currentWorkspace.favourites.find((f) => f.id === id);
    if (fav) {
      fav.pinned = !fav.pinned;
      fav.updatedAt = new Date().toISOString();
      this.persist();
    }
  }

  // ==========================================
  // SAVED VESSEL LISTS (FLEET POOLS)
  // ==========================================

  public getVesselLists(): SavedVesselList[] {
    return [...this.currentWorkspace.vesselLists];
  }

  public getVesselListById(id: string): SavedVesselList | undefined {
    return this.currentWorkspace.vesselLists.find((l) => l.id === id);
  }

  public createVesselList(
    name: string,
    description?: string,
    initialVesselIds: number[] = [],
    tags: string[] = [],
    color: string = '#38bdf8'
  ): SavedVesselList {
    const now = new Date().toISOString();
    const uniqueVesselIds = Array.from(new Set(initialVesselIds));
    const newList: SavedVesselList = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      description: description?.trim(),
      vesselIds: uniqueVesselIds,
      vesselCount: uniqueVesselIds.length,
      tags,
      color,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    this.currentWorkspace.vesselLists = [newList, ...this.currentWorkspace.vesselLists];
    this.persist();
    return newList;
  }

  public updateVesselList(
    id: string,
    updates: Partial<Omit<SavedVesselList, 'id' | 'createdAt'>>
  ): SavedVesselList {
    const listIndex = this.currentWorkspace.vesselLists.findIndex((l) => l.id === id);
    if (listIndex === -1) {
      throw new Error(`Vessel list with ID ${id} not found`);
    }

    const current = this.currentWorkspace.vesselLists[listIndex];
    let vesselIds = updates.vesselIds ? Array.from(new Set(updates.vesselIds)) : current.vesselIds;

    const updated: SavedVesselList = {
      ...current,
      ...updates,
      vesselIds,
      vesselCount: vesselIds.length,
      updatedAt: new Date().toISOString(),
    };

    this.currentWorkspace.vesselLists[listIndex] = updated;
    this.persist();
    return updated;
  }

  public deleteVesselList(id: string): void {
    this.currentWorkspace.vesselLists = this.currentWorkspace.vesselLists.filter((l) => l.id !== id);
    // Also unassign tags for this list
    this.currentWorkspace.tagAssignments = this.currentWorkspace.tagAssignments.filter(
      (a) => !(a.entityType === 'vessel_list' && a.entityId === id)
    );
    this.persist();
  }

  public addVesselToList(listId: string, vesselId: number): void {
    const list = this.getVesselListById(listId);
    if (!list) return;

    if (!list.vesselIds.includes(vesselId)) {
      this.updateVesselList(listId, {
        vesselIds: [...list.vesselIds, vesselId],
      });
    }
  }

  public removeVesselFromList(listId: string, vesselId: number): void {
    const list = this.getVesselListById(listId);
    if (!list) return;

    this.updateVesselList(listId, {
      vesselIds: list.vesselIds.filter((id) => id !== vesselId),
    });
  }

  // ==========================================
  // TAGGING SYSTEM
  // ==========================================

  public getTags(): WorkspaceTag[] {
    return [...this.currentWorkspace.tags];
  }

  public createTag(name: string, color: string = '#38bdf8', description?: string): WorkspaceTag {
    const cleanName = name.trim();
    const existing = this.currentWorkspace.tags.find(
      (t) => t.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    const newTag: WorkspaceTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      color,
      description: description?.trim(),
      createdAt: new Date().toISOString(),
    };

    this.currentWorkspace.tags = [...this.currentWorkspace.tags, newTag];
    this.persist();
    return newTag;
  }

  public deleteTag(id: string): void {
    this.currentWorkspace.tags = this.currentWorkspace.tags.filter((t) => t.id !== id);
    this.currentWorkspace.tagAssignments = this.currentWorkspace.tagAssignments.filter(
      (a) => a.tagId !== id
    );
    this.persist();
  }

  public assignTag(
    tagId: string,
    entityType: WorkspaceEntityType | 'private_cargo' | 'vessel_list',
    entityId: string
  ): void {
    const exists = this.currentWorkspace.tagAssignments.some(
      (a) => a.tagId === tagId && a.entityType === entityType && a.entityId === String(entityId)
    );
    if (exists) return;

    const assignment: WorkspaceTagAssignment = {
      tagId,
      entityType,
      entityId: String(entityId),
      assignedAt: new Date().toISOString(),
    };

    this.currentWorkspace.tagAssignments = [...this.currentWorkspace.tagAssignments, assignment];
    this.persist();
  }

  public unassignTag(
    tagId: string,
    entityType: WorkspaceEntityType | 'private_cargo' | 'vessel_list',
    entityId: string
  ): void {
    this.currentWorkspace.tagAssignments = this.currentWorkspace.tagAssignments.filter(
      (a) => !(a.tagId === tagId && a.entityType === entityType && a.entityId === String(entityId))
    );
    this.persist();
  }

  public getEntityTags(
    entityType: WorkspaceEntityType | 'private_cargo' | 'vessel_list',
    entityId: string
  ): WorkspaceTag[] {
    const assignedTagIds = this.currentWorkspace.tagAssignments
      .filter((a) => a.entityType === entityType && a.entityId === String(entityId))
      .map((a) => a.tagId);

    return this.currentWorkspace.tags.filter((t) => assignedTagIds.includes(t.id));
  }

  public getEntitiesByTag(tagId: string): WorkspaceTagAssignment[] {
    return this.currentWorkspace.tagAssignments.filter((a) => a.tagId === tagId);
  }

  // ==========================================
  // SAVED QUERIES (MODULE 24 INTEGRATION)
  // ==========================================

  public getSavedQueries(): SavedQueryRecord[] {
    return [...this.currentWorkspace.savedQueries];
  }

  public saveQuery(
    name: string,
    description: string,
    queryConfig: Record<string, any>,
    dataset: string,
    mode: string,
    tags: string[] = [],
    shareableUrl?: string
  ): SavedQueryRecord {
    const now = new Date().toISOString();
    const newQuery: SavedQueryRecord = {
      id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      description: description?.trim(),
      queryConfig,
      dataset,
      mode,
      tags,
      isPinned: false,
      shareableUrl,
      createdAt: now,
      updatedAt: now,
      lastExecutedAt: now,
    };

    this.currentWorkspace.savedQueries = [newQuery, ...this.currentWorkspace.savedQueries];
    this.persist();
    return newQuery;
  }

  public updateQuery(
    id: string,
    updates: Partial<Omit<SavedQueryRecord, 'id' | 'createdAt'>>
  ): SavedQueryRecord {
    const idx = this.currentWorkspace.savedQueries.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error(`Saved query ${id} not found`);

    const updated = {
      ...this.currentWorkspace.savedQueries[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.currentWorkspace.savedQueries[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteQuery(id: string): void {
    this.currentWorkspace.savedQueries = this.currentWorkspace.savedQueries.filter((q) => q.id !== id);
    this.persist();
  }

  public touchQueryExecution(id: string): void {
    const q = this.currentWorkspace.savedQueries.find((item) => item.id === id);
    if (q) {
      q.lastExecutedAt = new Date().toISOString();
      this.persist();
    }
  }

  // ==========================================
  // CUSTOM TEMPLATES
  // ==========================================

  public getTemplates(type?: WorkspaceTemplateType): WorkspaceTemplate[] {
    if (!type) return [...this.currentWorkspace.templates];
    return this.currentWorkspace.templates.filter((t) => t.type === type);
  }

  public createTemplate(
    name: string,
    description: string,
    type: WorkspaceTemplateType,
    config: Record<string, any>,
    tags: string[] = []
  ): WorkspaceTemplate {
    const now = new Date().toISOString();
    const newTmpl: WorkspaceTemplate = {
      id: `tmpl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      description: description.trim(),
      type,
      config,
      tags,
      createdAt: now,
      updatedAt: now,
    };

    this.currentWorkspace.templates = [newTmpl, ...this.currentWorkspace.templates];
    this.persist();
    return newTmpl;
  }

  public deleteTemplate(id: string): void {
    this.currentWorkspace.templates = this.currentWorkspace.templates.filter((t) => t.id !== id);
    this.persist();
  }

  // ==========================================
  // PRIVATE CARGO TRACKING (STRICT PRIVACY)
  // ==========================================

  public getPrivateCargoList(): PrivateCargoRecord[] {
    return [...this.currentWorkspace.privateCargo];
  }

  public getPrivateCargoById(id: string): PrivateCargoRecord | undefined {
    return this.currentWorkspace.privateCargo.find((c) => c.id === id);
  }

  public createPrivateCargo(
    cargo: Omit<PrivateCargoRecord, 'id' | 'createdAt' | 'updatedAt' | 'isPrivate'>
  ): PrivateCargoRecord {
    const now = new Date().toISOString();
    const newCargo: PrivateCargoRecord = {
      ...cargo,
      id: `cargo-priv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isPrivate: true, // Guarantees strict user workspace isolation
      createdAt: now,
      updatedAt: now,
    };

    this.currentWorkspace.privateCargo = [newCargo, ...this.currentWorkspace.privateCargo];
    this.persist();
    return newCargo;
  }

  public updatePrivateCargo(
    id: string,
    updates: Partial<Omit<PrivateCargoRecord, 'id' | 'createdAt' | 'isPrivate'>>
  ): PrivateCargoRecord {
    const idx = this.currentWorkspace.privateCargo.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Private cargo with ID ${id} not found`);

    const updated: PrivateCargoRecord = {
      ...this.currentWorkspace.privateCargo[idx],
      ...updates,
      isPrivate: true, // Ensure privacy cannot be overwritten
      updatedAt: new Date().toISOString(),
    };

    this.currentWorkspace.privateCargo[idx] = updated;
    this.persist();
    return updated;
  }

  public deletePrivateCargo(id: string): void {
    this.currentWorkspace.privateCargo = this.currentWorkspace.privateCargo.filter((c) => c.id !== id);
    this.persist();
  }

  // ==========================================
  // PRIVATE NOTES PER ENTITY
  // ==========================================

  public getUserNote(entityId: string): string {
    return this.currentWorkspace.userNotes?.[entityId] || '';
  }

  public setUserNote(entityId: string, note: string): void {
    if (!this.currentWorkspace.userNotes) {
      this.currentWorkspace.userNotes = {};
    }
    if (!note.trim()) {
      delete this.currentWorkspace.userNotes[entityId];
    } else {
      this.currentWorkspace.userNotes[entityId] = note.trim();
    }
    this.persist();
  }

  // ==========================================
  // EXPORT / IMPORT & RESET
  // ==========================================

  public exportWorkspaceJson(): string {
    const payload: WorkspaceExportPayload = {
      version: this.currentWorkspace.version,
      exportedAt: new Date().toISOString(),
      schema: 'SIH26006_WORKSPACE_V1',
      data: this.currentWorkspace,
    };
    return JSON.stringify(payload, null, 2);
  }

  public importWorkspaceJson(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || parsed.schema !== 'SIH26006_WORKSPACE_V1' || !parsed.data) {
        return {
          success: false,
          error: 'Invalid schema format. Expected SIH26006_WORKSPACE_V1 container.',
        };
      }

      const importedData: PersonalWorkspace = parsed.data;
      if (
        !Array.isArray(importedData.favourites) ||
        !Array.isArray(importedData.vesselLists) ||
        !Array.isArray(importedData.tags)
      ) {
        return {
          success: false,
          error: 'Corrupted workspace data structure.',
        };
      }

      // Preserve existing user ID if present, but import records
      this.currentWorkspace = {
        ...importedData,
        userId: this.currentWorkspace.userId || importedData.userId,
        lastSyncedAt: new Date().toISOString(),
      };

      this.persist();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `JSON parse failed: ${err?.message || 'Unknown error'}`,
      };
    }
  }

  public async resetToDefaults(): Promise<void> {
    await this.adapter.clearWorkspace();
    this.currentWorkspace = { ...DEFAULT_PERSONAL_WORKSPACE, lastSyncedAt: new Date().toISOString() };
    this.notify();
  }
}

export const personalizationService = PersonalizationService.getInstance();
