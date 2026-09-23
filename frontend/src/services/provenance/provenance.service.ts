/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 32: DATA SOURCES, PROVENANCE & FRESHNESS ARCHITECTURE
 * Centralized Provenance Service
 *
 * Coordinates data provenance across telemetry, commercial desks,
 * messaging channels, workspace privacy boundaries, and mathematical derivations.
 */

import { FreshnessEngine } from './freshness-engine';
import type {
  DataProvenance,
  DataSourceOrigin,
  DataTemporalState,
  DataPrivacyScope,
  DataDerivationType,
  DataLineage,
  DataConflictInfo,
} from '../../types/provenance';

export class ProvenanceService {
  public static readonly ORIGIN_METADATA: Record<
    DataSourceOrigin,
    { label: string; category: 'Telemetry' | 'Messaging' | 'Commercial' | 'User' | 'Regulatory' | 'Derived'; description: string }
  > = {
    // Physical Telemetry & Satellites
    ais_terrestrial: {
      label: 'Terrestrial AIS',
      category: 'Telemetry',
      description: 'VHF shore-based receiver network for coastal maritime navigation.',
    },
    ais_satellite: {
      label: 'Satellite AIS',
      category: 'Telemetry',
      description: 'Low-earth orbit satellite constellation tracking open-ocean position telemetry.',
    },
    iot_telemetry: {
      label: 'Vessel IoT Telemetry',
      category: 'Telemetry',
      description: 'Direct onboard engine telemetry, mass flow meters, and shaft generators.',
    },
    radar_tracking: {
      label: 'Port Radar / VTS',
      category: 'Telemetry',
      description: 'Harbor radar stations and Vessel Traffic Services tracking.',
    },

    // Unstructured Communication Channels
    email_parser: {
      label: 'Email Ingestion Parser',
      category: 'Messaging',
      description: 'Chartering circulars and broker position lists extracted via NLP.',
    },
    whatsapp_connector: {
      label: 'WhatsApp Maritime Desk (Planned)',
      category: 'Messaging',
      description: 'Planned webhook connector for direct WhatsApp broker negotiation transcripts.',
    },
    slack_connector: {
      label: 'Slack Channel Sync (Planned)',
      category: 'Messaging',
      description: 'Planned commercial desk broker channel sync integration.',
    },
    ms_teams_connector: {
      label: 'MS Teams Connector (Planned)',
      category: 'Messaging',
      description: 'Planned enterprise freight operations connector.',
    },

    // Commercial Feeds & Exchanges
    fixture_reports: {
      label: 'Commercial Fixture Reports',
      category: 'Commercial',
      description: 'Verified chartering fixtures, laycan agreements, and concluded voyage terms.',
    },
    baltic_exchange: {
      label: 'Baltic Exchange Indices',
      category: 'Commercial',
      description: 'Official spot freight benchmarks (TD3C, C5, TC2, P1A).',
    },
    port_lineup_authority: {
      label: 'Port Authority Lineups',
      category: 'Commercial',
      description: 'Official harbor master lineups, expected vessels, and terminal congestion tables.',
    },
    customs_manifest: {
      label: 'Customs & Port Manifests',
      category: 'Commercial',
      description: 'Stowed cargo bills of lading and certified customs clearances.',
    },

    // User & Tenancy
    user_manual_input: {
      label: 'User Manual Entry',
      category: 'User',
      description: 'Direct operator adjustments and manual overrides.',
    },
    user_workspace_private: {
      label: 'Private Workspace Ingestion',
      category: 'User',
      description: 'Restricted private cargo demands and custom fleet allocations; strictly isolated.',
    },

    // Regulatory
    imo_gisis: {
      label: 'IMO GISIS Registry',
      category: 'Regulatory',
      description: 'International Maritime Organization certified technical particulars and IMO numbers.',
    },
    class_society: {
      label: 'Classification Society Registry',
      category: 'Regulatory',
      description: 'Certified DNV, Lloyd’s Register, and Bureau Veritas surveys.',
    },
    sanctions_list_ofac: {
      label: 'OFAC & EU Sanctions Screening',
      category: 'Regulatory',
      description: 'Live sanctions compliance screening against OFAC SDN and European Union watchlists.',
    },

    // Derived & Analytics
    calculated_analytics: {
      label: 'Platform Analytics Engine',
      category: 'Derived',
      description: 'Synthesized metrics computed from multiple empirical feeds (TCE, distance, emissions).',
    },
    predictive_model: {
      label: 'Predictive Routing Model',
      category: 'Derived',
      description: 'Machine learning ETA forecast and weather-routed voyage extrapolation.',
    },
    canonical_benchmark: {
      label: 'Canonical Historical Benchmark',
      category: 'Derived',
      description: '12+ years of verified empirical maritime data (2014–2026).',
    },
  };

  /**
   * Factory to construct standard DataProvenance envelope
   */
  public static createProvenance(params: {
    origin: DataSourceOrigin;
    observedAt?: string;
    timestamp?: string;
    sourceName?: string;
    entityId?: string;
    state?: DataTemporalState;
    privacy?: DataPrivacyScope;
    derivation?: DataDerivationType;
    confidenceScore?: number;
    lineage?: DataLineage;
    conflict?: DataConflictInfo;
    metadataNotes?: string;
  }): DataProvenance {
    const meta = this.ORIGIN_METADATA[params.origin] || {
      label: params.sourceName || params.origin,
      category: 'Telemetry',
      description: 'Maritime observation stream',
    };

    const observedAt = params.observedAt || params.timestamp || new Date().toISOString();
    const state = params.state || 'live';
    const freshness = FreshnessEngine.calculateFreshness(observedAt, params.origin, state);
    const privacy = params.privacy || (params.origin === 'user_workspace_private' ? 'workspace_private' : 'authenticated_platform');
    const isPlanned = params.origin.includes('whatsapp') || params.origin.includes('slack') || params.origin.includes('ms_teams');

    let derivation = params.derivation;
    if (!derivation) {
      if (params.origin.startsWith('ais_') || params.origin === 'iot_telemetry') derivation = 'raw_sensor';
      else if (params.origin === 'email_parser' || isPlanned) derivation = 'unstructured_extracted';
      else if (params.origin === 'calculated_analytics') derivation = 'calculated_formula';
      else if (params.origin === 'predictive_model') derivation = 'machine_learning_forecast';
      else derivation = 'curated_empirical';
    }

    return {
      origin: params.origin,
      originLabel: params.sourceName || meta.label,
      state,
      freshness: freshness.level,
      privacy,
      derivation,
      observedAt,
      receivedAt: new Date().toISOString(),
      ageSeconds: freshness.ageSeconds,
      ageHumanized: freshness.ageHumanized,
      confidenceScore: params.confidenceScore,
      isPlannedConnector: isPlanned,
      lineage: params.lineage,
      conflict: params.conflict,
      metadataNotes: params.metadataNotes || (params.entityId ? `Entity ID: ${params.entityId}` : undefined),
    };
  }

  /**
   * Specialized factory for Live AIS Telemetry (supports both positional and object options)
   */
  public static createTelemetryProvenance(
    arg1: string | {
      origin?: DataSourceOrigin;
      sourceName?: string;
      timestamp?: string;
      observedAt?: string;
      entityId?: string;
      metadata?: any;
    },
    isSatellite: boolean = false
  ): DataProvenance {
    if (typeof arg1 === 'object' && arg1 !== null) {
      const origin = arg1.origin || (isSatellite ? 'ais_satellite' : 'ais_terrestrial');
      const observedAt = arg1.timestamp || arg1.observedAt || new Date().toISOString();
      return this.createProvenance({
        origin,
        observedAt,
        sourceName: arg1.sourceName,
        entityId: arg1.entityId,
        state: 'live',
        privacy: 'public',
        derivation: 'raw_sensor',
        confidenceScore: 0.98,
        metadataNotes: arg1.metadata ? JSON.stringify(arg1.metadata) : undefined,
      });
    }

    return this.createProvenance({
      origin: isSatellite ? 'ais_satellite' : 'ais_terrestrial',
      observedAt: arg1,
      state: 'live',
      privacy: 'public',
      derivation: 'raw_sensor',
      confidenceScore: 0.98,
    });
  }

  /**
   * Specialized factory for Calculated / Lineage Metrics (supports both positional and object options)
   */
  public static createCalculatedProvenance(
    targetMetricOrOpts: string | {
      metricName?: string;
      targetMetric?: string;
      formula?: string;
      formulaName?: string;
      formulaDescription?: string;
      inputs: Array<{ field?: string; name?: string; label?: string; sourceOrigin?: DataSourceOrigin; origin?: DataSourceOrigin; value?: any; contributingValue?: any }>;
      observedAt?: string;
      timestamp?: string;
      executionTimeMs?: number;
    },
    formulaName?: string,
    formulaDescription?: string,
    inputs?: Array<{ field?: string; name?: string; label?: string; sourceOrigin?: DataSourceOrigin; origin?: DataSourceOrigin; value?: any; contributingValue?: any }>,
    observedAt?: string
  ): DataProvenance {
    if (typeof targetMetricOrOpts === 'object' && targetMetricOrOpts !== null) {
      const metric = targetMetricOrOpts.metricName || targetMetricOrOpts.targetMetric || 'Calculated Metric';
      const formName = targetMetricOrOpts.formulaName || metric;
      const formDesc = targetMetricOrOpts.formula || targetMetricOrOpts.formulaDescription || formName;
      const timestamp = targetMetricOrOpts.observedAt || targetMetricOrOpts.timestamp || new Date().toISOString();

      const normalizedInputs = (targetMetricOrOpts.inputs || []).map((inp, idx) => ({
        field: inp.field || inp.name || `input_${idx + 1}`,
        label: inp.label || inp.name || inp.field || `Input ${idx + 1}`,
        sourceOrigin: inp.sourceOrigin || inp.origin || 'calculated_analytics',
        contributingValue: inp.contributingValue !== undefined ? inp.contributingValue : inp.value,
      }));

      return this.createProvenance({
        origin: 'calculated_analytics',
        observedAt: timestamp,
        state: 'live',
        derivation: 'calculated_formula',
        lineage: {
          targetMetric: metric,
          formulaName: formName,
          formulaDescription: formDesc,
          inputs: normalizedInputs,
        },
      });
    }

    const metric = targetMetricOrOpts;
    const formName = formulaName || metric;
    const formDesc = formulaDescription || formName;
    const timestamp = observedAt || new Date().toISOString();

    const normalizedInputs = (inputs || []).map((inp, idx) => ({
      field: inp.field || inp.name || `input_${idx + 1}`,
      label: inp.label || inp.name || inp.field || `Input ${idx + 1}`,
      sourceOrigin: inp.sourceOrigin || inp.origin || 'calculated_analytics',
      contributingValue: inp.contributingValue !== undefined ? inp.contributingValue : inp.value,
    }));

    return this.createProvenance({
      origin: 'calculated_analytics',
      observedAt: timestamp,
      state: 'live',
      derivation: 'calculated_formula',
      lineage: {
        targetMetric: metric,
        formulaName: formName,
        formulaDescription: formDesc,
        inputs: normalizedInputs,
      },
    });
  }

  /**
   * Specialized factory for Private User Workspace items (supports both positional and object options)
   */
  public static createPrivateWorkspaceProvenance(
    arg1?: string | {
      origin?: DataSourceOrigin;
      sourceName?: string;
      workspaceId?: string;
      workspaceName?: string;
      entityId?: string;
      timestamp?: string;
      observedAt?: string;
      metadataNotes?: string;
    },
    metadataNotes?: string
  ): DataProvenance {
    if (typeof arg1 === 'object' && arg1 !== null) {
      const origin = arg1.origin || 'user_workspace_private';
      const observedAt = arg1.timestamp || arg1.observedAt || new Date().toISOString();
      return this.createProvenance({
        origin,
        observedAt,
        sourceName: arg1.sourceName,
        entityId: arg1.entityId,
        state: 'live',
        privacy: 'workspace_private',
        derivation: 'unstructured_extracted',
        metadataNotes: arg1.metadataNotes || (arg1.workspaceName ? `Workspace: ${arg1.workspaceName}` : 'Strictly isolated within authenticated tenant workspace.'),
      });
    }

    return this.createProvenance({
      origin: 'user_workspace_private',
      observedAt: arg1 || new Date().toISOString(),
      state: 'live',
      privacy: 'workspace_private',
      derivation: 'unstructured_extracted',
      metadataNotes: metadataNotes || 'Strictly isolated within authenticated tenant workspace.',
    });
  }

  /**
   * Helper to detect and format conflicting source readings
   */
  public static detectConflict(
    primary: { origin: DataSourceOrigin; value: string | number; observedAt: string; label: string },
    secondary: { origin: DataSourceOrigin; value: string | number; observedAt: string; label: string },
    strategy: 'primary_source_precedence' | 'latest_timestamp' | 'user_manual_override' = 'primary_source_precedence'
  ): DataConflictInfo | undefined {
    if (primary.value === secondary.value) return undefined;

    return {
      hasConflict: true,
      primaryValue: primary.value,
      conflictingSources: [primary, secondary],
      resolutionStrategy: strategy,
      warningMessage: `Variance detected between ${primary.label} (${primary.value}) and ${secondary.label} (${secondary.value}). Applied: ${strategy.replace(/_/g, ' ')}.`,
    };
  }
}

export const provenanceService = ProvenanceService;
