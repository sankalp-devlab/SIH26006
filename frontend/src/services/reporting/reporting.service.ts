import type {
  ReportFilterState,
  DetailedTransactionRecord,
  DrillDownContext,
  DrillDownFilterState,
  ReportKpiItem,
  MonthlyTimeSeriesPoint,
  CorridorBarPoint,
  SegmentSharePoint,
  DecisionRecommendation,
  ExecutiveDossierReport,
} from '../../types/reporting';

import {
  ALL_REPORTING_TRANSACTIONS,
  filterTransactionsByState,
  computeExecutiveKpiRibbon,
  computeMonthlyTimeSeries,
  computeCorridorBreakdown,
  computeSegmentShare,
  extractDrillDownSlice,
  applyDrillDownSecondaryFilters,
  generateDecisionRecommendations,
  compileExecutiveDossier,
} from './reporting-analytics-engine';

export interface ReportingStatePayload {
  allRecords: DetailedTransactionRecord[];
  filteredRecords: DetailedTransactionRecord[];
  kpis: ReportKpiItem[];
  timeSeries: MonthlyTimeSeriesPoint[];
  corridors: CorridorBarPoint[];
  segmentShare: SegmentSharePoint[];
  recommendations: DecisionRecommendation[];
  drillDownSlice?: DetailedTransactionRecord[];
  drillDownFiltered?: DetailedTransactionRecord[];
  dossier: ExecutiveDossierReport;
}

export class ReportingService {
  /**
   * Primary computation function returning full reactive state for the UI
   */
  public static getReportingState(
    filters: ReportFilterState,
    drillDownContext: DrillDownContext | null,
    drillDownFilters: DrillDownFilterState
  ): ReportingStatePayload {
    const allRecords = ALL_REPORTING_TRANSACTIONS;
    const filteredRecords = filterTransactionsByState(allRecords, filters);

    const kpis = computeExecutiveKpiRibbon(filteredRecords, filters.metricFocus);
    const timeSeries = computeMonthlyTimeSeries(filteredRecords, filters.metricFocus);
    const corridors = computeCorridorBreakdown(filteredRecords, filters.metricFocus);
    const segmentShare = computeSegmentShare(filteredRecords);
    const recommendations = generateDecisionRecommendations(filteredRecords, drillDownContext || undefined);

    let drillDownSlice: DetailedTransactionRecord[] | undefined;
    let drillDownFiltered: DetailedTransactionRecord[] | undefined;

    if (drillDownContext) {
      drillDownSlice = extractDrillDownSlice(filteredRecords, drillDownContext);
      drillDownFiltered = applyDrillDownSecondaryFilters(drillDownSlice, drillDownFilters);
    }

    const dossierSummary = drillDownContext && drillDownFiltered
      ? {
          context: drillDownContext,
          filteredCount: drillDownFiltered.length,
          avgTce: drillDownFiltered.length
            ? Math.round(drillDownFiltered.reduce((acc, r) => acc + r.tceRate, 0) / drillDownFiltered.length)
            : 0,
          totalVolumeMt: drillDownFiltered.reduce((acc, r) => acc + r.cargoVolume, 0),
          primaryCharterers: Array.from(new Set(drillDownFiltered.map((r) => r.charterer))).slice(0, 4),
        }
      : undefined;

    const dossier = compileExecutiveDossier(
      filters,
      kpis,
      corridors,
      dossierSummary,
      recommendations
    );

    return {
      allRecords,
      filteredRecords,
      kpis,
      timeSeries,
      corridors,
      segmentShare,
      recommendations,
      drillDownSlice,
      drillDownFiltered,
      dossier,
    };
  }

  /**
   * Export detailed transaction records to CSV
   */
  public static exportToCsv(records: DetailedTransactionRecord[], filename = 'maritime-report-ledger.csv'): void {
    if (records.length === 0) return;

    const headers = [
      'Fixture ID',
      'Date',
      'Vessel Name',
      'IMO',
      'Vessel Class',
      'Segment',
      'Route Code',
      'Route Name',
      'Origin',
      'Destination',
      'Cargo',
      'Cargo Sub-Type',
      'TCE Rate ($/day)',
      'Cargo Volume (MT)',
      'Ton-Miles (Billion)',
      'Bunker Cost ($/day)',
      'CO2 (MT/day)',
      'Total CO2 (MT)',
      'Commercial Status',
      'Charterer',
      'Speed (knots)',
      'Duration (days)',
      'CII Rating',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${r.vesselName}"`,
      `"${r.vesselImo}"`,
      `"${r.vesselClass}"`,
      `"${r.segment}"`,
      `"${r.routeCode}"`,
      `"${r.routeName}"`,
      `"${r.originPort}"`,
      `"${r.destinationPort}"`,
      `"${r.cargo}"`,
      `"${r.cargoSubType}"`,
      r.tceRate,
      r.cargoVolume,
      r.tonMiles,
      r.bunkerCostPerDay,
      r.co2PerDay,
      r.totalCo2Mt,
      `"${r.commercialStatus}"`,
      `"${r.charterer}"`,
      r.speedKnots,
      r.durationDays,
      `"${r.ciiRating}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    if (typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Export records to JSON file
   */
  public static exportToJson(data: unknown, filename = 'maritime-analytics-export.json'): void {
    if (typeof window !== 'undefined') {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Copy records to clipboard in TSV format
   */
  public static async copyToClipboardTsv(records: DetailedTransactionRecord[]): Promise<boolean> {
    if (records.length === 0) return false;

    const headers = [
      'Fixture ID',
      'Date',
      'Vessel Name',
      'Class',
      'Route',
      'Cargo',
      'TCE ($/day)',
      'Volume (MT)',
      'Status',
      'Charterer',
    ];

    const rows = records.map((r) => [
      r.id,
      r.date,
      r.vesselName,
      r.vesselClass,
      r.routeCode,
      r.cargoSubType,
      r.tceRate,
      r.cargoVolume,
      r.commercialStatus,
      r.charterer,
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(tsvContent);
        return true;
      } catch (err) {
        console.error('Clipboard copy error:', err);
        return false;
      }
    }
    return false;
  }

  /**
   * Serializes active filters and drill-down state into URLSearchParams
   */
  public static serializeToUrlParams(
    filters: ReportFilterState,
    drillDown: DrillDownContext | null,
    drillDownFilters: DrillDownFilterState
  ): URLSearchParams {
    const params = new URLSearchParams();
    params.set('view', filters.view);
    params.set('horizon', filters.timeHorizon);
    params.set('segment', filters.segment);
    params.set('class', filters.vesselClass);
    params.set('basin', filters.basin);
    params.set('metric', filters.metricFocus);

    if (drillDown) {
      params.set('drillPeriod', drillDown.datePeriod);
      if (drillDown.routeCode) params.set('drillRoute', drillDown.routeCode);
      if (drillDown.segment) params.set('drillSegment', drillDown.segment);
      if (drillDown.vesselClass) params.set('drillClass', drillDown.vesselClass);
      params.set('drillLabel', drillDown.label);

      if (drillDownFilters.status !== 'all') params.set('drillStatus', drillDownFilters.status);
      if (drillDownFilters.cargoSubType !== 'all') params.set('drillCargo', drillDownFilters.cargoSubType);
      if (drillDownFilters.minTce > 0) params.set('drillMinTce', String(drillDownFilters.minTce));
      if (drillDownFilters.searchTerm.trim()) params.set('drillQ', drillDownFilters.searchTerm.trim());
    }

    return params;
  }

  /**
   * Deserializes URLSearchParams into ReportFilterState and DrillDownContext
   */
  public static deserializeUrlParams(params: URLSearchParams): {
    filters: ReportFilterState;
    drillDown: DrillDownContext | null;
    drillDownFilters: DrillDownFilterState;
  } {
    const filters: ReportFilterState = {
      view: (params.get('view') as ReportFilterState['view']) || 'commercial',
      timeHorizon: (params.get('horizon') as ReportFilterState['timeHorizon']) || '3Y',
      segment: (params.get('segment') as ReportFilterState['segment']) || 'all',
      vesselClass: (params.get('class') as ReportFilterState['vesselClass']) || 'all',
      basin: (params.get('basin') as ReportFilterState['basin']) || 'all',
      metricFocus: (params.get('metric') as ReportFilterState['metricFocus']) || 'tce_rate',
    };

    let drillDown: DrillDownContext | null = null;
    const drillPeriod = params.get('drillPeriod');

    if (drillPeriod) {
      drillDown = {
        datePeriod: drillPeriod,
        routeCode: params.get('drillRoute') || undefined,
        segment: (params.get('drillSegment') as ReportFilterState['segment']) || undefined,
        vesselClass: params.get('drillClass') || undefined,
        label: params.get('drillLabel') || `Period: ${drillPeriod}`,
        recordCount: 0,
      };
    }

    const drillDownFilters: DrillDownFilterState = {
      status: (params.get('drillStatus') as DrillDownFilterState['status']) || 'all',
      cargoSubType: params.get('drillCargo') || 'all',
      minTce: params.get('drillMinTce') ? parseInt(params.get('drillMinTce')!, 10) : 0,
      searchTerm: params.get('drillQ') || '',
    };

    return { filters, drillDown, drillDownFilters };
  }
}
