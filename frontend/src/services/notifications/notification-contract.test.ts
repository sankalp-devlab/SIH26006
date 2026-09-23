/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: Notifications Contract Test Suite
 *
 * Verifies:
 * 1. ON SUBS lifecycle notification generation
 * 2. FULLY FIXED lifecycle notification generation
 * 3. FAILED lifecycle notification generation (with failure reason preservation)
 * 4. Unread count computation
 * 5. Mark as read behavior (non-mutating for underlying objects)
 * 6. Mark all as read behavior
 * 7. Storage persistence across save/load cycles
 * 8. Desktop navigation route derivation (/fixtures?fixtureId=...)
 * 9. Mobile navigation route derivation (/m/fixtures?fixtureId=...)
 * 10. Missing / deleted affected object handling
 * 11. Invalid notification payload validation
 */

import { NotificationService } from './notification.service';
import type { MaritimeNotification } from '../../types/notification';
import type { FixtureRecord } from '../../types/fixture';

// Setup minimal browser simulation for Node/TSX execution
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

// Helper assertion function
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

// Mock Fixture data
const mockFixture: FixtureRecord = {
  id: 'FIX-TEST-999',
  fixture_reference: 'FIX-2026-TEST',
  fixture_date: '2026-09-13T10:00:00Z',
  vessel_id: 101,
  vessel_name: 'TEST OCEANIC',
  vessel_type: 'Tanker',
  vessel_imo: 'IMO 9876543',
  vessel_dwt: 150000,
  charterer: 'Glencore Energy',
  commodity: 'Crude Oil',
  cargo_type: 'Liquid Bulk',
  quantity_tons: 130000,
  rate_type: 'worldscale',
  rate_value: 68.5,
  rate_formatted: 'WS 68.5',
  rate_currency: 'USD',
  charter_party_form: 'SHELLTIME 4',
  status: 'draft',
  is_historical: false,
  laycan_start: '2026-09-20',
  laycan_end: '2026-09-25',
  ports: [],
  notes: 'Contract test fixture',
  history: [],
  created_at: '2026-09-13T10:00:00Z',
  updated_at: '2026-09-13T10:00:00Z',
  created_by: 'TestRunner',
  last_updated_by: 'TestRunner',
};

async function runNotificationContractTests() {
  console.log('====================================================');
  console.log('RUNNING MODULE 28 NOTIFICATION CONTRACT TEST SUITE');
  console.log('====================================================\n');

  mockStorage.clear();

  // Test 1: ON SUBS notification
  console.log('[Test 1] ON SUBS Notification Generation');
  const onSubsNotif = NotificationService.createFixtureLifecycleNotification(
    mockFixture,
    'on_subjects'
  );
  assert(onSubsNotif.category === 'fixture_lifecycle', 'Category is fixture_lifecycle');
  assert(onSubsNotif.severity === 'warning', 'ON SUBS severity is warning');
  assert(onSubsNotif.metadata?.toStatus === 'on_subjects', 'Metadata contains toStatus on_subjects');
  assert(onSubsNotif.title.includes('On Subjects'), 'Title reflects on subjects status');
  assert(onSubsNotif.provenance === 'live', 'Provenance is live');

  // Test 2: FULLY FIXED notification
  console.log('\n[Test 2] FULLY FIXED Notification Generation');
  const fixedNotif = NotificationService.createFixtureLifecycleNotification(
    mockFixture,
    'fully_fixed'
  );
  assert(fixedNotif.category === 'fixture_lifecycle', 'Category is fixture_lifecycle');
  assert(fixedNotif.severity === 'success', 'FULLY FIXED severity is success');
  assert(fixedNotif.metadata?.toStatus === 'fully_fixed', 'Metadata contains toStatus fully_fixed');
  assert(fixedNotif.title.includes('Fully Fixed'), 'Title reflects fully fixed status');
  assert(fixedNotif.message.includes('subjects lifted'), 'Message highlights subjects lifted');

  // Test 3: FAILED notification with preserved failure reason
  console.log('\n[Test 3] FAILED Notification Generation & Reason Preservation');
  const failedReason = 'Stem delayed at terminal berth 2';
  const failedNotif = NotificationService.createFixtureLifecycleNotification(
    mockFixture,
    'failed',
    failedReason
  );
  assert(failedNotif.category === 'fixture_lifecycle', 'Category is fixture_lifecycle');
  assert(failedNotif.severity === 'danger', 'FAILED severity is danger');
  assert(failedNotif.metadata?.toStatus === 'failed', 'Metadata contains toStatus failed');
  assert(failedNotif.metadata?.reason === failedReason, 'Failure reason is accurately preserved');
  assert(failedNotif.message.includes(failedReason), 'Message includes the specific failure reason');

  // Test 4: Desktop navigation target
  console.log('\n[Test 4] Desktop Navigation Target Contract');
  assert(
    onSubsNotif.navigationTarget?.desktopRoute === `/fixtures?fixtureId=${mockFixture.id}`,
    'Desktop route matches /fixtures?fixtureId=<id>'
  );

  // Test 5: Mobile navigation target
  console.log('\n[Test 5] Mobile Navigation Target Contract');
  assert(
    onSubsNotif.navigationTarget?.mobileRoute === `/m/fixtures?fixtureId=${mockFixture.id}`,
    'Mobile route matches /m/fixtures?fixtureId=<id>'
  );

  // Test 6: Persistence & Storage Retrieval
  console.log('\n[Test 6] LocalStorage Persistence & Retrieval');
  NotificationService.clearAll();
  assert(NotificationService.getNotifications().length === 0, 'Storage cleared successfully');

  NotificationService.addNotification(onSubsNotif);
  NotificationService.addNotification(fixedNotif);
  NotificationService.addNotification(failedNotif);

  const storedList = NotificationService.getNotifications();
  assert(storedList.length === 3, 'Persisted exactly 3 notifications');
  assert(storedList[0].id === failedNotif.id, 'Most recent notification is first in sort');

  // Test 7: Unread count calculation
  console.log('\n[Test 7] Unread Count Calculation');
  const unreadCount = NotificationService.getUnreadCount();
  assert(unreadCount === 3, 'All 3 initial notifications are unread');

  // Test 8: Mark single notification as read
  console.log('\n[Test 8] Mark Single Notification as Read');
  const marked = NotificationService.markAsRead(failedNotif.id);
  assert(marked === true, 'markAsRead returns true for existing notification');
  assert(NotificationService.getUnreadCount() === 2, 'Unread count decreased to 2');
  const updatedFailed = NotificationService.getNotifications().find((n) => n.id === failedNotif.id);
  assert(updatedFailed?.isRead === true, 'Target notification isRead is now true');

  // Strictly verify underlying mock fixture was NOT mutated
  assert(mockFixture.status === 'draft', 'Underlying fixture status remained untouched (draft)');

  // Test 9: Mark all notifications as read
  console.log('\n[Test 9] Mark All Notifications as Read');
  NotificationService.markAllAsRead();
  assert(NotificationService.getUnreadCount() === 0, 'Unread count is 0 after markAllAsRead');
  const allRead = NotificationService.getNotifications().every((n) => n.isRead);
  assert(allRead, 'Every notification record is marked read');

  // Test 10: Missing or deleted affected object handling
  console.log('\n[Test 10] Missing / Deleted Affected Object Handling');
  const ghostNotif: MaritimeNotification = {
    id: 'notif-ghost-404',
    title: 'Unknown Target',
    message: 'Affected fixture has been pruned.',
    severity: 'info',
    category: 'fixture_lifecycle',
    isRead: false,
    timestamp: new Date().toISOString(),
    provenance: 'live',
    affectedObjectType: 'fixture',
    affectedObjectId: 'NON_EXISTENT_ID_99999',
  };
  const exists = NotificationService.checkAffectedObjectExists(ghostNotif);
  assert(exists === false, 'Non-existent fixture correctly identified without crashing');

  // Test 11: Invalid notification payload validation
  console.log('\n[Test 11] Invalid Notification Payload Contract');
  const invalidPayload1 = { id: 'missing-title-and-message' };
  const val1 = NotificationService.validateNotification(invalidPayload1);
  assert(val1.isValid === false, 'Rejects payload missing required fields');
  assert(val1.errors.length >= 2, 'Reports multiple missing fields');

  const invalidPayload2 = {
    id: 'valid-id',
    title: 'Valid Title',
    message: 'Valid Message',
    timestamp: new Date().toISOString(),
    severity: 'critical_super_severe', // invalid severity
  };
  const val2 = NotificationService.validateNotification(invalidPayload2);
  assert(val2.isValid === false, 'Rejects invalid severity string');
  assert(val2.errors.includes('Invalid "severity" level'), 'Identifies severity error');

  const validPayload = onSubsNotif;
  const val3 = NotificationService.validateNotification(validPayload);
  assert(val3.isValid === true, 'Accepts valid notification contract payload');

  console.log('\n====================================================');
  console.log('✅ ALL MODULE 28 NOTIFICATION CONTRACT TESTS PASSED');
  console.log('====================================================\n');
}

runNotificationContractTests().catch((err) => {
  console.error('Test suite encountered an error:', err);
  process.exit(1);
});
