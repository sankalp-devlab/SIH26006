/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 27: Mobile Frontend Contract & Persistence Verification Test Suite
 * Run with: npx tsx src/services/mobile/mobile-contract.test.ts
 */

// Mock localStorage and window for Node environment
const mockStore: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key: string) => mockStore[key] ?? null,
    setItem: (key: string, val: string) => {
      mockStore[key] = String(val);
    },
    removeItem: (key: string) => {
      delete mockStore[key];
    },
    clear: () => {
      for (const k in mockStore) delete mockStore[k];
    },
    key: (idx: number) => Object.keys(mockStore)[idx] ?? null,
    length: 0,
  } as Storage;
}

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    localStorage: globalThis.localStorage,
    dispatchEvent: () => true,
  };
}

import {
  MobilePositionUpdaterService,
  SEED_MOBILE_NOTES,
  SEED_WATCHLISTS,
} from './mobile-position-updater.service';
import type { MobileVesselPositionUpdate } from '../../types/mobile';

declare const process: { exit: (code: number) => void };

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('----------------------------------------------------');
console.log('RUNNING MODULE 27 MOBILE CONTRACT & VERIFICATION TESTS');
console.log('----------------------------------------------------');

// Test 1: GPS Coordinate Validation
console.log('\n--- 1. GPS Coordinate Boundary Validation ---');
assert(
  MobilePositionUpdaterService.validateCoordinates(1.2902, 103.8519),
  'Valid coordinates for Singapore (1.2902, 103.8519) should pass'
);
assert(
  MobilePositionUpdaterService.validateCoordinates(51.9244, 4.4777),
  'Valid coordinates for Rotterdam (51.9244, 4.4777) should pass'
);
assert(
  MobilePositionUpdaterService.validateCoordinates(-90, -180),
  'Lower boundary coordinates (-90, -180) should pass'
);
assert(
  MobilePositionUpdaterService.validateCoordinates(90, 180),
  'Upper boundary coordinates (90, 180) should pass'
);
assert(
  !MobilePositionUpdaterService.validateCoordinates(90.1, 100),
  'Latitude > 90 (90.1) should fail'
);
assert(
  !MobilePositionUpdaterService.validateCoordinates(-91, 100),
  'Latitude < -90 (-91) should fail'
);
assert(
  !MobilePositionUpdaterService.validateCoordinates(20, 180.5),
  'Longitude > 180 (180.5) should fail'
);
assert(
  !MobilePositionUpdaterService.validateCoordinates(20, -181),
  'Longitude < -180 (-181) should fail'
);
assert(
  !MobilePositionUpdaterService.validateCoordinates(NaN, 50),
  'NaN coordinate should fail'
);

// Test 2: Position Override Persistence
console.log('\n--- 2. Position Override Telemetry Persistence ---');
localStorage.clear();
const testUpdate: MobileVesselPositionUpdate = {
  vesselId: 101,
  vesselName: 'TEST TANKER',
  status: 'underway',
  latitude: 25.1234,
  longitude: 55.4321,
  speedKnots: 13.8,
  heading: 180,
  destinationPort: 'Fujairah',
  eta: '2026-09-18',
  timestamp: new Date().toISOString(),
  updatedBy: 'Test Officer',
};

const saveResult = MobilePositionUpdaterService.savePositionUpdate(testUpdate);
assert(saveResult === true, 'savePositionUpdate should return true on success');

const retrieved = MobilePositionUpdaterService.getVesselPositionUpdate(101);
assert(retrieved !== null, 'getVesselPositionUpdate should retrieve saved record');
assert(retrieved?.vesselName === 'TEST TANKER', 'Retrieved vessel name should match');
assert(retrieved?.latitude === 25.1234, 'Retrieved latitude should match');
assert(retrieved?.speedKnots === 13.8, 'Retrieved speed should match');
assert(retrieved?.status === 'underway', 'Retrieved status should match');

// Test 3: Invalid Update Boundary Exceptions
console.log('\n--- 3. Validation Exceptions ---');
let caughtLatError = false;
try {
  MobilePositionUpdaterService.savePositionUpdate({
    ...testUpdate,
    latitude: 95.0,
  });
} catch {
  caughtLatError = true;
}
assert(caughtLatError, 'savePositionUpdate with latitude 95.0 should throw error');

let caughtHeadingError = false;
try {
  MobilePositionUpdaterService.savePositionUpdate({
    ...testUpdate,
    heading: 420,
  });
} catch {
  caughtHeadingError = true;
}
assert(caughtHeadingError, 'savePositionUpdate with heading 420 should throw error');

// Test 4: Operational Notes Journal
console.log('\n--- 4. Operational Notes Journal ---');
localStorage.clear();
const initialNotes = MobilePositionUpdaterService.getNotes();
assert(
  initialNotes.length >= SEED_MOBILE_NOTES.length,
  'Initial notes should contain seeded records'
);

const newNote = MobilePositionUpdaterService.addNote({
  vesselId: 1,
  vesselName: 'APOLLO GLORY',
  author: 'Chief Mate Singh',
  content: 'Commencing cargo discharge pump run-up.',
  category: 'commercial',
});
assert(Boolean(newNote.id), 'addNote should generate unique ID');
assert(Boolean(newNote.createdAt), 'addNote should populate timestamp');

const vesselNotes = MobilePositionUpdaterService.getVesselNotes(1);
assert(
  vesselNotes.some((n) => n.id === newNote.id),
  'getVesselNotes should contain the newly added note'
);

// Test 5: Watchlist Toggling
console.log('\n--- 5. Custom Watchlist Membership ---');
localStorage.clear();
const lists = MobilePositionUpdaterService.getWatchlists();
assert(lists.length >= SEED_WATCHLISTS.length, 'Initial watchlists should contain seed lists');

const firstList = lists[0];
const testVesselId = 999;

const added = MobilePositionUpdaterService.toggleVesselInWatchlist(firstList.id, testVesselId);
assert(added === true, 'toggleVesselInWatchlist should return true when adding');
assert(
  Boolean(
    MobilePositionUpdaterService.getWatchlists()
      .find((l) => l.id === firstList.id)
      ?.vesselIds.includes(testVesselId)
  ),
  'Watchlist should now include test vessel'
);

const removed = MobilePositionUpdaterService.toggleVesselInWatchlist(firstList.id, testVesselId);
assert(removed === false, 'toggleVesselInWatchlist should return false when removing');
assert(
  !MobilePositionUpdaterService.getWatchlists()
    .find((l) => l.id === firstList.id)
    ?.vesselIds.includes(testVesselId),
  'Watchlist should no longer include test vessel'
);

console.log('\n----------------------------------------------------');
console.log('✅ ALL MODULE 27 MOBILE TESTS PASSED SUCCESSFULLY');
console.log('----------------------------------------------------');
