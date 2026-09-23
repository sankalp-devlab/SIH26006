/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: Maritime Notifications Domain Types
 */

import type { FixtureStatus } from './fixture';

export type NotificationCategory =
  | 'fixture_lifecycle'
  | 'vessel_telemetry'
  | 'port_congestion'
  | 'operational_system';

export type NotificationSeverity = 'info' | 'warning' | 'success' | 'danger';

export type NotificationProvenance = 'live' | 'historical' | 'simulated';

export type AffectedObjectType = 'fixture' | 'vessel' | 'port' | 'system';

export interface NotificationNavigationTarget {
  desktopRoute: string; // e.g. /fixtures?fixtureId=fx-1021
  mobileRoute: string;  // e.g. /m/fixtures?fixtureId=fx-1021
}

export interface NotificationMetadata {
  fixtureReference?: string;
  vesselName?: string;
  vesselImo?: string;
  fromStatus?: FixtureStatus;
  toStatus?: FixtureStatus;
  rateFormatted?: string;
  charterer?: string;
  commodity?: string;
  reason?: string;
  portName?: string;
}

export interface MaritimeNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  isRead: boolean;
  timestamp: string; // ISO 8601
  provenance: NotificationProvenance;
  affectedObjectType: AffectedObjectType;
  affectedObjectId: string | number;
  navigationTarget?: NotificationNavigationTarget;
  metadata?: NotificationMetadata;
}

export interface NotificationFiltersState {
  searchQuery: string;
  category: NotificationCategory | 'all';
  severity: NotificationSeverity | 'all';
  readStatus: 'all' | 'unread' | 'read';
  dateRange: 'all' | 'today' | 'last_7_days' | 'last_30_days';
}
