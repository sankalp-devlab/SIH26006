/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: Notification Service & Operational Event Architecture
 */

import type {
  MaritimeNotification,
  NotificationSeverity,
} from '../../types/notification';
import type { FixtureRecord, FixtureStatus } from '../../types/fixture';
import { FixturesService } from '../fixtures/fixtures.service';

const STORAGE_KEY = 'sih26006_notifications_v2';
export const NOTIF_EVENT_NAME = 'sih26006_new_notification';
export const NOTIF_UPDATED_EVENT = 'sih26006_notifications_updated';

export class NotificationService {
  private static isListenerInitialized = false;

  /**
   * Initial historical and realistic notifications derived from empirical fixtures & fleet data
   */
  private static getInitialSeedNotifications(): MaritimeNotification[] {
    const seed: MaritimeNotification[] = [];

    try {
      const storedFixtures = FixturesService.getStoredFixtures();
      
      // 1. Derive lifecycle notifications from stored fixtures audit histories
      for (const fx of storedFixtures.slice(0, 6)) {
        if (fx.status === 'on_subjects') {
          seed.push({
            id: `notif-seed-${fx.id}-on-subs`,
            title: `Fixture On Subjects: ${fx.fixture_reference}`,
            message: `${fx.vessel_name} on subjects for ${fx.charterer} (${fx.commodity}). Awaiting stem & charter party approval.`,
            severity: 'warning',
            category: 'fixture_lifecycle',
            isRead: false,
            timestamp: fx.updated_at || fx.fixture_date || new Date().toISOString(),
            provenance: 'historical',
            affectedObjectType: 'fixture',
            affectedObjectId: fx.id,
            navigationTarget: {
              desktopRoute: `/fixtures?fixtureId=${fx.id}`,
              mobileRoute: `/m/fixtures?fixtureId=${fx.id}`,
            },
            metadata: {
              fixtureReference: fx.fixture_reference,
              vesselName: fx.vessel_name,
              vesselImo: fx.vessel_imo,
              toStatus: 'on_subjects',
              charterer: fx.charterer,
              commodity: fx.commodity,
              rateFormatted: fx.rate_formatted,
            },
          });
        } else if (fx.status === 'fully_fixed') {
          seed.push({
            id: `notif-seed-${fx.id}-fixed`,
            title: `Fixture Fully Fixed: ${fx.fixture_reference}`,
            message: `All subjects lifted! ${fx.vessel_name} agreed with ${fx.charterer} at ${fx.rate_formatted}.`,
            severity: 'success',
            category: 'fixture_lifecycle',
            isRead: true,
            timestamp: fx.updated_at || fx.fixture_date || new Date().toISOString(),
            provenance: 'historical',
            affectedObjectType: 'fixture',
            affectedObjectId: fx.id,
            navigationTarget: {
              desktopRoute: `/fixtures?fixtureId=${fx.id}`,
              mobileRoute: `/m/fixtures?fixtureId=${fx.id}`,
            },
            metadata: {
              fixtureReference: fx.fixture_reference,
              vesselName: fx.vessel_name,
              vesselImo: fx.vessel_imo,
              toStatus: 'fully_fixed',
              charterer: fx.charterer,
              commodity: fx.commodity,
              rateFormatted: fx.rate_formatted,
            },
          });
        } else if (fx.status === 'failed') {
          seed.push({
            id: `notif-seed-${fx.id}-failed`,
            title: `Fixture Failed: ${fx.fixture_reference}`,
            message: `${fx.vessel_name} fixture failed on subjects: Stem not approved by terminal agent.`,
            severity: 'danger',
            category: 'fixture_lifecycle',
            isRead: false,
            timestamp: fx.updated_at || fx.fixture_date || new Date().toISOString(),
            provenance: 'historical',
            affectedObjectType: 'fixture',
            affectedObjectId: fx.id,
            navigationTarget: {
              desktopRoute: `/fixtures?fixtureId=${fx.id}`,
              mobileRoute: `/m/fixtures?fixtureId=${fx.id}`,
            },
            metadata: {
              fixtureReference: fx.fixture_reference,
              vesselName: fx.vessel_name,
              vesselImo: fx.vessel_imo,
              toStatus: 'failed',
              charterer: fx.charterer,
              commodity: fx.commodity,
              reason: 'Stem not approved by terminal agent.',
            },
          });
        }
      }
    } catch {
      // ignore storage access errors in test or SSR
    }

    // 2. Operational Port & Vessel Telemetry alerts
    seed.push(
      {
        id: 'notif-port-jnpt-001',
        title: 'Port Congestion Alert: JNPT Mumbai',
        message: 'Anchorage queue reached 14 vessels. Average turnaround delay +6.2 hrs.',
        severity: 'warning',
        category: 'port_congestion',
        isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(), // 24m ago
        provenance: 'historical',
        affectedObjectType: 'port',
        affectedObjectId: 104,
        navigationTarget: {
          desktopRoute: '/ports',
          mobileRoute: '/m/ports',
        },
        metadata: {
          portName: 'JNPT Mumbai (INJNP)',
          reason: 'Monsoon sea state swell restrictions at berth 3.',
        },
      },
      {
        id: 'notif-vessel-arrival-002',
        title: 'Vessel Arrival Notice: APOLLO GLORY',
        message: 'VLCC APOLLO GLORY berthed safely at Jurong Island Terminal, Singapore.',
        severity: 'success',
        category: 'vessel_telemetry',
        isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(), // 85m ago
        provenance: 'historical',
        affectedObjectType: 'vessel',
        affectedObjectId: 1,
        navigationTarget: {
          desktopRoute: '/vessels/1',
          mobileRoute: '/m/vessels/1',
        },
        metadata: {
          vesselName: 'APOLLO GLORY',
          vesselImo: 'IMO 9876543',
        },
      }
    );

    return seed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Initializes real-time window listener for fixture status updates
   */
  public static initEventListener(): void {
    if (this.isListenerInitialized || typeof window === 'undefined') return;

    window.addEventListener(NOTIF_EVENT_NAME, ((e: CustomEvent) => {
      const detail = e.detail;
      if (!detail) return;

      const fixtureId = detail.fixtureId || detail.id;
      let fixture: FixtureRecord | undefined;
      try {
        fixture = FixturesService.getStoredFixtures().find((f) => f.id === fixtureId);
      } catch {
        // ignore
      }

      let severity: NotificationSeverity = 'info';
      if (detail.type === 'warning') severity = 'warning';
      if (detail.type === 'success') severity = 'success';
      if (detail.type === 'danger' || detail.status === 'failed' || detail.title?.toLowerCase().includes('failed')) severity = 'danger';

      const newNotif: MaritimeNotification = {
        id: `notif-live-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: detail.title || 'Fixture Status Updated',
        message: detail.description || 'A maritime fixture status was updated.',
        severity,
        category: 'fixture_lifecycle',
        isRead: false,
        timestamp: new Date().toISOString(),
        provenance: 'live',
        affectedObjectType: 'fixture',
        affectedObjectId: fixtureId,
        navigationTarget: {
          desktopRoute: `/fixtures?fixtureId=${fixtureId}`,
          mobileRoute: `/m/fixtures?fixtureId=${fixtureId}`,
        },
        metadata: {
          fixtureReference: fixture?.fixture_reference,
          vesselName: fixture?.vessel_name,
          vesselImo: fixture?.vessel_imo,
          toStatus: detail.status || fixture?.status,
          rateFormatted: fixture?.rate_formatted,
          charterer: fixture?.charterer,
          commodity: fixture?.commodity,
          reason: detail.reason,
        },
      };

      this.addNotification(newNotif);
    }) as EventListener);

    this.isListenerInitialized = true;
  }

  /**
   * Retrieves all stored notifications
   */
  public static getNotifications(): MaritimeNotification[] {
    if (typeof window === 'undefined') return this.getInitialSeedNotifications();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
      }
    } catch {
      // Fallback
    }

    const initial = this.getInitialSeedNotifications();
    this.saveNotifications(initial);
    return initial;
  }

  /**
   * Saves notification collection to storage
   */
  public static saveNotifications(notifications: MaritimeNotification[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      window.dispatchEvent(new CustomEvent(NOTIF_UPDATED_EVENT));
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves unread notification count
   */
  public static getUnreadCount(): number {
    const list = this.getNotifications();
    return list.filter((n) => !n.isRead).length;
  }

  /**
   * Prepends a new notification to the store
   */
  public static addNotification(notification: MaritimeNotification): MaritimeNotification {
    const all = this.getNotifications();
    // Avoid exact duplicate IDs
    const filtered = all.filter((n) => n.id !== notification.id);
    filtered.unshift(notification);
    this.saveNotifications(filtered);
    return notification;
  }

  /**
   * Marks a notification as read
   * STRICT: Never alters underlying fixture or vessel state
   */
  public static markAsRead(id: string): boolean {
    const all = this.getNotifications();
    let found = false;
    const updated = all.map((n) => {
      if (n.id === id) {
        found = true;
        return { ...n, isRead: true };
      }
      return n;
    });

    if (found) {
      this.saveNotifications(updated);
    }
    return found;
  }

  /**
   * Marks all notifications as read
   * STRICT: Never alters underlying fixture or vessel state
   */
  public static markAllAsRead(): void {
    const all = this.getNotifications();
    const updated = all.map((n) => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
  }

  /**
   * Deletes a single notification record
   */
  public static deleteNotification(id: string): boolean {
    const all = this.getNotifications();
    const next = all.filter((n) => n.id !== id);
    if (next.length !== all.length) {
      this.saveNotifications(next);
      return true;
    }
    return false;
  }

  /**
   * Clears all notifications
   */
  public static clearAll(): void {
    this.saveNotifications([]);
  }

  /**
   * Relative time formatter ("Just now", "12m ago", "2h ago", "Yesterday")
   */
  public static formatRelativeTime(isoString: string): string {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffSecs = Math.floor((now - past) / 1000);

      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  }

  /**
   * Full UTC timestamp formatter
   */
  public static formatFullDateTime(isoString: string): string {
    try {
      const d = new Date(isoString);
      return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    } catch {
      return isoString;
    }
  }

  /**
   * Validates a notification payload contract
   */
  public static validateNotification(payload: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, errors: ['Payload must be a non-null object'] };
    }
    const p = payload as Record<string, unknown>;
    if (!p.id || typeof p.id !== 'string') errors.push('Missing or invalid "id"');
    if (!p.title || typeof p.title !== 'string') errors.push('Missing or invalid "title"');
    if (!p.message || typeof p.message !== 'string') errors.push('Missing or invalid "message"');
    if (!p.timestamp || typeof p.timestamp !== 'string') errors.push('Missing or invalid "timestamp"');
    if (p.severity && !['info', 'warning', 'success', 'danger'].includes(p.severity as string)) {
      errors.push('Invalid "severity" level');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks if affected object exists in platform storage
   */
  public static checkAffectedObjectExists(notif: MaritimeNotification): boolean {
    if (!notif.affectedObjectType || !notif.affectedObjectId) return false;
    if (notif.affectedObjectType === 'fixture') {
      try {
        const stored = FixturesService.getStoredFixtures();
        return stored.some((f) => String(f.id) === String(notif.affectedObjectId));
      } catch {
        return false;
      }
    }
    return true;
  }

  /**
   * Helper to construct a typed fixture lifecycle notification
   */
  public static createFixtureLifecycleNotification(
    fixture: FixtureRecord,
    toStatus: FixtureStatus,
    reason?: string
  ): MaritimeNotification {
    let severity: NotificationSeverity = 'info';
    let title = `Fixture Update: ${fixture.fixture_reference}`;
    let message = `${fixture.vessel_name} status moved to ${toStatus}.`;

    if (toStatus === 'on_subjects') {
      severity = 'warning';
      title = `Fixture On Subjects: ${fixture.fixture_reference}`;
      message = `${fixture.vessel_name} agreed on subjects with ${fixture.charterer} (${fixture.commodity}). Awaiting stem & CP confirmation.`;
    } else if (toStatus === 'fully_fixed') {
      severity = 'success';
      title = `Fixture Fully Fixed: ${fixture.fixture_reference}`;
      message = `All subjects lifted! ${fixture.vessel_name} fixture confirmed at ${fixture.rate_formatted}.`;
    } else if (toStatus === 'failed') {
      severity = 'danger';
      title = `Fixture Failed: ${fixture.fixture_reference}`;
      const reasonText = reason || 'Subjects failed on charter party terms.';
      message = `${fixture.vessel_name} failed on subjects: ${reasonText}`;
    }

    return {
      id: `notif-fixture-${fixture.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      severity,
      category: 'fixture_lifecycle',
      isRead: false,
      timestamp: new Date().toISOString(),
      provenance: 'live',
      affectedObjectType: 'fixture',
      affectedObjectId: fixture.id,
      navigationTarget: {
        desktopRoute: `/fixtures?fixtureId=${fixture.id}`,
        mobileRoute: `/m/fixtures?fixtureId=${fixture.id}`,
      },
      metadata: {
        fixtureReference: fixture.fixture_reference,
        vesselName: fixture.vessel_name,
        vesselImo: fixture.vessel_imo,
        toStatus,
        charterer: fixture.charterer,
        commodity: fixture.commodity,
        rateFormatted: fixture.rate_formatted,
        reason,
      },
    };
  }
}
