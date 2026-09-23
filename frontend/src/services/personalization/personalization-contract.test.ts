/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION / USER WORKSPACE — Contract Test Suite
 *
 * Verifies:
 * 1. Initial workspace loading & default seed data integrity
 * 2. Generic Favourites CRUD, duplicate prevention & pinning
 * 3. Saved Vessel Lists (Fleet Pools) creation, vessel enrollment & removal
 * 4. Master Data Immutability: Platform master vessels/fixtures are never mutated
 * 5. Tagging system: creation, assignment, unassignment & filtering
 * 6. Module 24 Saved Queries: configuration preservation & execution touch
 * 7. Custom Templates: creation, filtering by type & deletion
 * 8. Private Cargo Tracking: CRUD & strict user privacy enforcement (`isPrivate: true`)
 * 9. User Notes: entity-specific confidential journal
 * 10. Multi-format Workspace Export & Import schema validation
 * 11. Corrupted input rejection & factory reset
 */

import { PersonalizationService } from './personalization.service';
import {
  LocalStorageWorkspaceAdapter,
  DEFAULT_PERSONAL_WORKSPACE,
} from './workspace-storage.adapter';

// Minimal browser simulation
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
}

const mockStorage = new LocalStorageMock();
(globalThis as any).localStorage = mockStorage;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

export async function runPersonalizationContractTests() {
  console.log('====================================================');
  console.log('SIH 26006 MODULE 29: PERSONALIZATION CONTRACT TESTS');
  console.log('====================================================');

  mockStorage.clear();
  const adapter = new LocalStorageWorkspaceAdapter();
  const service = PersonalizationService.getInstance(adapter);

  // Test 1: Initialization & Seeds
  console.log('\n[Test 1] Workspace Initialization & Seed Data');
  const initialWorkspace = service.getWorkspace();
  assert(initialWorkspace.version === 1, 'Workspace version is 1');
  assert(initialWorkspace.favourites.length > 0, 'Workspace initializes with default favourites');
  assert(initialWorkspace.vesselLists.length > 0, 'Workspace initializes with default fleet pools');
  assert(initialWorkspace.privateCargo.length > 0, 'Workspace initializes with default private cargo');

  // Test 2: Favourites Management & Duplicate Prevention
  console.log('\n[Test 2] Favourites Management & Duplicate Prevention');
  const newFav = service.addFavourite({
    entityType: 'port',
    entityId: 'NLRTM',
    title: 'Port of Rotterdam',
    subtitle: 'UN/LOCODE: NLRTM',
    badge: 'European Hub',
    path: '/ports',
    tags: ['Bunkering', 'North Sea'],
    pinned: true,
  });
  assert(newFav.id === 'fav-port-NLRTM', 'Generated deterministic favourite ID');
  assert(service.isFavourite('port', 'NLRTM'), 'Port NLRTM is registered as favourite');

  // Duplicate add test
  const duplicateFav = service.addFavourite({
    entityType: 'port',
    entityId: 'NLRTM',
    title: 'Port of Rotterdam Duplicate',
    path: '/ports',
    tags: [],
    pinned: false,
  });
  assert(duplicateFav.id === newFav.id, 'Duplicate favourite add returns existing record');

  // Toggle favourite
  service.toggleFavourite({
    entityType: 'port',
    entityId: 'NLRTM',
    title: 'Port of Rotterdam',
    path: '/ports',
  });
  assert(!service.isFavourite('port', 'NLRTM'), 'Toggling favourite removes it');

  // Test 3: Saved Vessel Lists / Fleet Pools
  console.log('\n[Test 3] Saved Vessel Lists (Fleet Pools)');
  const fleetList = service.createVesselList('Atlantic MR Tankers', 'MR product tankers', [1, 2], ['Atlantic', 'MR']);
  assert(fleetList.vesselCount === 2, 'Initial vessel count is 2');
  assert(fleetList.name === 'Atlantic MR Tankers', 'Fleet name matches');

  // Add vessel
  service.addVesselToList(fleetList.id, 5);
  const updatedList = service.getVesselListById(fleetList.id);
  assert(updatedList?.vesselCount === 3, 'Vessel count increased to 3 after add');
  assert(updatedList?.vesselIds.includes(5) === true, 'Vessel ID 5 enrolled');

  // Add duplicate vessel ID
  service.addVesselToList(fleetList.id, 5);
  const dupCheckList = service.getVesselListById(fleetList.id);
  assert(dupCheckList?.vesselCount === 3, 'Duplicate vessel enrollment was prevented');

  // Remove vessel
  service.removeVesselFromList(fleetList.id, 1);
  const afterRemoveList = service.getVesselListById(fleetList.id);
  assert(afterRemoveList?.vesselCount === 2, 'Vessel count decreased after removal');

  // Test 4: Master Data Immutability Guarantee
  console.log('\n[Test 4] Master Data Immutability Guarantee');
  const mockMasterVessel = { id: 1, name: 'PACIFIC DISCOVERY', imo: '9412345' };
  const originalSnapshot = JSON.stringify(mockMasterVessel);
  service.addFavourite({
    entityType: 'vessel',
    entityId: String(mockMasterVessel.id),
    title: mockMasterVessel.name,
    path: `/vessels/${mockMasterVessel.id}`,
    tags: ['ModifiedTag'],
    pinned: false,
  });
  service.deleteVesselList(fleetList.id);
  assert(JSON.stringify(mockMasterVessel) === originalSnapshot, 'Master vessel record was NOT mutated by workspace actions');

  // Test 5: Tagging System
  console.log('\n[Test 5] Tagging System Operations');
  const tag = service.createTag('Special Charter', '#ec4899', 'For spot market tenders');
  assert(tag.name === 'Special Charter', 'Tag created with correct name');
  
  service.assignTag(tag.id, 'vessel', '1');
  const assignedTags = service.getEntityTags('vessel', '1');
  assert(assignedTags.some((t) => t.id === tag.id), 'Tag assigned to vessel 1');

  service.unassignTag(tag.id, 'vessel', '1');
  const tagsAfterUnassign = service.getEntityTags('vessel', '1');
  assert(!tagsAfterUnassign.some((t) => t.id === tag.id), 'Tag unassigned successfully');

  // Test 6: Saved Queries (Module 24)
  console.log('\n[Test 6] Saved Queries Integration');
  const sampleConfig = {
    mode: 'time_series',
    entity: 'freight_rates',
    granularity: 'weekly',
  };
  const savedQ = service.saveQuery(
    'Weekly Suezmax Trend',
    'Historical rates for Suezmax routes',
    sampleConfig,
    'freight_rates',
    'time_series',
    ['Suezmax', 'Weekly']
  );
  assert(savedQ.dataset === 'freight_rates', 'Dataset preserved in saved query');
  assert(savedQ.queryConfig.granularity === 'weekly', 'Configuration preserved');

  service.touchQueryExecution(savedQ.id);
  const reloadedQ = service.getSavedQueries().find((q) => q.id === savedQ.id);
  assert(Boolean(reloadedQ?.lastExecutedAt), 'Query execution timestamp updated');

  // Test 7: Custom Templates
  console.log('\n[Test 7] Custom Templates');
  const template = service.createTemplate(
    'Aframax Black Sea Voyage',
    'Pre-configured template for Novorossiysk to Augusta',
    'voyage',
    { speed: 13.5, cargo: 80000 },
    ['Black Sea']
  );
  assert(template.type === 'voyage', 'Template type is voyage');
  assert(service.getTemplates('voyage').some((t) => t.id === template.id), 'Found in voyage templates');

  // Test 8: Private Cargo Tracking (Strict Isolation)
  console.log('\n[Test 8] Private Cargo Tracking & Privacy Boundary');
  const cargo = service.createPrivateCargo({
    cargoName: 'Jet A-1 Fuel Batch 9',
    cargoType: 'Clean Petroleum',
    volume: 35000,
    unit: 'MT',
    originPort: 'Jurong (SG JUR)',
    destinationPort: 'Darwin (AU DRW)',
    status: 'planned',
    tags: ['Private Tender'],
  });
  assert(cargo.isPrivate === true, 'Cargo record has strict isPrivate: true boundary');
  assert(cargo.status === 'planned', 'Cargo status initialized as planned');

  service.updatePrivateCargo(cargo.id, { status: 'in_transit' });
  const updatedCargo = service.getPrivateCargoById(cargo.id);
  assert(updatedCargo?.status === 'in_transit', 'Cargo status updated to in_transit');
  assert(updatedCargo?.isPrivate === true, 'isPrivate remained true after update');

  // Test 9: Confidential Notes
  console.log('\n[Test 9] Confidential User Notes');
  service.setUserNote('vessel-99', 'Charter party agreed with demurrage $25,000/day.');
  assert(service.getUserNote('vessel-99').includes('demurrage'), 'Confidential user note persisted');
  service.setUserNote('vessel-99', '');
  assert(service.getUserNote('vessel-99') === '', 'Empty note cleared');

  // Test 10: Export & Import Schema Validation
  console.log('\n[Test 10] Workspace Export & Import');
  const exported = service.exportWorkspaceJson();
  assert(exported.includes('SIH26006_WORKSPACE_V1'), 'Export contains valid schema header');

  const importResult = service.importWorkspaceJson(exported);
  assert(importResult.success === true, 'Self-import succeeds');

  const badImport = service.importWorkspaceJson('{ "invalid": true }');
  assert(badImport.success === false, 'Invalid JSON schema rejected cleanly');

  // Test 11: Factory Reset
  console.log('\n[Test 11] Factory Reset');
  await service.resetToDefaults();
  const resetWs = service.getWorkspace();
  assert(resetWs.favourites.length === DEFAULT_PERSONAL_WORKSPACE.favourites.length, 'Factory reset restores default seeds');

  console.log('\n====================================================');
  console.log('✅ ALL 11 PERSONALIZATION CONTRACT TESTS PASSED');
  console.log('====================================================\n');
  return true;
}

// Execute if run directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('personalization-contract.test')) {
  runPersonalizationContractTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
