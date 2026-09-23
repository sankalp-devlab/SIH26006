/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 32: DATA SOURCES, PROVENANCE & FRESHNESS ARCHITECTURE
 * Dynamic Freshness Calculation Engine
 *
 * Implements standardized domain-specific staleness thresholds:
 * - Terrestrial AIS: Live ≤ 15 min, Recent ≤ 2 hrs, Stale > 2 hrs
 * - Satellite AIS: Live ≤ 60 min, Recent ≤ 4 hrs, Stale > 4 hrs
 * - Bunker & Market Prices: Live ≤ 6 hrs, Recent ≤ 24 hrs, Stale > 24 hrs
 * - Port Lineups & Queues: Live ≤ 12 hrs, Recent ≤ 48 hrs, Stale > 48 hrs
 * - Commercial Fixtures: Live ≤ 24 hrs, Recent ≤ 7 days, Stale > 7 days
 * - Unstructured Parsers (Email/EDI): Live ≤ 2 hrs, Recent ≤ 24 hrs, Stale > 24 hrs
 * - Analytics & Derived Metrics: Live ≤ 15 min, Recent ≤ 2 hrs, Stale > 2 hrs
 *
 * Zero False-Positives: Never marks records as 'LIVE' simply because a view loaded.
 */

import type {
  DataSourceOrigin,
  DataFreshnessLevel,
  DataTemporalState,
  DomainFreshnessThresholds,
} from '../../types/provenance';

export class FreshnessEngine {
  /**
   * Domain-specific freshness windows in seconds
   */
  public static readonly THRESHOLDS: Record<DataSourceOrigin, DomainFreshnessThresholds> = {
    // Physical Telemetry & AIS
    ais_terrestrial: { liveSecondsMax: 15 * 60, recentSecondsMax: 2 * 3600, staleSecondsThreshold: 2 * 3600 },
    ais_satellite: { liveSecondsMax: 60 * 60, recentSecondsMax: 4 * 3600, staleSecondsThreshold: 4 * 3600 },
    iot_telemetry: { liveSecondsMax: 10 * 60, recentSecondsMax: 1 * 3600, staleSecondsThreshold: 1 * 3600 },
    radar_tracking: { liveSecondsMax: 5 * 60, recentSecondsMax: 30 * 60, staleSecondsThreshold: 30 * 60 },

    // Unstructured Channels
    email_parser: { liveSecondsMax: 2 * 3600, recentSecondsMax: 24 * 3600, staleSecondsThreshold: 24 * 3600 },
    whatsapp_connector: { liveSecondsMax: 2 * 3600, recentSecondsMax: 24 * 3600, staleSecondsThreshold: 24 * 3600 },
    slack_connector: { liveSecondsMax: 2 * 3600, recentSecondsMax: 24 * 3600, staleSecondsThreshold: 24 * 3600 },
    ms_teams_connector: { liveSecondsMax: 2 * 3600, recentSecondsMax: 24 * 3600, staleSecondsThreshold: 24 * 3600 },

    // Commercial Feeds & Exchanges
    fixture_reports: { liveSecondsMax: 24 * 3600, recentSecondsMax: 7 * 86400, staleSecondsThreshold: 7 * 86400 },
    baltic_exchange: { liveSecondsMax: 6 * 3600, recentSecondsMax: 24 * 3600, staleSecondsThreshold: 24 * 3600 },
    port_lineup_authority: { liveSecondsMax: 12 * 3600, recentSecondsMax: 48 * 3600, staleSecondsThreshold: 48 * 3600 },
    customs_manifest: { liveSecondsMax: 24 * 3600, recentSecondsMax: 14 * 86400, staleSecondsThreshold: 14 * 86400 },

    // User & Tenancy Inputs
    user_manual_input: { liveSecondsMax: 1 * 3600, recentSecondsMax: 24 * 3600, staleSecondsThreshold: 24 * 3600 },
    user_workspace_private: { liveSecondsMax: 1 * 3600, recentSecondsMax: 24 * 3600, staleSecondsThreshold: 24 * 3600 },

    // Regulatory Authorities
    imo_gisis: { liveSecondsMax: 7 * 86400, recentSecondsMax: 30 * 86400, staleSecondsThreshold: 30 * 86400 },
    class_society: { liveSecondsMax: 7 * 86400, recentSecondsMax: 30 * 86400, staleSecondsThreshold: 30 * 86400 },
    sanctions_list_ofac: { liveSecondsMax: 24 * 3600, recentSecondsMax: 7 * 86400, staleSecondsThreshold: 7 * 86400 },

    // Analytical & Synthetic
    calculated_analytics: { liveSecondsMax: 15 * 60, recentSecondsMax: 2 * 3600, staleSecondsThreshold: 2 * 3600 },
    predictive_model: { liveSecondsMax: 0, recentSecondsMax: 0, staleSecondsThreshold: 0 },
    canonical_benchmark: { liveSecondsMax: 0, recentSecondsMax: 0, staleSecondsThreshold: 0 },
  };

  /**
   * Evaluates freshness level from raw timestamp and domain origin
   */
  public static calculateFreshness(
    observedAt: string | undefined | null,
    origin: DataSourceOrigin,
    temporalState: DataTemporalState = 'live',
    referenceDate: Date = new Date()
  ): { level: DataFreshnessLevel; ageSeconds: number; ageHumanized: string } {
    if (!observedAt) {
      return { level: 'UNKNOWN', ageSeconds: 0, ageHumanized: 'No observation timestamp' };
    }

    const obsDate = new Date(observedAt);
    if (isNaN(obsDate.getTime())) {
      return { level: 'UNAVAILABLE', ageSeconds: 0, ageHumanized: 'Invalid timestamp format' };
    }

    // Explicit state overrides
    if (temporalState === 'predicted') {
      return { level: 'PREDICTED', ageSeconds: 0, ageHumanized: 'Model Forecast' };
    }

    if (temporalState === 'historical') {
      return {
        level: 'HISTORICAL',
        ageSeconds: Math.max(0, Math.floor((referenceDate.getTime() - obsDate.getTime()) / 1000)),
        ageHumanized: `As of ${obsDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      };
    }

    const ageSeconds = Math.floor((referenceDate.getTime() - obsDate.getTime()) / 1000);

    // Negative age indicates future observation / prediction
    if (ageSeconds < -60) {
      return {
        level: 'PREDICTED',
        ageSeconds: Math.abs(ageSeconds),
        ageHumanized: `Projected ETA in ${this.humanizeAge(Math.abs(ageSeconds))}`,
      };
    }

    const clampedAge = Math.max(0, ageSeconds);
    const thresholds = this.THRESHOLDS[origin] || this.THRESHOLDS.ais_terrestrial;

    let level: DataFreshnessLevel;
    if (clampedAge <= thresholds.liveSecondsMax) {
      level = 'LIVE';
    } else if (clampedAge <= thresholds.recentSecondsMax) {
      level = 'RECENT';
    } else {
      level = 'STALE';
    }

    return {
      level,
      ageSeconds: clampedAge,
      ageHumanized: this.humanizeAge(clampedAge),
    };
  }

  /**
   * Humanizes elapsed seconds into intuitive operational format
   */
  public static humanizeAge(seconds: number): string {
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  }
}
