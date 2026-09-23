/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION / USER WORKSPACE — React Hook
 *
 * Provides a reactive, synchronized interface to the PersonalizationService.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  PersonalWorkspace,
  WorkspaceFavouriteItem,
  WorkspaceEntityType,
  SavedVesselList,
  SavedQueryRecord,
  WorkspaceTemplateType,
  PrivateCargoRecord,
} from '../types/personalization';
import {
  personalizationService,
} from '../services/personalization/personalization.service';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<PersonalWorkspace>(() =>
    personalizationService.getWorkspace()
  );

  useEffect(() => {
    const unsubscribe = personalizationService.subscribe((updated) => {
      setWorkspace({ ...updated });
    });
    return unsubscribe;
  }, []);

  // Favourites actions
  const isFavourite = useCallback((entityType: WorkspaceEntityType, entityId: string) => {
    return personalizationService.isFavourite(entityType, entityId);
  }, []);

  const addFavourite = useCallback(
    (item: Omit<WorkspaceFavouriteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      return personalizationService.addFavourite(item);
    },
    []
  );

  const removeFavourite = useCallback((id: string) => {
    personalizationService.removeFavourite(id);
  }, []);

  const toggleFavourite = useCallback(
    (
      item: Omit<WorkspaceFavouriteItem, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'pinned'> & {
        tags?: string[];
        pinned?: boolean;
      }
    ) => {
      return personalizationService.toggleFavourite(item);
    },
    []
  );

  const togglePinFavourite = useCallback((id: string) => {
    personalizationService.togglePinFavourite(id);
  }, []);

  // Vessel list actions
  const createVesselList = useCallback(
    (name: string, description?: string, initialVesselIds?: number[], tags?: string[], color?: string) => {
      return personalizationService.createVesselList(name, description, initialVesselIds, tags, color);
    },
    []
  );

  const updateVesselList = useCallback(
    (id: string, updates: Partial<Omit<SavedVesselList, 'id' | 'createdAt'>>) => {
      return personalizationService.updateVesselList(id, updates);
    },
    []
  );

  const deleteVesselList = useCallback((id: string) => {
    personalizationService.deleteVesselList(id);
  }, []);

  const addVesselToList = useCallback((listId: string, vesselId: number) => {
    personalizationService.addVesselToList(listId, vesselId);
  }, []);

  const removeVesselFromList = useCallback((listId: string, vesselId: number) => {
    personalizationService.removeVesselFromList(listId, vesselId);
  }, []);

  // Tag actions
  const createTag = useCallback((name: string, color?: string, description?: string) => {
    return personalizationService.createTag(name, color, description);
  }, []);

  const deleteTag = useCallback((id: string) => {
    personalizationService.deleteTag(id);
  }, []);

  const assignTag = useCallback(
    (tagId: string, entityType: WorkspaceEntityType | 'private_cargo' | 'vessel_list', entityId: string) => {
      personalizationService.assignTag(tagId, entityType, entityId);
    },
    []
  );

  const unassignTag = useCallback(
    (tagId: string, entityType: WorkspaceEntityType | 'private_cargo' | 'vessel_list', entityId: string) => {
      personalizationService.unassignTag(tagId, entityType, entityId);
    },
    []
  );

  const getEntityTags = useCallback(
    (entityType: WorkspaceEntityType | 'private_cargo' | 'vessel_list', entityId: string) => {
      return personalizationService.getEntityTags(entityType, entityId);
    },
    []
  );

  // Saved query actions
  const saveQuery = useCallback(
    (
      name: string,
      description: string,
      queryConfig: Record<string, any>,
      dataset: string,
      mode: string,
      tags?: string[],
      shareableUrl?: string
    ) => {
      return personalizationService.saveQuery(name, description, queryConfig, dataset, mode, tags, shareableUrl);
    },
    []
  );

  const updateQuery = useCallback(
    (id: string, updates: Partial<Omit<SavedQueryRecord, 'id' | 'createdAt'>>) => {
      return personalizationService.updateQuery(id, updates);
    },
    []
  );

  const deleteQuery = useCallback((id: string) => {
    personalizationService.deleteQuery(id);
  }, []);

  const touchQueryExecution = useCallback((id: string) => {
    personalizationService.touchQueryExecution(id);
  }, []);

  // Templates
  const createTemplate = useCallback(
    (
      name: string,
      description: string,
      type: WorkspaceTemplateType,
      config: Record<string, any>,
      tags?: string[]
    ) => {
      return personalizationService.createTemplate(name, description, type, config, tags);
    },
    []
  );

  const deleteTemplate = useCallback((id: string) => {
    personalizationService.deleteTemplate(id);
  }, []);

  // Private cargo
  const createPrivateCargo = useCallback(
    (cargo: Omit<PrivateCargoRecord, 'id' | 'createdAt' | 'updatedAt' | 'isPrivate'>) => {
      return personalizationService.createPrivateCargo(cargo);
    },
    []
  );

  const updatePrivateCargo = useCallback(
    (id: string, updates: Partial<Omit<PrivateCargoRecord, 'id' | 'createdAt' | 'isPrivate'>>) => {
      return personalizationService.updatePrivateCargo(id, updates);
    },
    []
  );

  const deletePrivateCargo = useCallback((id: string) => {
    personalizationService.deletePrivateCargo(id);
  }, []);

  // User notes
  const getUserNote = useCallback((entityId: string) => {
    return personalizationService.getUserNote(entityId);
  }, []);

  const setUserNote = useCallback((entityId: string, note: string) => {
    personalizationService.setUserNote(entityId, note);
  }, []);

  // Import / Export
  const exportWorkspaceJson = useCallback(() => {
    return personalizationService.exportWorkspaceJson();
  }, []);

  const importWorkspaceJson = useCallback((jsonString: string) => {
    return personalizationService.importWorkspaceJson(jsonString);
  }, []);

  const resetToDefaults = useCallback(() => {
    return personalizationService.resetToDefaults();
  }, []);

  // Quick statistics
  const stats = useMemo(() => {
    return {
      favouritesCount: workspace.favourites.length,
      vesselListsCount: workspace.vesselLists.length,
      tagsCount: workspace.tags.length,
      savedQueriesCount: workspace.savedQueries.length,
      templatesCount: workspace.templates.length,
      privateCargoCount: workspace.privateCargo.length,
      totalAssetsCount:
        workspace.favourites.length +
        workspace.vesselLists.length +
        workspace.savedQueries.length +
        workspace.templates.length +
        workspace.privateCargo.length,
    };
  }, [workspace]);

  return {
    workspace,
    favourites: workspace.favourites,
    vesselLists: workspace.vesselLists,
    tags: workspace.tags,
    tagAssignments: workspace.tagAssignments,
    savedQueries: workspace.savedQueries,
    templates: workspace.templates,
    privateCargo: workspace.privateCargo,
    userNotes: workspace.userNotes || {},
    stats,
    isFavourite,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    togglePinFavourite,
    createVesselList,
    updateVesselList,
    deleteVesselList,
    addVesselToList,
    removeVesselFromList,
    createTag,
    deleteTag,
    assignTag,
    unassignTag,
    getEntityTags,
    saveQuery,
    updateQuery,
    deleteQuery,
    touchQueryExecution,
    createTemplate,
    deleteTemplate,
    createPrivateCargo,
    updatePrivateCargo,
    deletePrivateCargo,
    getUserNote,
    setUserNote,
    exportWorkspaceJson,
    importWorkspaceJson,
    resetToDefaults,
  };
}
